import { PROCESS_METADATA } from "../bullmq.constants";
import type { ProcessMetadata, ProcessOptions } from "../interfaces";

/**
 * Marks a method on a `@Processor` class as a job handler. The method receives
 * the BullMQ `Job`; its return value becomes the job's result.
 *
 * Without `options.name` the method handles every job the worker pulls. Pass
 * `name` to dispatch only jobs added under that name — letting one processor
 * class route multiple job types to different methods.
 *
 * @param options - Optional job-name routing.
 *
 * @example
 * ```typescript
 * @Processor("media")
 * export class MediaProcessor {
 *   @Process({ name: "resize" })
 *   resize(job: Job) { ... }
 *
 *   @Process({ name: "transcode" })
 *   transcode(job: Job) { ... }
 * }
 * ```
 */
export function Process(options: ProcessOptions = {}): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    const existing: ProcessMetadata[] =
      Reflect.getMetadata(PROCESS_METADATA, target.constructor) ?? [];

    existing.push({ methodName: propertyKey as string, name: options.name });

    Reflect.defineMetadata(PROCESS_METADATA, existing, target.constructor);
    return descriptor;
  };
}
