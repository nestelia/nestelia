/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Context as ElysiaContextType } from "elysia";

let _reqId = 0;

import { GUARDS_METADATA, INTERCEPTORS_METADATA, PARAMS_METADATA } from "../decorators/constants";
import {
  PARAMS_METADATA as FILE_PARAMS_METADATA,
  processParameters,
} from "../decorators/param.decorators";
import { HEADERS_METADATA } from "../decorators/header.decorator";
import { HTTP_CODE_METADATA } from "../decorators/http-code.decorator";
import type { ParamMetadata } from "../decorators/types";
import { Container, DIContainer, type Type } from "../di";
import type { ExecutionContext } from "../interfaces/execution-context.interface";
import { Logger } from "../logger/logger.service";
import { resolveParam } from "./param-resolver";

/**
 * Builds an HTTP ExecutionContext for the given Elysia request context.
 */
function buildHttpExecutionContext(
  controllerClass: Type,
  handlerMethodName: string,
  controllerInstance: object,
  elysiaContext: ElysiaContextType,
): ExecutionContext {
  return {
    getClass: <T = any>() => controllerClass as unknown as T,
    getHandler: () =>
      (controllerInstance as Record<string, (...args: unknown[]) => unknown>)[handlerMethodName] ??
      (() => undefined),
    getArgs: <T extends Array<any> = any[]>() => [elysiaContext] as unknown as T,
    getArgByIndex: <T = any>(index: number) => ([elysiaContext] as any)[index] as T,
    getType: <TContext extends string = string>() => "http" as unknown as TContext,
    switchToHttp: () => ({
      getRequest: <T = any>() => elysiaContext.request as unknown as T,
      getResponse: <T = any>() => elysiaContext as unknown as T,
      getNext: <T = any>() => undefined as unknown as T,
    }),
    switchToRpc: () => ({
      getData: <T = any>() => undefined as unknown as T,
      getContext: <T = any>() => undefined as unknown as T,
    }),
    switchToWs: () => ({
      getData: <T = any>() => undefined as unknown as T,
      getClient: <T = any>() => undefined as unknown as T,
      getPattern: <T = any>() => undefined as unknown as T,
    }),
  };
}

/**
 * Runs all guards (class-level then method-level) for the given route.
 * Returns a 403 response object if any guard denies access, otherwise undefined.
 */
async function runGuards(
  guards: unknown[],
  controllerClass: Type,
  handlerMethodName: string,
  controllerInstance: object,
  moduleinstance: any,
  elysiaContext: ElysiaContextType,
): Promise<{ statusCode: 403; error: string; message: string } | undefined> {
  const executionContext = buildHttpExecutionContext(
    controllerClass,
    handlerMethodName,
    controllerInstance,
    elysiaContext,
  );

  for (const guardToken of guards) {
    let guard: any;
    if (typeof guardToken === "function") {
      const fromDI = await DIContainer.get(guardToken as Type, moduleinstance as Type);
      guard = fromDI ?? new (guardToken as any)();
    } else {
      guard = guardToken;
    }

    if (typeof guard?.canActivate === "function") {
      const allowed = await guard.canActivate(executionContext);
      if (!allowed) {
        elysiaContext.set.status = 403;
        return { statusCode: 403, error: "Forbidden", message: "Forbidden" };
      }
    }
  }

  return undefined;
}

// ── Startup-time metadata cache ──────────────────────────────────────────────

interface RouteMetadataCache {
  guards: unknown[];
  interceptors: any[];
  paramDefinitions: ParamMetadata[];
  paramTypes: any[];
  fileParamDefs: Array<{ index: number }>;
  httpCode: number | undefined;
  headers: Array<{ name: string; value: string }>;
  hasGuards: boolean;
  hasInterceptors: boolean;
  hasParams: boolean;
  hasFileParams: boolean;
  hasHttpCode: boolean;
  hasHeaders: boolean;
  /** True when the route needs no guards, interceptors, params, or response decorators. */
  isFastPath: boolean;
}

function buildMetadataCache(
  controllerClass: Type,
  handlerMethodName: string,
): RouteMetadataCache {
  const classGuards: unknown[] = Reflect.getMetadata(GUARDS_METADATA, controllerClass) ?? [];
  const methodGuards: unknown[] =
    Reflect.getMetadata(GUARDS_METADATA, controllerClass, handlerMethodName) ?? [];
  const guards = [...classGuards, ...methodGuards];

  const interceptors: any[] =
    Reflect.getMetadata(INTERCEPTORS_METADATA, controllerClass, handlerMethodName) || [];

  const paramDefinitions: ParamMetadata[] =
    Reflect.getMetadata(PARAMS_METADATA, controllerClass, handlerMethodName) || [];

  const paramTypes: any[] =
    Reflect.getMetadata("design:paramtypes", controllerClass.prototype, handlerMethodName) || [];

  const fileParamDefs: Array<{ index: number }> =
    Reflect.getMetadata(FILE_PARAMS_METADATA, controllerClass, handlerMethodName) || [];

  const httpCode: number | undefined =
    Reflect.getMetadata(HTTP_CODE_METADATA, controllerClass, handlerMethodName);

  const headers: Array<{ name: string; value: string }> =
    Reflect.getMetadata(HEADERS_METADATA, controllerClass, handlerMethodName) || [];

  const hasGuards = guards.length > 0;
  const hasInterceptors = interceptors.length > 0;
  const hasParams = paramTypes.length > 0;
  const hasFileParams = fileParamDefs.length > 0;
  const hasHttpCode = httpCode !== undefined;
  const hasHeaders = headers.length > 0;

  return {
    guards,
    interceptors,
    paramDefinitions,
    paramTypes,
    fileParamDefs,
    httpCode,
    headers,
    hasGuards,
    hasInterceptors,
    hasParams,
    hasFileParams,
    hasHttpCode,
    hasHeaders,
    isFastPath: !hasGuards && !hasInterceptors && !hasParams && !hasHttpCode && !hasHeaders,
  };
}

