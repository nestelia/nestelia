/**
 * @packageDocumentation
 *
 * Nestelia EventEmitter Module
 *
 * Integrates a typed, wildcard-capable event emitter with nestelia's
 * dependency injection system.
 *
 * @example
 * ```typescript
 * import { EventEmitterModule, EventEmitterService, OnEvent } from 'nestelia/event-emitter';
 *
 * @Module({
 *   imports: [EventEmitterModule.forRoot({ wildcard: true })],
 * })
 * export class AppModule {}
 * ```
 *
 * @module
 */

export * from "./event-emitter.constants";
export * from "./event-emitter.module";
export * from "./event-emitter.service";
export * from "./decorators";
export * from "./interfaces";
