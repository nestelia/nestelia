# Interface: RequestOptions\<T\>

Defined in: [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:261](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L261)

RPC Request options for AmqpConnection.request()

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="correlationid"></a> `correlationId?` | `string` | Custom correlation ID (auto-generated if not provided) | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:273](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L273) |
| <a id="exchange"></a> `exchange` | `string` | Exchange to publish to | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:263](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L263) |
| <a id="headers"></a> `headers?` | `Record`\<`string`, `unknown`\> | Custom headers | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:271](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L271) |
| <a id="payload"></a> `payload` | `T` | Payload to send | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:267](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L267) |
| <a id="routingkey"></a> `routingKey` | `string` | Routing key | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:265](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L265) |
| <a id="timeout"></a> `timeout?` | `number` | Request timeout in milliseconds | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:269](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L269) |
