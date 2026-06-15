import { Container, Injectable, STATIC_CONTEXT } from "nestelia";
import type { OnModuleDestroy, OnModuleInit } from "nestelia";

import { ON_EVENT_METADATA } from "./event-emitter.constants";
import { EventEmitterService } from "./event-emitter.service";
import type { OnEventMetadata } from "./interfaces";

/**
 * Scans all providers registered in the DI container for `@OnEvent`-decorated
 * methods and registers them with the `EventEmitterService` instance.
 *
 * Runs automatically during `onModuleInit`, after all provider instances have
 * been resolved. (Note: `onApplicationBootstrap` is NOT used — the core
 * LifecycleManager only registers a provider for lifecycle hooks if it
 * implements `onModuleInit`, so a bootstrap-only explorer would never run.)
 *
 * @internal
 */
interface RegisteredHandler {
  event: string | symbol;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (payload: any) => any;
}

@Injectable()
export class EventEmitterExplorer implements OnModuleInit, OnModuleDestroy {
  private readonly registeredHandlers: RegisteredHandler[] = [];

  constructor(private readonly eventEmitter: EventEmitterService) {}

  onModuleDestroy(): void {
    for (const { event, handler } of this.registeredHandlers) {
      this.eventEmitter.off(event, handler);
    }
    this.registeredHandlers.length = 0;
  }

  onModuleInit(): void {
    for (const moduleRef of Container.instance.getModules().values()) {
      for (const [, wrapper] of moduleRef.getProviders()) {
        const instancePerContext = wrapper.getInstanceByContextId(STATIC_CONTEXT);
        const instance = instancePerContext?.instance;

        if (!instance || typeof instance !== "object") continue;

        const metadata: OnEventMetadata[] | undefined = Reflect.getMetadata(
          ON_EVENT_METADATA,
          instance.constructor,
        );

        if (!metadata || metadata.length === 0) continue;

        for (const { event, methodName, once } of metadata) {
          const method = (instance as Record<string | symbol, unknown>)[methodName];
          if (typeof method !== "function") continue;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const handler = (method as (payload: unknown) => any).bind(instance);

          if (once) {
            this.eventEmitter.once(event, handler);
          } else {
            this.eventEmitter.on(event, handler);
          }

          this.registeredHandlers.push({ event, handler });
        }
      }
    }
  }
}
