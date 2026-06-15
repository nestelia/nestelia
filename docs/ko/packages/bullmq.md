---
title: Queues (BullMQ)
icon: layers
description: 데코레이터 기반 프로세서와 DI 통합을 갖춘 BullMQ 기반 백그라운드 작업 큐
---

BullMQ 모듈은 [BullMQ](https://docs.bullmq.io) 작업 큐를 nestelia의 의존성 주입, 데코레이터, 라이프사이클과 통합합니다. 주입 가능한 `QueueService`를 통해 작업을 큐에 추가하고, `@Process` 메서드가 부트스트랩 시 자동으로 워커에 연결되는 `@Processor` 클래스로 컨슈머를 선언합니다.

## 설치

```bash
bun add bullmq
```

`bullmq`는 선택적 peer 의존성입니다 — 이 모듈을 사용할 때만 설치하세요. 실행 중인 Redis(또는 Valkey) 인스턴스가 필요합니다.

## 설정

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

`forRoot`는 기본적으로 모듈을 전역으로 등록하므로, 다시 임포트하지 않아도 어디서나 `QueueService`를 사용할 수 있습니다.

### 비동기 설정

`forRootAsync`로 다른 프로바이더에서 연결 정보를 가져올 수 있습니다:

```typescript
QueueModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    connection: { host: config.get("REDIS_HOST"), port: 6379 },
  }),
});
```

## 작업 생성

`QueueService`를 주입하고 `add`(또는 `addDelayed`)를 호출합니다:

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
    // 지금부터 30초 후에 실행.
    await this.queue.addDelayed("email", { userId, email }, { seconds: 30 });
  }
}
```

작업 이름은 기본적으로 큐 이름으로 설정됩니다. 특정 `@Process({ name })` 핸들러를 지정하려면 `options.name`을 전달하세요. `addDelayed`는 밀리초 값 또는 기간 객체(`{ minutes, seconds, hours, days, milliseconds }`)를 모두 받습니다.

## 작업 소비

클래스에 `@Processor(queueName)`를 표시하고 프로바이더로 등록합니다. 부트스트랩 시 모듈은 해당 큐에 대해 하나의 BullMQ 워커를 시작하고 작업을 클래스의 `@Process` 메서드로 라우팅합니다.

```typescript
import type { Job } from "bullmq";
import { Logger } from "nestelia";
import { Processor, Process, OnWorkerEvent } from "nestelia/bullmq";

@Processor("email", { concurrency: 5 })
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  // "welcome" 이름으로 추가된 작업을 처리합니다.
  @Process({ name: "welcome" })
  async sendWelcome(job: Job<{ email: string }>) {
    this.logger.log(`Sending welcome email to ${job.data.email}`);
    return { sentTo: job.data.email };
  }

  // "email" 큐의 다른 모든 작업을 처리합니다.
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

> 프로세서를 모듈의 `provider`로 등록하세요:
> ```typescript
> @Module({ providers: [EmailProcessor] })
> export class EmailModule {}
> ```

`@Process` 메서드는 BullMQ `Job`을 받으며, 그 반환값이 작업의 결과가 됩니다. 하나의 프로세서 클래스 안에서 서로 다른 작업 이름을 서로 다른 메서드로 라우팅하려면 `@Process({ name })`을 사용하세요.

## 원시 Queue 주입

`QueueService` 대신 원시 BullMQ `Queue` API가 필요할 때는 큐를 등록하고 주입합니다:

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

## 설정

### QueueModuleOptions

| 옵션 | 타입 | 기본값 | 설명 |
|--------|------|---------|-------------|
| `connection` | `ConnectionOptions` | — | 모든 큐와 워커가 공유하는 Redis 연결 |
| `prefix` | `string` | — | Redis의 모든 BullMQ 키에 적용되는 키 접두사 |
| `defaultJobOptions` | `JobsOptions` | — | 모든 `add()`에 병합되는 기본 옵션 |
| `isGlobal` | `boolean` | `true` | 모듈을 전역으로 등록 |

## QueueService API

| 메서드 | 시그니처 | 설명 |
|--------|-----------|-------------|
| `add` | `(queue, data, options?) → Promise<Job>` | 작업을 큐에 추가 (작업 이름은 기본적으로 큐 이름) |
| `addDelayed` | `(queue, data, delay, options?) → Promise<Job>` | 지연 후 실행되도록 작업을 큐에 추가 |
| `getQueue` | `(name) → Queue` | 캐시된 프로듀서 큐를 가져오거나 생성 |
| `registerWorker` | `(queue, processor, options?) → Worker` | 워커를 수동으로 시작 (큐당 하나) |
| `getWorker` | `(name) → Worker \| undefined` | 큐의 워커를 가져옴 |
| `close` | `() → Promise<void>` | 모든 큐와 워커를 종료 (셧다운 시 호출됨) |

## 내보내기

| 내보내기 | 설명 |
|--------|-------------|
| `QueueModule` | 모듈 클래스 (`forRoot`, `forRootAsync`, `registerQueue`) |
| `QueueService` | 주입 가능한 프로듀서/컨슈머 파사드 |
| `@Processor(queue, opts?)` | 큐 컨슈머를 표시하는 클래스 데코레이터 |
| `@Process(opts?)` | 작업 핸들러를 표시하는 메서드 데코레이터 |
| `@OnWorkerEvent(event)` | 워커 이벤트용 메서드 데코레이터 |
| `@InjectQueue(name)` | 원시 `Queue`를 주입하는 파라미터 데코레이터 |
| `durationToMs(duration)` | 기간 객체를 밀리초로 변환 |
