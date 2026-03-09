---
title: Middleware
icon: layers
description: Добавляйте сквозную логику с помощью class-based и функционального middleware
---

Middleware выполняется до обработчика маршрута и может модифицировать запрос, ответ или прерывать конвейер обработки.

## Class-Based Middleware

Создайте класс, реализующий `ElysiaNestMiddleware`:

```typescript
import { Injectable, ElysiaNestMiddleware } from "nestelia";

@Injectable()
class LoggerMiddleware implements ElysiaNestMiddleware {
  async use(context: any, next: () => Promise<any>) {
    const start = Date.now();
    console.log(`→ ${context.request.method} ${context.request.url}`);

    await next();

    console.log(`← ${Date.now() - start}ms`);
  }
}
```

Зарегистрируйте его в массивах `providers` и `middlewares` module:

```typescript
@Module({
  controllers: [AppController],
  providers: [LoggerMiddleware],
  middlewares: [LoggerMiddleware],
})
class AppModule {}
```

Class-based middleware разрешается из DI container, поэтому может инжектировать другие services:

```typescript
@Injectable()
class AuthMiddleware implements ElysiaNestMiddleware {
  constructor(@Inject(AuthService) private auth: AuthService) {}

  async use(context: any, next: () => Promise<any>) {
    const token = context.request.headers.get("authorization");
    if (!this.auth.verify(token)) {
      context.set.status = 401;
      return { error: "Unauthorized" };
    }
    await next();
  }
}
```

## Функциональный Middleware

Для более простых случаев используйте плагин-функции Elysia напрямую:

```typescript
import cors from "@elysiajs/cors";
import jwt from "@elysiajs/jwt";

@Module({
  middlewares: [
    (app) => app.use(cors()),
    (app) => app.use(jwt({ secret: "my-secret" })),
  ],
})
class AppModule {}
```

## Порядок выполнения

Middleware выполняется в том порядке, в котором перечислен в массиве `middlewares`, до выполнения любых обработчиков маршрутов. Class-based middleware из импортированных modules выполняется раньше middleware текущего module.