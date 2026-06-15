import "reflect-metadata";

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

/**
 * Memory leak tests for the BullMQ integration.
 *
 * The risks guarded here:
 * 1. `QueueService` caches a `Queue` per name and a `Worker` per queue in
 *    `Map`s — `close()` must drop every reference, otherwise queues/workers (and
 *    their Redis connections) leak across app restarts in tests.
 * 2. `registerWorker()` must not create a second `Worker` for a queue that
 *    already has one — repeated registration would accumulate workers + sockets.
 * 3. `QueueExplorer.onModuleDestroy()` must release everything `QueueService`
 *    holds so a bootstrap→destroy cycle returns to zero.
 */

class MockQueue {
  static live = 0;
  closed = false;
  constructor(
    public name: string,
    public options: unknown,
  ) {
    MockQueue.live++;
  }
  add = mock(async () => ({ id: "1" }));
  async close() {
    if (!this.closed) {
      this.closed = true;
      MockQueue.live--;
    }
  }
}

class MockWorker {
  static live = 0;
  closed = false;
  constructor(
    public name: string,
    public processor: unknown,
    public options: unknown,
  ) {
    MockWorker.live++;
  }
  on() {
    return this;
  }
  async close() {
    if (!this.closed) {
      this.closed = true;
      MockWorker.live--;
    }
  }
}

mock.module("bullmq", () => ({ Queue: MockQueue, Worker: MockWorker }));

const { QueueService } = await import("../../src/bullmq.service");
const { QueueExplorer } = await import("../../src/bullmq.explorer");

const options = { connection: { host: "localhost", port: 6379 } };

// Reach into the private maps to assert references are actually dropped.
function maps(service: object) {
  return service as unknown as {
    queues: Map<string, unknown>;
    workers: Map<string, unknown>;
  };
}

beforeEach(() => {
  MockQueue.live = 0;
  MockWorker.live = 0;
});

describe("QueueService — memory leak", () => {
  let service: InstanceType<typeof QueueService>;

  afterEach(async () => {
    await service?.close();
  });

  it("close() drops every cached queue and worker reference", async () => {
    service = new QueueService(options);

    for (let i = 0; i < 50; i++) {
      service.getQueue(`queue-${i}`);
      service.registerWorker(`queue-${i}`, async () => {});
    }

    expect(maps(service).queues.size).toBe(50);
    expect(maps(service).workers.size).toBe(50);
    expect(MockQueue.live).toBe(50);
    expect(MockWorker.live).toBe(50);

    await service.close();

    expect(maps(service).queues.size).toBe(0);
    expect(maps(service).workers.size).toBe(0);
    expect(MockQueue.live).toBe(0);
    expect(MockWorker.live).toBe(0);
  });

  it("registerWorker() never creates more than one worker per queue", () => {
    service = new QueueService(options);

    for (let i = 0; i < 100; i++) {
      service.registerWorker("hot-queue", async () => {});
    }

    expect(maps(service).workers.size).toBe(1);
    expect(MockWorker.live).toBe(1);
  });

  it("getQueue() reuses the cached instance instead of leaking new ones", () => {
    service = new QueueService(options);

    for (let i = 0; i < 100; i++) {
      service.getQueue("same");
    }

    expect(maps(service).queues.size).toBe(1);
    expect(MockQueue.live).toBe(1);
  });

  it("repeated bootstrap→destroy cycles return to zero live resources", async () => {
    for (let cycle = 0; cycle < 5; cycle++) {
      const cycleService = new QueueService(options);
      const explorer = new QueueExplorer(cycleService);

      cycleService.getQueue("a");
      cycleService.registerWorker("a", async () => {});
      cycleService.getQueue("b");
      cycleService.registerWorker("b", async () => {});

      await explorer.onModuleDestroy();

      expect(maps(cycleService).queues.size).toBe(0);
      expect(maps(cycleService).workers.size).toBe(0);
    }

    expect(MockQueue.live).toBe(0);
    expect(MockWorker.live).toBe(0);
  });
});
