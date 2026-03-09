---
title: Быстрый старт
icon: zap
description: Создайте CRUD API на nestelia за 5 минут
---

Это руководство проведёт вас через создание простого Users API на nestelia.

## 1. Создание Service

Services содержат бизнес-логику и помечаются декоратором `@Injectable()`, чтобы DI container мог ими управлять.

```typescript
import { Injectable } from "nestelia";

@Injectable()
class UserService {
  private users = [{ id: 1, name: "John" }];

  findAll() {
    return this.users;
  }

  findById(id: number) {
    return this.users.find((u) => u.id === id);
  }

  create(user: { name: string }) {
    const newUser = { id: this.users.length + 1, ...user };
    this.users.push(newUser);
    return newUser;
  }
}
```

## 2. Создание Controller

Controllers определяют HTTP-маршруты. Используйте `@Controller` для задания префикса маршрута и HTTP-декораторов для отдельных методов.

```typescript
import { t } from "elysia";
import { Controller, Get, Post, Body, Param, Inject, Ctx } from "nestelia";

@Controller("/users")
class UserController {
  constructor(@Inject(UserService) private readonly userService: UserService) {}

  @Get("/")
  getAll() {
    return this.userService.findAll();
  }

  @Get("/:id")
  getById(@Ctx() ctx: any) {
    return this.userService.findById(Number(ctx.params.id));
  }

  @Post("/")
  create(@Body(t.Object({ name: t.String() })) body: { name: string }) {
    return this.userService.create(body);
  }
}
```

::: info
`@Body`, `@Param` и `@Query` принимают схему [TypeBox](https://github.com/sinclairzx81/typebox) для валидации. Чтобы получить доступ к отдельным параметрам маршрута без схемы, используйте `@Ctx()` для получения полного контекста Elysia.
:::

## 3. Создание Module

Modules объединяют controllers и providers. Каждое приложение имеет как минимум один корневой module.

```typescript
import { Module } from "nestelia";

@Module({
  controllers: [UserController],
  providers: [UserService],
})
class AppModule {}
```

## 4. Bootstrap приложения

```typescript
import { createElysiaApplication } from "nestelia";

const app = await createElysiaApplication(AppModule);
app.listen(3000, () => {
  console.log("Running on http://localhost:3000");
});
```

## 5. Тестирование

```bash
# Список пользователей
curl http://localhost:3000/users

# Получить пользователя по ID
curl http://localhost:3000/users/1

# Создать пользователя
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane"}'
```

## Полный пример

```typescript
import { t } from "elysia";
import {
  createElysiaApplication,
  Controller,
  Get,
  Post,
  Module,
  Body,
  Ctx,
  Inject,
  Injectable,
} from "nestelia";

@Injectable()
class UserService {
  private users = [{ id: 1, name: "John" }];

  findAll() {
    return this.users;
  }

  findById(id: number) {
    return this.users.find((u) => u.id === id);
  }

  create(user: { name: string }) {
    const newUser = { id: this.users.length + 1, ...user };
    this.users.push(newUser);
    return newUser;
  }
}

@Controller("/users")
class UserController {
  constructor(@Inject(UserService) private readonly userService: UserService) {}

  @Get("/")
  getAll() {
    return this.userService.findAll();
  }

  @Get("/:id")
  getById(@Ctx() ctx: any) {
    return this.userService.findById(Number(ctx.params.id));
  }

  @Post("/")
  create(@Body(t.Object({ name: t.String() })) body: { name: string }) {
    return this.userService.create(body);
  }
}

@Module({
  controllers: [UserController],
  providers: [UserService],
})
class AppModule {}

const app = await createElysiaApplication(AppModule);
app.listen(3000);
```

## Следующие шаги

- [Modules](/core-concepts/modules) — узнайте, как организовать приложение с помощью modules.
- [Dependency Injection](/features/dependency-injection) — разберитесь с DI scope-ами и custom providers.