import { Module } from "nestelia";
import type { DynamicModule, Provider } from "nestelia";

import { BULLMQ_MODULE_OPTIONS, getQueueToken } from "./bullmq.constants";
import { QueueExplorer } from "./bullmq.explorer";
import { QueueService } from "./bullmq.service";
import type {
  QueueModuleAsyncOptions,
  QueueModuleOptions,
} from "./interfaces";

/**
 * Integrates BullMQ-backed job queues with nestelia's dependency injection.
 *
 * Register the connection once at the application root with {@link forRoot}
 * (or {@link forRootAsync}). Producers inject {@link QueueService} and call
 * `add()`; consumers declare `@Processor` classes whose `@Process` methods are
 * wired to workers automatically during bootstrap.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     QueueModule.forRoot({
 *       connection: { host: "localhost", port: 6379 },
 *     }),
 *   ],
 *   providers: [EmailProcessor, EmailService],
 * })
 * export class AppModule {}
 * ```
 *
 * @example
 * Async configuration:
 * ```typescript
 * QueueModule.forRootAsync({
 *   inject: [ConfigService],
 *   useFactory: (config: ConfigService) => ({
 *     connection: { host: config.get("REDIS_HOST"), port: 6379 },
 *   }),
 * });
 * ```
 */
@Module({})
export class QueueModule {
  /**
   * Register the module with a static configuration. Global by default.
   */
  static forRoot(options: QueueModuleOptions): DynamicModule {
    return {
      module: QueueModule,
      global: options.isGlobal ?? true,
      providers: [
        { provide: BULLMQ_MODULE_OPTIONS, useValue: options },
        QueueService,
        QueueExplorer,
      ],
      exports: [QueueService],
    };
  }

  /**
   * Register the module with an asynchronously-resolved configuration.
   * Global by default.
   */
  static forRootAsync(options: QueueModuleAsyncOptions): DynamicModule {
    return {
      module: QueueModule,
      global: options.isGlobal ?? true,
      providers: [
        {
          provide: BULLMQ_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
        QueueService,
        QueueExplorer,
      ],
      exports: [QueueService],
    };
  }

  /**
   * Expose producer `Queue` instances under `@InjectQueue(name)` tokens.
   *
   * Requires {@link forRoot}/{@link forRootAsync} to have been called. Import
   * in any feature module that injects a raw queue.
   *
   * @example
   * ```typescript
   * @Module({ imports: [QueueModule.registerQueue("email", "media")] })
   * export class EmailModule {}
   * ```
   */
  static registerQueue(...names: string[]): DynamicModule {
    const providers: Provider[] = names.map((name) => ({
      provide: getQueueToken(name),
      useFactory: (queueService: QueueService) => queueService.getQueue(name),
      inject: [QueueService],
    }));

    return {
      module: QueueModule,
      providers,
      exports: providers.map((provider) => (provider as { provide: string }).provide),
    };
  }
}
