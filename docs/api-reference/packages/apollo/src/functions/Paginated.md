# Function: Paginated()

```ts
function Paginated<T>(ItemType): Constructor;
```

Defined in: [packages/apollo/src/pagination.ts:48](https://github.com/kiyasov/nestelia/blob/main/packages/apollo/src/pagination.ts#L48)

Creates a simple paginated response type for a given item class.
Fields: `items`, `total`, `hasNextPage`, `hasPreviousPage`.

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `ItemType` | `Constructor`\<`T`\> |

## Returns

`Constructor`

## Example

```typescript
@ObjectType()
class BooksPage extends Paginated(Book) {}

@Query(() => BooksPage)
books(@Args('offset', { type: () => Int }) offset: number): BooksPage { ... }
```

## Public Api
