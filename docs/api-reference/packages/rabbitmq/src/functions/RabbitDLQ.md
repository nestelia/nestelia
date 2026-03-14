# Function: RabbitDLQ()

```ts
function RabbitDLQ(exchange, routingKey): MethodDecorator;
```

Defined in: [packages/rabbitmq/src/decorators/rabbitmq.decorators.ts:229](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/decorators/rabbitmq.decorators.ts#L229)

Decorator to configure dead letter queue behavior

## Parameters

| Parameter | Type |
| ------ | ------ |
| `exchange` | `string` |
| `routingKey` | `string` |

## Returns

`MethodDecorator`