// ── Route handler factory ────────────────────────────────────────────────────

/**
 * Creates an Elysia route handler for a controller method.
 * All reflection (Reflect.getMetadata) is done once at startup and cached.
 * Simple handlers with no guards/interceptors/params use a fast path that
 * skips request-scoped context creation entirely.
 */
export function createRouteHandler(
  controllerClass: Type,
  handlerMethodName: string,
  moduleinstance: any,
): (ctx: ElysiaContextType) => any {
  const meta = buildMetadataCache(controllerClass, handlerMethodName);

  // ── Fast path: no DI features used, call the method directly ─────────────
  if (meta.isFastPath) {
    // Eagerly resolve the singleton controller once (not per-request)
    let cachedInstance: any = null;
    let cachedMethod: ((...args: unknown[]) => unknown) | null = null;

    return async (elysiaContext: ElysiaContextType) => {
      if (cachedInstance === null) {
        cachedInstance = await DIContainer.get(controllerClass, moduleinstance as Type<any>);
        cachedMethod = (cachedInstance as Record<string, (...args: unknown[]) => unknown>)[
          handlerMethodName
        ];
      }
      return cachedMethod!.call(cachedInstance);
    };
  }

  // ── Full path: guards, interceptors, params, response decorators ─────────
  return async (elysiaContext: ElysiaContextType) =>
    Container.runInRequestContext({ id: ++_reqId, container: new Map() }, async () => {
      const controllerInstance = await DIContainer.get(
        controllerClass,
        moduleinstance as Type<any>,
      );

      if (!controllerInstance) {
        Logger.error(`Failed to resolve controller ${controllerClass.name}`);
        elysiaContext.set.status = 500;
        return { error: "Internal server error" };
      }

      const originalMethod = (
        controllerInstance as Record<string, (...args: unknown[]) => unknown>
      )[handlerMethodName];

      if (typeof originalMethod !== "function") {
        Logger.error(`Handler method ${handlerMethodName} not found on ${controllerClass.name}`);
        elysiaContext.set.status = 500;
        return { error: "Internal server error" };
      }

      // Guards (pre-cached)
      if (meta.hasGuards) {
        const denied = await runGuards(
          meta.guards,
          controllerClass,
          handlerMethodName,
          controllerInstance,
          moduleinstance,
          elysiaContext,
        );
        if (denied) return denied;
      }

      // Interceptors (pre-cached)
      if (meta.hasInterceptors) {
        for (const InterceptorClass of meta.interceptors) {
          const interceptor =
            typeof InterceptorClass === "function" ? new InterceptorClass() : InterceptorClass;
          if (typeof interceptor.intercept === "function") {
            await interceptor.intercept(elysiaContext);
          }
        }
      }

      // Parameters (pre-cached definitions)
      let resolvedParams: unknown[];
      if (meta.hasParams) {
        resolvedParams = await Promise.all(
          meta.paramTypes.map(async (paramType: any, index: number) => {
            const paramMeta = meta.paramDefinitions.find((p) => p.index === index);
            try {
              return await resolveParam(
                paramMeta,
                paramType,
                elysiaContext,
                moduleinstance as Type<any>,
              );
            } catch {
              return undefined;
            }
          }),
        );
      } else {
        resolvedParams = [];
      }

      // File/form params (pre-cached)
      if (meta.hasFileParams) {
        const fileResolvedParams = await processParameters(
          elysiaContext as any,
          controllerClass,
          handlerMethodName,
        );
        for (const { index } of meta.fileParamDefs) {
          resolvedParams[index] = fileResolvedParams[index];
        }
      }

      const result = await originalMethod.apply(controllerInstance, resolvedParams);

      // HTTP status code (pre-cached)
      if (meta.hasHttpCode) {
        elysiaContext.set.status = meta.httpCode!;
      }

      // HTTP headers (pre-cached)
      if (meta.hasHeaders) {
        for (const { name, value } of meta.headers) {
          elysiaContext.set.headers[name] = value;
        }
      }

      return result;
    });
}
