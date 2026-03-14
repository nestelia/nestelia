# Function: createParamDecorator()

## Call Signature

```ts
function createParamDecorator(factory): () => ParameterDecorator;
```

Defined in: [packages/core/src/decorators/http.decorators.ts:36](https://github.com/nestelia/nestelia/blob/main/packages/core/src/decorators/http.decorators.ts#L36)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `factory` | `CustomParamFactory` |

### Returns

```ts
(): ParameterDecorator;
```

#### Returns

`ParameterDecorator`

## Call Signature

```ts
function createParamDecorator(type, data?): () => ParameterDecorator;
```

Defined in: [packages/core/src/decorators/http.decorators.ts:39](https://github.com/nestelia/nestelia/blob/main/packages/core/src/decorators/http.decorators.ts#L39)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `type` | `string` |
| `data?` | `string` |

### Returns

```ts
(): ParameterDecorator;
```

#### Returns

`ParameterDecorator`
