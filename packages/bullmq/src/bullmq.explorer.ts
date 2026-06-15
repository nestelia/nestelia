import type { Job, WorkerListener } from "bullmq";
import { Container, Injectable, Logger, STATIC_CONTEXT } from "nestelia";
import type { OnModuleDestroy, OnModuleInit } from "nestelia";

import {
  PROCESS_METADATA,
  PROCESSOR_METADATA,
  WORKER_EVENT_METADATA,
} from "./bullmq.constants";
import { QueueService } from "./bullmq.service";
import type {
  ProcessMetadata,
  ProcessorMetadata,
  WorkerEventMetadata,
} from "./interfaces";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;

/**
 * Scans every provider in the DI container for `@Processor` classes and starts
 * a BullMQ worker for each, routing jobs to their `@Process` methods and wiring
 * `@OnWorkerEvent` listeners. Runs once during `onModuleInit`, after all
 * provider instances have been resolved.
 *
 * On shutdown it closes all queues and workers via {@link QueueService.close}.
 *
 * @internal
 */
@Injectable()
export class QueueExplorer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueExplorer.name);

  constructor(private readonly queueService: QueueService) {}

  onModuleInit(): void {
    for (const moduleRef of Container.instance.getModules().values()) {
      for (const [, wrapper] of moduleRef.getProviders()) {
        const instance = wrapper.getInstanceByContextId(STATIC_CONTEXT)?.instance;
        if (!instance || typeof instance !== "object") continue;

        const metadata: ProcessorMetadata | undefined = Reflect.getMetadata(
          PROCESSOR_METADATA,
          instance.constructor,
        );
        if (!metadata) continue;

        this.registerProcessor(
          instance as Record<string, unknown>,
          metadata,
        );
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.queueService.close();
  }

  private registerProcessor(
    instance: Record<string, unknown>,
    { queueName, options }: ProcessorMetadata,
  ): void {
    const ctor = instance.constructor;
    const processMeta: ProcessMetadata[] =
      Reflect.getMetadata(PROCESS_METADATA, ctor) ?? [];

    if (processMeta.length === 0) {
      this.logger.warn(
        `@Processor("${queueName}") on ${ctor.name} has no @Process() method; no worker started.`,
      );
      return;
    }

    const named = new Map<string, AnyFn>();
    let fallback: AnyFn | undefined;

    for (const { methodName, name } of processMeta) {
      const method = instance[methodName];
      if (typeof method !== "function") continue;
      const handler = (method as AnyFn).bind(instance);
      if (name) {
        named.set(name, handler);
      } else {
        fallback = handler;
      }
    }

    const processor = (job: Job): Promise<unknown> | unknown => {
      const handler = named.get(job.name) ?? fallback;
      if (!handler) {
        this.logger.warn(
          `No @Process handler for job "${job.name}" on queue "${queueName}".`,
        );
        return undefined;
      }
      return handler(job);
    };

    const worker = this.queueService.registerWorker(
      queueName,
      processor,
      options,
    );

    const eventMeta: WorkerEventMetadata[] =
      Reflect.getMetadata(WORKER_EVENT_METADATA, ctor) ?? [];

    for (const { methodName, event } of eventMeta) {
      const method = instance[methodName];
      if (typeof method !== "function") continue;
      worker.on(
        event as keyof WorkerListener,
        (method as AnyFn).bind(instance),
      );
    }

    this.logger.log(
      `Started worker for queue "${queueName}" → ${ctor.name}`,
    );
  }
}
