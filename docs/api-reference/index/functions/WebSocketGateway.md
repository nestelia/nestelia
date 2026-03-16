# Function: WebSocketGateway()

```ts
function WebSocketGateway(path, options?): ClassDecorator;
```

Defined in: [packages/core/src/websocket/ws-gateway.decorator.ts:35](https://github.com/nestelia/nestelia/blob/main/packages/core/src/websocket/ws-gateway.decorator.ts#L35)

Class decorator that marks a class as a WebSocket gateway.

The gateway is registered as a WebSocket endpoint on the Elysia server
at the given path. Constructor injection works as with any other provider.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | The URL path for the WebSocket endpoint (e.g. '/ws/chat') |
| `options?` | `Record`\<`string`, `any`\> | Optional Elysia ws() options (query schema, etc.) |

## Returns

`ClassDecorator`

## Example

```typescript
@Injectable()
@WebSocketGateway('/ws/chat')
export class ChatGateway {
  @OnOpen()
  handleOpen(ws: ElysiaWsContext) {}

  @OnMessage()
  handleMessage(ws: ElysiaWsContext, message: unknown) {}

  @OnClose()
  handleClose(ws: ElysiaWsContext) {}
}
```
