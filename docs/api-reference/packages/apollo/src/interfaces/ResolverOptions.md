# Interface: ResolverOptions

Defined in: [packages/apollo/src/decorators/resolver.decorator.ts:6](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/resolver.decorator.ts#L6)

Options for the

## Resolver

decorator.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="deprecationreason"></a> `deprecationReason?` | `string` | Deprecation reason. | [packages/apollo/src/decorators/resolver.decorator.ts:12](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/resolver.decorator.ts#L12) |
| <a id="description"></a> `description?` | `string` | Description for documentation. | [packages/apollo/src/decorators/resolver.decorator.ts:10](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/resolver.decorator.ts#L10) |
| <a id="extensions"></a> `extensions?` | `Record`\<`string`, `unknown`\> | Additional extensions. | [packages/apollo/src/decorators/resolver.decorator.ts:14](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/resolver.decorator.ts#L14) |
| <a id="name"></a> `name?` | `string` | GraphQL type name in schema. | [packages/apollo/src/decorators/resolver.decorator.ts:8](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/resolver.decorator.ts#L8) |
| <a id="type"></a> `type?` | () => `Constructor` | Function returning the type (for lazy loading). | [packages/apollo/src/decorators/resolver.decorator.ts:16](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/resolver.decorator.ts#L16) |
