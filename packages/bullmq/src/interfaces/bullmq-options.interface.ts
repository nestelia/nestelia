import type {
  ConnectionOptions,
  JobsOptions,
  WorkerOptions,
} from "bullmq";
import type { ProviderToken } from "nestelia";

/**
 * A human-friendly delay description.
 *
 * All fields are additive — `{ minutes: 1, seconds: 30 }` resolves to
 * `90_000` milliseconds.
 */
export type DelayDuration = {
  milliseconds?: number;
  seconds?: number;
  minutes?: number;
  hours?: number;
  days?: number;
};

/**
 * Options accepted by {@link QueueModule.forRoot}.
 */
export interface QueueModuleOptions {
  /**
   * Redis connection used by every queue and worker created through this
   * module. Accepts an `ioredis` options object or an existing client.
   */
  connection: ConnectionOptions;

  /**
   * Optional key prefix applied to every BullMQ key in Redis.
   * Useful for sharing a Redis instance across multiple apps.
   */
  prefix?: string;

  /**
   * Default job options merged into every `add()` call (attempts, backoff,
   * removeOnComplete, …).
   */
  defaultJobOptions?: JobsOptions;

  /**
   * Register the module globally so {@link QueueService} is available
   * application-wide without re-importing the module.
   *
   * @default true
   */
  isGlobal?: boolean;
}

/**
 * Options accepted by {@link QueueModule.forRootAsync}.
 */
export interface QueueModuleAsyncOptions {
  /** Factory that produces {@link QueueModuleOptions}, possibly async. */
  useFactory: (
    ...args: unknown[]
  ) => QueueModuleOptions | Promise<QueueModuleOptions>;
  /** Providers injected positionally into `useFactory`. */
  inject?: ProviderToken[];
  /**
   * Register the module globally.
   *
   * @default true
   */
  isGlobal?: boolean;
}

/**
 * Per-worker options accepted by `@Processor`. A subset of BullMQ's
 * `WorkerOptions`; `connection` and `prefix` are supplied by the module.
 */
export type ProcessorOptions = Omit<
  Partial<WorkerOptions>,
  "connection" | "prefix"
>;

/**
 * Options accepted by `@Process`.
 */
export interface ProcessOptions {
  /**
   * Restrict this handler to jobs added under the given name. When omitted,
   * the method handles every job that no named handler claims.
   */
  name?: string;
}

/**
 * Options accepted by {@link QueueService.add}. Extends BullMQ `JobsOptions`
 * with an optional job `name` used for `@Process({ name })` routing.
 */
export type AddJobOptions = JobsOptions & { name?: string };

/**
 * Metadata recorded by `@Processor`.
 *
 * @internal
 */
export interface ProcessorMetadata {
  queueName: string;
  options: ProcessorOptions;
}

/**
 * Metadata recorded by `@Process`.
 *
 * @internal
 */
export interface ProcessMetadata {
  methodName: string;
  name?: string;
}

/**
 * Metadata recorded by `@OnWorkerEvent`.
 *
 * @internal
 */
export interface WorkerEventMetadata {
  methodName: string;
  event: string;
}
