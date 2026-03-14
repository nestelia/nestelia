# Interface: SubscriptionOptions

Defined in: [packages/apollo/src/decorators/subscription.decorator.ts:18](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/subscription.decorator.ts#L18)

Options for the

## Subscription

decorator.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="deprecationreason"></a> `deprecationReason?` | `string` | Deprecation reason. | [packages/apollo/src/decorators/subscription.decorator.ts:26](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/subscription.decorator.ts#L26) |
| <a id="description"></a> `description?` | `string` | Description for documentation. | [packages/apollo/src/decorators/subscription.decorator.ts:22](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/subscription.decorator.ts#L22) |
| <a id="extensions"></a> `extensions?` | `Record`\<`string`, `unknown`\> | Additional extensions. | [packages/apollo/src/decorators/subscription.decorator.ts:32](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/subscription.decorator.ts#L32) |
| <a id="name"></a> `name?` | `string` | Subscription name (defaults to method name). | [packages/apollo/src/decorators/subscription.decorator.ts:20](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/subscription.decorator.ts#L20) |
| <a id="nullable"></a> `nullable?` | `boolean` | Whether the subscription can return null. | [packages/apollo/src/decorators/subscription.decorator.ts:24](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/subscription.decorator.ts#L24) |
| <a id="resolve"></a> `resolve?` | [`ResolveFn`](../type-aliases/ResolveFn.md) | Resolve function to transform the payload. | [packages/apollo/src/decorators/subscription.decorator.ts:30](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/subscription.decorator.ts#L30) |
| <a id="returntype"></a> `returnType?` | () => `unknown` | Return type factory function. | [packages/apollo/src/decorators/subscription.decorator.ts:34](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/subscription.decorator.ts#L34) |
| <a id="subscribe"></a> `subscribe?` | [`SubscribeFn`](../type-aliases/SubscribeFn.md) | Subscribe function (async iterator). | [packages/apollo/src/decorators/subscription.decorator.ts:28](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/subscription.decorator.ts#L28) |
