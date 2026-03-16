# Function: OnMessage()

```ts
function OnMessage(): MethodDecorator;
```

Defined in: [packages/core/src/websocket/ws-handlers.decorator.ts:44](https://github.com/nestelia/nestelia/blob/main/packages/core/src/websocket/ws-handlers.decorator.ts#L44)

Marks a gateway method as the WebSocket `message` handler.
Called when a message is received from a client.

## Returns

`MethodDecorator`

## Example

```typescript
@OnMessage()
handleMessage(ws: ElysiaWsContext, message: unknown) {
  ws.send(message);
}
```
