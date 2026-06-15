import "reflect-metadata";

import { Module } from "nestelia";

import { QueueModule } from "../../../packages/bullmq/src";

import { EmailController } from "./email.controller";
import { EmailProcessor } from "./email.processor";

@Module({
  imports: [
    QueueModule.forRoot({
      connection: { host: "localhost", port: 6379 },
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1_000 },
        removeOnComplete: true,
      },
    }),
  ],
  controllers: [EmailController],
  providers: [EmailProcessor],
})
export class AppModule {}
