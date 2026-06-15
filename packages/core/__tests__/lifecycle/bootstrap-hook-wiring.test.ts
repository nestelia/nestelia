import "reflect-metadata";
import { describe, expect, it } from "bun:test";

import { createElysiaApplication } from "../../../../index";
import { Injectable, Module } from "../../../../index";

/**
 * Real-boot coverage for lifecycle hooks. The existing lifecycle-manager.spec.ts
 * calls manager.register() manually, so it never checks whether the bootstrap
 * flow actually registers and fires hooks on real providers.
 */
describe("lifecycle hooks — real application boot", () => {
  it("fires onApplicationBootstrap on a provider that ONLY implements it", async () => {
    const fired: string[] = [];

    @Injectable()
    class BootOnly {
      onApplicationBootstrap() {
        fired.push("bootstrap");
      }
    }

    @Module({ providers: [BootOnly] })
    class AppModule {}

    await createElysiaApplication(AppModule);

    expect(fired).toEqual(["bootstrap"]);
  });

  it("fires both onModuleInit and onApplicationBootstrap when both exist", async () => {
    const fired: string[] = [];

    @Injectable()
    class Both {
      onModuleInit() {
        fired.push("init");
      }
      onApplicationBootstrap() {
        fired.push("bootstrap");
      }
    }

    @Module({ providers: [Both] })
    class AppModule {}

    await createElysiaApplication(AppModule);

    expect(fired).toEqual(["init", "bootstrap"]);
  });
});
