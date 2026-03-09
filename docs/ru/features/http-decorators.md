---
title: HTTP Decorators
icon: globe
description: Связывайте методы controller с HTTP-маршрутами
---

HTTP-декораторы связывают методы controller с конкретными HTTP-методами и путями.

## Доступные декораторы

| Декоратор | HTTP-метод |
|-----------|-------------|
| `@Get(path?)` | GET |
| `@Post(path?)` | POST |
| `@Put(path?)` | PUT |
| `@Patch(path?)` | PATCH |
| `@Delete(path?)` | DELETE |
| `@Options(path?)` | OPTIONS |
| `@Head(path?)` | HEAD |
| `@All(path?)` | Все методы |

## Использование

```typescript
import { t } from "elysia";
import { Controller, Get, Post, Put, Delete, Body, Ctx } from "nestelia";

@Controller("/posts")
class PostController {
  @Get("/")
  findAll() {
    return this.postService.findAll();
  }

  @Get("/:id")
  findOne(@Ctx() ctx: any) {
    return this.postService.findById(ctx.params.id);
  }

  @Post("/")
  create(@Body(t.Object({ title: t.String(), content: t.String() })) body: { title: string; content: string }) {
    return this.postService.create(body);
  }

  @Put("/:id")
  update(@Ctx() ctx: any, @Body(t.Object({ title: t.Optional(t.String()) })) body: { title?: string }) {
    return this.postService.update(ctx.params.id, body);
  }

  @Delete("/:id")
  remove(@Ctx() ctx: any) {
    return this.postService.remove(ctx.params.id);
  }
}
```

## Параметры пути

Пути поддерживают параметры маршрута Elysia с синтаксисом `:param`:

```typescript
@Get("/:category/:id")
findByCategory(@Ctx() ctx: any) {
  const { category, id } = ctx.params;
  return this.service.find(category, id);
}
```

Для валидации params используйте декоратор `@Param()` со схемой TypeBox:

```typescript
import { t } from "elysia";

@Get("/:id")
findOne(@Param(t.Object({ id: t.Numeric() })) params: { id: number }) {
  return this.service.findById(params.id);
}
```

## Маршруты с подстановочным знаком

Используйте `@All()` для обработки любого HTTP-метода:

```typescript
@All("/health")
health() {
  return { status: "ok" };
}
```

## Без аргумента пути

Если путь не указан, метод совпадает с префиксом controller:

```typescript
@Controller("/users")
class UserController {
  @Get()  // обрабатывает GET /users
  findAll() { /* ... */ }
}
```

## Статус ответа и заголовки

Используйте декораторы `@HttpCode()` и `@Header()` на методах маршрутов:

```typescript
@Post("/")
@HttpCode(201)
@Header("Location", "/users/1")
create(@Body(t.Object({ name: t.String() })) body: { name: string }) {
  return this.userService.create(body);
}
```

## Метаданные маршрута

Под капотом каждый декоратор сохраняет метаданные через `reflect-metadata`:

- `ROUTE_METADATA` — HTTP-метод и путь
- `PARAMS_METADATA` — инструкции по извлечению параметров
- `ROUTE_SCHEMA_METADATA` — схемы валидации TypeBox

Эти метаданные считываются во время bootstrap для регистрации маршрутов на экземпляре Elysia.