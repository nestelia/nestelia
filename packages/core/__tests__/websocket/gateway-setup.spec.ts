import "reflect-metadata";

import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";

import { Module } from "~/src/core/module.decorator";
import { setupGateways } from "~/src/core/gateway-setup";
import { Container, DIContainer } from "~/src/di";
import { Injectable } from "~/src/di/injectable.decorator";
import { GUARDS_METADATA } from "~/src/decorators/constants";
import { OnClose, OnMessage, OnOpen } from "~/src/websocket/ws-handlers.decorator";
import { WebSocketGateway } from "~/src/websocket/ws-gateway.decorator";
import { Elysia } from "elysia";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Captures ws() calls on a mock Elysia instance */
function mockApp() {
  const calls: { path: string; config: Record<string, unknown> }[] = [];
  return {
    ws(path: string, config: Record<string, unknown>) {
      calls.push({ path, config });
      return this;
    },
    calls,
  };
}

// ── Gateway fixtures ─────────────────────────────────────────────────────────

@Injectable()
@WebSocketGateway("/ws/test")
class TestGateway {
  readonly log: string[] = [];

  @OnOpen()
  handleOpen(ws: unknown) {
    this.log.push("open");
  }

  @OnMessage()
  handleMessage(ws: unknown, msg: unknown) {
    this.log.push(`message:${msg}`);
  }

  @OnClose()
  handleClose(ws: unknown) {
    this.log.push("close");
  }
}

@Injectable()
@WebSocketGateway("/ws/options", { compress: true })
class OptionsGateway {
  @OnOpen()
  handleOpen() {}
}

@Injectable()
class NoDecoratorGateway {}

// ── Module for DI ─────────────────────────────────────────────────────────────

@Module({ providers: [TestGateway], gateways: [TestGateway] })
class TestModule {}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("setupGateways()", () => {
  beforeEach(() => {
    Container.instance.clear();
    DIContainer.register([TestGateway, OptionsGateway], TestModule as any);
  });

  afterEach(() => {
    Container.instance.clear();
  });

  it("calls app.ws() with the correct path", async () => {
    const app = mockApp();
    await setupGateways(app as any, [TestGateway], TestModule as any);

    expect(app.calls).toHaveLength(1);
    expect(app.calls[0]!.path).toBe("/ws/test");
  });

  it("maps open/message/close handlers to app.ws config", async () => {
    const app = mockApp();
    await setupGateways(app as any, [TestGateway], TestModule as any);

    const { config } = app.calls[0]!;
    expect(typeof config.open).toBe("function");
    expect(typeof config.message).toBe("function");
    expect(typeof config.close).toBe("function");
  });

  it("delegates open() to the gateway instance method", async () => {
    const app = mockApp();
    await setupGateways(app as any, [TestGateway], TestModule as any);

    const instance = await DIContainer.get<TestGateway>(TestGateway, TestModule as any);
    const { config } = app.calls[0]!;
    (config.open as Function)(null);
    expect(instance!.log).toContain("open");
  });

  it("delegates message() to the gateway instance method", async () => {
    const app = mockApp();
    await setupGateways(app as any, [TestGateway], TestModule as any);

    const instance = await DIContainer.get<TestGateway>(TestGateway, TestModule as any);
    const { config } = app.calls[0]!;
    (config.message as Function)(null, "hello");
    expect(instance!.log).toContain("message:hello");
  });

  it("delegates close() to the gateway instance method", async () => {
    const app = mockApp();
    await setupGateways(app as any, [TestGateway], TestModule as any);

    const instance = await DIContainer.get<TestGateway>(TestGateway, TestModule as any);
    const { config } = app.calls[0]!;
    (config.close as Function)(null, 1000, "");
    expect(instance!.log).toContain("close");
  });

  it("merges extra options into ws config", async () => {
    DIContainer.register([OptionsGateway], TestModule as any);
    const app = mockApp();
    await setupGateways(app as any, [OptionsGateway], TestModule as any);

    expect(app.calls[0]!.config.compress).toBe(true);
    expect(typeof app.calls[0]!.config.open).toBe("function");
  });

  it("skips a gateway class with no @WebSocketGateway decorator", async () => {
    DIContainer.register([NoDecoratorGateway], TestModule as any);
    const warnSpy = spyOn(Container.prototype, "clear" as any);
    const app = mockApp();
    await setupGateways(app as any, [NoDecoratorGateway as any], TestModule as any);

    expect(app.calls).toHaveLength(0);
    warnSpy.mockRestore();
  });

  it("does not add beforeHandle when no guards are defined", async () => {
    const app = mockApp();
    await setupGateways(app as any, [TestGateway], TestModule as any);

    expect(app.calls[0]!.config.beforeHandle).toBeUndefined();
  });
});

// ── Guard integration ─────────────────────────────────────────────────────────

describe("setupGateways() — guard support", () => {
  class AllowGuard {
    canActivate() {
      return true;
    }
  }

  class DenyGuard {
    canActivate() {
      return false;
    }
  }

  beforeEach(() => {
    Container.instance.clear();
  });

  afterEach(() => {
    Container.instance.clear();
  });

  it("adds beforeHandle when class-level guards are present", async () => {
    @Injectable()
    @WebSocketGateway("/ws/guarded")
    class GuardedGateway {
      @OnOpen()
      handleOpen() {}
    }
    Reflect.defineMetadata(GUARDS_METADATA, [AllowGuard], GuardedGateway);
    DIContainer.register([GuardedGateway], TestModule as any);

    const app = mockApp();
    await setupGateways(app as any, [GuardedGateway as any], TestModule as any);

    expect(typeof app.calls[0]!.config.beforeHandle).toBe("function");
  });

  it("beforeHandle returns undefined (allow) when guard passes", async () => {
    @Injectable()
    @WebSocketGateway("/ws/allow")
    class AllowedGateway {
      @OnOpen()
      handleOpen() {}
    }
    Reflect.defineMetadata(GUARDS_METADATA, [new AllowGuard()], AllowedGateway);
    DIContainer.register([AllowedGateway], TestModule as any);

    const app = mockApp();
    await setupGateways(app as any, [AllowedGateway as any], TestModule as any);

    const fakeCtx = { set: { status: 200, headers: {} }, request: new Request("http://test") };
    const result = await (app.calls[0]!.config.beforeHandle as Function)(fakeCtx);
    expect(result).toBeUndefined();
    expect(fakeCtx.set.status).toBe(200);
  });

  it("beforeHandle returns 403 when guard denies", async () => {
    @Injectable()
    @WebSocketGateway("/ws/deny")
    class DeniedGateway {
      @OnOpen()
      handleOpen() {}
    }
    Reflect.defineMetadata(GUARDS_METADATA, [new DenyGuard()], DeniedGateway);
    DIContainer.register([DeniedGateway], TestModule as any);

    const app = mockApp();
    await setupGateways(app as any, [DeniedGateway as any], TestModule as any);

    const fakeCtx = { set: { status: 200, headers: {} }, request: new Request("http://test") };
    const result = await (app.calls[0]!.config.beforeHandle as Function)(fakeCtx);
    expect(result).toMatchObject({ statusCode: 403, error: "Forbidden" });
    expect(fakeCtx.set.status).toBe(403);
  });
});
