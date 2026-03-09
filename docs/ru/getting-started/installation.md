---
title: Установка
icon: download
description: Установите nestelia и настройте проект
---

## Требования

- [Bun](https://bun.sh/) v1.0 или новее
- TypeScript 5.0+

## Установка

```bash
bun add nestelia elysia
```

nestelia требует `elysia` ^1.2.0 в качестве peer dependency.

## Настройка TypeScript

nestelia использует decorators и рефлексию метаданных. Убедитесь, что ваш `tsconfig.json` содержит следующие настройки:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true,
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

## Опциональные peer dependencies

Все subpath-пути включены в пакет `nestelia`. Устанавливайте только те peer dependencies, которые вам нужны:

```bash
# Microservices — транспорт Redis
bun add ioredis

# Microservices — транспорт RabbitMQ
bun add amqplib

# Apollo GraphQL
bun add @apollo/server graphql graphql-ws

# Аутентификация Passport
bun add passport

# Cache manager
bun add cache-manager

# Обмен сообщениями RabbitMQ
bun add amqplib

# GraphQL PubSub (Redis)
bun add ioredis
```

## Проверка установки

Создайте минимальное приложение, чтобы убедиться, что всё работает:

```typescript
import { createElysiaApplication, Controller, Get, Module } from "nestelia";

@Controller("/")
class AppController {
  @Get("/")
  hello() {
    return { status: "ok" };
  }
}

@Module({ controllers: [AppController] })
class AppModule {}

const app = await createElysiaApplication(AppModule);
app.listen(3000, () => {
  console.log("Running on http://localhost:3000");
});
```

```bash
bun run app.ts
```