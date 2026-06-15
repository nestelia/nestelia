import { PROCESSOR_METADATA } from "../bullmq.constants";
import type { ProcessorMetadata, ProcessorOptions } from "../interfaces";

/**
 * Marks a class as the consumer of a queue.
 *
 * Register the class in a module's `providers`; on bootstrap the
 * {@link QueueExplorer} starts a BullMQ `Worker` for `queueName` and routes
 * jobs to the class's `@Process` methods. `@OnWorkerEvent` methods on the same
 * class receive worker lifecycle events.
 *
 * @param queueName - Name of the queue to consume.
 * @param options - Worker tuning (concurrency, limiter, …).
 *
 * @example
 * ```typescript
 * @Processor("email", { concurrency: 5 })
 * export class EmailProcessor {
 *   @Process()
 *   async handle(job: Job<{ userId: string }>) {
 *     await sendEmail(job.data.userId);
 *   }
 *
 *   @OnWorkerEvent("completed")
 *   onCompleted(job: Job) {
 *     console.log(`Job ${job.id} done`);
 *   }
 * }
 * ```
 */
export function Processor(
  queueName: string,
  options: ProcessorOptions = {},
): ClassDecorator {
  return (target) => {
    const metadata: ProcessorMetadata = { queueName, options };
    Reflect.defineMetadata(PROCESSOR_METADATA, metadata, target);
  };
}
