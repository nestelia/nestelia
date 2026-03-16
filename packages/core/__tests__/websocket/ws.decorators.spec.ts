import "reflect-metadata";

import { describe, expect, it } from "bun:test";

import {
  WS_GATEWAY_METADATA,
  WS_HANDLER_METADATA,
} from "~/src/decorators/constants";
import { OnClose, OnMessage, OnOpen } from "~/src/websocket/ws-handlers.decorator";
import { WebSocketGateway } from "~/src/websocket/ws-gateway.decorator";

// ── @WebSocketGateway ────────────────────────────────────────────────────────

describe("@WebSocketGateway()", () => {
  it("stores path in metadata", () => {
    @WebSocketGateway("/ws/chat")
    class ChatGateway {}

    const meta = Reflect.getMetadata(WS_GATEWAY_METADATA, ChatGateway);
    expect(meta).toBeDefined();
    expect(meta.path).toBe("/ws/chat");
  });

  it("stores options in metadata", () => {
    const opts = { query: { token: "string" } };

    @WebSocketGateway("/ws/secure", opts)
    class SecureGateway {}

    const meta = Reflect.getMetadata(WS_GATEWAY_METADATA, SecureGateway);
    expect(meta.options).toBe(opts);
  });

  it("stores undefined options when none provided", () => {
    @WebSocketGateway("/ws/simple")
    class SimpleGateway {}

    const meta = Reflect.getMetadata(WS_GATEWAY_METADATA, SimpleGateway);
    expect(meta.options).toBeUndefined();
  });

  it("two gateways do not share metadata", () => {
    @WebSocketGateway("/ws/a")
    class GatewayA {}

    @WebSocketGateway("/ws/b")
    class GatewayB {}

    expect(Reflect.getMetadata(WS_GATEWAY_METADATA, GatewayA).path).toBe("/ws/a");
    expect(Reflect.getMetadata(WS_GATEWAY_METADATA, GatewayB).path).toBe("/ws/b");
  });
});

// ── @OnOpen / @OnMessage / @OnClose ─────────────────────────────────────────

describe("@OnOpen()", () => {
  it("stores handler type 'open' on the method", () => {
    class TestGateway {
      @OnOpen()
      handleOpen() {}
    }

    const meta = Reflect.getMetadata(
      WS_HANDLER_METADATA,
      TestGateway.prototype,
      "handleOpen",
    );
    expect(meta).toBeDefined();
    expect(meta.type).toBe("open");
  });
});

describe("@OnMessage()", () => {
  it("stores handler type 'message' on the method", () => {
    class TestGateway {
      @OnMessage()
      handleMessage() {}
    }

    const meta = Reflect.getMetadata(
      WS_HANDLER_METADATA,
      TestGateway.prototype,
      "handleMessage",
    );
    expect(meta).toBeDefined();
    expect(meta.type).toBe("message");
  });
});

describe("@OnClose()", () => {
  it("stores handler type 'close' on the method", () => {
    class TestGateway {
      @OnClose()
      handleClose() {}
    }

    const meta = Reflect.getMetadata(
      WS_HANDLER_METADATA,
      TestGateway.prototype,
      "handleClose",
    );
    expect(meta).toBeDefined();
    expect(meta.type).toBe("close");
  });
});

describe("Combined gateway class", () => {
  it("collects all three handler types on a single class", () => {
    @WebSocketGateway("/ws/combined")
    class CombinedGateway {
      @OnOpen()
      onOpen() {}

      @OnMessage()
      onMessage() {}

      @OnClose()
      onClose() {}
    }

    expect(
      Reflect.getMetadata(WS_HANDLER_METADATA, CombinedGateway.prototype, "onOpen").type,
    ).toBe("open");
    expect(
      Reflect.getMetadata(WS_HANDLER_METADATA, CombinedGateway.prototype, "onMessage").type,
    ).toBe("message");
    expect(
      Reflect.getMetadata(WS_HANDLER_METADATA, CombinedGateway.prototype, "onClose").type,
    ).toBe("close");

    const gatewayMeta = Reflect.getMetadata(WS_GATEWAY_METADATA, CombinedGateway);
    expect(gatewayMeta.path).toBe("/ws/combined");
  });

  it("does not set handler metadata on undecorated methods", () => {
    class PartialGateway {
      @OnOpen()
      onOpen() {}

      undecorated() {}
    }

    const meta = Reflect.getMetadata(
      WS_HANDLER_METADATA,
      PartialGateway.prototype,
      "undecorated",
    );
    expect(meta).toBeUndefined();
  });
});
