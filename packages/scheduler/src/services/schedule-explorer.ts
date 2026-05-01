import { Container, type OnModuleInit } from "nestelia";
import { registerScheduledJobs } from "../utils/scheduler.utils";

/**
 * Scans the DI container for providers and controllers that have scheduled-job
 * decorators ({@link Cron}, {@link Interval}, {@link Timeout}, {@link ScheduleAt})
 * and registers them with the global {@link Scheduler}.
 */
export class ScheduleExplorer implements OnModuleInit {
  public onModuleInit(): void {
    const container = Container.instance;
    const processed = new Set<unknown>();

    for (const moduleRef of container.getModules().values()) {
      for (const wrapper of moduleRef.getProviders().values()) {
        const instance = wrapper.instance;
        if (instance && !processed.has(instance)) {
          processed.add(instance);
          registerScheduledJobs(instance);
        }
      }

      for (const wrapper of moduleRef.getControllers().values()) {
        const instance = wrapper.instance;
        if (instance && !processed.has(instance)) {
          processed.add(instance);
          registerScheduledJobs(instance);
        }
      }
    }
  }
}
