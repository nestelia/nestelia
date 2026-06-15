---
title: Queues (BullMQ)
icon: layers
description: Background job queues powered by BullMQ with decorator-based processors and DI integration
---

The BullMQ module integrates [BullMQ](https://docs.bullmq.io) job queues with nestelia's dependency injection, decorators, and lifecycle. Enqueue jobs through an injectable `QueueService`, and declare consumers as `@Processor` classes whose `@Process` methods are wired to workers automatically on bootstrap.

## Installation

```bash
bun add bullmq
```

`bullmq` is an optional peer dependency — install it only when you use this module. A running Redis (or Valkey) instance is required.

## Setup

```typescript
import { Module } from "nestelia";
import { QueueModule } from "nestelia/bullmq";

@Module({
  imports: [
    QueueModule.forRoot({
      connection: { host: "localhost", port: 6379 },
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1_000 },
        removeOnComplete: true,
      },
    }),
  ],
})
export class AppModule {}
```

`forRoot` registers the module globally by default, so `QueueService` is available everywhere without re-importing.

### Async configuration

Derive the connection from another provider with `forRootAsync`:

```typescript
QueueModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    connection: { host: config.get("REDIS_HOST"), port: 6379 },
  }),
});
```

## Producing jobs

Inject `QueueService` and call `add` (or `addDelayed`):

```typescript
import { Injectable } from "nestelia";
import { QueueService } from "nestelia/bullmq";

@Injectable()
export class EmailService {
  constructor(private readonly queue: QueueService) {}

  async sendWelcome(userId: string, email: string) {
    await this.queue.add("email", { userId, email }, { name: "welcome" });
  }

  async sendReminderLater(userId: string, email: string) {
    // Run 30 seconds from now.
    await this.queue.addDelayed("email", { userId, email }, { seconds: 30 });
  }
}
```

The job name defaults to the queue name; pass `options.name` to target a specific `@Process({ name })` handler. `addDelayed` accepts either raw milliseconds or a duration object (`{ minutes, seconds, hours, days, milliseconds }`).

## Consuming jobs

Mark a class with `@Processor(queueName)` and register it as a provider. On bootstrap the module starts one BullMQ worker for the queue and routes jobs to the class's `@Process` methods.

```typescript
import type { Job } from "bullmq";
import { Logger } from "nestelia";
import { Processor, Process, OnWorkerEvent } from "nestelia/bullmq";

@Processor("email", { concurrency: 5 })
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  // Handles jobs added under the name "welcome".
  @Process({ name: "welcome" })
  async sendWelcome(job: Job<{ email: string }>) {
    this.logger.log(`Sending welcome email to ${job.data.email}`);
    return { sentTo: job.data.email };
  }

  // Handles any other job on the "email" queue.
  @Process()
  async sendGeneric(job: Job) {
    this.logger.log(`Processing "${job.name}" (${job.id})`);
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job | undefined, err: Error) {
    this.logger.error(`Job ${job?.id} failed: ${err.message}`);
  }
}
```

> Register the processor as a `provider` in a module:
> ```typescript
> @Module({ providers: [EmailProcessor] })
> export class EmailModule {}
> ```

The `@Process` method receives the BullMQ `Job`; its return value becomes the job's result. Use `@Process({ name })` to route different job names to different methods within one processor class.

## Injecting a raw Queue

When you need the raw BullMQ `Queue` API rather than `QueueService`, register the queue and inject it:

```typescript
import { Queue } from "bullmq";
import { Module, Injectable } from "nestelia";
import { QueueModule, InjectQueue } from "nestelia/bullmq";

@Module({ imports: [QueueModule.registerQueue("email")] })
export class EmailModule {}

@Injectable()
export class EmailService {
  constructor(@InjectQueue("email") private readonly queue: Queue) {}
}
```

## Configuration

### QueueModuleOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `connection` | `ConnectionOptions` | — | Redis connection shared by every queue and worker |
| `prefix` | `string` | — | Key prefix applied to every BullMQ key in Redis |
| `defaultJobOptions` | `JobsOptions` | — | Default options merged into every `add()` |
| `isGlobal` | `boolean` | `true` | Register the module globally |

## QueueService API

| Method | Signature | Description |
|--------|-----------|-------------|
| `add` | `(queue, data, options?) → Promise<Job>` | Enqueue a job (job name defaults to the queue name) |
| `addDelayed` | `(queue, data, delay, options?) → Promise<Job>` | Enqueue a job to run after a delay |
| `getQueue` | `(name) → Queue` | Get/create the cached producer queue |
| `registerWorker` | `(queue, processor, options?) → Worker` | Manually start a worker (one per queue) |
| `getWorker` | `(name) → Worker \| undefined` | Get the worker for a queue |
| `close` | `() → Promise<void>` | Close all queues and workers (called on shutdown) |

## Exports

| Export | Description |
|--------|-------------|
| `QueueModule` | Module class (`forRoot`, `forRootAsync`, `registerQueue`) |
| `QueueService` | Injectable producer/consumer facade |
| `@Processor(queue, opts?)` | Class decorator marking a queue consumer |
| `@Process(opts?)` | Method decorator marking a job handler |
| `@OnWorkerEvent(event)` | Method decorator for worker events |
| `@InjectQueue(name)` | Parameter decorator injecting a raw `Queue` |
| `durationToMs(duration)` | Convert a duration object to milliseconds |
