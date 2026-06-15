---
title: Lifecycle Hooks
icon: refresh-cw
description: Подключайтесь к событиям жизненного цикла приложения и module
---

nestelia предоставляет lifecycle hooks, позволяющие выполнять логику в определённые моменты запуска и завершения работы приложения.

## Lifecycle Hooks модуля

Реализуйте эти интерфейсы в ваших `@Injectable()` services или controllers:

### OnModuleInit

Вызывается после того, как **все** providers во всех модулях были инстанциированы. Это гарантирует, что любой provider можно безопасно получить через `ModuleRef` в этот момент:

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

Используйте `ModuleRef` для динамического получения другого provider внутри `onModuleInit`:

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

Вызывается один раз, после того как все modules были инициализированы (отработали все hooks `onModuleInit`). Срабатывает во время `createElysiaApplication()` — вам **не** нужно вызывать `listen()`, чтобы он сработал, поэтому он подходит и для serverless, и для конфигураций с `getHttpServer().handle()`:

```typescript
@Injectable()
class AppService implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    console.log("Application is ready");
  }
}
```

### OnModuleDestroy

Вызывается при уничтожении module (во время завершения работы):

```typescript
@Injectable()
class CacheService implements OnModuleDestroy {
  async onModuleDestroy() {
    await this.cache.flush();
  }
}
```

### BeforeApplicationShutdown

Вызывается перед началом завершения работы приложения. Получает сигнал, инициировавший завершение:

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

Вызывается после уничтожения всех modules:

```typescript
@Injectable()
class CleanupService implements OnApplicationShutdown {
  async onApplicationShutdown(signal?: string) {
    await this.releaseResources();
  }
}
```

## Порядок выполнения

При запуске (внутри `createElysiaApplication()`):
1. `OnModuleInit` — после инстанцирования всех providers
2. `OnApplicationBootstrap` — один раз, после инициализации всех modules

При завершении (внутри `app.close()`):
1. `OnModuleDestroy`
2. `BeforeApplicationShutdown`
3. `OnApplicationShutdown`

## Гарантии

- **Каждый hook срабатывает для каждого provider.** Provider получает каждый реализуемый им hook независимо — вам не нужно дополнительно реализовывать `onModuleInit`, чтобы сработали остальные hooks.
- **Bootstrap выполняется при инициализации.** `OnApplicationBootstrap` запускается один раз во время `createElysiaApplication()` и идемпотентен, поэтому последующий вызов `app.listen()` не запустит его повторно.
- **Hooks завершения требуют `app.close()`.** `OnModuleDestroy`, `BeforeApplicationShutdown` и `OnApplicationShutdown` выполняются при вызове `app.close()`.

## Декораторы lifecycle Elysia

nestelia также предоставляет lifecycle hooks запроса Elysia в виде декораторов методов на controllers:

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
    // выполняется перед обработчиком маршрута
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

Доступные декораторы lifecycle Elysia:

| Декоратор | Hook |
|-----------|------|
| `@OnRequest()` | До маршрутизации |
| `@OnParse()` | Разбор тела запроса |
| `@OnTransform()` | Трансформация запроса |
| `@OnBeforeHandle()` | До обработчика |
| `@OnAfterHandle()` | После обработчика |
| `@OnMapResponse()` | Маппинг ответа |
| `@OnAfterResponse()` | После отправки ответа |
| `@OnError()` | Обработчик ошибок |