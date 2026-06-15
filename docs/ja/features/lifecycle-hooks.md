---
title: ライフサイクルフック
icon: refresh-cw
description: アプリケーションとモジュールのライフサイクルイベントにフックする
---

nestelia はアプリケーションの起動・シャットダウン処理の特定のタイミングでロジックを実行するライフサイクルフックを提供します。

## モジュールライフサイクルフック

`@Injectable()` サービスやコントローラーにこれらのインターフェースを実装します:

### OnModuleInit

**すべての**モジュールのプロバイダーがインスタンス化された後に呼ばれます。この時点では `ModuleRef` を使って任意のプロバイダーを安全に取得できることが保証されています:

```typescript
import { Injectable, OnModuleInit } from "nestelia";

@Injectable()
class DatabaseService implements OnModuleInit {
  async onModuleInit() {
    await this.connect();
    console.log("Database connected");
  }
}
```

`onModuleInit` 内で `ModuleRef` を使って他のプロバイダーを動的に取得できます:

```typescript
import { Injectable, ModuleRef, OnModuleInit } from "nestelia";

@Injectable()
class CacheService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    const db = this.moduleRef.get(DatabaseService);
    console.log(`Cache connected to ${db.getUrl()}`);
  }
}
```

### OnApplicationBootstrap

すべてのモジュールが初期化された後（すべての `onModuleInit` フックが実行された後）に一度だけ呼ばれます。`createElysiaApplication()` の実行中に発火するため、実行するために `listen()` を呼ぶ必要は**ありません**。したがって、サーバーレスや `getHttpServer().handle()` の構成でも動作します:

```typescript
@Injectable()
class AppService implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    console.log("Application is ready");
  }
}
```

### OnModuleDestroy

モジュールが破棄される時（シャットダウン中）に呼ばれます:

```typescript
@Injectable()
class CacheService implements OnModuleDestroy {
  async onModuleDestroy() {
    await this.cache.flush();
  }
}
```

### BeforeApplicationShutdown

アプリケーションのシャットダウン開始前に呼ばれます。シャットダウンをトリガーしたシグナルを受け取ります:

```typescript
@Injectable()
class GracefulService implements BeforeApplicationShutdown {
  async beforeApplicationShutdown(signal?: string) {
    console.log(`Shutting down due to: ${signal}`);
    await this.drainRequests();
  }
}
```

### OnApplicationShutdown

すべてのモジュールが破棄された後に呼ばれます:

```typescript
@Injectable()
class CleanupService implements OnApplicationShutdown {
  async onApplicationShutdown(signal?: string) {
    await this.releaseResources();
  }
}
```

## 実行順序

起動時（`createElysiaApplication()` 内）:
1. `OnModuleInit` — すべてのプロバイダーがインスタンス化された後
2. `OnApplicationBootstrap` — すべてのモジュール初期化後に一度だけ

シャットダウン時（`app.close()` 内）:
1. `OnModuleDestroy`
2. `BeforeApplicationShutdown`
3. `OnApplicationShutdown`

## 保証

- **すべてのフックはすべてのプロバイダーで発火します。** プロバイダーは実装している各フックを個別に受け取ります。他のフックを実行するために `onModuleInit` も併せて実装する必要はありません。
- **Bootstrap は初期化時に実行されます。** `OnApplicationBootstrap` は `createElysiaApplication()` の実行中に一度だけトリガーされ、冪等です。そのため、後で `app.listen()` を呼んでも 2 回実行されることはありません。
- **シャットダウンフックには `app.close()` が必要です。** `OnModuleDestroy`、`BeforeApplicationShutdown`、`OnApplicationShutdown` は `app.close()` を呼んだときに実行されます。

## Elysia ライフサイクルデコレータ

nestelia は Elysia のリクエストライフサイクルフックをコントローラーのメソッドデコレータとして公開しています:

```typescript
import {
  OnRequest,
  OnBeforeHandle,
  OnAfterHandle,
  OnAfterResponse,
  OnError,
} from "nestelia";

@Controller("/")
class AppController {
  @OnRequest()
  logRequest(ctx: any) {
    console.log(`${ctx.request.method} ${ctx.request.url}`);
  }

  @OnBeforeHandle()
  checkAuth(ctx: any) {
    // ルートハンドラーの前に実行される
  }

  @OnAfterHandle()
  addHeaders(ctx: any) {
    ctx.set.headers["x-powered-by"] = "nestelia";
  }

  @OnError()
  handleError(ctx: any) {
    console.error("Error:", ctx.error);
  }

  @OnAfterResponse()
  logResponse(ctx: any) {
    console.log("Response sent");
  }
}
```

利用可能な Elysia ライフサイクルデコレータ:

| デコレータ | フック |
|-----------|------|
| `@OnRequest()` | ルーティング前 |
| `@OnParse()` | ボディパース |
| `@OnTransform()` | リクエスト変換 |
| `@OnBeforeHandle()` | ハンドラー前 |
| `@OnAfterHandle()` | ハンドラー後 |
| `@OnMapResponse()` | レスポンスマッピング |
| `@OnAfterResponse()` | レスポンス送信後 |
| `@OnError()` | エラーハンドラー |
