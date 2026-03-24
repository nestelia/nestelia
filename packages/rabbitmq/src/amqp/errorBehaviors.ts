import type { Channel, ConsumeMessage } from "amqplib";
import type { QueueOptions } from "../interfaces/rabbitmq.interface";

export enum MessageHandlerErrorBehavior {
  ACK = "ACK",
  NACK = "NACK",
  REQUEUE = "REQUEUE",
}

type BaseMessageErrorHandler<T extends ConsumeMessage | ConsumeMessage[]> = (
  channel: Channel,
  msg: T,
  error: unknown,
) => Promise<void> | void;

export type MessageErrorHandler = BaseMessageErrorHandler<ConsumeMessage>;

export type BatchMessageErrorHandler = BaseMessageErrorHandler<
  ConsumeMessage[]
>;

export type LegacyMessageErrorHandler = BaseMessageErrorHandler<
  ConsumeMessage | ConsumeMessage[]
>;

export const ackErrorHandler: LegacyMessageErrorHandler = (channel, msg) => {
  for (const m of Array.isArray(msg) ? msg : [msg]) {
    channel.ack(m);
  }
};

export const requeueErrorHandler: LegacyMessageErrorHandler = (
  channel,
  msg,
) => {
  for (const m of Array.isArray(msg) ? msg : [msg]) {
    channel.nack(m, false, true);
  }
};

export const defaultNackErrorHandler: LegacyMessageErrorHandler = (
  channel,
  msg,
) => {
  for (const m of Array.isArray(msg) ? msg : [msg]) {
    channel.nack(m, false, false);
  }
};

export const getHandlerForLegacyBehavior = (
  behavior: MessageHandlerErrorBehavior,
) => {
  switch (behavior) {
    case MessageHandlerErrorBehavior.ACK:
      return ackErrorHandler;
    case MessageHandlerErrorBehavior.REQUEUE:
      return requeueErrorHandler;
    default:
      return defaultNackErrorHandler;
  }
};

export type AssertQueueErrorHandler = (
  channel: Channel,
  queueName: string,
  queueOptions: QueueOptions | undefined,
  error: unknown,
) => Promise<string> | string;

export const defaultAssertQueueErrorHandler: AssertQueueErrorHandler = (
  _channel: Channel,
  _queueName: string,
  _queueOptions: QueueOptions | undefined,
  error: unknown,
) => {
  throw error;
};

export const PRECONDITION_FAILED_CODE = 406;

export const forceDeleteAssertQueueErrorHandler: AssertQueueErrorHandler =
  async (
    channel: Channel,
    queueName: string,
    queueOptions: QueueOptions | undefined,
    error: unknown,
  ) => {
    if ((error as { code?: number }).code === PRECONDITION_FAILED_CODE) {
      await channel.deleteQueue(queueName);
      const { queue } = await channel.assertQueue(queueName, queueOptions);
      return queue;
    }
    throw error;
  };
