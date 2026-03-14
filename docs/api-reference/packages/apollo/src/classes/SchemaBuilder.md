# Class: SchemaBuilder

Defined in: [packages/apollo/src/schema-builder.ts:61](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/schema-builder.ts#L61)

Builds a GraphQL schema from decorator metadata stored in [typeMetadataStorage](../variables/typeMetadataStorage.md).
Follows the code-first schema generation pattern.

## Constructors

### Constructor

```ts
new SchemaBuilder(container, buildSchemaOptions?): SchemaBuilder;
```

Defined in: [packages/apollo/src/schema-builder.ts:71](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/schema-builder.ts#L71)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `container` | [`Container`](../../../../index/classes/Container.md) |
| `buildSchemaOptions` | [`BuildSchemaOptions`](../interfaces/BuildSchemaOptions.md) |

#### Returns

`SchemaBuilder`

## Methods

### buildSchema()

```ts
buildSchema(): GraphQLSchema;
```

Defined in: [packages/apollo/src/schema-builder.ts:84](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/schema-builder.ts#L84)

Builds and returns the complete GraphQL schema from registered metadata.
Registers all object types, input types, enums, and scalars, then assembles
the root Query / Mutation / Subscription types.

#### Returns

[`GraphQLSchema`](GraphQLSchema.md)
