# Class: TypeMetadataStorage

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:67](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L67)

Global storage for GraphQL type metadata.
Fields are stored separately from type declarations.
globalThis ensures a single instance even with symlink-based module resolution.

## Constructors

### Constructor

```ts
new TypeMetadataStorage(): TypeMetadataStorage;
```

#### Returns

`TypeMetadataStorage`

## Methods

### addEnum()

```ts
addEnum(target, metadata): void;
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:152](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L152)

Registers an enum type.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `target` | `object` | The enum object. |
| `metadata` | [`EnumMetadata`](../interfaces/EnumMetadata.md) | Enum metadata. |

#### Returns

`void`

***

### addField()

```ts
addField(constructor, field): void;
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:181](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L181)

Adds a field to a type.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `constructor` | `object` | The class constructor. |
| `field` | `TypeFieldMetadata` | Field metadata. |

#### Returns

`void`

***

### addFieldResolver()

```ts
addFieldResolver(metadata): void;
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:244](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L244)

Registers a field resolver.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `metadata` | `ResolverFieldMetadata` | Field resolver metadata. |

#### Returns

`void`

***

### addInputType()

```ts
addInputType(target, metadata): void;
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:131](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L131)

Registers an input type.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `target` | `object` | The class constructor. |
| `metadata` | [`InputTypeMetadata`](../interfaces/InputTypeMetadata.md) | Input type metadata. |

#### Returns

`void`

***

### addInterfaceType()

```ts
addInterfaceType(target, metadata): void;
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:143](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L143)

Registers an interface type.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `target` | `object` | The class constructor. |
| `metadata` | [`InterfaceTypeMetadata`](../interfaces/InterfaceTypeMetadata.md) | Interface type metadata. |

#### Returns

`void`

***

### addMutation()

```ts
addMutation(metadata): void;
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:228](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L228)

Registers a mutation resolver.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `metadata` | `ResolverFieldMetadata` | Mutation metadata. |

#### Returns

`void`

***

### addObjectType()

```ts
addObjectType(target, metadata): void;
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:119](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L119)

Registers an object type.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `target` | `object` | The class constructor. |
| `metadata` | [`ObjectTypeMetadata`](../interfaces/ObjectTypeMetadata.md) | Object type metadata. |

#### Returns

`void`

***

### addQuery()

```ts
addQuery(metadata): void;
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:220](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L220)

Registers a query resolver.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `metadata` | `ResolverFieldMetadata` | Query metadata. |

#### Returns

`void`

***

### addScalar()

```ts
addScalar(target, metadata): void;
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:161](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L161)

Registers a scalar type.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `target` | `object` | The class constructor. |
| `metadata` | [`ScalarMetadata`](../interfaces/ScalarMetadata.md) | Scalar metadata. |

#### Returns

`void`

***

### addSubscription()

```ts
addSubscription(metadata): void;
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:236](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L236)

Registers a subscription resolver.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `metadata` | `ResolverFieldMetadata` | Subscription metadata. |

#### Returns

`void`

***

### addUnion()

```ts
addUnion(target, metadata): void;
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:170](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L170)

Registers a union type.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `target` | `object` | The class constructor. |
| `metadata` | [`UnionMetadata`](../interfaces/UnionMetadata.md) | Union metadata. |

#### Returns

`void`

***

### clear()

```ts
clear(): void;
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:89](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L89)

Clears all registered metadata in-place.
Preserves the same instance so module-level imports remain valid.

#### Returns

`void`

***

### getEnums()

```ts
getEnums(): EnumMetadata & {
  target: object;
}[];
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:296](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L296)

Gets all registered enums.

#### Returns

[`EnumMetadata`](../interfaces/EnumMetadata.md) & \{
  `target`: `object`;
\}[]

Array of enum metadata.

***

### getFieldResolvers()

```ts
getFieldResolvers(): ResolverFieldMetadata[];
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:353](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L353)

Gets all registered field resolvers.

#### Returns

`ResolverFieldMetadata`[]

Array of field resolver metadata.

***

### getFieldsByConstructor()

```ts
getFieldsByConstructor(constructor): TypeFieldMetadata[];
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:195](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L195)

Gets all fields for a constructor.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `constructor` | `object` | The class constructor. |

#### Returns

`TypeFieldMetadata`[]

Array of field metadata.

***

### getInputTypes()

```ts
getInputTypes(): InputTypeMetadata & {
  fields: TypeFieldMetadata[];
  target: object;
}[];
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:268](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L268)

Gets all registered input types with their fields.

#### Returns

[`InputTypeMetadata`](../interfaces/InputTypeMetadata.md) & \{
  `fields`: `TypeFieldMetadata`[];
  `target`: `object`;
\}[]

Array of input type metadata with fields.

***

### getInterfaceTypes()

```ts
getInterfaceTypes(): InterfaceTypeMetadata & {
  fields: TypeFieldMetadata[];
  target: object;
}[];
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:282](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L282)

Gets all registered interface types with their fields.

#### Returns

[`InterfaceTypeMetadata`](../interfaces/InterfaceTypeMetadata.md) & \{
  `fields`: `TypeFieldMetadata`[];
  `target`: `object`;
\}[]

Array of interface type metadata with fields.

***

### getMutations()

```ts
getMutations(): ResolverFieldMetadata[];
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:337](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L337)

Gets all registered mutations.

#### Returns

`ResolverFieldMetadata`[]

Array of mutation metadata.

***

### getObjectTypes()

```ts
getObjectTypes(): ObjectTypeMetadata & {
  fields: TypeFieldMetadata[];
  target: object;
}[];
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:254](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L254)

Gets all registered object types with their fields.

#### Returns

[`ObjectTypeMetadata`](../interfaces/ObjectTypeMetadata.md) & \{
  `fields`: `TypeFieldMetadata`[];
  `target`: `object`;
\}[]

Array of object type metadata with fields.

***

### getQueries()

```ts
getQueries(): ResolverFieldMetadata[];
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:329](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L329)

Gets all registered queries.

#### Returns

`ResolverFieldMetadata`[]

Array of query metadata.

***

### getScalars()

```ts
getScalars(): ScalarMetadata & {
  target: object;
}[];
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:307](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L307)

Gets all registered scalars.

#### Returns

[`ScalarMetadata`](../interfaces/ScalarMetadata.md) & \{
  `target`: `object`;
\}[]

Array of scalar metadata.

***

### getSubscriptions()

```ts
getSubscriptions(): ResolverFieldMetadata[];
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:345](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L345)

Gets all registered subscriptions.

#### Returns

`ResolverFieldMetadata`[]

Array of subscription metadata.

***

### getUnions()

```ts
getUnions(): UnionMetadata & {
  target: object;
}[];
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:318](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L318)

Gets all registered unions.

#### Returns

[`UnionMetadata`](../interfaces/UnionMetadata.md) & \{
  `target`: `object`;
\}[]

Array of union metadata.

***

### removeField()

```ts
removeField(constructor, fieldName): void;
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:204](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L204)

Removes a field from a type.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `constructor` | `object` | The class constructor. |
| `fieldName` | `string` | Name of the field to remove. |

#### Returns

`void`

***

### reset()

```ts
static reset(): void;
```

Defined in: [packages/apollo/src/storages/type-metadata.storage.ts:108](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/storages/type-metadata.storage.ts#L108)

Resets the global metadata storage by clearing the singleton in-place.
Module-level imports of [typeMetadataStorage](../variables/typeMetadataStorage.md) remain valid after calling this.
Useful for testing to ensure clean state between test cases.

#### Returns

`void`
