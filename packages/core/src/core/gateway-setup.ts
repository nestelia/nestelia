/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Context as ElysiaContextType, Elysia } from "elysia";

import { GUARDS_METADATA, WS_GATEWAY_METADATA, WS_HANDLER_METADATA } from "../decorators/constants";
import { Container, DIContainer, type Type } from "../di";
import type { ExecutionContext } from "../interfaces/execution-context.interface";
import { Logger } from "../logger/logger.service";
import type { WsGatewayMetadata } from "../websocket/ws-gateway.decorator";
import type { WsHandlerMetadata, WsHandlerType } from "../websocket/ws-handlers.decorator";

/**
 * Scans all methods of a gateway class for WS_HANDLER_METADATA and returns
 * a map of handler type → method name.
 */
function collectWsHandlers(gatewayClass: Type): Map<WsHandlerType, string> {
  const handlers = new Map<WsHandlerType, string>();
  const proto = gatewayClass.prototype as Record<string, unknown>;

  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key === "constructor") continue;
    const meta: WsHandlerMetadata | undefined = Reflect.getMetadata(
      WS_HANDLER_METADATA,
      proto,
      key,
    );
    if (meta) {
      handlers.set(meta.type, key);
    }
  }

  return handlers;
}

function buildWsExecutionContext(
  gatewayClass: Type,
  instance: object,
  upgradeCtx: ElysiaContextType,
): ExecutionContext {
  return {
    getClass: <T = any>() => gatewayClass as unknown as T,
    getHandler: () =>
      (instance as Record<string, (...args: unknown[]) => unknown>)["constructor"] ??
      (() => undefined),
    getArgs: <T extends Array<any> = any[]>() => [upgradeCtx] as unknown as T,
    getArgByIndex: <T = any>(index: number) => ([upgradeCtx] as any)[index] as T,
    getType: <TContext extends string = string>() => "ws" as unknown as TContext,
    switchToHttp: () => ({
      getRequest: <T = any>() => upgradeCtx.request as unknown as T,
      getResponse: <T = any>() => upgradeCtx as unknown as T,
      getNext: <T = any>() => undefined as unknown as T,
    }),
    switchToRpc: () => ({
      getData: <T = any>() => undefined as unknown as T,
      getContext: <T = any>() => undefined as unknown as T,
    }),
    switchToWs: () => ({
      getData: <T = any>() => undefined as unknown as T,
      getClient: <T = any>() => upgradeCtx as unknown as T,
      getPattern: <T = any>() => undefined as unknown as T,
    }),
  };
}

async function runWsGuards(
  guards: unknown[],
  gatewayClass: Type,
  instance: object,
  moduleinstance: any,
  upgradeCtx: ElysiaContextType,
): Promise<boolean> {
  const executionContext = buildWsExecutionContext(gatewayClass, instance, upgradeCtx);

  for (const guardToken of guards) {
    const guard: any =
      typeof guardToken === "function"
        ? ((await DIContainer.get(guardToken as Type, moduleinstance as Type)) ??
          new (guardToken as any)())
        : guardToken;

    if (typeof guard?.canActivate === "function") {
      const allowed = await guard.canActivate(executionContext);
      if (!allowed) return false;
    }
  }
  return true;
}

/**
 * Resolves and registers all WebSocket gateways listed in a module on the
 * Elysia app instance.
 */
export async function setupGateways(
  app: Elysia,
  gatewayClasses: Type[],
  moduleinstance: any,
): Promise<void> {
  const logger = new Logger("WebSocketGateway");

  for (const gatewayClass of gatewayClasses) {
    const meta: WsGatewayMetadata | undefined = Reflect.getMetadata(
      WS_GATEWAY_METADATA,
      gatewayClass,
    );

    if (!meta) {
      Logger.warn(
        `${gatewayClass.name} is listed in gateways but has no @WebSocketGateway() decorator — skipped.`,
      );
      continue;
    }

    const instance = await DIContainer.get<Record<string, (...args: any[]) => any>>(
      gatewayClass,
      moduleinstance as Type<any>,
    );

    if (!instance) {
      Logger.warn(`Failed to resolve gateway instance for ${gatewayClass.name} — skipped.`);
      continue;
    }

    const handlers = collectWsHandlers(gatewayClass);
    const classGuards: unknown[] = Reflect.getMetadata(GUARDS_METADATA, gatewayClass) ?? [];

    const wsConfig: Record<string, any> = { ...(meta.options || {}) };

    // Guards run in beforeHandle (HTTP upgrade phase) — rejection closes connection before it opens
    if (classGuards.length > 0) {
      wsConfig.beforeHandle = async (ctx: ElysiaContextType) => {
        const allowed = await runWsGuards(
          classGuards,
          gatewayClass,
          instance,
          moduleinstance,
          ctx,
        );
        if (!allowed) {
          ctx.set.status = 403;
          return { statusCode: 403, error: "Forbidden", message: "Forbidden" };
        }
      };
    }

    const openMethod = handlers.get("open");
    if (openMethod) {
      wsConfig.open = (ws: unknown) => instance[openMethod](ws);
    }

    const messageMethod = handlers.get("message");
    if (messageMethod) {
      wsConfig.message = (ws: unknown, msg: unknown) => instance[messageMethod](ws, msg);
    }

    const closeMethod = handlers.get("close");
    if (closeMethod) {
      wsConfig.close = (ws: unknown, code: number, reason: string) =>
        instance[closeMethod](ws, code, reason);
    }

    (app as any).ws(meta.path, wsConfig);

    logger.log(`Mapped {${meta.path}, WS} gateway`);
  }
}
