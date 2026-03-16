import { WS_GATEWAY_METADATA } from "../decorators/constants";

export interface WsGatewayMetadata {
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: Record<string, any>;
}

/**
 * Class decorator that marks a class as a WebSocket gateway.
 *
 * The gateway is registered as a WebSocket endpoint on the Elysia server
 * at the given path. Constructor injection works as with any other provider.
 *
 * @param path The URL path for the WebSocket endpoint (e.g. '/ws/chat')
 * @param options Optional Elysia ws() options (query schema, etc.)
 *
 * @example
 * ```typescript
 * @Injectable()
 * @WebSocketGateway('/ws/chat')
 * export class ChatGateway {
 *   @OnOpen()
 *   handleOpen(ws: ElysiaWsContext) {}
 *
 *   @OnMessage()
 *   handleMessage(ws: ElysiaWsContext, message: unknown) {}
 *
 *   @OnClose()
 *   handleClose(ws: ElysiaWsContext) {}
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function WebSocketGateway(path: string, options?: Record<string, any>): ClassDecorator {
  return (target: object) => {
    const metadata: WsGatewayMetadata = { path, options };
    Reflect.defineMetadata(WS_GATEWAY_METADATA, metadata, target);
  };
}
