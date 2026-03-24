# Interface: MessageHandlerOptions

Defined in: [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:90](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L90)

## Extended by

- [`RabbitHandlerConfig`](RabbitHandlerConfig.md)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="allownonjsonmessages"></a> `allowNonJsonMessages?` | `boolean` | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:102](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L102) |
| <a id="assertqueueerrorhandler"></a> `assertQueueErrorHandler?` | [`AssertQueueErrorHandler`](../type-aliases/AssertQueueErrorHandler.md) | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:101](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L101) |
| <a id="batchoptions"></a> `batchOptions?` | [`BatchOptions`](BatchOptions.md) | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:106](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L106) |
| <a id="bindings"></a> `bindings?` | [`RabbitSubscribeBinding`](RabbitSubscribeBinding.md)[] | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:95](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L95) |
| <a id="connection"></a> `connection?` | `string` | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:92](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L92) |
| <a id="createqueueifnotexists"></a> `createQueueIfNotExists?` | `boolean` | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:103](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L103) |
| <a id="deserializer"></a> `deserializer?` | [`MessageDeserializer`](../type-aliases/MessageDeserializer.md) | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:105](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L105) |
| <a id="errorbehavior"></a> ~~`errorBehavior?`~~ | [`MessageHandlerErrorBehavior`](../enumerations/MessageHandlerErrorBehavior.md) | **Deprecated** Use errorHandler instead | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:99](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L99) |
| <a id="errorhandler"></a> `errorHandler?` | [`MessageErrorHandler`](../type-aliases/MessageErrorHandler.md) | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:100](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L100) |
| <a id="exchange"></a> `exchange?` | `string` | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:93](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L93) |
| <a id="name"></a> `name?` | `string` | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:91](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L91) |
| <a id="queue"></a> `queue?` | `string` | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:96](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L96) |
| <a id="queueoptions"></a> `queueOptions?` | [`QueueOptions`](QueueOptions.md) | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:97](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L97) |
| <a id="routingkey"></a> `routingKey?` | `string` \| `string`[] | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:94](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L94) |
| <a id="usepersistentreplyto"></a> `usePersistentReplyTo?` | `boolean` | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:104](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L104) |
