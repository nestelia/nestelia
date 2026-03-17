# Interface: RabbitMQQueueConfig

Defined in: [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:140](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L140)

Queue configuration

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="bindings"></a> `bindings?` | [`RabbitMQQueueBinding`](RabbitMQQueueBinding.md)[] | Queue bindings | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:157](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L157) |
| <a id="createifnotexists"></a> `createIfNotExists?` | `boolean` | Create queue if it doesn't exist | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:163](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L163) |
| <a id="exchange"></a> `exchange?` | `string` | Exchange to bind to (shortcut for simple binding) | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:159](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L159) |
| <a id="name"></a> `name` | `string` | Queue name | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:142](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L142) |
| <a id="options"></a> `options?` | \{ `arguments?`: `Record`\<`string`, `unknown`\>; `autoDelete?`: `boolean`; `durable?`: `boolean`; `exclusive?`: `boolean`; `maxLength?`: `number`; `maxLengthBytes?`: `number`; `messageTtl?`: `number`; \} | Queue options | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:144](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L144) |
| `options.arguments?` | `Record`\<`string`, `unknown`\> | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:148](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L148) |
| `options.autoDelete?` | `boolean` | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:146](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L146) |
| `options.durable?` | `boolean` | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:145](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L145) |
| `options.exclusive?` | `boolean` | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:147](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L147) |
| `options.maxLength?` | `number` | Maximum number of messages in queue | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:152](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L152) |
| `options.maxLengthBytes?` | `number` | Maximum queue size in bytes | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:154](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L154) |
| `options.messageTtl?` | `number` | Message TTL in milliseconds | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:150](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L150) |
| <a id="routingkey"></a> `routingKey?` | `string` | Routing key for binding (shortcut for simple binding) | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:161](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L161) |
