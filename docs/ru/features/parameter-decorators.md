---
title: Parameter Decorators
icon: at-sign
description: Извлекайте данные из запросов с помощью декораторов
---

Parameter decorators позволяют извлекать конкретные части входящего запроса непосредственно в аргументы метода-обработчика.

## Доступные декораторы

| Декоратор | Извлекает |
|-----------|----------|
| `@Body(schema)` | Тело запроса (JSON), валидированное по схеме TypeBox |
| `@Param(schema)` | Все параметры URL-пути, валидированные по схеме TypeBox |
| `@Query(schema)` | Все параметры строки запроса, валидированные по схеме TypeBox |
| `@Headers(name?)` | Заголовок(и) запроса |
| `@Req()` / `@Request()` | Сырой объект `Request` |
| `@Res()` / `@Response()` | Контекст ответа Elysia (`set`) |
| `@Ctx()` / `@ElysiaContext()` | Полный контекст Elysia |
| `@Ip()` | IP-адрес клиента |
| `@Session()` | Объект сессии |

## TypeBox Schema Decorators

`@Body`, `@Param` и `@Query` используют [TypeBox](https://github.com/sinclairzx81/typebox) для определения схем и валидации. Импортируйте `t` из `elysia`:

```typescript
import { t } from "elysia";
import { Controller, Post, Get, Body, Param, Query } from "nestelia";

@Controller("/users")
class UserController {
  @Post("/")
  create(@Body(t.Object({ name: t.String(), age: t.Number() })) body: { name: string; age: number }) {
    return this.service.create(body);
  }

  @Get("/:id")
  findOne(@Param(t.Object({ id: t.String() })) params: { id: string }) {
    return this.service.findById(params.id);
  }

  @Get("/search")
  search(@Query(t.Object({ q: t.String(), page: t.Optional(t.Number()) })) query: { q: string; page?: number }) {
    return this.service.search(query.q, query.page);
  }
}
```

Схема передаётся в маршрут Elysia для валидации TypeBox. Если валидация завершается неудачей, Elysia автоматически возвращает ответ 422.

## @Body()

Извлекает и валидирует разобранное тело JSON-запроса:

```typescript
import { t } from "elysia";

@Post("/")
create(@Body(t.Object({
  name: t.String(),
  email: t.String({ format: "email" }),
})) body: { name: string; email: string }) {
  return this.userService.create(body);
}
```

## @Param()

Извлекает все параметры URL-пути в виде объекта:

```typescript
@Get("/:category/:id")
find(@Param(t.Object({
  category: t.String(),
  id: t.String(),
})) params: { category: string; id: string }) {
  return this.service.find(params.category, params.id);
}
```

## @Query()

Извлекает все значения строки запроса в виде объекта:

```typescript
@Get("/search")
search(@Query(t.Object({
  q: t.String(),
  page: t.Optional(t.Number()),
})) query: { q: string; page?: number }) {
  // GET /search?q=hello&page=2
}
```

## @Headers()

Доступ к заголовкам запроса. Передайте имя, чтобы получить конкретный заголовок, или опустите его, чтобы получить полный объект `Headers`:

```typescript
@Get("/")
check(
  @Headers("authorization") auth: string,
  @Headers() allHeaders: Headers
) {
  // ...
}
```

## @Ctx() / @ElysiaContext()

Доступ к полному контексту запроса Elysia для низкоуровневого управления. Это также простейший способ получить доступ к отдельным параметрам пути или значениям запроса без валидации по схеме:

```typescript
@Get("/:id")
findOne(@Ctx() ctx: any) {
  const id = ctx.params.id;       // параметр пути
  const q = ctx.query.search;     // строка запроса
  const body = ctx.body;          // тело запроса
  ctx.set.status = 200;           // установить статус ответа
  ctx.set.headers["x-custom"] = "value"; // установить заголовок ответа
  return this.service.findById(id);
}
```

## @Req() / @Request()

Доступ к сырому Web API объекту `Request`:

```typescript
@Get("/")
handle(@Req() request: Request) {
  const userAgent = request.headers.get("user-agent");
  return { userAgent };
}
```

## @Ip()

Получение IP-адреса клиента:

```typescript
@Get("/")
handle(@Ip() ip: string) {
  return { ip };
}
```

## Пользовательские Parameter Decorators

Создавайте переиспользуемые parameter decorators с помощью `createParamDecorator`:

```typescript
import { createParamDecorator, ExecutionContext } from "nestelia";

const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<any>();
  return request.user;
});

@Get("/profile")
getProfile(@User() user: any) {
  return user;
}
```

## Использование @Schema() для полной валидации маршрута

Декоратор `@Schema()` позволяет определить полную схему маршрута Elysia (body, params, query, headers, response) в одном месте:

```typescript
import { t } from "elysia";
import { Schema } from "nestelia";

@Post("/")
@Schema({
  body: t.Object({ name: t.String() }),
  response: t.Object({ id: t.Number(), name: t.String() }),
})
create(@Ctx() ctx: any) {
  return this.service.create(ctx.body);
}
```