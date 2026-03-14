# Interface: ElysiaHookMetadata

Defined in: [packages/core/src/decorators/lifecycle.decorators.ts:20](https://github.com/nestelia/nestelia/blob/main/packages/core/src/decorators/lifecycle.decorators.ts#L20)

Metadata for Elysia lifecycle hooks

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="hook"></a> `hook` | [`ElysiaHookName`](../type-aliases/ElysiaHookName.md) | - | [packages/core/src/decorators/lifecycle.decorators.ts:21](https://github.com/nestelia/nestelia/blob/main/packages/core/src/decorators/lifecycle.decorators.ts#L21) |
| <a id="method"></a> `method` | `string` \| `symbol` | - | [packages/core/src/decorators/lifecycle.decorators.ts:22](https://github.com/nestelia/nestelia/blob/main/packages/core/src/decorators/lifecycle.decorators.ts#L22) |
| <a id="options"></a> `options?` | \{ `before?`: `boolean`; \} | - | [packages/core/src/decorators/lifecycle.decorators.ts:23](https://github.com/nestelia/nestelia/blob/main/packages/core/src/decorators/lifecycle.decorators.ts#L23) |
| `options.before?` | `boolean` | Insert before other hooks | [packages/core/src/decorators/lifecycle.decorators.ts:25](https://github.com/nestelia/nestelia/blob/main/packages/core/src/decorators/lifecycle.decorators.ts#L25) |
