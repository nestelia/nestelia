import "reflect-metadata";

import { afterAll, beforeAll, describe, expect, it, jest, mock } from "bun:test";

// ── amqplib mock ────────────────────────────────────────────────────────
// Mock amqplib before any imports that use it, so RabbitMQModule.forRoot
// can call AmqpConnection.connect() without a running broker.

function createMockChannel() {
  const consumers = new Map<string, (msg: unknown) => void>();
  let tagCounter = 0;

  return {
    assertExchange: jest.fn(async () => ({ exchange: "" })),
    assertQueue: jest.fn(async (q: string) => ({
      queue: q || `amq.gen-${++tagCounter}`,
      messageCount: 0,
      consumerCount: 0,
    })),
    bindQueue: jest.fn(async () => ({})),
    deleteQueue: jest.fn(async () => ({ messageCount: 0 })),
    publish: jest.fn(() => true),
    sendToQueue: jest.fn(() => true),
    consume: jest.fn(async (queue: string, cb: (msg: unknown) => void) => {
      const tag = `ctag-${++tagCounter}`;
      consumers.set(queue, cb);
      return { consumerTag: tag };
    }),
    cancel: jest.fn(async () => ({})),
    ack: jest.fn(),
    nack: jest.fn(),
    reject: jest.fn(),
    prefetch: jest.fn(async () => {}),
    close: jest.fn(async () => {}),
    on: jest.fn(),
    _deliver(queue: string, content: unknown, properties: Record<string, unknown> = {}) {
      const cb = consumers.get(queue);
      if (cb) {
        cb({
          content: Buffer.from(JSON.stringify(content)),
          fields: { deliveryTag: 1, redelivered: false, exchange: "", routingKey: "" },
          properties: { headers: {}, ...properties },
        });
      }
    },
  };
}

let channel: ReturnType<typeof createMockChannel>;

mock.module("amqplib", () => ({
  connect: jest.fn(async () => {
    channel = createMockChannel();
    return {
      createChannel: jest.fn(async () => channel),
      close: jest.fn(async () => {}),
      on: jest.fn(),
    };
  }),
}));

// ── Imports after mock ──────────────────────────────────────────────────

import { Container } from "nestelia";
import { initializeSingletonProviders } from "../../../packages/core/src/core/module.utils";
import { AmqpConnection } from "../../../packages/rabbitmq/src/connection/amqp-connection";
import { RabbitMQModule } from "../../../packages/rabbitmq/src";
import { OrdersHandler } from "../src/orders.handler";
import { OrdersService } from "../src/orders.service";
import { AppModule } from "../src/app.module";

// ── Bootstrap ───────────────────────────────────────────────────────────

let connection: AmqpConnection;
let ordersService: OrdersService;
let ordersHandler: OrdersHandler;

beforeAll(async () => {
  // Reset singleton so module creates a fresh connection
  (RabbitMQModule as any).connectionInstance = null;
  (RabbitMQModule as any).connectionPromise = null;

  Container.instance.beginInitSession();

  // Register RabbitMQModule
  const dynamicModule = RabbitMQModule.forRoot({
    urls: ["amqp://localhost:5672"],
    reconnect: false,
    exchanges: [{ name: "orders", type: "topic", options: { durable: true } }],
  });
  const rabbitModuleRef = Container.instance.addModule(RabbitMQModule, "RabbitMQModule");
  for (const provider of dynamicModule.providers || []) {
    rabbitModuleRef.addProvider(provider);
  }
  for (const exp of dynamicModule.exports || []) {
    rabbitModuleRef.addExport(exp as any);
  }

  // Register AppModule with handlers
  const appModuleRef = Container.instance.addModule(AppModule, "AppModule");
  appModuleRef.addImport(rabbitModuleRef);
  appModuleRef.addProvider(OrdersHandler);
  appModuleRef.addProvider(OrdersService);

  // Init all singletons — this triggers RabbitMQExplorer.onModuleInit(),
  // which auto-discovers @RabbitSubscribe handlers and registers consumers
  await initializeSingletonProviders();

  connection = (await Container.instance.get(AmqpConnection))!;
  ordersService = (await Container.instance.get(OrdersService))!;
  ordersHandler = (await Container.instance.get(OrdersHandler))!;
});

