import "reflect-metadata";
import { describe, expect, it, mock } from "bun:test";

/**
 * Boots a real application through `createElysiaApplication` to prove the
 * lifecycle wiring works end-to-end — i.e. that the framework actually invokes
 * QueueExplorer and a Worker is started.
 *
 * This is the gap the unit tests miss: they call `explorer.onModuleInit()`
 * directly, so they never exercise whether the LifecycleManager registers and
 * fires the hook at all. A provider that only implements `onApplicationBootstrap`
 * (without `onModuleInit`) is never registered, so its hook never runs — exactly
 * the bug this test guards against.
 */

class MockQueue {
  static instances: MockQueue[] = [];
  add = mock(async () => ({ id: "1" }));
  close = mock(async () => {});
  constructor(
    public name: string,
    public options: unknown,
  ) {
    MockQueue.instances.push(this);
  }
}

class MockWorker {
  static instances: MockWorker[] = [];
  close = mock(async () => {});
  constructor(
    public name: string,
    public processor: (job: { name: string; data: unknown }) => Promise<unknown>,
    public options: unknown,
  ) {
    MockWorker.instances.push(this);
  }
  on() {
    return this;
  }
}

mock.module("bullmq", () => ({ Queue: MockQueue, Worker: MockWorker }));

const { QueueModule, Processor, Process } = await import("../src");
const { Module, Injectable } = await import("nestelia");
const { createElysiaApplication } = await import("../../../index");

describe("QueueModule — application bootstrap", () => {
  it("starts a worker for a @Processor when the app boots", async () => {
    const processed: string[] = [];

    @Processor("email")
    @Injectable()
    class EmailProcessor {
      @Process()
      handle(job: { name: string; data: unknown }) {
        processed.push(job.name);
      }
    }

    @Module({
      imports: [
        QueueModule.forRoot({
          connection: { host: "localhost", port: 6379 },
        }),
      ],
      providers: [EmailProcessor],
    })
    class AppModule {}

    MockWorker.instances.length = 0;

    await createElysiaApplication(AppModule);

    // The explorer fired through the real lifecycle and created a worker.
    expect(MockWorker.instances).toHaveLength(1);
    expect(MockWorker.instances[0]!.name).toBe("email");

    // And that worker actually routes jobs to the @Process method.
    await MockWorker.instances[0]!.processor({ name: "email", data: {} });
    expect(processed).toEqual(["email"]);
  });
});
