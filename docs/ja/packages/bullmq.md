---
title: Queues (BullMQ)
icon: layers
description: デコレーターベースのプロセッサーと DI 統合を備えた、BullMQ による バックグラウンドジョブキュー
---

BullMQ モジュールは、[BullMQ](https://docs.bullmq.io) のジョブキューを nestelia の依存性注入、デコレーター、ライフサイクルと統合します。インジェクタブルな `QueueService` を通じてジョブをエンキューし、コンシューマーを `@Processor` クラスとして宣言します。その `@Process` メソッドは、ブートストラップ時に自動的にワーカーへ接続されます。

## インストール

```bash
bun add bullmq
```

`bullmq` はオプションのピア依存関係です — このモジュールを使用する場合のみインストールしてください。実行中の Redis（または Valkey）インスタンスが必要です。

## セットアップ

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

`forRoot` はデフォルトでモジュールをグローバルに登録するため、再インポートせずにどこでも `QueueService` を利用できます。

### 非同期設定

`forRootAsync` を使って、別のプロバイダーから接続情報を導出します：

```typescript
QueueModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    connection: { host: config.get("REDIS_HOST"), port: 6379 },
  }),
});
```

## ジョブの生成

`QueueService` を注入し、`add`（または `addDelayed`）を呼び出します：

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
    // 30 秒後に実行する。
    await this.queue.addDelayed("email", { userId, email }, { seconds: 30 });
  }
}
```

ジョブ名はデフォルトでキュー名になります。特定の `@Process({ name })` ハンドラーを対象にするには `options.name` を渡します。`addDelayed` は生のミリ秒、または期間オブジェクト（`{ minutes, seconds, hours, days, milliseconds }`）のいずれかを受け取ります。

## ジョブの消費

クラスに `@Processor(queueName)` を付与し、プロバイダーとして登録します。ブートストラップ時に、モジュールはそのキュー用の BullMQ ワーカーを 1 つ起動し、ジョブをクラスの `@Process` メソッドへルーティングします。

```typescript
import type { Job } from "bullmq";
import { Logger } from "nestelia";
import { Processor, Process, OnWorkerEvent } from "nestelia/bullmq";

@Processor("email", { concurrency: 5 })
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  // "welcome" という名前で追加されたジョブを処理する。
  @Process({ name: "welcome" })
  async sendWelcome(job: Job<{ email: string }>) {
    this.logger.log(`Sending welcome email to ${job.data.email}`);
    return { sentTo: job.data.email };
  }

  // "email" キュー上のその他のジョブを処理する。
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

> プロセッサーをモジュールの `provider` として登録します：
> ```typescript
> @Module({ providers: [EmailProcessor] })
> export class EmailModule {}
> ```

`@Process` メソッドは BullMQ の `Job` を受け取り、その戻り値がジョブの結果になります。`@Process({ name })` を使うと、1 つのプロセッサークラス内で異なるジョブ名を異なるメソッドへルーティングできます。

## 生の Queue の注入

`QueueService` ではなく生の BullMQ `Queue` API が必要な場合は、キューを登録して注入します：

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

## 設定

### QueueModuleOptions

| オプション | 型 | デフォルト | 説明 |
|--------|------|---------|-------------|
| `connection` | `ConnectionOptions` | — | すべてのキューとワーカーで共有される Redis 接続 |
| `prefix` | `string` | — | Redis 内のすべての BullMQ キーに適用されるキープレフィックス |
| `defaultJobOptions` | `JobsOptions` | — | すべての `add()` にマージされるデフォルトオプション |
| `isGlobal` | `boolean` | `true` | モジュールをグローバルに登録する |

## QueueService API

| メソッド | シグネチャ | 説明 |
|--------|-----------|-------------|
| `add` | `(queue, data, options?) → Promise<Job>` | ジョブをエンキューする（ジョブ名はデフォルトでキュー名になる） |
| `addDelayed` | `(queue, data, delay, options?) → Promise<Job>` | 遅延後に実行するジョブをエンキューする |
| `getQueue` | `(name) → Queue` | キャッシュされたプロデューサーキューを取得／作成する |
| `registerWorker` | `(queue, processor, options?) → Worker` | ワーカーを手動で起動する（キューごとに 1 つ） |
| `getWorker` | `(name) → Worker \| undefined` | キューのワーカーを取得する |
| `close` | `() → Promise<void>` | すべてのキューとワーカーを閉じる（シャットダウン時に呼び出される） |

## エクスポート

| エクスポート | 説明 |
|--------|-------------|
| `QueueModule` | モジュールクラス（`forRoot`、`forRootAsync`、`registerQueue`） |
| `QueueService` | インジェクタブルなプロデューサー／コンシューマーのファサード |
| `@Processor(queue, opts?)` | キューコンシューマーを示すクラスデコレーター |
| `@Process(opts?)` | ジョブハンドラーを示すメソッドデコレーター |
| `@OnWorkerEvent(event)` | ワーカーイベント用のメソッドデコレーター |
| `@InjectQueue(name)` | 生の `Queue` を注入するパラメーターデコレーター |
| `durationToMs(duration)` | 期間オブジェクトをミリ秒に変換する |
