import "reflect-metadata";
import { afterAll, describe, expect, it } from "bun:test";

import { createElysiaApplication, Injectable, Module } from "../../../../index";

/**
 * Maps which lifecycle hooks actually fire through a REAL application boot →
 * listen → close cycle (not by calling LifecycleManager.trigger* manually).
 *
 * Records every hook invocation into a shared log so we can assert exact order
 * and coverage.
 */

const log: string[] = [];

// A provider that implements every hook.
@Injectable()
class AllHooks {
  onModuleInit() {
    log.push("all:onModuleInit");
  }
  onApplicationBootstrap() {
    log.push("all:onApplicationBootstrap");
  }
  beforeApplicationShutdown() {
    log.push("all:beforeApplicationShutdown");
  }
  onModuleDestroy() {
    log.push("all:onModuleDestroy");
  }
  onApplicationShutdown() {
    log.push("all:onApplicationShutdown");
  }
}

// Providers that implement ONLY one hook (no onModuleInit) — exposes whether
// registration is gated on onModuleInit.
@Injectable()
class BootstrapOnly {
  onApplicationBootstrap() {
    log.push("only:onApplicationBootstrap");
  }
}
@Injectable()
class DestroyOnly {
  onModuleDestroy() {
    log.push("only:onModuleDestroy");
  }
}
@Injectable()
class BeforeShutdownOnly {
  beforeApplicationShutdown() {
    log.push("only:beforeApplicationShutdown");
  }
}
@Injectable()
class ShutdownOnly {
  onApplicationShutdown() {
    log.push("only:onApplicationShutdown");
  }
}

@Module({
  providers: [
    AllHooks,
    BootstrapOnly,
    DestroyOnly,
    BeforeShutdownOnly,
    ShutdownOnly,
  ],
})
class AppModule {}

describe("ALL lifecycle hooks — real boot/listen/close", () => {
  let snapshotAfterListen: string[] = [];
  let snapshotAfterClose: string[] = [];

  it("runs the full cycle and records hook invocations", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const app: any = await createElysiaApplication(AppModule);
    await app.listen(0); // ephemeral port — triggers onApplicationBootstrap
    snapshotAfterListen = [...log];

    await app.close(); // triggers shutdown hooks
    snapshotAfterClose = [...log];

    // Print the actual observed behavior for the record.
    console.log("AFTER LISTEN:", JSON.stringify(snapshotAfterListen));
    console.log("AFTER CLOSE :", JSON.stringify(snapshotAfterClose));
    expect(snapshotAfterClose.length).toBeGreaterThan(0);
  });

  it("onModuleInit fires for the all-hooks provider", () => {
    expect(snapshotAfterClose).toContain("all:onModuleInit");
  });

  it("onApplicationBootstrap fires (all hooks provider)", () => {
    expect(snapshotAfterClose).toContain("all:onApplicationBootstrap");
  });

  it("onApplicationBootstrap fires for a bootstrap-only provider", () => {
    expect(snapshotAfterClose).toContain("only:onApplicationBootstrap");
  });

  it("beforeApplicationShutdown fires (all hooks provider)", () => {
    expect(snapshotAfterClose).toContain("all:beforeApplicationShutdown");
  });

  it("beforeApplicationShutdown fires for a shutdown-only provider", () => {
    expect(snapshotAfterClose).toContain("only:beforeApplicationShutdown");
  });

  it("onApplicationShutdown fires (all hooks provider)", () => {
    expect(snapshotAfterClose).toContain("all:onApplicationShutdown");
  });

  it("onApplicationShutdown fires for a shutdown-only provider", () => {
    expect(snapshotAfterClose).toContain("only:onApplicationShutdown");
  });

  it("onModuleDestroy fires (all hooks provider)", () => {
    expect(snapshotAfterClose).toContain("all:onModuleDestroy");
  });

  it("onModuleDestroy fires for a destroy-only provider", () => {
    expect(snapshotAfterClose).toContain("only:onModuleDestroy");
  });
});

afterAll(() => {
  log.length = 0;
});
