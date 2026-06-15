import { type Static, t } from "elysia";

import { Body, Controller, Post } from "nestelia";

import { QueueService } from "../../../packages/bullmq/src";

const SendBody = t.Object({ userId: t.String(), email: t.String() });

@Controller("/email")
export class EmailController {
  constructor(private readonly queue: QueueService) {}

  /** Enqueue a welcome email to be processed by EmailProcessor. */
  @Post("/welcome")
  async sendWelcome(@Body(SendBody) body: Static<typeof SendBody>) {
    const job = await this.queue.add("email", body, { name: "welcome" });
    return { enqueued: true, jobId: job.id };
  }

  /** Enqueue a job to run 30 seconds from now. */
  @Post("/reminder")
  async sendReminder(@Body(SendBody) body: Static<typeof SendBody>) {
    const job = await this.queue.addDelayed("email", body, { seconds: 30 });
    return { scheduled: true, jobId: job.id };
  }
}
