---
title: Microservices
icon: network
description: Создавайте распределённые системы с несколькими транспортами
---

Пакет microservices обеспечивает многотранспортную коммуникацию между сервисами с поддержкой Redis, RabbitMQ, TCP и других транспортов.

## Установка

```bash
bun add ioredis   # транспорт Redis
bun add amqplib   # транспорт RabbitMQ
```

## Настройка

```typescript
import { createElysiaApplication } from "nestelia";
import { Transport } from "nestelia/microservices";

const app = await createElysiaApplication(AppModule);

app.connectMicroservice({
  transport: Transport.REDIS,
  options: { host: "localhost", port: 6379 },
});

await app.startAllMicroservices();
app.listen(3000); // гибрид HTTP + microservices
```

## Транспорты

```typescript
enum Transport {
  REDIS = "REDIS",
  RABBITMQ = "RABBITMQ",
  TCP = "TCP",
  GRPC = "GRPC",
  KAFKA = "KAFKA",
  MQTT = "MQTT",
  NATS = "NATS",
}
```

## Паттерны сообщений

### Request/Response

Используйте `@MessagePattern()` для коммуникации по схеме запрос/ответ:

```typescript
import { Controller } from "nestelia";
import { MessagePattern, Payload } from "nestelia/microservices";

@Controller()
class MathController {
  @MessagePattern("sum")
  sum(@Payload() data: { numbers: number[] }) {
    return data.numbers.reduce((a, b) => a + b, 0);
  }
}
```

### Event-Based

Используйте `@EventPattern()` для событий по схеме fire-and-forget:

```typescript
import { EventPattern, Payload } from "nestelia/microservices";

@Controller()
class NotificationController {
  @EventPattern("user.created")
  handleUserCreated(@Payload() data: { userId: string }) {
    console.log("New user:", data.userId);
  }
}
```

## Client Factory

Отправляйте сообщения другим microservices:

```typescript
import { Injectable } from "nestelia";
import { ClientFactory, Transport } from "nestelia/microservices";

@Injectable()
class OrderService {
  private client = ClientFactory.create({
    transport: Transport.REDIS,
    options: { host: "localhost", port: 6379 },
  });

  async calculateTotal(items: any[]) {
    return this.client.send("sum", { numbers: items.map((i) => i.price) });
  }
}
```

## Гибридное приложение

Запускайте HTTP и microservice-слушатели в одном процессе:

```typescript
const app = await createElysiaApplication(AppModule);

// HTTP-маршруты работают как обычно
// Плюс обработчики сообщений microservice
app.connectMicroservice({
  transport: Transport.REDIS,
  options: { host: "localhost", port: 6379 },
});

await app.startAllMicroservices();
app.listen(3000);
```