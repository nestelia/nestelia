# Function: resolveHandlerConfigs()

```ts
function resolveHandlerConfigs(handlers, lookupKey): (
  | MessageHandlerOptions
  | undefined)[];
```

Defined in: [packages/rabbitmq/src/rabbitmq.module.ts:29](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/rabbitmq.module.ts#L29)

Resolves the list of per-registration handler configs for a given handler.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `handlers` | [`RabbitMQHandlers`](../type-aliases/RabbitMQHandlers.md) |
| `lookupKey` | `string` \| `undefined` |

## Returns

(
  \| [`MessageHandlerOptions`](../interfaces/MessageHandlerOptions.md)
  \| `undefined`)[]
