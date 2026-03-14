# Function: RabbitBatch()

```ts
function RabbitBatch(batchSize, flushTimeout?): MethodDecorator;
```

Defined in: [packages/rabbitmq/src/decorators/rabbitmq.decorators.ts:208](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/decorators/rabbitmq.decorators.ts#L208)

Decorator to mark a method for batch processing

## Parameters

| Parameter | Type |
| ------ | ------ |
| `batchSize` | `number` |
| `flushTimeout?` | `number` |

## Returns

`MethodDecorator`
