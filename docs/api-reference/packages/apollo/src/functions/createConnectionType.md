# Function: createConnectionType()

```ts
function createConnectionType<T>(NodeType, EdgeType?): AnyConstructor;
```

Defined in: [packages/apollo/src/pagination.ts:102](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/pagination.ts#L102)

Creates a Relay-style Connection type for a given node class.
Fields: `edges`, `pageInfo`, `totalCount`.

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `NodeType` | `Constructor`\<`T`\> |
| `EdgeType?` | `AnyConstructor` |

## Returns

`AnyConstructor`

## Example

```typescript
@ObjectType()
class BookEdge extends createEdgeType(Book) {}

@ObjectType()
class BookConnection extends createConnectionType(Book, BookEdge) {}

@Query(() => BookConnection)
booksConnection(@Args('after', { nullable: true }) after?: string): BookConnection { ... }
```
