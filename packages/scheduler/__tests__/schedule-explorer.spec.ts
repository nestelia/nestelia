import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Container } from "nestelia";
import { initializeSingletonProviders } from "~/src/core/module.utils";
import { Cron, ScheduleModule, getScheduler } from "../src";

describe("ScheduleExplorer", () => {
  let container: Container;

  beforeEach(() => {
    Container.instance.clear();
    container = Container.instance;
  });

  afterEach(() => {
    getScheduler().cancelAllTasks();
  });

  it("should register @Cron decorated methods via DI", async () => {
    let executed = false;

    class TestService {
      @Cron("* * * * * *", { name: "test-cron" })
      handleCron() {
        executed = true;
      }
    }

    class TestModule {}

    const moduleRef = container.addModule(TestModule, "TestModule");
    moduleRef.addProvider(TestService);

    const scheduleModule = ScheduleModule.forRoot();
    for (const provider of scheduleModule.providers ?? []) {
      moduleRef.addProvider(provider);
    }

    await initializeSingletonProviders();

    await new Promise((resolve) => setTimeout(resolve, 1100));

    expect(executed).toBe(true);
  });

  it("should not double-register jobs on multiple init cycles", async () => {
    class TestService {
      @Cron("0 0 * * *", { name: "dedup-cron" })
      handleCron() {}
    }

    class TestModule {}

    const moduleRef = container.addModule(TestModule, "TestModule");
    moduleRef.addProvider(TestService);

    const scheduleModule = ScheduleModule.forRoot();
    for (const provider of scheduleModule.providers ?? []) {
      moduleRef.addProvider(provider);
    }

    await initializeSingletonProviders();

    const tasksAfterFirst = getScheduler().getTasks().length;

    await initializeSingletonProviders();

    const tasksAfterSecond = getScheduler().getTasks().length;

    expect(tasksAfterFirst).toBe(1);
    expect(tasksAfterSecond).toBe(1);
  });
});
