# Type Alias: BatchSubscriberHandler\<T\>

```ts
type BatchSubscriberHandler<T> = (msg, rawMessage?, headers?) => Promise<SubscribeResponse>;
```

Defined in: [packages/rabbitmq/src/amqp/connection.ts:51](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/amqp/connection.ts#L51)

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `msg` | (`T` \| `undefined`)[] |
| `rawMessage?` | `ConsumeMessage`[] |
| `headers?` | `unknown`[] |

## Returns

`Promise`\<[`SubscribeResponse`](SubscribeResponse.md)\>
