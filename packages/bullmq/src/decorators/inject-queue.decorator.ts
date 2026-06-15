import { Inject } from "nestelia";

import { getQueueToken } from "../bullmq.constants";

/**
 * Injects the producer `Queue` registered for `name` via
 * {@link QueueModule.registerQueue}.
 *
 * Shorthand for `@Inject(getQueueToken(name))`. Prefer injecting
 * {@link QueueService} when you only need to enqueue jobs — use this when you
 * want the raw BullMQ `Queue` API.
 *
 * @param name - Queue name.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class EmailService {
 *   constructor(@InjectQueue("email") private readonly queue: Queue) {}
 * }
 * ```
 */
export const InjectQueue = (name: string): ParameterDecorator =>
  Inject(getQueueToken(name));
