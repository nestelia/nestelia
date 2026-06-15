import type { WorkerListener } from "bullmq";

import { WORKER_EVENT_METADATA } from "../bullmq.constants";
import type { WorkerEventMetadata } from "../interfaces";

/**
 * Marks a method on a `@Processor` class as a listener for a BullMQ worker
 * event (`"completed"`, `"failed"`, `"active"`, `"progress"`, `"stalled"`, …).
 *
 * The method is bound to the same worker that runs the class's `@Process`
 * handlers and receives the native event arguments.
 *
 * @param event - Worker event name.
 *
 * @example
 * ```typescript
 * @Processor("email")
 * export class EmailProcessor {
 *   @Process()
 *   handle(job: Job) { ... }
 *
 *   @OnWorkerEvent("failed")
 *   onFailed(job: Job, err: Error) {
 *     console.error(`Job ${job?.id} failed`, err);
 *   }
 * }
 * ```
 */
export function OnWorkerEvent(
  event: keyof WorkerListener,
): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    const existing: WorkerEventMetadata[] =
      Reflect.getMetadata(WORKER_EVENT_METADATA, target.constructor) ?? [];

    existing.push({ methodName: propertyKey as string, event: event as string });

    Reflect.defineMetadata(WORKER_EVENT_METADATA, existing, target.constructor);
    return descriptor;
  };
}
