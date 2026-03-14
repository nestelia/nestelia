# Class: Injector

Defined in: [packages/core/src/di/injector.ts:11](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/injector.ts#L11)

## Constructors

### Constructor

```ts
new Injector(container): Injector;
```

Defined in: [packages/core/src/di/injector.ts:12](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/injector.ts#L12)

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

Defined in: [packages/core/src/di/injector.ts:14](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/injector.ts#L14)

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

Defined in: [packages/core/src/di/injector.ts:45](https://github.com/nestelia/nestelia/blob/main/packages/core/src/di/injector.ts#L45)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `wrapper` | [`InstanceWrapper`](InstanceWrapper.md) | `undefined` |
| `contextId` | [`ContextId`](../interfaces/ContextId.md) | `STATIC_CONTEXT` |

#### Returns

`Promise`\<`void`\>
