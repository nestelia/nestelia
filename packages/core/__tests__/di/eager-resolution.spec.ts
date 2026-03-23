import "reflect-metadata";

import { beforeEach, describe, expect, it } from "bun:test";

import { Container } from "~/src/di/container";
import { Inject, Injectable, Optional } from "~/src/di/injectable.decorator";
import { DIError } from "~/src/di/injector";
import { initializeSingletonProviders } from "~/src/core/module.utils";

describe("Eager DI resolution", () => {
  let container: Container;

  beforeEach(() => {
    Container.instance.clear();
    container = Container.instance;
  });

  describe("missing provider detection", () => {
    it("throws DIError when a provider dependency is not found", async () => {
      @Injectable()
      class MissingDep {}

      @Injectable()
      class MyService {
        constructor(public dep: MissingDep) {}
      }

      class AppModule {}
      const mod = container.addModule(AppModule, "AppModule");
      // Register MyService but NOT MissingDep
      mod.addProvider(MyService);

      await expect(initializeSingletonProviders()).rejects.toThrow(DIError);
    });

    it("error message contains the consumer class name", async () => {
      @Injectable()
      class Database {}

      @Injectable()
      class ListingsService {
        constructor(public db: Database) {}
      }

      class ListingsModule {}
      const mod = container.addModule(ListingsModule, "ListingsModule");
      mod.addProvider(ListingsService);

      try {
        await initializeSingletonProviders();
        expect.unreachable("should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(DIError);
        expect((e as DIError).message).toContain("ListingsService");
      }
    });

    it("error message contains the missing dependency name", async () => {
      @Injectable()
      class Database {}

      @Injectable()
      class ListingsService {
        constructor(public db: Database) {}
      }

      class ListingsModule {}
      const mod = container.addModule(ListingsModule, "ListingsModule");
      mod.addProvider(ListingsService);

      try {
        await initializeSingletonProviders();
        expect.unreachable("should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(DIError);
        expect((e as DIError).message).toContain("Database");
      }
    });

    it("error message contains the module name", async () => {
      @Injectable()
      class Database {}

      @Injectable()
      class ListingsService {
        constructor(public db: Database) {}
      }

      class ListingsModule {}
      const mod = container.addModule(ListingsModule, "ListingsModule");
      mod.addProvider(ListingsService);

      try {
        await initializeSingletonProviders();
        expect.unreachable("should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(DIError);
        expect((e as DIError).message).toContain("ListingsModule");
      }
    });

    it("error message contains the parameter index", async () => {
      @Injectable()
      class KnownDep {
        value = 1;
      }

      @Injectable()
      class UnknownDep {}

      @Injectable()
      class MultiParamService {
        constructor(
          public known: KnownDep,
          public unknown: UnknownDep,
        ) {}
      }

      class TestModule {}
      const mod = container.addModule(TestModule, "TestModule");
      mod.addProvider(KnownDep);
      // UnknownDep is NOT registered
      mod.addProvider(MultiParamService);

      try {
        await initializeSingletonProviders();
        expect.unreachable("should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(DIError);
        expect((e as DIError).message).toContain("parameter 1");
      }
    });

    it("error message format matches expected pattern", async () => {
      @Injectable()
      class Database {}

      @Injectable()
      class ListingsService {
        constructor(public db: Database) {}
      }

      class ListingsModule {}
      const mod = container.addModule(ListingsModule, "ListingsModule");
      mod.addProvider(ListingsService);

      try {
        await initializeSingletonProviders();
        expect.unreachable("should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(DIError);
        const msg = (e as DIError).message;
        // Must contain all key pieces
        expect(msg).toMatch(/DI Error/);
        expect(msg).toMatch(/Cannot resolve dependency/);
        expect(msg).toMatch(/ListingsService/);
        expect(msg).toMatch(/parameter 0/);
        expect(msg).toMatch(/Database/);
        expect(msg).toMatch(/ListingsModule/);
      }
    });
  });

  describe("missing controller dependency detection", () => {
    it("throws DIError when a controller dependency is not found", async () => {
      @Injectable()
      class MissingService {}

      // Controller needs at least one decorator for TS to emit design:paramtypes
      @Injectable()
      class MyController {
        constructor(public svc: MissingService) {}
      }

      class AppModule {}
      const mod = container.addModule(AppModule, "AppModule");
      mod.addController(MyController);

      await expect(initializeSingletonProviders()).rejects.toThrow(DIError);
    });
  });

  describe("circular dependency detection", () => {
    it("throws DIError for direct circular dependency (A → B → A)", async () => {
      // Need to use @Inject to set up circular refs since TS design:paramtypes
      // can't handle forward references in the same scope
      @Injectable()
      class ServiceB {
        constructor(@Inject("ServiceA") public a: unknown) {}
      }

      @Injectable()
      class ServiceA {
        constructor(public b: ServiceB) {}
      }

      class TestModule {}
      const mod = container.addModule(TestModule, "TestModule");
      mod.addProvider(ServiceA);
      mod.addProvider(ServiceB);
      mod.addProvider({ provide: "ServiceA", useExisting: ServiceA });

      try {
        await initializeSingletonProviders();
        expect.unreachable("should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(DIError);
        expect((e as DIError).message).toContain("Circular dependency");
      }
    });

    it("throws DIError for self-referencing dependency", async () => {
      @Injectable()
      class SelfRef {
        constructor(@Inject("SELF") public self: unknown) {}
      }

      class TestModule {}
      const mod = container.addModule(TestModule, "TestModule");
      mod.addProvider(SelfRef);
      mod.addProvider({ provide: "SELF", useExisting: SelfRef });

      try {
        await initializeSingletonProviders();
        expect.unreachable("should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(DIError);
        expect((e as DIError).message).toContain("Circular dependency");
      }
    });
  });

  describe("@Optional() dependencies", () => {
    it("does not throw for optional missing dependency", async () => {
      @Injectable()
      class MissingDep {}

      @Injectable()
      class ServiceWithOptional {
        constructor(@Optional() public dep: MissingDep) {}
      }

      class TestModule {}
      const mod = container.addModule(TestModule, "TestModule");
      mod.addProvider(ServiceWithOptional);

      // Should NOT throw
      await initializeSingletonProviders();

      const instance = await container.get<ServiceWithOptional>(ServiceWithOptional);
      expect(instance).toBeDefined();
      expect(instance!.dep).toBeUndefined();
    });

    it("resolves optional dependency when it IS available", async () => {
      @Injectable()
      class OptionalDep {
        value = "present";
      }

      @Injectable()
      class ServiceWithOptional {
        constructor(@Optional() public dep: OptionalDep) {}
      }

      class TestModule {}
      const mod = container.addModule(TestModule, "TestModule");
      mod.addProvider(OptionalDep);
      mod.addProvider(ServiceWithOptional);

      await initializeSingletonProviders();

      const instance = await container.get<ServiceWithOptional>(ServiceWithOptional);
      expect(instance).toBeDefined();
      expect(instance!.dep).toBeInstanceOf(OptionalDep);
      expect(instance!.dep.value).toBe("present");
    });
  });

  describe("factory provider with missing dependency", () => {
    it("throws DIError when factory inject token is not found", async () => {
      const TOKEN = Symbol("factory");
      const MISSING = Symbol("missing");

      class TestModule {}
      const mod = container.addModule(TestModule, "TestModule");
      mod.addProvider({
        provide: TOKEN,
        useFactory: (dep: unknown) => ({ dep }),
        inject: [MISSING],
      });

      await expect(initializeSingletonProviders()).rejects.toThrow(DIError);
    });

    it("does not throw for optional factory dependency", async () => {
      const TOKEN = Symbol("factory");
      const MISSING = Symbol("missing");

      class TestModule {}
      const mod = container.addModule(TestModule, "TestModule");
      mod.addProvider({
        provide: TOKEN,
        useFactory: (dep: unknown) => ({ dep: dep ?? "default" }),
        inject: [{ token: MISSING, optional: true }],
      });

      await initializeSingletonProviders();

      const instance = await container.get<{ dep: string }>(TOKEN);
      expect(instance).toBeDefined();
      expect(instance!.dep).toBe("default");
    });
  });

  describe("successful eager resolution", () => {
    it("all providers are resolved eagerly at bootstrap", async () => {
      const constructorCalls: string[] = [];

      @Injectable()
      class RepoService {
        constructor() {
          constructorCalls.push("RepoService");
        }
      }

      @Injectable()
      class BusinessService {
        constructor(public repo: RepoService) {
          constructorCalls.push("BusinessService");
        }
      }

      class AppModule {}
      const mod = container.addModule(AppModule, "AppModule");
      mod.addProvider(RepoService);
      mod.addProvider(BusinessService);

      await initializeSingletonProviders();

      // Both constructors must have been called during eager init
      expect(constructorCalls).toContain("RepoService");
      expect(constructorCalls).toContain("BusinessService");
    });

    it("controllers are resolved eagerly", async () => {
      let controllerInstantiated = false;

      @Injectable()
      class SomeService {
        value = "ok";
      }

      class SomeController {
        constructor(public svc: SomeService) {
          controllerInstantiated = true;
        }
      }

      class AppModule {}
      const mod = container.addModule(AppModule, "AppModule");
      mod.addProvider(SomeService);
      mod.addController(SomeController);

      await initializeSingletonProviders();

      expect(controllerInstantiated).toBe(true);
    });
  });

  describe("cross-module missing dependency", () => {
    it("throws DIError with correct module name for cross-module failure", async () => {
      @Injectable()
      class ExternalDep {}

      @Injectable()
      class FeatureService {
        constructor(public dep: ExternalDep) {}
      }

      class FeatureModule {}
      class AppModule {}

      const featureMod = container.addModule(FeatureModule, "FeatureModule");
      featureMod.addProvider(FeatureService);
      // ExternalDep is NOT registered anywhere

      const appMod = container.addModule(AppModule, "AppModule");
      appMod.addImport(featureMod);

      try {
        await initializeSingletonProviders();
        expect.unreachable("should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(DIError);
        const msg = (e as DIError).message;
        expect(msg).toContain("FeatureService");
        expect(msg).toContain("ExternalDep");
        expect(msg).toContain("FeatureModule");
      }
    });
  });
});
