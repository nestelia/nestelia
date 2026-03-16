# Function: OnClose()

```ts
function OnClose(): MethodDecorator;
```

Defined in: [packages/core/src/websocket/ws-handlers.decorator.ts:58](https://github.com/nestelia/nestelia/blob/main/packages/core/src/websocket/ws-handlers.decorator.ts#L58)

Marks a gateway method as the WebSocket `close` handler.
Called when a client disconnects.

## Returns

`MethodDecorator`

## Example

```typescript
@OnClose()
handleClose(ws: ElysiaWsContext) {}
```
