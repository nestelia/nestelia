import {
  type ConnectionOptions,
  type Job,
  type JobsOptions,
  Queue,
  type WorkerOptions,
  Worker,
} from "bullmq";
import { Inject, Injectable, Logger } from "nestelia";

import { BULLMQ_MODULE_OPTIONS } from "./bullmq.constants";
import type {
  AddJobOptions,
  DelayDuration,
  QueueModuleOptions,
} from "./interfaces";
import { durationToMs } from "./utils";

/**
 * Processor function executed for every job pulled from a queue.
 */
export type JobProcessor = (job: Job) => Promise<unknown> | unknown;

/**
 * Injectable producer/consumer facade over BullMQ.
 *
 * Producing side — enqueue jobs with {@link add} / {@link addDelayed}.
 * Consuming side — workers are normally wired automatically from `@Processor`
 * classes by the {@link QueueExplorer}, but {@link registerWorker} is available
 * for manual registration.
 *
 * Queues are created lazily and cached per name; a single shared Redis
 * connection (from {@link QueueModule.forRoot}) backs every queue and worker.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class EmailService {
 *   constructor(private readonly queue: QueueService) {}
 *
 *   async sendWelcome(userId: string) {
 *     await this.queue.add("email", { userId }, { attempts: 3 });
 *   }
 * }
 * ```
 */
@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private readonly queues = new Map<string, Queue>();
  private readonly workers = new Map<string, Worker>();
  private readonly connection: ConnectionOptions;
  private readonly prefix?: string;
  private readonly defaultJobOptions?: JobsOptions;

  constructor(
    @Inject(BULLMQ_MODULE_OPTIONS) options: QueueModuleOptions,
  ) {
    this.connection = options.connection;
    this.prefix = options.prefix;
    this.defaultJobOptions = options.defaultJobOptions;
  }

  /**
   * Get (creating and caching on first use) the producer {@link Queue} for
   * `name`.
   */
  getQueue(name: string): Queue {
    let queue = this.queues.get(name);
    if (!queue) {
      queue = new Queue(name, {
        connection: this.connection,
        prefix: this.prefix,
        defaultJobOptions: this.defaultJobOptions,
      });
      this.queues.set(name, queue);
    }
    return queue;
  }

  /**
   * Enqueue a job. The job name defaults to the queue name; pass
   * `options.name` to target a specific `@Process({ name })` handler.
   */
  async add<T = unknown>(
    queueName: string,
    data: T,
    options: AddJobOptions = {},
  ): Promise<Job<T>> {
    const { name, ...jobOptions } = options;
    return this.getQueue(queueName).add(
      name ?? queueName,
      data,
      jobOptions,
    ) as Promise<Job<T>>;
  }

  /**
   * Enqueue a job to run after a delay, expressed as milliseconds or a
   * {@link DelayDuration} object.
   */
  async addDelayed<T = unknown>(
    queueName: string,
    data: T,
    delay: DelayDuration | number,
    options: AddJobOptions = {},
  ): Promise<Job<T>> {
    return this.add(queueName, data, {
      ...options,
      delay: durationToMs(delay),
    });
  }

  /**
   * Create and track a {@link Worker} for `queueName`. At most one worker per
   * queue is created; a second registration is ignored with a warning.
   */
  registerWorker(
    queueName: string,
    processor: JobProcessor,
    options: Omit<Partial<WorkerOptions>, "connection" | "prefix"> = {},
  ): Worker {
    const existing = this.workers.get(queueName);
    if (existing) {
      this.logger.warn(
        `A worker for queue "${queueName}" is already registered; ignoring duplicate.`,
      );
      return existing;
    }

    const worker = new Worker(queueName, async (job) => processor(job), {
      ...options,
      connection: this.connection,
      prefix: this.prefix,
    });

    worker.on("failed", (job, err) => {
      this.logger.error(
        `Job "${queueName}" (${job?.id ?? "unknown"}) failed: ${err.message}`,
      );
    });

    this.workers.set(queueName, worker);
    return worker;
  }

  /** Return the registered worker for `queueName`, if any. */
  getWorker(queueName: string): Worker | undefined {
    return this.workers.get(queueName);
  }

  /**
   * Close every worker and queue and release their Redis connections.
   * Called automatically on application shutdown.
   */
  async close(): Promise<void> {
    await Promise.all(
      [...this.workers.values()].map((worker) => worker.close()),
    );
    await Promise.all([...this.queues.values()].map((queue) => queue.close()));
    this.workers.clear();
    this.queues.clear();
  }
}
