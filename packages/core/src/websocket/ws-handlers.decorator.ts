import { WS_HANDLER_METADATA } from "../decorators/constants";

export type WsHandlerType = "open" | "message" | "close";

export interface WsHandlerMetadata {
  type: WsHandlerType;
}

function createWsHandlerDecorator(type: WsHandlerType): MethodDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const metadata: WsHandlerMetadata = { type };
    Reflect.defineMetadata(WS_HANDLER_METADATA, metadata, target, propertyKey);
  };
}

/**
 * Marks a gateway method as the WebSocket `open` handler.
 * Called when a client establishes a connection.
 *
 * @example
 * ```typescript
 * @OnOpen()
 * handleOpen(ws: ElysiaWsContext) {
 *   ws.send('connected');
 * }
 * ```
 */
export function OnOpen(): MethodDecorator {
  return createWsHandlerDecorator("open");
}

/**
 * Marks a gateway method as the WebSocket `message` handler.
 * Called when a message is received from a client.
 *
 * @example
 * ```typescript
 * @OnMessage()
 * handleMessage(ws: ElysiaWsContext, message: unknown) {
 *   ws.send(message);
 * }
 * ```
 */
export function OnMessage(): MethodDecorator {
  return createWsHandlerDecorator("message");
}

/**
 * Marks a gateway method as the WebSocket `close` handler.
 * Called when a client disconnects.
 *
 * @example
 * ```typescript
 * @OnClose()
 * handleClose(ws: ElysiaWsContext) {}
 * ```
 */
export function OnClose(): MethodDecorator {
  return createWsHandlerDecorator("close");
}
