---
title: Swagger / OpenAPI
icon: file-code
description: Документирование схем на основе TypeBox через Elysia
---

nestelia использует схемы [TypeBox](https://github.com/sinclairzx81/typebox) — те же схемы, что нативно использует Elysia — для валидации запросов. Поскольку Elysia уже имеет первоклассную поддержку Swagger/OpenAPI через плагин `@elysiajs/swagger`, вы можете добавить полную документацию API с минимальной конфигурацией.

## Настройка

Установите плагин Elysia Swagger:

```bash
bun add @elysiajs/swagger
```

Зарегистрируйте его как функциональный middleware в вашем корневом module:

```typescript
import { Module } from "nestelia";
import swagger from "@elysiajs/swagger";

@Module({
  middlewares: [
    (app) => app.use(swagger()),
  ],
})
class AppModule {}
```

После этого Swagger UI будет доступен по адресу `/swagger`.

## Декораторы схем

Используйте `@Body`, `@Param` и `@Query` со схемами TypeBox — они автоматически подхватываются системой схем Elysia и отображаются в сгенерированной спецификации OpenAPI:

```typescript
import { t } from "elysia";
import { Controller, Post, Get, Body, Param, Query } from "nestelia";

@Controller("/users")
class UserController {
  @Post("/")
  create(@Body(t.Object({
    name: t.String({ description: "User display name" }),
    email: t.String({ format: "email" }),
  })) body: { name: string; email: string }) {
    return this.userService.create(body);
  }

  @Get("/:id")
  findOne(@Param(t.Object({ id: t.String() })) params: { id: string }) {
    return this.userService.findById(params.id);
  }
}
```

## Декоратор @Schema()

Декоратор `@Schema()` позволяет определить полную схему маршрута, включая типы ответов:

```typescript
import { t } from "elysia";
import { Schema } from "nestelia";

@Get("/users")
@Schema({
  query: t.Object({ page: t.Optional(t.Number()) }),
  response: {
    200: t.Array(t.Object({ id: t.String(), name: t.String() })),
  },
})
findAll(@Ctx() ctx: any) {
  return this.userService.findAll(ctx.query.page);
}
```

## Настройка Swagger

Настройте параметры плагина Swagger: заголовок, версию, теги и многое другое:

```typescript
import swagger from "@elysiajs/swagger";

@Module({
  middlewares: [
    (app) => app.use(swagger({
      documentation: {
        info: {
          title: "My API",
          version: "1.0.0",
          description: "API documentation",
        },
        tags: [
          { name: "users", description: "User operations" },
        ],
      },
    })),
  ],
})
class AppModule {}
```

Полный список параметров смотрите в [документации Elysia Swagger](https://elysiajs.com/plugins/swagger.html).