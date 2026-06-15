---
title: Queues (BullMQ)
icon: layers
description: 基于 BullMQ 的后台任务队列，支持基于装饰器的处理器和依赖注入集成
---

BullMQ 模块将 [BullMQ](https://docs.bullmq.io) 任务队列与 nestelia 的依赖注入、装饰器和生命周期集成在一起。通过可注入的 `QueueService` 将任务入队，并将消费者声明为 `@Processor` 类，其 `@Process` 方法会在启动时自动连接到 worker。

## 安装

```bash
bun add bullmq
```

`bullmq` 是一个可选的 peer 依赖——仅在使用该模块时才需安装。需要一个正在运行的 Redis（或 Valkey）实例。

## 配置

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

`forRoot` 默认将模块注册为全局，因此 `QueueService` 在任何地方都可用，无需重新导入。

### 异步配置

使用 `forRootAsync` 从另一个提供者派生连接：

```typescript
QueueModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    connection: { host: config.get("REDIS_HOST"), port: 6379 },
  }),
});
```

## 生产任务

注入 `QueueService` 并调用 `add`（或 `addDelayed`）：

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
    // 从现在起 30 秒后运行。
    await this.queue.addDelayed("email", { userId, email }, { seconds: 30 });
  }
}
```

任务名默认为队列名；传入 `options.name` 可以指定特定的 `@Process({ name })` 处理器。`addDelayed` 接受原始毫秒数或一个时长对象（`{ minutes, seconds, hours, days, milliseconds }`）。

## 消费任务

用 `@Processor(queueName)` 标记一个类并将其注册为提供者。在启动时，模块会为该队列启动一个 BullMQ worker，并将任务路由到该类的 `@Process` 方法。

```typescript
import type { Job } from "bullmq";
import { Logger } from "nestelia";
import { Processor, Process, OnWorkerEvent } from "nestelia/bullmq";

@Processor("email", { concurrency: 5 })
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  // 处理以 "welcome" 为名添加的任务。
  @Process({ name: "welcome" })
  async sendWelcome(job: Job<{ email: string }>) {
    this.logger.log(`Sending welcome email to ${job.data.email}`);
    return { sentTo: job.data.email };
  }

  // 处理 "email" 队列上的其他任务。
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

> 在模块中将处理器注册为 `provider`：
> ```typescript
> @Module({ providers: [EmailProcessor] })
> export class EmailModule {}
> ```

`@Process` 方法接收 BullMQ 的 `Job`；其返回值将成为任务的结果。使用 `@Process({ name })` 可以将不同的任务名路由到同一个处理器类中的不同方法。

## 注入原始 Queue

当你需要原始的 BullMQ `Queue` API 而非 `QueueService` 时，注册该队列并注入它：

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

## 配置选项

### QueueModuleOptions

| 选项 | 类型 | 默认值 | 描述 |
|--------|------|---------|-------------|
| `connection` | `ConnectionOptions` | — | 所有队列和 worker 共享的 Redis 连接 |
| `prefix` | `string` | — | 应用到 Redis 中每个 BullMQ key 的 key 前缀 |
| `defaultJobOptions` | `JobsOptions` | — | 合并到每次 `add()` 的默认选项 |
| `isGlobal` | `boolean` | `true` | 将模块注册为全局 |

## QueueService API

| 方法 | 签名 | 描述 |
|--------|-----------|-------------|
| `add` | `(queue, data, options?) → Promise<Job>` | 将任务入队（任务名默认为队列名） |
| `addDelayed` | `(queue, data, delay, options?) → Promise<Job>` | 将任务入队，在延迟后运行 |
| `getQueue` | `(name) → Queue` | 获取/创建已缓存的生产者队列 |
| `registerWorker` | `(queue, processor, options?) → Worker` | 手动启动一个 worker（每个队列一个） |
| `getWorker` | `(name) → Worker \| undefined` | 获取某个队列的 worker |
| `close` | `() → Promise<void>` | 关闭所有队列和 worker（在关闭时调用） |

## 导出

| 导出 | 描述 |
|--------|-------------|
| `QueueModule` | 模块类（`forRoot`、`forRootAsync`、`registerQueue`） |
| `QueueService` | 可注入的生产者/消费者门面 |
| `@Processor(queue, opts?)` | 标记队列消费者的类装饰器 |
| `@Process(opts?)` | 标记任务处理器的方法装饰器 |
| `@OnWorkerEvent(event)` | 用于 worker 事件的方法装饰器 |
| `@InjectQueue(name)` | 注入原始 `Queue` 的参数装饰器 |
| `durationToMs(duration)` | 将时长对象转换为毫秒 |
