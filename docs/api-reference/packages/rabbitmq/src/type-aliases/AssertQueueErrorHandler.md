# Type Alias: AssertQueueErrorHandler

```ts
type AssertQueueErrorHandler = (channel, queueName, queueOptions, error) => Promise<string> | string;
```

Defined in: [packages/rabbitmq/src/amqp/errorBehaviors.ts:63](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/amqp/errorBehaviors.ts#L63)

## Parameters

| Parameter | Type |
| ------ | ------ |
| `channel` | `Channel` |
| `queueName` | `string` |
| `queueOptions` | [`QueueOptions`](../interfaces/QueueOptions.md) \| `undefined` |
| `error` | `unknown` |

## Returns

`Promise`\<`string`\> \| `string`
