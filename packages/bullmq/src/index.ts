/**
 * @packageDocumentation
 *
 * Nestelia BullMQ Module
 *
 * Integrates {@link https://docs.bullmq.io | BullMQ} job queues with nestelia's
 * dependency injection, decorators, and lifecycle.
 *
 * @example
 * ```typescript
 * import { QueueModule, QueueService, Processor, Process } from "nestelia/bullmq";
 *
 * @Processor("email")
 * class EmailProcessor {
 *   @Process()
 *   async handle(job: Job<{ userId: string }>) {
 *     await sendWelcome(job.data.userId);
 *   }
 * }
 *
 * @Module({
 *   imports: [QueueModule.forRoot({ connection: { host: "localhost", port: 6379 } })],
 *   providers: [EmailProcessor],
 * })
 * class AppModule {}
 * ```
 *
 * @module
 */

export { QueueModule } from "./bullmq.module";
export { QueueService, type JobProcessor } from "./bullmq.service";
export { QueueExplorer } from "./bullmq.explorer";
export * from "./decorators";
export * from "./interfaces";
export { durationToMs } from "./utils";
export {
  BULLMQ_MODULE_OPTIONS,
  getQueueToken,
  PROCESS_METADATA,
  PROCESSOR_METADATA,
  WORKER_EVENT_METADATA,
} from "./bullmq.constants";
