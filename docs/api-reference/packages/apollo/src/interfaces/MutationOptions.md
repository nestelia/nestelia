# Interface: MutationOptions

Defined in: [packages/apollo/src/decorators/mutation.decorator.ts:7](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/mutation.decorator.ts#L7)

Options for the

## Mutation

decorator.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="defaultvalue"></a> `defaultValue?` | `unknown` | Default value for the mutation result. | [packages/apollo/src/decorators/mutation.decorator.ts:15](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/mutation.decorator.ts#L15) |
| <a id="deprecationreason"></a> `deprecationReason?` | `string` | Deprecation reason. | [packages/apollo/src/decorators/mutation.decorator.ts:17](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/mutation.decorator.ts#L17) |
| <a id="description"></a> `description?` | `string` | Description for documentation. | [packages/apollo/src/decorators/mutation.decorator.ts:11](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/mutation.decorator.ts#L11) |
| <a id="extensions"></a> `extensions?` | `Record`\<`string`, `unknown`\> | Additional extensions. | [packages/apollo/src/decorators/mutation.decorator.ts:19](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/mutation.decorator.ts#L19) |
| <a id="name"></a> `name?` | `string` | Mutation name (defaults to method name). | [packages/apollo/src/decorators/mutation.decorator.ts:9](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/mutation.decorator.ts#L9) |
| <a id="nullable"></a> `nullable?` | `boolean` | Whether the mutation can return null. | [packages/apollo/src/decorators/mutation.decorator.ts:13](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/mutation.decorator.ts#L13) |
| <a id="returntype"></a> `returnType?` | () => `unknown` | Return type factory function. | [packages/apollo/src/decorators/mutation.decorator.ts:21](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/mutation.decorator.ts#L21) |
