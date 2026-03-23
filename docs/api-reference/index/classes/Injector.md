# Class: Injector

Defined in: [packages/core/src/di/injector.ts:21](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/injector.ts#L21)

## Constructors

### Constructor

```ts
new Injector(container): Injector;
```

Defined in: [packages/core/src/di/injector.ts:24](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/injector.ts#L24)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `container` | [`Container`](Container.md) |

#### Returns

`Injector`

## Methods

### loadInstance()

```ts
loadInstance(
   wrapper, 
   moduleRef, 
contextId?): Promise<void>;
```

Defined in: [packages/core/src/di/injector.ts:26](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/injector.ts#L26)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `wrapper` | [`InstanceWrapper`](InstanceWrapper.md) | `undefined` |
| `moduleRef` | `Module` | `undefined` |
| `contextId` | [`ContextId`](../interfaces/ContextId.md) | `STATIC_CONTEXT` |

#### Returns

`Promise`\<`void`\>

***

### loadPrototype()

```ts
loadPrototype(wrapper, contextId?): Promise<void>;
```

Defined in: [packages/core/src/di/injector.ts:74](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/injector.ts#L74)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `wrapper` | [`InstanceWrapper`](InstanceWrapper.md) | `undefined` |
| `contextId` | [`ContextId`](../interfaces/ContextId.md) | `STATIC_CONTEXT` |

#### Returns

`Promise`\<`void`\>
