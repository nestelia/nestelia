# Type Alias: RpcSubscriberHandler\<T, U\>

```ts
type RpcSubscriberHandler<T, U> = (msg, rawMessage?, headers?) => Promise<RpcResponse<U>>;
```

Defined in: [packages/rabbitmq/src/amqp/connection.ts:57](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/amqp/connection.ts#L57)

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |
| `U` | `unknown` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `msg` | `T` \| `undefined` |
| `rawMessage?` | `ConsumeMessage` |
| `headers?` | `unknown` |

## Returns

`Promise`\<[`RpcResponse`](RpcResponse.md)\<`U`\>\>
