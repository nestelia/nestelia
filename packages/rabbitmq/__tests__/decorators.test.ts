import "reflect-metadata";

import { describe, it, expect } from "bun:test";
import {
  RabbitSubscribe,
  RabbitRPC,
  RabbitHandler,
  RabbitPayload,
  RabbitHeader,
  RabbitRequest,
  RABBIT_PAYLOAD_METADATA,
  RABBIT_HEADER_METADATA,
  RABBIT_REQUEST_METADATA,
} from "../src/decorators/rabbitmq.decorators";
import { RABBIT_HANDLER } from "../src/rabbitmq.constants";
import { Nack } from "../src/amqp/handlerResponses";

describe("RabbitMQ Decorators", () => {
  describe("@RabbitSubscribe", () => {
    it("stores handler config as method metadata", () => {
      class TestService {
        @RabbitSubscribe({
          exchange: "test-exchange",
          routingKey: "test.key",
          queue: "test-queue",
        })
        handleMessage() {}
      }

      const config = Reflect.getMetadata(
        RABBIT_HANDLER,
        TestService.prototype,
        "handleMessage",
      );

      expect(config).toBeDefined();
      expect(config.type).toBe("subscribe");
      expect(config.exchange).toBe("test-exchange");
      expect(config.routingKey).toBe("test.key");
      expect(config.queue).toBe("test-queue");
    });
  });

  describe("@RabbitRPC", () => {
    it("stores RPC handler config as method metadata", () => {
      class TestService {
        @RabbitRPC({
          exchange: "rpc-exchange",
          routingKey: "rpc.key",
          queue: "rpc-queue",
        })
        handleRpc() {}
      }

      const config = Reflect.getMetadata(
        RABBIT_HANDLER,
        TestService.prototype,
        "handleRpc",
      );

      expect(config).toBeDefined();
      expect(config.type).toBe("rpc");
      expect(config.exchange).toBe("rpc-exchange");
    });
  });

  describe("@RabbitHandler", () => {
    it("stores custom handler config", () => {
      class TestService {
        @RabbitHandler({ type: "subscribe", exchange: "ex", routingKey: "rk" })
        handle() {}
      }

      const config = Reflect.getMetadata(
        RABBIT_HANDLER,
        TestService.prototype,
        "handle",
      );

      expect(config.type).toBe("subscribe");
      expect(config.exchange).toBe("ex");
    });
  });

  describe("@RabbitPayload", () => {
    it("stores parameter metadata", () => {
      class TestService {
        handle(@RabbitPayload() _data: unknown) {}
      }

      const meta = Reflect.getMetadata(
        RABBIT_PAYLOAD_METADATA,
        TestService.prototype,
        "handle",
      );

      expect(meta).toHaveLength(1);
      expect(meta[0].index).toBe(0);
      expect(meta[0].propertyKey).toBeUndefined();
    });

    it("stores property key", () => {
      class TestService {
        handle(@RabbitPayload("orderId") _id: string) {}
      }

      const meta = Reflect.getMetadata(
        RABBIT_PAYLOAD_METADATA,
        TestService.prototype,
        "handle",
      );

      expect(meta[0].propertyKey).toBe("orderId");
    });
  });

  describe("@RabbitHeader", () => {
    it("stores header parameter metadata", () => {
      class TestService {
        handle(@RabbitHeader("x-request-id") _requestId: string) {}
      }

      const meta = Reflect.getMetadata(
        RABBIT_HEADER_METADATA,
        TestService.prototype,
        "handle",
      );

      expect(meta).toHaveLength(1);
      expect(meta[0].propertyKey).toBe("x-request-id");
    });
  });

  describe("@RabbitRequest", () => {
    it("stores request parameter metadata", () => {
      class TestService {
        handle(@RabbitRequest() _msg: unknown) {}
      }

      const meta = Reflect.getMetadata(
        RABBIT_REQUEST_METADATA,
        TestService.prototype,
        "handle",
      );

      expect(meta).toHaveLength(1);
      expect(meta[0].index).toBe(0);
    });
  });

  describe("Nack", () => {
    it("defaults requeue to false", () => {
      const nack = new Nack();
      expect(nack.requeue).toBe(false);
    });

    it("sets requeue to true", () => {
      const nack = new Nack(true);
      expect(nack.requeue).toBe(true);
    });
  });
});
