# Function: RabbitRetry()

```ts
function RabbitRetry(attempts, delay): MethodDecorator;
```

Defined in: [packages/rabbitmq/src/decorators/rabbitmq.decorators.ts:190](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/decorators/rabbitmq.decorators.ts#L190)

Decorator to configure retry behavior for a specific handler

## Parameters

| Parameter | Type |
| ------ | ------ |
| `attempts` | `number` |
| `delay` | `number` |

## Returns

`MethodDecorator`
