# Class: Reflector

Defined in: [packages/core/src/di/reflector.ts:11](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/reflector.ts#L11)

Helper class for retrieving metadata from classes and methods using reflect-metadata.

## Constructors

### Constructor

```ts
new Reflector(): Reflector;
```

#### Returns

`Reflector`

## Methods

### get()

#### Call Signature

```ts
get<T>(metadataKey, target): T | undefined;
```

Defined in: [packages/core/src/di/reflector.ts:20](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/reflector.ts#L20)

Retrieve metadata for a specified key from a target object.

##### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `metadataKey` | `string` \| `symbol` | the metadata key |
| `target` | `object` \| `Constructor` | the target object |

##### Returns

`T` \| `undefined`

the metadata value

#### Call Signature

```ts
get<T>(
   metadataKey, 
   target, 
   propertyKey): T | undefined;
```

Defined in: [packages/core/src/di/reflector.ts:34](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/reflector.ts#L34)

Retrieve metadata for a specified key from a target object's method.

##### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `metadataKey` | `string` \| `symbol` | the metadata key |
| `target` | `object` \| `Constructor` | the target object |
| `propertyKey` | `string` \| `symbol` | the property key (method name) |

##### Returns

`T` \| `undefined`

the metadata value

***

### getAllAndMerge()

```ts
getAllAndMerge<T>(metadataKey, targets): T | undefined;
```

Defined in: [packages/core/src/di/reflector.ts:116](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/reflector.ts#L116)

Retrieve metadata for a specified key from multiple targets and merge the results.
Arrays will be concatenated, objects will be merged, and primitive values will be
collected into an array.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `metadataKey` | `string` \| `symbol` | the metadata key |
| `targets` | (`object` \| `Constructor`)[] | array of target objects to check |

#### Returns

`T` \| `undefined`

merged metadata value

***

### getAllAndOverride()

```ts
getAllAndOverride<T>(metadataKey, targets): T | undefined;
```

Defined in: [packages/core/src/di/reflector.ts:93](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/reflector.ts#L93)

Retrieve metadata for a specified key from multiple targets and return the first defined value.
This method is useful when you want to get metadata from both class and method, where method
metadata should override class metadata.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `metadataKey` | `string` \| `symbol` | the metadata key |
| `targets` | (`object` \| `Constructor`)[] | array of target objects to check |

#### Returns

`T` \| `undefined`

the first defined metadata value

***

### getMetadataKeys()

#### Call Signature

```ts
getMetadataKeys(target): (string | symbol)[];
```

Defined in: [packages/core/src/di/reflector.ts:58](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/reflector.ts#L58)

Retrieve all metadata keys from a target object.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `target` | `object` \| `Constructor` | the target object |

##### Returns

(`string` \| `symbol`)[]

array of metadata keys

#### Call Signature

```ts
getMetadataKeys(target, propertyKey): (string | symbol)[];
```

Defined in: [packages/core/src/di/reflector.ts:68](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/reflector.ts#L68)

Retrieve all metadata keys from a target object's method.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `target` | `object` \| `Constructor` | the target object |
| `propertyKey` | `string` \| `symbol` | the property key (method name) |

##### Returns

(`string` \| `symbol`)[]

array of metadata keys
