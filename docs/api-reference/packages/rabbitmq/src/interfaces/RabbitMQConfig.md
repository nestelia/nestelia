# Interface: RabbitMQConfig

Defined in: [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:125](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L125)

## Extended by

- [`RabbitMQModuleOptions`](RabbitMQModuleOptions.md)

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="channels"></a> `channels?` | [`RabbitMQChannels`](../type-aliases/RabbitMQChannels.md) | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:141](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L141) |
| <a id="connectioninitoptions"></a> `connectionInitOptions?` | [`ConnectionInitOptions`](ConnectionInitOptions.md) | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:136](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L136) |
| <a id="connectionmanageroptions"></a> `connectionManagerOptions?` | `AmqpConnectionManagerOptions` | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:137](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L137) |
| <a id="defaultexchangetype"></a> `defaultExchangeType?` | `string` | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:133](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L133) |
| <a id="defaulthandler"></a> `defaultHandler?` | `string` | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:143](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L143) |
| <a id="defaultpublishoptions"></a> `defaultPublishOptions?` | `Publish` | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:147](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L147) |
| <a id="defaultrpcerrorhandler"></a> `defaultRpcErrorHandler?` | [`MessageErrorHandler`](../type-aliases/MessageErrorHandler.md) | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:134](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L134) |
| <a id="defaultrpctimeout"></a> `defaultRpcTimeout?` | `number` | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:132](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L132) |
| <a id="defaultsubscribeerrorbehavior"></a> `defaultSubscribeErrorBehavior?` | [`MessageHandlerErrorBehavior`](../enumerations/MessageHandlerErrorBehavior.md) | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:135](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L135) |
| <a id="deserializer"></a> `deserializer?` | [`MessageDeserializer`](../type-aliases/MessageDeserializer.md) | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:145](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L145) |
| <a id="enablecontrollerdiscovery"></a> `enableControllerDiscovery?` | `boolean` | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:140](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L140) |
| <a id="enabledirectreplyto"></a> `enableDirectReplyTo?` | `boolean` | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:139](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L139) |
| <a id="exchangebindings"></a> `exchangeBindings?` | [`RabbitMQExchangeBindingConfig`](RabbitMQExchangeBindingConfig.md)[] | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:130](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L130) |
| <a id="exchanges"></a> `exchanges?` | [`RabbitMQExchangeConfig`](RabbitMQExchangeConfig.md)[] | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:129](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L129) |
| <a id="handlers"></a> `handlers?` | [`RabbitMQHandlers`](../type-aliases/RabbitMQHandlers.md) | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:142](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L142) |
| <a id="logger"></a> `logger?` | [`LoggerService`](../../../../index/interfaces/LoggerService.md) | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:144](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L144) |
| <a id="name"></a> `name?` | `string` | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:126](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L126) |
| <a id="prefetchcount"></a> `prefetchCount?` | `number` | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:128](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L128) |
| <a id="queues"></a> `queues?` | [`RabbitMQQueueConfig`](RabbitMQQueueConfig.md)[] | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:131](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L131) |
| <a id="registerhandlers"></a> `registerHandlers?` | `boolean` | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:138](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L138) |
| <a id="serializer"></a> `serializer?` | [`MessageSerializer`](../type-aliases/MessageSerializer.md) | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:146](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L146) |
| <a id="uri"></a> `uri` | \| [`RabbitMQUriConfig`](../type-aliases/RabbitMQUriConfig.md) \| [`RabbitMQUriConfig`](../type-aliases/RabbitMQUriConfig.md)[] | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:127](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L127) |
