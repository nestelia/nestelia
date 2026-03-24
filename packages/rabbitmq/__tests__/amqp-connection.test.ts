import "reflect-metadata";

import { describe, expect, it } from "bun:test";
import {
  matchesRoutingKey,
  validateRabbitMqUris,
  convertUriConfigObjectsToUris,
  deepEqual,
} from "../src/amqp/utils";
import { Nack } from "../src/amqp/handlerResponses";
import {
  MessageHandlerErrorBehavior,
  getHandlerForLegacyBehavior,
  ackErrorHandler,
  requeueErrorHandler,
  defaultNackErrorHandler,
} from "../src/amqp/errorBehaviors";
import {
  RpcTimeoutError,
  NullMessageError,
  ChannelNotAvailableError,
  ConnectionNotAvailableError,
} from "../src/amqp/errors";
import { AmqpConnectionManager } from "../src/amqp/connectionManager";
import { resolveHandlerConfigs } from "../src/rabbitmq.module";

// ── utils ────────────────────────────────────────────────────────────

describe("matchesRoutingKey", () => {
  it("matches exact key", () => {
    expect(matchesRoutingKey("order.created", "order.created")).toBe(true);
  });

  it("does not match different key", () => {
    expect(matchesRoutingKey("order.created", "order.deleted")).toBe(false);
  });

  it("matches with * wildcard", () => {
    expect(matchesRoutingKey("order.created", "order.*")).toBe(true);
  });

  it("matches with # wildcard", () => {
    expect(matchesRoutingKey("order.created.us", "order.#")).toBe(true);
  });

  it("matches against array of patterns", () => {
    expect(matchesRoutingKey("order.created", ["user.*", "order.*"])).toBe(
      true,
    );
  });

  it("returns false for undefined pattern", () => {
    expect(matchesRoutingKey("order.created", undefined)).toBe(false);
  });

  it("returns false for empty array", () => {
    expect(matchesRoutingKey("order.created", [])).toBe(false);
  });

  it("matches empty string routing key", () => {
    expect(matchesRoutingKey("", "")).toBe(true);
  });
});

describe("validateRabbitMqUris", () => {
  it("accepts valid amqp URIs", () => {
    expect(() =>
      validateRabbitMqUris(["amqp://localhost:5672"]),
    ).not.toThrow();
  });

  it("accepts amqps URIs", () => {
    expect(() =>
      validateRabbitMqUris(["amqps://host:5671"]),
    ).not.toThrow();
  });

  it("rejects non-amqp URIs", () => {
    expect(() =>
      validateRabbitMqUris(["http://localhost:5672"]),
    ).toThrow("amqp");
  });
});

describe("convertUriConfigObjectsToUris", () => {
  it("passes through string URIs", () => {
    const result = convertUriConfigObjectsToUris("amqp://localhost");
    expect(result).toEqual(["amqp://localhost"]);
  });

  it("converts Options.Connect objects", () => {
    const result = convertUriConfigObjectsToUris({
      hostname: "rabbit.example.com",
      username: "user",
      password: "pass",
      port: 5672,
    });
    expect(result[0]).toContain("rabbit.example.com");
    expect(result[0]).toContain("user");
  });

  it("handles array of URIs", () => {
    const result = convertUriConfigObjectsToUris([
      "amqp://host1",
      "amqp://host2",
    ]);
    expect(result).toHaveLength(2);
  });
});

describe("deepEqual", () => {
  it("compares primitives", () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual("a", "a")).toBe(true);
  });

  it("compares objects", () => {
    expect(deepEqual({ a: 1 }, { a: 1 })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it("compares nested objects", () => {
    expect(deepEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
    expect(deepEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
  });

  it("handles null", () => {
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(null, {})).toBe(false);
  });
});

// ── errors ───────────────────────────────────────────────────────────

describe("Custom errors", () => {
  it("RpcTimeoutError", () => {
    const err = new RpcTimeoutError(5000, "ex", "rk");
    expect(err.name).toBe("RpcTimeoutError");
    expect(err.timeout).toBe(5000);
    expect(err.exchange).toBe("ex");
    expect(err.message).toContain("5000ms");
  });

  it("NullMessageError", () => {
    const err = new NullMessageError();
    expect(err.name).toBe("NullMessageError");
  });

  it("ChannelNotAvailableError", () => {
    const err = new ChannelNotAvailableError();
    expect(err.name).toBe("ChannelNotAvailableError");
  });

  it("ConnectionNotAvailableError", () => {
    const err = new ConnectionNotAvailableError();
    expect(err.name).toBe("ConnectionNotAvailableError");
  });
});

// ── error behaviors ──────────────────────────────────────────────────

describe("Error behaviors", () => {
  it("getHandlerForLegacyBehavior returns correct handlers", () => {
    expect(getHandlerForLegacyBehavior(MessageHandlerErrorBehavior.ACK)).toBe(
      ackErrorHandler,
    );
    expect(
      getHandlerForLegacyBehavior(MessageHandlerErrorBehavior.REQUEUE),
    ).toBe(requeueErrorHandler);
    expect(getHandlerForLegacyBehavior(MessageHandlerErrorBehavior.NACK)).toBe(
      defaultNackErrorHandler,
    );
  });
});

// ── handler responses ────────────────────────────────────────────────

describe("Nack", () => {
  it("defaults requeue to false", () => {
    const nack = new Nack();
    expect(nack.requeue).toBe(false);
  });

  it("accepts requeue parameter", () => {
    const nack = new Nack(true);
    expect(nack.requeue).toBe(true);
  });
});

// ── connection manager ───────────────────────────────────────────────

describe("AmqpConnectionManager", () => {
  it("manages connections", () => {
    const mgr = new AmqpConnectionManager();
    const fakeConn = {
      configuration: { name: "test" },
      close: async () => {},
    } as any;

    mgr.addConnection(fakeConn);
    expect(mgr.getConnection("test")).toBe(fakeConn);
    expect(mgr.getConnections()).toHaveLength(1);

    mgr.clearConnections();
    expect(mgr.getConnections()).toHaveLength(0);
  });
});

// ── resolveHandlerConfigs ────────────────────────────────────────────

describe("resolveHandlerConfigs", () => {
  it("returns [undefined] when no lookup key", () => {
    const result = resolveHandlerConfigs({}, undefined);
    expect(result).toEqual([undefined]);
  });

  it("returns [] when key not in handlers", () => {
    const result = resolveHandlerConfigs({}, "missing");
    expect(result).toEqual([]);
  });

  it("wraps single handler in array", () => {
    const handler = { exchange: "ex", routingKey: "rk" };
    const result = resolveHandlerConfigs({ test: handler }, "test");
    expect(result).toEqual([handler]);
  });

  it("returns array as-is", () => {
    const handlers = [
      { exchange: "ex1", routingKey: "rk1" },
      { exchange: "ex2", routingKey: "rk2" },
    ];
    const result = resolveHandlerConfigs({ test: handlers }, "test");
    expect(result).toEqual(handlers);
  });
});
