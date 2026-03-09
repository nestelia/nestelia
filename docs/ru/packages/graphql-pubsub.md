---
title: GraphQL PubSub
icon: rss
description: Redis-based PubSub для GraphQL subscriptions
---

Пакет GraphQL PubSub предоставляет систему publish/subscribe на основе Redis для GraphQL subscriptions с поддержкой async iterator.

## Установка

```bash
bun add ioredis
```

## Базовое использование

```typescript
import { RedisPubSub } from "nestelia/graphql-pubsub";

const pubsub = new RedisPubSub({
  connection: {
    host: "localhost",
    port: 6379,
  },
  keyPrefix: "myapp:",
});

// Публикация события
await pubsub.publish("user-created", { id: 1, name: "John" });

// Подписка на события
const subId = await pubsub.subscribe("user-created", (message) => {
  console.log("New user:", message);
});

// Отписка
pubsub.unsubscribe(subId);

// Закрытие подключений
await pubsub.close();
```

## Регистрация Module

### Статическая конфигурация

```typescript
import { Module } from "nestelia";
import { GraphQLPubSubModule } from "nestelia/graphql-pubsub";

@Module({
  imports: [
    GraphQLPubSubModule.forRoot({
      useValue: {
        connection: {
          host: "localhost",
          port: 6379,
        },
        keyPrefix: "myapp:",
      },
    }),
  ],
})
class AppModule {}
```

### С существующими Redis-клиентами

```typescript
import Redis from "ioredis";

const publisher = new Redis({ host: "localhost", port: 6379 });
const subscriber = new Redis({ host: "localhost", port: 6379 });

GraphQLPubSubModule.forRoot({
  useExisting: {
    publisher,
    subscriber,
    keyPrefix: "myapp:",
  },
})
```

### Асинхронная конфигурация

```typescript
import { GraphQLPubSubModule } from "nestelia/graphql-pubsub";

GraphQLPubSubModule.forRootAsync({
  useFactory: async (config: ConfigService) => ({
    connection: {
      host: config.get("REDIS_HOST"),
      port: config.get("REDIS_PORT"),
      password: config.get("REDIS_PASSWORD"),
    },
    keyPrefix: config.get("REDIS_PREFIX"),
  }),
  inject: [ConfigService],
})
```

## Использование с GraphQL Resolvers

```typescript
import { Resolver, Query, Mutation, Subscription } from "nestelia/apollo";
import { InjectPubSub, RedisPubSub } from "nestelia/graphql-pubsub";

@Resolver("User")
class UserResolver {
  constructor(
    @InjectPubSub() private pubsub: RedisPubSub,
    @Inject(UserService) private userService: UserService
  ) {}

  @Mutation(() => User)
  async createUser(@Args("input") input: CreateUserInput) {
    const user = await this.userService.create(input);
    await this.pubsub.publish("user-created", user);
    return user;
  }

  @Subscription(() => User)
  userCreated() {
    return this.pubsub.asyncIterator("user-created");
  }
}
```

## Pattern Subscriptions

Подписка с использованием шаблонов в стиле glob:

```typescript
const subId = await pubsub.subscribe(
  "user.*",
  (message) => {
    console.log("User event:", message);
  },
  { pattern: true } // использует Redis psubscribe
);
```

## Пользовательская сериализация

```typescript
const pubsub = new RedisPubSub({
  connection: { host: "localhost", port: 6379 },
  serializer: (payload) => JSON.stringify(payload),
  deserializer: (payload) => JSON.parse(payload),
});
```

## Справочник API

### RedisPubSub

| Метод | Описание |
|--------|-------------|
| `publish(trigger, payload)` | Опубликовать сообщение в канал |
| `subscribe(trigger, handler, options?)` | Подписаться на канал. Возвращает числовой ID подписки |
| `unsubscribe(subId)` | Отменить подписку |
| `asyncIterator(triggers)` | Создать async iterator для GraphQL subscriptions |
| `getPublisher()` | Получить Redis publisher-клиент |
| `getSubscriber()` | Получить Redis subscriber-клиент |
| `close()` | Закрыть все подключения |

### RedisPubSubOptions

```typescript
interface RedisPubSubOptions {
  keyPrefix?: string;
  publisher?: Redis;
  subscriber?: Redis;
  connection?: Redis.ConnectionOptions;
  triggerTransform?: TriggerTransform;
  serializer?: (payload: unknown) => string;
  deserializer?: (payload: string) => unknown;
  reviver?: (key: string, value: unknown) => unknown;
}
```