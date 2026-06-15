---
title: Queues (BullMQ)
icon: layers
description: Colas de trabajos en segundo plano impulsadas por BullMQ con procesadores basados en decoradores e integración con DI
---

El módulo BullMQ integra las colas de trabajos de [BullMQ](https://docs.bullmq.io) con la inyección de dependencias, los decoradores y el ciclo de vida de nestelia. Encola trabajos mediante un `QueueService` inyectable, y declara consumidores como clases `@Processor` cuyos métodos `@Process` se conectan a los workers automáticamente durante el bootstrap.

## Instalación

```bash
bun add bullmq
```

`bullmq` es una dependencia peer opcional — instálala solo cuando uses este módulo. Se requiere una instancia de Redis (o Valkey) en ejecución.

## Configuración

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

`forRoot` registra el módulo de forma global por defecto, por lo que `QueueService` está disponible en todas partes sin necesidad de volver a importarlo.

### Configuración asíncrona

Deriva la conexión de otro proveedor con `forRootAsync`:

```typescript
QueueModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    connection: { host: config.get("REDIS_HOST"), port: 6379 },
  }),
});
```

## Produciendo trabajos

Inyecta `QueueService` y llama a `add` (o `addDelayed`):

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
    // Ejecutar dentro de 30 segundos.
    await this.queue.addDelayed("email", { userId, email }, { seconds: 30 });
  }
}
```

El nombre del trabajo toma por defecto el nombre de la cola; pasa `options.name` para apuntar a un handler `@Process({ name })` específico. `addDelayed` acepta milisegundos en bruto o un objeto de duración (`{ minutes, seconds, hours, days, milliseconds }`).

## Consumiendo trabajos

Marca una clase con `@Processor(queueName)` y regístrala como proveedor. Durante el bootstrap el módulo inicia un worker de BullMQ para la cola y enruta los trabajos a los métodos `@Process` de la clase.

```typescript
import type { Job } from "bullmq";
import { Logger } from "nestelia";
import { Processor, Process, OnWorkerEvent } from "nestelia/bullmq";

@Processor("email", { concurrency: 5 })
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  // Maneja los trabajos añadidos bajo el nombre "welcome".
  @Process({ name: "welcome" })
  async sendWelcome(job: Job<{ email: string }>) {
    this.logger.log(`Sending welcome email to ${job.data.email}`);
    return { sentTo: job.data.email };
  }

  // Maneja cualquier otro trabajo de la cola "email".
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

> Registra el procesador como un `provider` en un módulo:
> ```typescript
> @Module({ providers: [EmailProcessor] })
> export class EmailModule {}
> ```

El método `@Process` recibe el `Job` de BullMQ; su valor de retorno se convierte en el resultado del trabajo. Usa `@Process({ name })` para enrutar distintos nombres de trabajos a distintos métodos dentro de una misma clase de procesador.

## Inyectando una Queue en bruto

Cuando necesites la API `Queue` en bruto de BullMQ en lugar de `QueueService`, registra la cola e inyéctala:

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

## Configuración

### QueueModuleOptions

| Opción | Tipo | Por defecto | Descripción |
|--------|------|---------|-------------|
| `connection` | `ConnectionOptions` | — | Conexión de Redis compartida por cada cola y worker |
| `prefix` | `string` | — | Prefijo de clave aplicado a cada clave de BullMQ en Redis |
| `defaultJobOptions` | `JobsOptions` | — | Opciones por defecto fusionadas en cada `add()` |
| `isGlobal` | `boolean` | `true` | Registrar el módulo de forma global |

## API de QueueService

| Método | Firma | Descripción |
|--------|-----------|-------------|
| `add` | `(queue, data, options?) → Promise<Job>` | Encola un trabajo (el nombre del trabajo toma por defecto el nombre de la cola) |
| `addDelayed` | `(queue, data, delay, options?) → Promise<Job>` | Encola un trabajo para ejecutarse tras un retardo |
| `getQueue` | `(name) → Queue` | Obtiene/crea la cola productora en caché |
| `registerWorker` | `(queue, processor, options?) → Worker` | Inicia un worker manualmente (uno por cola) |
| `getWorker` | `(name) → Worker \| undefined` | Obtiene el worker de una cola |
| `close` | `() → Promise<void>` | Cierra todas las colas y workers (se llama al apagar) |

## Exportaciones

| Exportación | Descripción |
|--------|-------------|
| `QueueModule` | Clase del módulo (`forRoot`, `forRootAsync`, `registerQueue`) |
| `QueueService` | Fachada productor/consumidor inyectable |
| `@Processor(queue, opts?)` | Decorador de clase que marca un consumidor de cola |
| `@Process(opts?)` | Decorador de método que marca un handler de trabajos |
| `@OnWorkerEvent(event)` | Decorador de método para eventos del worker |
| `@InjectQueue(name)` | Decorador de parámetro que inyecta una `Queue` en bruto |
| `durationToMs(duration)` | Convierte un objeto de duración a milisegundos |