afterAll(async () => {
  await connection?.disconnect();
});

// ── Tests ───────────────────────────────────────────────────────────────

describe("RabbitMQ Integration", () => {
  describe("connection", () => {
    it("AmqpConnection is connected", () => {
      expect(connection).toBeDefined();
      expect(connection.isConnectionReady()).toBe(true);
    });

    it("OrdersService has AmqpConnection injected", () => {
      expect(ordersService).toBeDefined();
      expect((ordersService as any).rabbit).toBe(connection);
    });
  });

  describe("exchange & queue setup", () => {
    it("orders exchange was asserted", () => {
      const calls = (channel.assertExchange.mock.calls as any[]).filter(
        (c) => c[0] === "orders",
      );
      expect(calls.length).toBeGreaterThanOrEqual(1);
    });

    it("orders-created-queue was asserted", () => {
      const calls = (channel.assertQueue.mock.calls as any[]).filter(
        (c) => c[0] === "orders-created-queue",
      );
      expect(calls.length).toBeGreaterThanOrEqual(1);
    });

    it("queue was bound to exchange with routing key", () => {
      const calls = (channel.bindQueue.mock.calls as any[]).filter(
        (c) =>
          c[0] === "orders-created-queue" &&
          c[1] === "orders" &&
          c[2] === "order.created",
      );
      expect(calls.length).toBeGreaterThanOrEqual(1);
    });

    it("consumer was started on orders-created-queue", () => {
      const calls = (channel.consume.mock.calls as any[]).filter(
        (c) => c[0] === "orders-created-queue",
      );
      expect(calls.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("publish → handler flow", () => {
    it("OrdersService publishes to orders exchange", async () => {
      await ordersService.createOrder(100, "user-1");

      const publishCalls = channel.publish.mock.calls as any[];
      expect(publishCalls.length).toBeGreaterThanOrEqual(1);

      const lastCall = publishCalls[publishCalls.length - 1];
      expect(lastCall[0]).toBe("orders"); // exchange
      expect(lastCall[1]).toBe("order.created"); // routing key

      const payload = JSON.parse((lastCall[2] as Buffer).toString());
      expect(payload.amount).toBe(100);
      expect(payload.userId).toBe("user-1");
      expect(payload.orderId).toBeDefined();
    });

    it("handler receives message when broker delivers to queue", async () => {
      const before = ordersHandler.processed.length;

      // Simulate broker delivering a message to the subscribed queue
      channel._deliver("orders-created-queue", {
        orderId: "integration-001",
        amount: 42,
        userId: "test-user",
      });

      await new Promise((r) => setTimeout(r, 20));

      expect(ordersHandler.processed.length).toBe(before + 1);
      const last = ordersHandler.processed[ordersHandler.processed.length - 1];
      expect(last).toEqual({
        orderId: "integration-001",
        amount: 42,
        userId: "test-user",
      });
    });

    it("message is acked after handler processes it", async () => {
      channel.ack.mockClear();

      channel._deliver("orders-created-queue", {
        orderId: "ack-test",
        amount: 1,
        userId: "u",
      });

      await new Promise((r) => setTimeout(r, 20));

      expect(channel.ack).toHaveBeenCalled();
    });

    it("multiple messages are all delivered to handler", async () => {
      const before = ordersHandler.processed.length;

      channel._deliver("orders-created-queue", { orderId: "m1", amount: 10, userId: "a" });
      channel._deliver("orders-created-queue", { orderId: "m2", amount: 20, userId: "b" });
      channel._deliver("orders-created-queue", { orderId: "m3", amount: 30, userId: "c" });

      await new Promise((r) => setTimeout(r, 20));

      expect(ordersHandler.processed.length).toBe(before + 3);
    });
  });
});
