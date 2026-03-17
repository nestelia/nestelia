# Interface: RabbitMQPublishOptions

Defined in: [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:239](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L239)

Publisher options

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="correlationid"></a> `correlationId?` | `string` | Correlation ID for RPC | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:247](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L247) |
| <a id="expiration"></a> `expiration?` | `number` | Message expiration in milliseconds | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:245](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L245) |
| <a id="headers"></a> `headers?` | `Record`\<`string`, `unknown`\> | Message headers | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:241](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L241) |
| <a id="messageid"></a> `messageId?` | `string` | Message ID | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:255](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L255) |
| <a id="persistent"></a> `persistent?` | `boolean` | Persistent message (saved to disk) | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:253](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L253) |
| <a id="priority"></a> `priority?` | `number` | Message priority (0-9) | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:243](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L243) |
| <a id="replyto"></a> `replyTo?` | `string` | Reply queue for RPC | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:249](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L249) |
| <a id="type"></a> `type?` | `string` | Message type | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:251](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L251) |
