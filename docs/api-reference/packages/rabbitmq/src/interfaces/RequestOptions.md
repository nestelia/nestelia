# Interface: RequestOptions

Defined in: [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:49](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L49)

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="correlationid"></a> `correlationId?` | `string` | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:52](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L52) |
| <a id="exchange"></a> `exchange` | `string` | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:50](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L50) |
| <a id="expiration"></a> `expiration?` | `string` \| `number` | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:56](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L56) |
| <a id="headers"></a> `headers?` | `Record`\<`string`, `unknown`\> | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:55](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L55) |
| <a id="payload"></a> `payload?` | `unknown` | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:54](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L54) |
| <a id="publishoptions"></a> `publishOptions?` | `Omit`\<`Publish`, `"headers"` \| `"replyTo"` \| `"correlationId"` \| `"expiration"`\> | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:57](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L57) |
| <a id="routingkey"></a> `routingKey` | `string` | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:51](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L51) |
| <a id="timeout"></a> `timeout?` | `number` | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:53](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L53) |
