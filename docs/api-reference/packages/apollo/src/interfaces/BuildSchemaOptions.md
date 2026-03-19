# Interface: BuildSchemaOptions

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:62](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L62)

Options for building the GraphQL schema.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="addnewlineatend"></a> `addNewlineAtEnd?` | `boolean` | Add newline at end of generated schema file. | [packages/apollo/src/interfaces/apollo-options.interface.ts:78](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L78) |
| <a id="datescalarmode"></a> `dateScalarMode?` | [`DateScalarMode`](../type-aliases/DateScalarMode.md) | Date scalar mode (ISO string or timestamp). | [packages/apollo/src/interfaces/apollo-options.interface.ts:64](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L64) |
| <a id="directives"></a> `directives?` | `GraphQLDirective`[] | Custom directives to include. | [packages/apollo/src/interfaces/apollo-options.interface.ts:74](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L74) |
| <a id="noduplicatedfields"></a> `noDuplicatedFields?` | `boolean` | Prevent duplicate field definitions. | [packages/apollo/src/interfaces/apollo-options.interface.ts:76](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L76) |
| <a id="numberscalarmode"></a> `numberScalarMode?` | [`NumberScalarMode`](../type-aliases/NumberScalarMode.md) | Number scalar mode (float or integer). | [packages/apollo/src/interfaces/apollo-options.interface.ts:66](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L66) |
| <a id="orphanedtypes"></a> `orphanedTypes?` | (`object` \| `Constructor`)[] | Types that are not directly referenced but should be included. | [packages/apollo/src/interfaces/apollo-options.interface.ts:70](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L70) |
| <a id="scalarsmap"></a> `scalarsMap?` | [`ScalarsTypeMap`](ScalarsTypeMap.md)[] | Custom scalar type mappings. | [packages/apollo/src/interfaces/apollo-options.interface.ts:68](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L68) |
| <a id="skipcheck"></a> `skipCheck?` | `boolean` | Skip schema validation. | [packages/apollo/src/interfaces/apollo-options.interface.ts:72](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L72) |
