---
title: Scheduler
icon: clock
description: Планирование cron-задач, интервалов и таймаутов
---

Пакет scheduler предоставляет декораторы для запуска задач по расписанию.

## Настройка

Импортируйте `ScheduleModule` в корневой module:

```typescript
import { Module } from "nestelia";
import { ScheduleModule } from "nestelia/scheduler";

@Module({
  imports: [ScheduleModule.forRoot()],
})
class AppModule {}
```

## Декораторы

### @Cron()

Запуск метода по cron-расписанию:

```typescript
import { Injectable } from "nestelia";
import { Cron } from "nestelia/scheduler";

@Injectable()
class TasksService {
  @Cron("0 */5 * * * *") // каждые 5 минут
  async cleanup() {
    await this.db.cleanup();
  }

  @Cron("0 0 * * *") // ежедневно в полночь
  async dailyReport() {
    await this.reportService.generate();
  }
}
```

### @Interval()

Запуск метода с фиксированным интервалом (в миллисекундах):

```typescript
@Injectable()
class HealthService {
  @Interval(60000) // каждые 60 секунд
  heartbeat() {
    console.log("Alive");
  }
}
```

### @Timeout()

Запуск метода один раз после задержки (в миллисекундах):

```typescript
@Injectable()
class StartupService {
  @Timeout(5000) // через 5 секунд после bootstrap
  async delayedInit() {
    console.log("Delayed initialization complete");
  }
}
```

### @ScheduleAt()

Запуск метода в конкретную дату и время:

```typescript
@Injectable()
class EventService {
  @ScheduleAt(new Date("2025-12-31T23:59:00"))
  async newYearCountdown() {
    console.log("Happy New Year!");
  }
}
```

## Параметры Scheduler

Передайте параметры в `forRootWithOptions()`:

```typescript
ScheduleModule.forRootWithOptions({
  maxTasks: 5000,   // максимальное количество запланированных задач (по умолчанию: 10000)
})
```

## SchedulerRegistry

Инжектируйте `SchedulerRegistry` для программного управления запланированными задачами:

```typescript
import { Injectable, Inject } from "nestelia";
import { SchedulerRegistry, Scheduler } from "nestelia/scheduler";

@Injectable()
class DynamicTaskService {
  constructor(private registry: SchedulerRegistry) {}

  addCronTask(name: string, cronExpression: string, callback: () => void) {
    const scheduler = new Scheduler();
    scheduler.scheduleCron(cronExpression, callback);
    this.registry.addScheduler(name, scheduler);
  }

  removeTask(name: string) {
    this.registry.removeScheduler(name);
  }

  listTasks(): string[] {
    return this.registry.getSchedulerNames();
  }
}
```

### API SchedulerRegistry

| Метод | Описание |
|--------|-------------|
| `addScheduler(name, scheduler)` | Зарегистрировать scheduler под именем |
| `getScheduler(name)` | Получить scheduler по имени (возвращает `Scheduler \| undefined`) |
| `removeScheduler(name)` | Остановить и удалить scheduler |
| `getSchedulerNames()` | Получить список имён всех зарегистрированных schedulers |
| `clear()` | Остановить и удалить все schedulers |

### API Scheduler

| Метод | Описание |
|--------|-------------|
| `scheduleCron(expression, callback, options?)` | Запланировать cron-задачу, возвращает `TaskHandle` |
| `scheduleInterval(ms, callback, options?)` | Запланировать интервальную задачу |
| `scheduleTimeout(ms, callback, options?)` | Запланировать одноразовую задачу с задержкой |
| `cancelAllTasks()` | Отменить все задачи этого scheduler |