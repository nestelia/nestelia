---
title: Queues (BullMQ)
icon: layers
description: Фоновые очереди задач на основе BullMQ с процессорами на декораторах и DI-интеграцией
---

Модуль BullMQ интегрирует очереди задач [BullMQ](https://docs.bullmq.io) с системой внедрения зависимостей, декораторами и жизненным циклом nestelia. Помещайте задачи в очередь через инжектируемый `QueueService`, а потребителей объявляйте как `@Processor`-классы, чьи `@Process`-методы автоматически связываются с воркерами при старте приложения.

## Установка

```bash
bun add bullmq
```

`bullmq` — опциональная одноранговая зависимость (peer dependency): устанавливайте её только при использовании этого модуля. Требуется запущенный экземпляр Redis (или Valkey).

## Настройка

```typescript
import { Module } from "nestelia";
import { QueueModule } from "nestelia/bullmq";

@Module({
  imports: [
    QueueModule.forRoot({
      connection: { host: "localhost", port: 6379 },
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1_000 },
        removeOnComplete: true,
      },
    }),
  ],
})
export class AppModule {}
```

`forRoot` по умолчанию регистрирует модуль глобально, поэтому `QueueService` доступен везде без повторного импорта.

### Асинхронная конфигурация

Получите параметры подключения из другого провайдера с помощью `forRootAsync`:

```typescript
QueueModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    connection: { host: config.get("REDIS_HOST"), port: 6379 },
  }),
});
```

## Создание задач

Инжектируйте `QueueService` и вызывайте `add` (или `addDelayed`):

```typescript
import { Injectable } from "nestelia";
import { QueueService } from "nestelia/bullmq";

@Injectable()
export class EmailService {
  constructor(private readonly queue: QueueService) {}

  async sendWelcome(userId: string, email: string) {
    await this.queue.add("email", { userId, email }, { name: "welcome" });
  }

  async sendReminderLater(userId: string, email: string) {
    // Запустить через 30 секунд.
    await this.queue.addDelayed("email", { userId, email }, { seconds: 30 });
  }
}
```

Имя задачи по умолчанию совпадает с именем очереди; передайте `options.name`, чтобы нацелиться на конкретный обработчик `@Process({ name })`. `addDelayed` принимает либо число миллисекунд, либо объект длительности (`{ minutes, seconds, hours, days, milliseconds }`).

## Обработка задач

Отметьте класс декоратором `@Processor(queueName)` и зарегистрируйте его как провайдер. При старте модуль запускает один воркер BullMQ для очереди и направляет задачи в `@Process`-методы класса.

```typescript
import type { Job } from "bullmq";
import { Logger } from "nestelia";
import { Processor, Process, OnWorkerEvent } from "nestelia/bullmq";

@Processor("email", { concurrency: 5 })
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  // Обрабатывает задачи, добавленные под именем "welcome".
  @Process({ name: "welcome" })
  async sendWelcome(job: Job<{ email: string }>) {
    this.logger.log(`Sending welcome email to ${job.data.email}`);
    return { sentTo: job.data.email };
  }

  // Обрабатывает любую другую задачу в очереди "email".
  @Process()
  async sendGeneric(job: Job) {
    this.logger.log(`Processing "${job.name}" (${job.id})`);
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job | undefined, err: Error) {
    this.logger.error(`Job ${job?.id} failed: ${err.message}`);
  }
}
```

> Зарегистрируйте процессор как `provider` в модуле:
> ```typescript
> @Module({ providers: [EmailProcessor] })
> export class EmailModule {}
> ```

`@Process`-метод получает объект `Job` BullMQ; возвращаемое им значение становится результатом задачи. Используйте `@Process({ name })`, чтобы направлять разные имена задач в разные методы одного класса-процессора.

## Инжекция «сырой» очереди Queue

Когда вам нужен «сырой» API `Queue` из BullMQ, а не `QueueService`, зарегистрируйте очередь и инжектируйте её:

```typescript
import { Queue } from "bullmq";
import { Module, Injectable } from "nestelia";
import { QueueModule, InjectQueue } from "nestelia/bullmq";

@Module({ imports: [QueueModule.registerQueue("email")] })
export class EmailModule {}

@Injectable()
export class EmailService {
  constructor(@InjectQueue("email") private readonly queue: Queue) {}
}
```

## Конфигурация

### QueueModuleOptions

| Опция | Тип | По умолчанию | Описание |
|--------|------|---------|-------------|
| `connection` | `ConnectionOptions` | — | Подключение к Redis, общее для всех очередей и воркеров |
| `prefix` | `string` | — | Префикс ключей, применяемый ко всем ключам BullMQ в Redis |
| `defaultJobOptions` | `JobsOptions` | — | Параметры по умолчанию, объединяемые с каждым вызовом `add()` |
| `isGlobal` | `boolean` | `true` | Зарегистрировать модуль глобально |

## API QueueService

| Метод | Сигнатура | Описание |
|--------|-----------|-------------|
| `add` | `(queue, data, options?) → Promise<Job>` | Поместить задачу в очередь (имя задачи по умолчанию совпадает с именем очереди) |
| `addDelayed` | `(queue, data, delay, options?) → Promise<Job>` | Поместить задачу в очередь для запуска с задержкой |
| `getQueue` | `(name) → Queue` | Получить/создать кэшированную очередь-производитель |
| `registerWorker` | `(queue, processor, options?) → Worker` | Вручную запустить воркер (по одному на очередь) |
| `getWorker` | `(name) → Worker \| undefined` | Получить воркер для очереди |
| `close` | `() → Promise<void>` | Закрыть все очереди и воркеры (вызывается при завершении работы) |

## Экспорты

| Экспорт | Описание |
|--------|-------------|
| `QueueModule` | Класс модуля (`forRoot`, `forRootAsync`, `registerQueue`) |
| `QueueService` | Инжектируемый фасад производителя/потребителя |
| `@Processor(queue, opts?)` | Декоратор класса, помечающий потребителя очереди |
| `@Process(opts?)` | Декоратор метода, помечающий обработчик задачи |
| `@OnWorkerEvent(event)` | Декоратор метода для событий воркера |
| `@InjectQueue(name)` | Декоратор параметра, инжектирующий «сырую» `Queue` |
| `durationToMs(duration)` | Преобразовать объект длительности в миллисекунды |
