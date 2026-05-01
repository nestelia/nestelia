import { Injectable } from "nestelia";
import { Cron, Interval, Timeout } from "../../../packages/scheduler/src";
import { Logger } from "~/src/logger";

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron("*/5 * * * * *")
  handleEvery5Seconds() {
    this.logger.log(`cron:${Date.now()}`);
  }

  @Interval(10_000)
  handleEvery10Seconds() {
    this.logger.log(`interval:${Date.now()}`);
  }

  @Timeout(30_000)
  handleOnce() {
    this.logger.log(`timeout:${Date.now()}`);
  }
}
