# Interface: RabbitSubscribeOptions

Defined in: [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:169](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L169)

Message handler options for

## Rabbit Subscribe

decorator

## Extended by

- [`RabbitRPCOptions`](RabbitRPCOptions.md)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="allownonjsonmessages"></a> `allowNonJsonMessages?` | `boolean` | Whether to allow non-json messages | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:187](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L187) |
| <a id="errorhandler"></a> `errorHandler?` | (`error`, `message`) => `void` \| `Promise`\<`void`\> | Error handler | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:179](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L179) |
| <a id="exchange"></a> `exchange` | `string` | Exchange name (must be pre-configured in RabbitMQModule.forRoot({ exchanges })) | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:171](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L171) |
| <a id="queue"></a> `queue?` | `string` | Queue name (auto-generated if not provided) | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:175](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L175) |
| <a id="queueoptions"></a> `queueOptions?` | \{ `arguments?`: `Record`\<`string`, `unknown`\>; `autoDelete?`: `boolean`; `durable?`: `boolean`; `exclusive?`: `boolean`; `maxLength?`: `number`; `maxLengthBytes?`: `number`; `messageTtl?`: `number`; \} | Queue options | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:177](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L177) |
| `queueOptions.arguments?` | `Record`\<`string`, `unknown`\> | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:148](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L148) |
| `queueOptions.autoDelete?` | `boolean` | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:146](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L146) |
| `queueOptions.durable?` | `boolean` | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:145](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L145) |
| `queueOptions.exclusive?` | `boolean` | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:147](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L147) |
| `queueOptions.maxLength?` | `number` | Maximum number of messages in queue | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:152](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L152) |
| `queueOptions.maxLengthBytes?` | `number` | Maximum queue size in bytes | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:154](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L154) |
| `queueOptions.messageTtl?` | `number` | Message TTL in milliseconds | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:150](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L150) |
| <a id="retry"></a> `retry?` | `boolean` | Enable message retry on failure | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:181](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L181) |
| <a id="retryattempts"></a> `retryAttempts?` | `number` | Number of retry attempts | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:183](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L183) |
| <a id="retrydelay"></a> `retryDelay?` | `number` | Retry delay in milliseconds | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:185](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L185) |
| <a id="routingkey"></a> `routingKey` | `string` \| `string`[] | Routing key pattern | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:173](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L173) |
