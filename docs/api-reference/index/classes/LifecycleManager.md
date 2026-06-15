# Class: LifecycleManager

Defined in: [packages/core/src/lifecycle/lifecycle-manager.ts:12](https://github.com/nestelia/nestelia/blob/main/packages/core/src/lifecycle/lifecycle-manager.ts#L12)

Class to manage lifecycle hooks across the application

## Constructors

### Constructor

```ts
new LifecycleManager(): LifecycleManager;
```

#### Returns

`LifecycleManager`

## Methods

### clear()

```ts
clear(): void;
```

Defined in: [packages/core/src/lifecycle/lifecycle-manager.ts:88](https://github.com/nestelia/nestelia/blob/main/packages/core/src/lifecycle/lifecycle-manager.ts#L88)

Clear all registered providers to prevent memory leaks

#### Returns

`void`

***

### register()

```ts
register(provider): void;
```

Defined in: [packages/core/src/lifecycle/lifecycle-manager.ts:19](https://github.com/nestelia/nestelia/blob/main/packages/core/src/lifecycle/lifecycle-manager.ts#L19)

Register a provider with lifecycle hooks

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `provider` | `any` |

#### Returns

`void`

***

### triggerBeforeApplicationShutdown()

```ts
triggerBeforeApplicationShutdown(): void;
```

Defined in: [packages/core/src/lifecycle/lifecycle-manager.ts:74](https://github.com/nestelia/nestelia/blob/main/packages/core/src/lifecycle/lifecycle-manager.ts#L74)

Trigger beforeApplicationShutdown hooks for all registered providers

#### Returns

`void`

***

### triggerOnApplicationBootstrap()

```ts
triggerOnApplicationBootstrap(): void;
```

Defined in: [packages/core/src/lifecycle/lifecycle-manager.ts:42](https://github.com/nestelia/nestelia/blob/main/packages/core/src/lifecycle/lifecycle-manager.ts#L42)

Trigger onApplicationBootstrap hooks for all registered providers

#### Returns

`void`

***

### triggerOnApplicationShutdown()

```ts
triggerOnApplicationShutdown(): void;
```

Defined in: [packages/core/src/lifecycle/lifecycle-manager.ts:96](https://github.com/nestelia/nestelia/blob/main/packages/core/src/lifecycle/lifecycle-manager.ts#L96)

Trigger onApplicationShutdown hooks for all registered providers

#### Returns

`void`

***

### triggerOnModuleDestroy()

```ts
triggerOnModuleDestroy(): void;
```

Defined in: [packages/core/src/lifecycle/lifecycle-manager.ts:60](https://github.com/nestelia/nestelia/blob/main/packages/core/src/lifecycle/lifecycle-manager.ts#L60)

Trigger onModuleDestroy hooks for all registered providers

#### Returns

`void`

***

### triggerOnModuleInit()

```ts
triggerOnModuleInit(): void;
```

Defined in: [packages/core/src/lifecycle/lifecycle-manager.ts:28](https://github.com/nestelia/nestelia/blob/main/packages/core/src/lifecycle/lifecycle-manager.ts#L28)

Trigger onModuleInit hooks for all registered providers

#### Returns

`void`
