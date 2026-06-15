---
title: Queues (BullMQ)
icon: layers
description: Filas de jobs em background com BullMQ, processadores baseados em decoradores e integração de DI
---

O módulo BullMQ integra as filas de jobs do [BullMQ](https://docs.bullmq.io) com a injeção de dependências, os decoradores e o ciclo de vida do nestelia. Enfileire jobs através de um `QueueService` injetável e declare consumidores como classes `@Processor` cujos métodos `@Process` são conectados aos workers automaticamente durante o bootstrap.

## Instalação

```bash
bun add bullmq
```

`bullmq` é uma dependência de par opcional — instale-a apenas quando usar este módulo. É necessária uma instância de Redis (ou Valkey) em execução.

## Configuração

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

`forRoot` registra o módulo globalmente por padrão, então `QueueService` fica disponível em qualquer lugar sem precisar reimportá-lo.

### Configuração assíncrona

Derive a conexão a partir de outro provedor com `forRootAsync`:

```typescript
QueueModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    connection: { host: config.get("REDIS_HOST"), port: 6379 },
  }),
});
```

## Produzindo jobs

Injete `QueueService` e chame `add` (ou `addDelayed`):

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
    // Executa daqui a 30 segundos.
    await this.queue.addDelayed("email", { userId, email }, { seconds: 30 });
  }
}
```

O nome do job assume por padrão o nome da fila; passe `options.name` para direcionar a um handler `@Process({ name })` específico. `addDelayed` aceita milissegundos brutos ou um objeto de duração (`{ minutes, seconds, hours, days, milliseconds }`).

## Consumindo jobs

Marque uma classe com `@Processor(queueName)` e registre-a como provedor. Durante o bootstrap, o módulo inicia um worker do BullMQ para a fila e roteia os jobs para os métodos `@Process` da classe.

```typescript
import type { Job } from "bullmq";
import { Logger } from "nestelia";
import { Processor, Process, OnWorkerEvent } from "nestelia/bullmq";

@Processor("email", { concurrency: 5 })
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  // Trata jobs adicionados sob o nome "welcome".
  @Process({ name: "welcome" })
  async sendWelcome(job: Job<{ email: string }>) {
    this.logger.log(`Sending welcome email to ${job.data.email}`);
    return { sentTo: job.data.email };
  }

  // Trata qualquer outro job na fila "email".
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

> Registre o processador como um `provider` em um módulo:
> ```typescript
> @Module({ providers: [EmailProcessor] })
> export class EmailModule {}
> ```

O método `@Process` recebe o `Job` do BullMQ; seu valor de retorno se torna o resultado do job. Use `@Process({ name })` para rotear diferentes nomes de jobs para diferentes métodos dentro de uma mesma classe de processador.

## Injetando uma Queue bruta

Quando você precisar da API `Queue` bruta do BullMQ em vez do `QueueService`, registre a fila e injete-a:

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

## Configuração

### QueueModuleOptions

| Opção | Tipo | Padrão | Descrição |
|--------|------|---------|-------------|
| `connection` | `ConnectionOptions` | — | Conexão do Redis compartilhada por todas as filas e workers |
| `prefix` | `string` | — | Prefixo de chave aplicado a toda chave do BullMQ no Redis |
| `defaultJobOptions` | `JobsOptions` | — | Opções padrão mescladas em todo `add()` |
| `isGlobal` | `boolean` | `true` | Registrar o módulo globalmente |

## API do QueueService

| Método | Assinatura | Descrição |
|--------|-----------|-------------|
| `add` | `(queue, data, options?) → Promise<Job>` | Enfileira um job (o nome do job assume por padrão o nome da fila) |
| `addDelayed` | `(queue, data, delay, options?) → Promise<Job>` | Enfileira um job para executar após um atraso |
| `getQueue` | `(name) → Queue` | Obtém/cria a fila produtora em cache |
| `registerWorker` | `(queue, processor, options?) → Worker` | Inicia um worker manualmente (um por fila) |
| `getWorker` | `(name) → Worker \| undefined` | Obtém o worker de uma fila |
| `close` | `() → Promise<void>` | Fecha todas as filas e workers (chamado no shutdown) |

## Exportações

| Exportação | Descrição |
|--------|-------------|
| `QueueModule` | Classe do módulo (`forRoot`, `forRootAsync`, `registerQueue`) |
| `QueueService` | Fachada injetável de produtor/consumidor |
| `@Processor(queue, opts?)` | Decorador de classe que marca um consumidor de fila |
| `@Process(opts?)` | Decorador de método que marca um handler de job |
| `@OnWorkerEvent(event)` | Decorador de método para eventos do worker |
| `@InjectQueue(name)` | Decorador de parâmetro que injeta uma `Queue` bruta |
| `durationToMs(duration)` | Converte um objeto de duração em milissegundos |
