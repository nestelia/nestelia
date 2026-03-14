# Interface: ArgsOptions

Defined in: [packages/apollo/src/decorators/args.decorator.ts:6](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/args.decorator.ts#L6)

Options for an argument.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="defaultvalue"></a> `defaultValue?` | `unknown` | Default value. | [packages/apollo/src/decorators/args.decorator.ts:16](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/args.decorator.ts#L16) |
| <a id="description"></a> `description?` | `string` | Argument description. | [packages/apollo/src/decorators/args.decorator.ts:14](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/args.decorator.ts#L14) |
| <a id="name"></a> `name` | `string` | Argument name. | [packages/apollo/src/decorators/args.decorator.ts:8](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/args.decorator.ts#L8) |
| <a id="nullable"></a> `nullable?` | `boolean` | Whether the argument can be null. | [packages/apollo/src/decorators/args.decorator.ts:12](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/args.decorator.ts#L12) |
| <a id="type"></a> `type?` | () => `unknown` | Function returning the type (for lazy loading and complex types). | [packages/apollo/src/decorators/args.decorator.ts:10](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/decorators/args.decorator.ts#L10) |
