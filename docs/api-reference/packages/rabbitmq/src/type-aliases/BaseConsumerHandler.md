# Type Alias: BaseConsumerHandler

```ts
type BaseConsumerHandler = {
  channel: ConfirmChannel;
  consumerTag: string;
  msgOptions: MessageHandlerOptions;
};
```

Defined in: [packages/rabbitmq/src/amqp/connection.ts:73](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/amqp/connection.ts#L73)

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="channel"></a> `channel` | `ConfirmChannel` | [packages/rabbitmq/src/amqp/connection.ts:75](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/amqp/connection.ts#L75) |
| <a id="consumertag"></a> `consumerTag` | `string` | [packages/rabbitmq/src/amqp/connection.ts:74](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/amqp/connection.ts#L74) |
| <a id="msgoptions"></a> `msgOptions` | [`MessageHandlerOptions`](../interfaces/MessageHandlerOptions.md) | [packages/rabbitmq/src/amqp/connection.ts:76](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/amqp/connection.ts#L76) |
