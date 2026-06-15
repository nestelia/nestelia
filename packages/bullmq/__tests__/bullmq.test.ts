import "reflect-metadata";
import { beforeEach, describe, expect, it, mock } from "bun:test";

// ─── Mock bullmq so tests need no Redis ──────────────────────────────────────

interface MockJob {
  name: string;
  data: unknown;
}

const queueAdd = mock(async (name: string, data: unknown, opts?: unknown) => ({
  id: "1",
  name,
  data,
  opts,
}));
const queueClose = mock(async () => {});
const workerClose = mock(async () => {});

class MockQueue {
  static instances: MockQueue[] = [];
  add = queueAdd;
  close = queueClose;
  constructor(
    public name: string,
    public options: unknown,
  ) {
    MockQueue.instances.push(this);
  }
}

class MockWorker {
  static instances: MockWorker[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listeners: Record<string, (...args: any[]) => void> = {};
  close = workerClose;
  constructor(
    public name: string,
    public processor: (job: MockJob) => Promise<unknown>,
    public options: unknown,
  ) {
    MockWorker.instances.push(this);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, cb: (...args: any[]) => void) {
    this.listeners[event] = cb;
    return this;
  }
}

mock.module("bullmq", () => ({
  Queue: MockQueue,
  Worker: MockWorker,
}));

// Import AFTER the mock is registered.
const { QueueService } = await import("../src/bullmq.service");
const { QueueExplorer } = await import("../src/bullmq.explorer");
const { Processor, Process, OnWorkerEvent, InjectQueue } = await import(
  "../src/decorators"
);
const {
  PROCESSOR_METADATA,
  PROCESS_METADATA,
  WORKER_EVENT_METADATA,
  getQueueToken,
} = await import("../src/bullmq.constants");
const { durationToMs } = await import("../src/utils");
const { Container, STATIC_CONTEXT } = await import("nestelia");

const options = { connection: { host: "localhost", port: 6379 } };

beforeEach(() => {
  MockQueue.instances.length = 0;
  MockWorker.instances.length = 0;
  queueAdd.mockClear();
  queueClose.mockClear();
  workerClose.mockClear();
  Container.instance.clear();
});

// ─── decorators ──────────────────────────────────────────────────────────────

describe("decorators", () => {
  it("@Processor stores queue name and options on the class", () => {
    @Processor("email", { concurrency: 4 })
    class EmailProcessor {}

    expect(Reflect.getMetadata(PROCESSOR_METADATA, EmailProcessor)).toEqual({
      queueName: "email",
      options: { concurrency: 4 },
    });
  });

  it("@Process records each handler with optional job name", () => {
    class MediaProcessor {
      @Process()
      fallback() {}
      @Process({ name: "resize" })
      resize() {}
    }

    expect(Reflect.getMetadata(PROCESS_METADATA, MediaProcessor)).toEqual([
      { methodName: "fallback", name: undefined },
      { methodName: "resize", name: "resize" },
    ]);
  });

  it("@OnWorkerEvent records the event and method", () => {
    class P {
      @OnWorkerEvent("completed")
      onDone() {}
    }

    expect(Reflect.getMetadata(WORKER_EVENT_METADATA, P)).toEqual([
      { methodName: "onDone", event: "completed" },
    ]);
  });

  it("@InjectQueue injects the queue token", () => {
    expect(getQueueToken("email")).toBe("BullQueue_email");
    // Should not throw — produces a parameter decorator.
    expect(typeof InjectQueue("email")).toBe("function");
  });
});

// ─── durationToMs ────────────────────────────────────────────────────────────

describe("durationToMs", () => {
  it("passes through raw numbers", () => {
    expect(durationToMs(500)).toBe(500);
  });

  it("sums duration parts", () => {
    expect(durationToMs({ minutes: 1, seconds: 30 })).toBe(90_000);
    expect(durationToMs({ hours: 2 })).toBe(7_200_000);
    expect(durationToMs({ days: 1 })).toBe(86_400_000);
  });
});

// ─── QueueService ────────────────────────────────────────────────────────────

describe("QueueService", () => {
  it("creates and caches a queue per name", () => {
    const service = new QueueService(options);
    const a = service.getQueue("email");
    const b = service.getQueue("email");
    const c = service.getQueue("media");

    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(MockQueue.instances).toHaveLength(2);
  });

  it("add() defaults job name to the queue name", async () => {
    const service = new QueueService(options);
    await service.add("email", { userId: "1" }, { attempts: 3 });

    expect(queueAdd).toHaveBeenCalledWith(
      "email",
      { userId: "1" },
      { attempts: 3 },
    );
  });

  it("add() honours an explicit job name", async () => {
    const service = new QueueService(options);
    await service.add("media", { id: "1" }, { name: "resize" });

    expect(queueAdd).toHaveBeenCalledWith("resize", { id: "1" }, {});
  });

  it("addDelayed() converts the duration to a delay in ms", async () => {
    const service = new QueueService(options);
    await service.addDelayed("email", { userId: "1" }, { seconds: 5 });

    expect(queueAdd).toHaveBeenCalledWith(
      "email",
      { userId: "1" },
      { delay: 5_000 },
    );
  });

  it("registerWorker() creates one worker per queue", () => {
    const service = new QueueService(options);
    const handler = async () => {};
    const first = service.registerWorker("email", handler);
    const second = service.registerWorker("email", handler);

    expect(first).toBe(second);
    expect(MockWorker.instances).toHaveLength(1);
  });

  it("close() closes every worker and queue", async () => {
    const service = new QueueService(options);
    service.getQueue("email");
    service.registerWorker("email", async () => {});

    await service.close();

    expect(queueClose).toHaveBeenCalledTimes(1);
    expect(workerClose).toHaveBeenCalledTimes(1);
  });
});

// ─── QueueExplorer ───────────────────────────────────────────────────────────

function mountProvider(instance: object) {
  const ctor = instance.constructor as new (...args: unknown[]) => unknown;
  const moduleRef = Container.instance.addModule(ctor, "TestModule");
  moduleRef.addProvider(ctor);
  const wrapper = moduleRef.getProviderByKey(ctor)!;
  wrapper.setInstanceByContextId(STATIC_CONTEXT, {
    instance,
    isResolved: true,
    isPending: false,
  });
}

describe("QueueExplorer", () => {
  it("starts a worker and routes jobs to @Process handlers", async () => {
    const calls: string[] = [];

    @Processor("media")
    class MediaProcessor {
      @Process({ name: "resize" })
      resize(job: MockJob) {
        calls.push(`resize:${(job.data as { id: string }).id}`);
      }
      @Process()
      fallback(job: MockJob) {
        calls.push(`fallback:${job.name}`);
      }
    }

    const service = new QueueService(options);
    const explorer = new QueueExplorer(service);
    mountProvider(new MediaProcessor());

    explorer.onModuleInit();

    expect(MockWorker.instances).toHaveLength(1);
    const worker = MockWorker.instances[0]!;

    await worker.processor({ name: "resize", data: { id: "42" } });
    await worker.processor({ name: "other", data: { id: "x" } });

    expect(calls).toEqual(["resize:42", "fallback:other"]);
  });

  it("wires @OnWorkerEvent listeners to the worker", () => {
    const seen: string[] = [];

    @Processor("email")
    class EmailProcessor {
      @Process()
      handle() {}
      @OnWorkerEvent("completed")
      onCompleted(job: MockJob) {
        seen.push(`done:${job.name}`);
      }
    }

    const service = new QueueService(options);
    const explorer = new QueueExplorer(service);
    mountProvider(new EmailProcessor());

    explorer.onModuleInit();

    const worker = MockWorker.instances[0]!;
    worker.listeners.completed!({ name: "email" });

    expect(seen).toEqual(["done:email"]);
  });

  it("skips a @Processor with no @Process methods", () => {
    @Processor("empty")
    class EmptyProcessor {}

    const service = new QueueService(options);
    const explorer = new QueueExplorer(service);
    mountProvider(new EmptyProcessor());

    explorer.onModuleInit();

    expect(MockWorker.instances).toHaveLength(0);
  });

  it("closes the service on destroy", async () => {
    const service = new QueueService(options);
    const explorer = new QueueExplorer(service);
    service.getQueue("email");

    await explorer.onModuleDestroy();

    expect(queueClose).toHaveBeenCalledTimes(1);
  });
});
