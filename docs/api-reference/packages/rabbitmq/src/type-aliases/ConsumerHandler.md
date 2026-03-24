# Type Alias: ConsumerHandler\<T, U\>

```ts
type ConsumerHandler<T, U> = 
  | BaseConsumerHandler & {
  handler: SubscriberHandler<T>;
  type: "subscribe";
}
  | BaseConsumerHandler & {
  handler: BatchSubscriberHandler<T>;
  type: "subscribe-batch";
}
  | BaseConsumerHandler & {
  handler: RpcSubscriberHandler<T, U>;
  type: "rpc";
};
```

Defined in: [packages/rabbitmq/src/amqp/connection.ts:79](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/amqp/connection.ts#L79)

## Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `U` |
