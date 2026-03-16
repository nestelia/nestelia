# Type Alias: ElysiaWsContext

```ts
type ElysiaWsContext = ElysiaWS<any, any>;
```

Defined in: [packages/core/src/websocket/ws-context.type.ts:8](https://github.com/nestelia/nestelia/blob/main/packages/core/src/websocket/ws-context.type.ts#L8)

The WebSocket context object passed to gateway handler methods.
Wraps Elysia's ElysiaWS with an untyped data payload for general use.
