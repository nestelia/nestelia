# Variable: Form()

```ts
const Form: (paramNameOrDtoOrOptions?, dtoTypeOrFileOptions?) => (target, propertyKey, parameterIndex) => void;
```

Defined in: [packages/core/src/decorators/param.decorators.ts:454](https://github.com/nestelia/nestelia/blob/main/packages/core/src/decorators/param.decorators.ts#L454)

## Parameters

| Parameter | Type |
| ------ | ------ |
| `paramNameOrDtoOrOptions?` | `unknown` |
| `dtoTypeOrFileOptions?` | `unknown` |

## Returns

```ts
(
   target, 
   propertyKey, 
   parameterIndex): void;
```

### Parameters

| Parameter | Type |
| ------ | ------ |
| `target` | `object` |
| `propertyKey` | `string` \| `symbol` |
| `parameterIndex` | `number` |

### Returns

`void`
