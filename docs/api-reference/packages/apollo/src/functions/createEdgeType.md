# Function: createEdgeType()

```ts
function createEdgeType<T>(NodeType): Constructor;
```

Defined in: [packages/apollo/src/pagination.ts:81](https://github.com/kiyasov/nestelia/blob/main/packages/apollo/src/pagination.ts#L81)

Creates a Relay-style Edge type for a given node class.
Fields: `node`, `cursor`.

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `NodeType` | `Constructor`\<`T`\> |

## Returns

`Constructor`

## Public Api
