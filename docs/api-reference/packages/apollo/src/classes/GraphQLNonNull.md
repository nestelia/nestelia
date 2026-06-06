# Class: GraphQLNonNull\<T\>

Defined in: node\_modules/graphql/type/definition.d.ts:1032

Non-Null Type Wrapper

A non-null is a wrapping type which points to another type.
Non-null types enforce that their values are never null and can ensure
an error is raised if this ever occurs during a request. It is useful for
fields which you can make a strong guarantee on non-nullability, for example
usually the id field of a database row will never be null.

## Example

```ts
const RowType = new GraphQLObjectType({
  name: 'Row',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
  })
})
```

Note: the enforcement of non-nullability occurs within the executor.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` *extends* `GraphQLNullableType` | The nullable GraphQL type wrapped by this non-null type. |

## Accessors

### \[toStringTag\]

#### Get Signature

```ts
get toStringTag: string;
```

Defined in: node\_modules/graphql/type/definition.d.ts:1053

Returns the value used by `Object.prototype.toString`.

##### Returns

`string`

The built-in string tag for this object.

## Constructors

### Constructor

```ts
new GraphQLNonNull<T>(ofType): GraphQLNonNull<T>;
```

Defined in: node\_modules/graphql/type/definition.d.ts:1048

Creates a GraphQLNonNull instance.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ofType` | `T` | The type to wrap. |

#### Returns

`GraphQLNonNull`\<`T`\>

#### Example

```ts
import { GraphQLNonNull, GraphQLString } from 'graphql/type';

const requiredString = new GraphQLNonNull(GraphQLString);

requiredString.ofType; // => GraphQLString
String(requiredString); // => 'String!'
```

## Methods

### toJSON()

```ts
toJSON(): string;
```

Defined in: node\_modules/graphql/type/definition.d.ts:1084

Returns the JSON representation used when this object is serialized.

#### Returns

`string`

The JSON-serializable representation.

#### Example

```ts
import { GraphQLNonNull, GraphQLString } from 'graphql/type';

const requiredString = new GraphQLNonNull(GraphQLString);

requiredString.toJSON(); // => 'String!'
JSON.stringify({ type: requiredString }); // => '{"type":"String!"}'
```

***

### toString()

```ts
toString(): string;
```

Defined in: node\_modules/graphql/type/definition.d.ts:1070

Returns this wrapping type as a GraphQL type-reference string.

#### Returns

`string`

The GraphQL type-reference string.

#### Example

```ts
import { GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql/type';

const requiredString = new GraphQLNonNull(GraphQLString);
const requiredStringList = new GraphQLNonNull(
  new GraphQLList(GraphQLString),
);

requiredString.toString(); // => 'String!'
requiredStringList.toString(); // => '[String]!'
```

## Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="oftype"></a> `ofType` | `readonly` | `T` | The type wrapped by this list or non-null type. | node\_modules/graphql/type/definition.d.ts:1034 |
