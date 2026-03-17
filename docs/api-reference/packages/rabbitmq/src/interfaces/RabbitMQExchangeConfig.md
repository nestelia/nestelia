# Interface: RabbitMQExchangeConfig

Defined in: [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:103](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L103)

Exchange configuration

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="createexchangeifnotexists"></a> `createExchangeIfNotExists?` | `boolean` | Create exchange if it doesn't exist (default: true). When false, uses checkExchange instead of assertExchange. | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:122](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L122) |
| <a id="name"></a> `name` | `string` | Exchange name | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:105](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L105) |
| <a id="options"></a> `options?` | \{ `arguments?`: `Record`\<`string`, `unknown`\> & \{ `x-delayed-type?`: `"direct"` \| `"topic"` \| `"fanout"` \| `"headers"`; \}; `autoDelete?`: `boolean`; `durable?`: `boolean`; `internal?`: `boolean`; \} | Exchange options | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:109](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L109) |
| `options.arguments?` | `Record`\<`string`, `unknown`\> & \{ `x-delayed-type?`: `"direct"` \| `"topic"` \| `"fanout"` \| `"headers"`; \} | For x-delayed-message exchange: the underlying type | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:114](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L114) |
| `options.autoDelete?` | `boolean` | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:111](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L111) |
| `options.durable?` | `boolean` | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:110](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L110) |
| `options.internal?` | `boolean` | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:112](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L112) |
| <a id="type"></a> `type?` | [`RabbitMQExchangeType`](../type-aliases/RabbitMQExchangeType.md) | Exchange type (defaults to config.defaultExchangeType or "topic") | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:107](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L107) |
