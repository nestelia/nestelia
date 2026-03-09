---
title: Interceptors
icon: arrow-right-left
description: Добавляйте логику до обработчика с помощью interceptors
---

Interceptors выполняются до вызова обработчика маршрута. Они могут проверять запрос, прерывать выполнение или добавлять побочные эффекты, например логирование.

## Интерфейс Interceptor

nestelia предоставляет простой интерфейс interceptor:

```typescript
interface Interceptor {
  intercept(context: any): Promise<boolean | void> | boolean | void;
}
```

Аргумент `context` — это сырой контекст Elysia (то же, что и `@Ctx()`).

Возврат `false` предотвращает выполнение обработчика маршрута.

## Создание Interceptor

### Auth Interceptor

```typescript
import { Injectable } from "nestelia";

@Injectable()
class AuthInterceptor implements Interceptor {
  intercept(ctx: any): boolean {
    const token = ctx.request.headers.get("authorization");
    if (!token) {
      ctx.set.status = 401;
      return false; // блокирует обработчик
    }
    return true; // позволяет обработчику продолжить
  }
}
```

### Logging Interceptor

```typescript
@Injectable()
class LoggingInterceptor implements Interceptor {
  intercept(ctx: any): void {
    const start = Date.now();
    console.log(`→ ${ctx.request.method} ${ctx.request.url}`);
    // После этого выполняется обработчик
    // Примечание: логика после обработчика требует ResponseInterceptor
  }
}
```

## Использование Interceptors

Применяйте interceptors с помощью `@UseInterceptors()` на уровне controller или метода:

```typescript
import { UseInterceptors } from "nestelia";

@Controller("/users")
@UseInterceptors(LoggingInterceptor)
class UserController {
  @Get("/")
  findAll() {
    return this.userService.findAll();
  }

  @Get("/secure")
  @UseInterceptors(AuthInterceptor)
  secure() {
    return { secret: "data" };
  }
}
```

## ResponseInterceptor

Для добавления логики, выполняемой после обработчика, реализуйте `ResponseInterceptor`:

```typescript
interface ResponseInterceptor {
  interceptAfter(context: any): Promise<any> | any;
}
```

```typescript
@Injectable()
class TimingInterceptor implements ResponseInterceptor {
  interceptAfter(ctx: any) {
    ctx.set.headers["x-response-time"] = String(Date.now());
  }
}
```

## Интерфейс NestInterceptor

Интерфейс `NestInterceptor` экспортируется, но **пока не выполняется** обработчиком маршрута. Для реального поведения используйте `Interceptor` или `ResponseInterceptor`:

```typescript
// Доступен для импорта, но не вызывается автоматически
export interface NestInterceptor<T = any, R = any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<R> | Promise<Observable<R>>;
}
```

## Несколько Interceptors

При применении нескольких interceptors они выполняются в указанном порядке. Если любой interceptor возвращает `false`, последующие interceptors и обработчик маршрута пропускаются:

```typescript
@Get("/admin")
@UseInterceptors(AuthInterceptor, LoggingInterceptor)
adminRoute() { /* ... */ }
```