---
title: 라이프사이클 훅
icon: refresh-cw
description: 애플리케이션 및 모듈 라이프사이클 이벤트에 훅을 연결합니다
---

nestelia는 애플리케이션 시작 및 종료 과정의 특정 지점에서 로직을 실행할 수 있는 라이프사이클 훅을 제공합니다.

## 모듈 라이프사이클 훅

`@Injectable()` 서비스나 컨트롤러에 다음 인터페이스를 구현합니다:

### OnModuleInit

**모든** 모듈의 프로바이더가 인스턴스화된 후 호출됩니다. 이 시점에서는 `ModuleRef`를 통해 어떤 프로바이더든 안전하게 가져올 수 있습니다:

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

`onModuleInit` 내에서 `ModuleRef`를 사용하여 다른 프로바이더를 동적으로 가져올 수 있습니다:

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

모든 모듈이 초기화된 후(모든 `onModuleInit` 훅이 실행된 후) 한 번 호출됩니다. 이 훅은 `createElysiaApplication()` 중에 실행됩니다 — 실행을 위해 `listen()`을 호출할 **필요가 없으므로**, 서버리스 및 `getHttpServer().handle()` 구성에서도 동작합니다:

```typescript
@Injectable()
class AppService implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    console.log("Application is ready");
  }
}
```

### OnModuleDestroy

모듈이 종료될 때 (종료 중에) 호출됩니다:

```typescript
@Injectable()
class CacheService implements OnModuleDestroy {
  async onModuleDestroy() {
    await this.cache.flush();
  }
}
```

### BeforeApplicationShutdown

애플리케이션이 종료되기 시작하기 전에 호출됩니다. 종료를 트리거한 신호를 받습니다:

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

모든 모듈이 종료된 후 호출됩니다:

```typescript
@Injectable()
class CleanupService implements OnApplicationShutdown {
  async onApplicationShutdown(signal?: string) {
    await this.releaseResources();
  }
}
```

## 실행 순서

시작 시 (`createElysiaApplication()` 내부):
1. `OnModuleInit` — 모든 프로바이더가 인스턴스화된 후
2. `OnApplicationBootstrap` — 모든 모듈이 초기화된 후 한 번

종료 시 (`app.close()` 내부):
1. `OnModuleDestroy`
2. `BeforeApplicationShutdown`
3. `OnApplicationShutdown`

## 보장 사항

- **모든 훅은 모든 프로바이더에 대해 실행됩니다.** 프로바이더는 자신이 구현한 각 훅을 독립적으로 받습니다 — 다른 훅이 실행되도록 하기 위해 `onModuleInit`을 함께 구현할 필요는 없습니다.
- **부트스트랩은 초기화 시 실행됩니다.** `OnApplicationBootstrap`은 `createElysiaApplication()` 중에 한 번 트리거되며 멱등(idempotent)하므로, 이후의 `app.listen()`이 이를 두 번 실행하지 않습니다.
- **종료 훅은 `app.close()`가 필요합니다.** `OnModuleDestroy`, `BeforeApplicationShutdown`, `OnApplicationShutdown`은 `app.close()`를 호출할 때 실행됩니다.

## Elysia 라이프사이클 데코레이터

nestelia는 Elysia의 요청 라이프사이클 훅을 컨트롤러의 메서드 데코레이터로도 노출합니다:

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
    // 라우트 핸들러 전에 실행
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

사용 가능한 Elysia 라이프사이클 데코레이터:

| 데코레이터 | 훅 |
|-----------|------|
| `@OnRequest()` | 라우팅 전 |
| `@OnParse()` | 본문 파싱 |
| `@OnTransform()` | 요청 변환 |
| `@OnBeforeHandle()` | 핸들러 전 |
| `@OnAfterHandle()` | 핸들러 후 |
| `@OnMapResponse()` | 응답 매핑 |
| `@OnAfterResponse()` | 응답 전송 후 |
| `@OnError()` | 에러 핸들러 |
