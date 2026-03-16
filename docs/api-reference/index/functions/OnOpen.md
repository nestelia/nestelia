# Function: OnOpen()

```ts
function OnOpen(): MethodDecorator;
```

Defined in: [packages/core/src/websocket/ws-handlers.decorator.ts:28](https://github.com/nestelia/nestelia/blob/main/packages/core/src/websocket/ws-handlers.decorator.ts#L28)

Marks a gateway method as the WebSocket `open` handler.
Called when a client establishes a connection.

## Returns

`MethodDecorator`

## Example

```typescript
@OnOpen()
handleOpen(ws: ElysiaWsContext) {
  ws.send('connected');
}
```
