import "reflect-metadata";

import { beforeEach, describe, expect, it, mock } from "bun:test";

import { Test } from "../../../packages/testing/src";
import { AmqpConnection } from "../../../packages/rabbitmq/src/connection/amqp-connection";
import { RabbitMQService } from "../../../packages/rabbitmq/src";
import { OrdersHandler } from "./orders.handler";
import { OrdersService } from "./orders.service";
import type { OrderCreatedEvent } from "./orders.handler";

// ── Mock AmqpConnection ─────────────────────────────────────────────────

const mockRabbit = {
  publish: mock(async () => true),
  sendToQueue: mock(async () => true),
  isConnectionReady: mock(() => true),
  subscribe: mock(async () => "ctag-1"),
  assertExchange: mock(async () => {}),
  assertQueue: mock(async () => {}),
  connect: mock(async () => {}),
  disconnect: mock(async () => {}),
  registerHandlers: mock(async () => {}),
};

// ── Unit tests ──────────────────────────────────────────────────────────

describe("OrdersHandler", () => {
  let handler: OrdersHandler;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [OrdersHandler],
    }).compile();

    handler = module.get(OrdersHandler);
  });

  it("processes an incoming order event", async () => {
    const event: OrderCreatedEvent = {
      orderId: "ord-1",
      amount: 99.99,
      userId: "usr-1",
    };

    await handler.handleOrderCreated(event);

    expect(handler.processed).toHaveLength(1);
    expect(handler.processed[0].orderId).toBe("ord-1");
  });

  it("accumulates multiple events", async () => {
    await handler.handleOrderCreated({ orderId: "a", amount: 10, userId: "u1" });
    await handler.handleOrderCreated({ orderId: "b", amount: 20, userId: "u2" });
    expect(handler.processed).toHaveLength(2);
  });
});

describe("OrdersService", () => {
  let service: OrdersService;

  beforeEach(async () => {
    mockRabbit.publish.mockClear();

    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: RabbitMQService, useValue: mockRabbit },
      ],
    }).compile();

    service = module.get(OrdersService);
  });

  it("publishes order.created event on create", async () => {
    const { orderId } = await service.createOrder(49.99, "user-123");

    expect(orderId).toBeDefined();
    expect(mockRabbit.publish).toHaveBeenCalledTimes(1);

    const [exchange, routingKey, payload] = (mockRabbit.publish as any).mock.calls[0];
    expect(exchange).toBe("orders");
    expect(routingKey).toBe("order.created");
    expect(payload.amount).toBe(49.99);
    expect(payload.userId).toBe("user-123");
  });

  it("returns a unique orderId each time", async () => {
    const { orderId: a } = await service.createOrder(1, "u");
    const { orderId: b } = await service.createOrder(2, "u");
    expect(a).not.toBe(b);
  });
});

// ── Integration tests ───────────────────────────────────────────────────

describe("Integration: OrdersService → OrdersHandler", () => {
  let service: OrdersService;
  let handler: OrdersHandler;

  beforeEach(async () => {
    mockRabbit.publish.mockClear();

    // Wire service to publish and capture → manually deliver to handler
    const module = await Test.createTestingModule({
      providers: [
        OrdersHandler,
        OrdersService,
        { provide: RabbitMQService, useValue: mockRabbit },
      ],
    }).compile();

    service = module.get(OrdersService);
    handler = module.get(OrdersHandler);
  });

  it("publish from service → handler receives the event", async () => {
    // Intercept publish calls and deliver them to the handler
    mockRabbit.publish.mockImplementation(
      async (_exchange: string, _routingKey: string, payload: unknown) => {
        await handler.handleOrderCreated(payload as OrderCreatedEvent);
        return true;
      },
    );

    await service.createOrder(250, "user-abc");

    expect(handler.processed).toHaveLength(1);
    expect(handler.processed[0].amount).toBe(250);
    expect(handler.processed[0].userId).toBe("user-abc");
    expect(handler.processed[0].orderId).toBeDefined();
  });

  it("multiple orders are all delivered to handler", async () => {
    mockRabbit.publish.mockImplementation(
      async (_exchange: string, _routingKey: string, payload: unknown) => {
        await handler.handleOrderCreated(payload as OrderCreatedEvent);
        return true;
      },
    );

    await service.createOrder(10, "u1");
    await service.createOrder(20, "u2");
    await service.createOrder(30, "u3");

    expect(handler.processed).toHaveLength(3);
    expect(handler.processed.map((e) => e.amount)).toEqual([10, 20, 30]);
    expect(handler.processed.map((e) => e.userId)).toEqual(["u1", "u2", "u3"]);
  });

  it("handler receives correct payload structure", async () => {
    mockRabbit.publish.mockImplementation(
      async (_exchange: string, _routingKey: string, payload: unknown) => {
        await handler.handleOrderCreated(payload as OrderCreatedEvent);
        return true;
      },
    );

    const { orderId } = await service.createOrder(99.99, "user-xyz");

    expect(handler.processed[0]).toEqual({
      orderId,
      amount: 99.99,
      userId: "user-xyz",
    });
  });

  it("publish routes to correct exchange and routing key", async () => {
    // Don't deliver — just verify the publish args
    mockRabbit.publish.mockImplementation(async () => true);

    await service.createOrder(1, "u");

    const [exchange, routingKey] = (mockRabbit.publish as any).mock.calls[0];
    expect(exchange).toBe("orders");
    expect(routingKey).toBe("order.created");
  });
});
