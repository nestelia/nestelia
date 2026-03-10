# Function: createConnectionType()

```ts
function createConnectionType<T>(NodeType, EdgeType?): Constructor;
```

Defined in: [packages/apollo/src/pagination.ts:112](https://github.com/kiyasov/nestelia/blob/main/packages/apollo/src/pagination.ts#L112)

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
| `EdgeType?` | `Constructor`\<`unknown`\> |

## Returns

`Constructor`

## Example

```typescript
@ObjectType()
class BookEdge extends createEdgeType(Book) {}

@ObjectType()
class BookConnection extends createConnectionType(Book, BookEdge) {}

@Query(() => BookConnection)
booksConnection(@Args('after', { nullable: true }) after?: string): BookConnection { ... }
```

## Public Api
