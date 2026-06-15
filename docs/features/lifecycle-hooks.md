---
title: Lifecycle Hooks
icon: refresh-cw
description: Hook into application and module lifecycle events
---

nestelia provides lifecycle hooks that let you run logic at specific points during the application startup and shutdown process.

## Module Lifecycle Hooks

Implement these interfaces on your `@Injectable()` services or controllers:

### OnModuleInit

Called once **all** providers across all modules have been instantiated. This guarantees that any provider can be safely retrieved via `ModuleRef` at this point:

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

You can use `ModuleRef` to dynamically retrieve another provider inside `onModuleInit`:

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

Called once, after every module has been initialized (all `onModuleInit` hooks have run). It fires during `createElysiaApplication()` — you do **not** need to call `listen()` for it to run, so it works for serverless and `getHttpServer().handle()` setups too:

```typescript
@Injectable()
class AppService implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    console.log("Application is ready");
  }
}
```

### OnModuleDestroy

Called when the module is being destroyed (during shutdown):

```typescript
@Injectable()
class CacheService implements OnModuleDestroy {
  async onModuleDestroy() {
    await this.cache.flush();
  }
}
```

### BeforeApplicationShutdown

Called before the application starts shutting down. Receives the signal that triggered shutdown:

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

Called after all modules have been destroyed:

```typescript
@Injectable()
class CleanupService implements OnApplicationShutdown {
  async onApplicationShutdown(signal?: string) {
    await this.releaseResources();
  }
}
```

## Execution Order

During startup (inside `createElysiaApplication()`):
1. `OnModuleInit` — after all providers are instantiated
2. `OnApplicationBootstrap` — once, after all modules are initialized

During shutdown (inside `app.close()`):
1. `OnModuleDestroy`
2. `BeforeApplicationShutdown`
3. `OnApplicationShutdown`

## Guarantees

- **Every hook fires for every provider.** A provider receives each hook it implements independently — you do not need to also implement `onModuleInit` for the other hooks to run.
- **Bootstrap runs at init.** `OnApplicationBootstrap` is triggered once during `createElysiaApplication()` and is idempotent, so a later `app.listen()` will not run it twice.
- **Shutdown hooks require `app.close()`.** `OnModuleDestroy`, `BeforeApplicationShutdown`, and `OnApplicationShutdown` run when you call `app.close()`.

## Elysia Lifecycle Decorators

nestelia also exposes Elysia's request lifecycle hooks as method decorators on controllers:

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
    // runs before route handler
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

Available Elysia lifecycle decorators:

| Decorator | Hook |
|-----------|------|
| `@OnRequest()` | Before routing |
| `@OnParse()` | Body parsing |
| `@OnTransform()` | Transform request |
| `@OnBeforeHandle()` | Before handler |
| `@OnAfterHandle()` | After handler |
| `@OnMapResponse()` | Map response |
| `@OnAfterResponse()` | After response sent |
| `@OnError()` | Error handler |
