import type { Job } from "bullmq";

import { Logger } from "nestelia";

import {
  OnWorkerEvent,
  Process,
  Processor,
} from "../../../packages/bullmq/src";

interface WelcomeEmailJob {
  userId: string;
  email: string;
}

/**
 * Consumes the "email" queue. The worker is started automatically on
 * application bootstrap — no manual wiring needed.
 */
@Processor("email", { concurrency: 5 })
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  /** Handles every job added under the name "welcome". */
  @Process({ name: "welcome" })
  async sendWelcome(job: Job<WelcomeEmailJob>) {
    this.logger.log(`Sending welcome email to ${job.data.email}`);
    // ... send the email ...
    return { sentTo: job.data.email };
  }

  /** Handles any other job pushed to the "email" queue. */
  @Process()
  async sendGeneric(job: Job) {
    this.logger.log(`Processing email job "${job.name}" (${job.id})`);
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job | undefined, err: Error) {
    this.logger.error(`Job ${job?.id} failed: ${err.message}`);
  }
}
