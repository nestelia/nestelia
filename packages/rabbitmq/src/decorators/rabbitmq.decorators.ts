import "reflect-metadata";
import {
  RABBIT_HANDLER,
  RABBIT_PARAM_TYPE,
  RABBIT_HEADER_TYPE,
  RABBIT_REQUEST_TYPE,
} from "../rabbitmq.constants";
import type { RabbitHandlerConfig } from "../interfaces/rabbitmq.interface";

// ── Handler decorators ─────────────────────────────────────────────

export const RabbitHandler =
  (config: RabbitHandlerConfig) =>
  (target: object, key: string | symbol, _descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(RABBIT_HANDLER, config, target, key);
  };

export const RabbitSubscribe = (
  config: Omit<RabbitHandlerConfig, "type">,
): MethodDecorator => {
  return (target, key, _descriptor) => {
    Reflect.defineMetadata(
      RABBIT_HANDLER,
      { ...config, type: "subscribe" } satisfies RabbitHandlerConfig,
      target,
      key,
    );
  };
};

export const RabbitRPC = (
  config: Omit<RabbitHandlerConfig, "type">,
): MethodDecorator => {
  return (target, key, _descriptor) => {
    Reflect.defineMetadata(
      RABBIT_HANDLER,
      { ...config, type: "rpc" } satisfies RabbitHandlerConfig,
      target,
      key,
    );
  };
};

// ── Parameter decorators ───────────────────────────────────────────

const RABBIT_PAYLOAD_METADATA = "__rabbitPayload__";
const RABBIT_HEADER_METADATA = "__rabbitHeader__";
const RABBIT_REQUEST_METADATA = "__rabbitRequest__";

export { RABBIT_PAYLOAD_METADATA, RABBIT_HEADER_METADATA, RABBIT_REQUEST_METADATA };

export function RabbitPayload(): ParameterDecorator;
export function RabbitPayload(propertyKey: string): ParameterDecorator;
export function RabbitPayload(propertyKey?: string): ParameterDecorator {
  return (target, propertyName, parameterIndex) => {
    const existing =
      Reflect.getMetadata(RABBIT_PAYLOAD_METADATA, target, propertyName!) ||
      [];
    existing.push({
      index: parameterIndex,
      propertyKey,
      type: RABBIT_PARAM_TYPE,
    });
    Reflect.defineMetadata(
      RABBIT_PAYLOAD_METADATA,
      existing,
      target,
      propertyName!,
    );
  };
}

export function RabbitHeader(): ParameterDecorator;
export function RabbitHeader(propertyKey: string): ParameterDecorator;
export function RabbitHeader(propertyKey?: string): ParameterDecorator {
  return (target, propertyName, parameterIndex) => {
    const existing =
      Reflect.getMetadata(RABBIT_HEADER_METADATA, target, propertyName!) || [];
    existing.push({
      index: parameterIndex,
      propertyKey,
      type: RABBIT_HEADER_TYPE,
    });
    Reflect.defineMetadata(
      RABBIT_HEADER_METADATA,
      existing,
      target,
      propertyName!,
    );
  };
}

export function RabbitRequest(): ParameterDecorator;
export function RabbitRequest(propertyKey: string): ParameterDecorator;
export function RabbitRequest(propertyKey?: string): ParameterDecorator {
  return (target, propertyName, parameterIndex) => {
    const existing =
      Reflect.getMetadata(RABBIT_REQUEST_METADATA, target, propertyName!) || [];
    existing.push({
      index: parameterIndex,
      propertyKey,
      type: RABBIT_REQUEST_TYPE,
    });
    Reflect.defineMetadata(
      RABBIT_REQUEST_METADATA,
      existing,
      target,
      propertyName!,
    );
  };
}

// ── Convenience decorators (pass-through, no golevelup equivalents) ──

export function InjectRabbitMQ(): ParameterDecorator {
  return () => {};
}

export function InjectRabbitMQChannel(): ParameterDecorator {
  return () => {};
}

export function InjectRabbitMQConnection(
  _connectionName: string,
): ParameterDecorator {
  return () => {};
}
