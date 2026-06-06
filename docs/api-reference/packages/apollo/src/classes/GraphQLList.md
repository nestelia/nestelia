# Class: GraphQLList\<T\>

Defined in: node\_modules/graphql/type/definition.d.ts:959

List Type Wrapper

A list is a wrapping type which points to another type.
Lists are often created within the context of defining the fields of
an object type.

## Example

```ts
const PersonType = new GraphQLObjectType({
  name: 'Person',
  fields: () => ({
    parents: { type: new GraphQLList(PersonType) },
    children: { type: new GraphQLList(PersonType) },
  })
})
```

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` *extends* `GraphQLType` | The GraphQL type wrapped by this list type. |

## Accessors

### \[toStringTag\]

#### Get Signature

```ts
get toStringTag: string;
```

Defined in: node\_modules/graphql/type/definition.d.ts:980

Returns the value used by `Object.prototype.toString`.

##### Returns

`string`

The built-in string tag for this object.

## Constructors

### Constructor

```ts
new GraphQLList<T>(ofType): GraphQLList<T>;
```

Defined in: node\_modules/graphql/type/definition.d.ts:975

Creates a GraphQLList instance.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ofType` | `T` | The type to wrap. |

#### Returns

`GraphQLList`\<`T`\>

#### Example

```ts
import { GraphQLList, GraphQLString } from 'graphql/type';

const stringList = new GraphQLList(GraphQLString);

stringList.ofType; // => GraphQLString
String(stringList); // => '[String]'
```

## Methods

### toJSON()

```ts
toJSON(): string;
```

Defined in: node\_modules/graphql/type/definition.d.ts:1009

Returns the JSON representation used when this object is serialized.

#### Returns

`string`

The JSON-serializable representation.

#### Example

```ts
import { GraphQLList, GraphQLString } from 'graphql/type';

const stringList = new GraphQLList(GraphQLString);

stringList.toJSON(); // => '[String]'
JSON.stringify({ type: stringList }); // => '{"type":"[String]"}'
```

***

### toString()

```ts
toString(): string;
```

Defined in: node\_modules/graphql/type/definition.d.ts:995

Returns this wrapping type as a GraphQL type-reference string.

#### Returns

`string`

The GraphQL type-reference string.

#### Example

```ts
import { GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql/type';

const stringList = new GraphQLList(GraphQLString);
const requiredStringList = new GraphQLList(new GraphQLNonNull(GraphQLString));

stringList.toString(); // => '[String]'
requiredStringList.toString(); // => '[String!]'
```

## Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="oftype"></a> `ofType` | `readonly` | `T` | The type wrapped by this list or non-null type. | node\_modules/graphql/type/definition.d.ts:961 |
