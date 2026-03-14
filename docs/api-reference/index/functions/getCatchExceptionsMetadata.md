# Function: getCatchExceptionsMetadata()

```ts
function getCatchExceptionsMetadata(target): (...args) => Error[] | undefined;
```

Defined in: [packages/core/src/exceptions/catch.decorator.ts:45](https://github.com/nestelia/nestelia/blob/main/packages/core/src/exceptions/catch.decorator.ts#L45)

Get the exception types that a filter catches

## Parameters

| Parameter | Type |
| ------ | ------ |
| `target` | `object` |

## Returns

(...`args`) => `Error`[] \| `undefined`
