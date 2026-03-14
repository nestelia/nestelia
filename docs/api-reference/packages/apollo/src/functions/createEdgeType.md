# Function: createEdgeType()

```ts
function createEdgeType<T>(NodeType): AnyConstructor;
```

Defined in: [packages/apollo/src/pagination.ts:72](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/pagination.ts#L72)

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

`AnyConstructor`
