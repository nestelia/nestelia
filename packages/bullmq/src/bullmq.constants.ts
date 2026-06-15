/**
 * DI token holding the resolved {@link QueueModuleOptions} object.
 *
 * @internal
 */
export const BULLMQ_MODULE_OPTIONS = "BULLMQ_MODULE_OPTIONS";

/**
 * Metadata key set by `@Processor` on a class, describing which queue the
 * class consumes.
 *
 * @internal
 */
export const PROCESSOR_METADATA = "__bullmq_processor__";

/**
 * Metadata key set by `@Process` on a method, marking it as a job handler.
 *
 * @internal
 */
export const PROCESS_METADATA = "__bullmq_process__";

/**
 * Metadata key set by `@OnWorkerEvent` on a method, marking it as a worker
 * event listener.
 *
 * @internal
 */
export const WORKER_EVENT_METADATA = "__bullmq_worker_event__";

/**
 * Builds the DI token used to inject a producer `Queue` for `name`.
 *
 * Used internally by {@link InjectQueue} and {@link QueueModule.registerQueue}.
 *
 * @param name - Queue name.
 */
export const getQueueToken = (name: string): string => `BullQueue_${name}`;
