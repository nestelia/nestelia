# Function: RabbitConnection()

```ts
function RabbitConnection(connectionName): ClassDecorator;
```

Defined in: [packages/rabbitmq/src/decorators/rabbitmq.decorators.ts:300](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/decorators/rabbitmq.decorators.ts#L300)

Decorator for connection-aware handlers
Useful when using multiple RabbitMQ connections

## Parameters

| Parameter | Type |
| ------ | ------ |
| `connectionName` | `string` |

## Returns

`ClassDecorator`
