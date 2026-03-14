# Interface: FieldResolverOptions

Defined in: [packages/apollo/src/decorators/field-resolver.decorator.ts:8](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/field-resolver.decorator.ts#L8)

Options for the

## Field Resolver

decorator.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="deprecationreason"></a> `deprecationReason?` | `string` | Deprecation reason. | [packages/apollo/src/decorators/field-resolver.decorator.ts:16](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/field-resolver.decorator.ts#L16) |
| <a id="description"></a> `description?` | `string` | Description for documentation. | [packages/apollo/src/decorators/field-resolver.decorator.ts:12](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/field-resolver.decorator.ts#L12) |
| <a id="extensions"></a> `extensions?` | `Record`\<`string`, `unknown`\> | Additional extensions. | [packages/apollo/src/decorators/field-resolver.decorator.ts:20](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/field-resolver.decorator.ts#L20) |
| <a id="name"></a> `name?` | `string` | Field name (defaults to method name). | [packages/apollo/src/decorators/field-resolver.decorator.ts:10](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/field-resolver.decorator.ts#L10) |
| <a id="nullable"></a> `nullable?` | `boolean` | Whether the field can return null. | [packages/apollo/src/decorators/field-resolver.decorator.ts:14](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/field-resolver.decorator.ts#L14) |
| <a id="returntype"></a> `returnType?` | () => `unknown` | Function returning the field type. | [packages/apollo/src/decorators/field-resolver.decorator.ts:18](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/field-resolver.decorator.ts#L18) |
