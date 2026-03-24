import type { LoggerService } from "nestelia";
import type { AmqpConnectionManagerOptions } from "amqp-connection-manager";
import type { ConsumeMessage, Options } from "amqplib";
import type {
  AssertQueueErrorHandler,
  MessageErrorHandler,
  BatchMessageErrorHandler,
  MessageHandlerErrorBehavior,
} from "../amqp/errorBehaviors";

export type {
  AssertQueueErrorHandler,
  MessageErrorHandler,
  BatchMessageErrorHandler,
  MessageHandlerErrorBehavior,
};

export interface RabbitMQExchangeConfig {
  name: string;
  type?: string;
  createExchangeIfNotExists?: boolean;
  options?: Options.AssertExchange;
}

export interface RabbitMQQueueConfig {
  name: string;
  createQueueIfNotExists?: boolean;
  options?: Options.AssertQueue;
  exchange?: string;
  routingKey?: string | string[];
  bindQueueArguments?: Record<string, unknown>;
  consumerTag?: string | undefined;
}

export interface RabbitMQExchangeBindingConfig {
  destination: string;
  source: string;
  pattern: string;
  args?: Record<string, unknown>;
}

export type ConsumeOptions = Options.Consume;

export interface MessageOptions {
  exchange: string;
  routingKey: string;
}

export interface RequestOptions {
  exchange: string;
  routingKey: string;
  correlationId?: string;
  timeout?: number;
  payload?: unknown;
  headers?: Record<string, unknown>;
  expiration?: string | number;
  publishOptions?: Omit<
    Options.Publish,
    "replyTo" | "correlationId" | "headers" | "expiration"
  >;
}

export interface QueueOptions {
  durable?: boolean;
  exclusive?: boolean;
  autoDelete?: boolean;
  arguments?: Record<string, unknown>;
  messageTtl?: number;
  expires?: number;
  deadLetterExchange?: string;
  deadLetterRoutingKey?: string;
  maxLength?: number;
  maxPriority?: number;
  bindQueueArguments?: Record<string, unknown>;
  channel?: string;
  consumerOptions?: ConsumeOptions;
}

export type MessageDeserializer = (
  message: Buffer,
  msg: ConsumeMessage,
) => unknown;
export type MessageSerializer = (value: unknown) => Buffer;

export interface RabbitSubscribeBinding {
  exchange: string;
  routingKey: string;
}

export interface MessageHandlerOptions {
  name?: string;
  connection?: string;
  exchange?: string;
  routingKey?: string | string[];
  bindings?: RabbitSubscribeBinding[];
  queue?: string;
  queueOptions?: QueueOptions;
  /** @deprecated Use errorHandler instead */
  errorBehavior?: MessageHandlerErrorBehavior;
  errorHandler?: MessageErrorHandler;
  assertQueueErrorHandler?: AssertQueueErrorHandler;
  allowNonJsonMessages?: boolean;
  createQueueIfNotExists?: boolean;
  usePersistentReplyTo?: boolean;
  deserializer?: MessageDeserializer;
  batchOptions?: BatchOptions;
}

export interface ConnectionInitOptions {
  wait?: boolean;
  timeout?: number;
  reject?: boolean;
  skipConnectionFailedLogging?: boolean;
  skipDisconnectFailedLogging?: boolean;
}

export type RabbitMQChannels = Record<string, RabbitMQChannelConfig>;
export type RabbitMQHandlers = Record<
  string,
  MessageHandlerOptions | MessageHandlerOptions[]
>;

export type RabbitMQUriConfig = Options.Connect | string;

export interface RabbitMQConfig {
  name?: string;
  uri: RabbitMQUriConfig | RabbitMQUriConfig[];
  prefetchCount?: number;
  exchanges?: RabbitMQExchangeConfig[];
  exchangeBindings?: RabbitMQExchangeBindingConfig[];
  queues?: RabbitMQQueueConfig[];
  defaultRpcTimeout?: number;
  defaultExchangeType?: string;
  defaultRpcErrorHandler?: MessageErrorHandler;
  defaultSubscribeErrorBehavior?: MessageHandlerErrorBehavior;
  connectionInitOptions?: ConnectionInitOptions;
  connectionManagerOptions?: AmqpConnectionManagerOptions;
  registerHandlers?: boolean;
  enableDirectReplyTo?: boolean;
  enableControllerDiscovery?: boolean;
  channels?: RabbitMQChannels;
  handlers?: RabbitMQHandlers;
  defaultHandler?: string;
  logger?: LoggerService;
  deserializer?: MessageDeserializer;
  serializer?: MessageSerializer;
  defaultPublishOptions?: Options.Publish;
}

export type RabbitHandlerType = "rpc" | "subscribe";

export interface RabbitHandlerConfig extends MessageHandlerOptions {
  type: RabbitHandlerType;
}

export interface RabbitMQChannelConfig {
  prefetchCount?: number;
  default?: boolean;
}

export interface BatchOptions {
  size: number;
  timeout?: number;
  errorHandler?: BatchMessageErrorHandler;
}
