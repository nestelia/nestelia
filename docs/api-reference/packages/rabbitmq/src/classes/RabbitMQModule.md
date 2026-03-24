# Class: RabbitMQModule

Defined in: [packages/rabbitmq/src/rabbitmq.module.ts:113](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/rabbitmq.module.ts#L113)

## Constructors

### Constructor

```ts
new RabbitMQModule(): RabbitMQModule;
```

#### Returns

`RabbitMQModule`

## Methods

### AmqpConnectionFactory()

```ts
static AmqpConnectionFactory(config): Promise<AmqpConnection | undefined>;
```

Defined in: [packages/rabbitmq/src/rabbitmq.module.ts:117](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/rabbitmq.module.ts#L117)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `config` | [`RabbitMQConfig`](../interfaces/RabbitMQConfig.md) |

#### Returns

`Promise`\<[`AmqpConnection`](AmqpConnection.md) \| `undefined`\>

***

### attach()

```ts
static attach(connection): DynamicModule;
```

Defined in: [packages/rabbitmq/src/rabbitmq.module.ts:229](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/rabbitmq.module.ts#L229)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `connection` | [`AmqpConnection`](AmqpConnection.md) |

#### Returns

[`DynamicModule`](../../../../index/interfaces/DynamicModule.md)

***

### forFeature()

```ts
static forFeature(handlers): DynamicModule;
```

Defined in: [packages/rabbitmq/src/rabbitmq.module.ts:221](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/rabbitmq.module.ts#L221)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `handlers` | `unknown`[] |

#### Returns

[`DynamicModule`](../../../../index/interfaces/DynamicModule.md)

***

### forRoot()

```ts
static forRoot(options): DynamicModule;
```

Defined in: [packages/rabbitmq/src/rabbitmq.module.ts:139](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/rabbitmq.module.ts#L139)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`RabbitMQModuleOptions`](../interfaces/RabbitMQModuleOptions.md) |

#### Returns

[`DynamicModule`](../../../../index/interfaces/DynamicModule.md)

***

### forRootAsync()

```ts
static forRootAsync(options): DynamicModule;
```

Defined in: [packages/rabbitmq/src/rabbitmq.module.ts:174](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/rabbitmq.module.ts#L174)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | \{ `inject?`: ( \| [`ProviderToken`](../../../../index/type-aliases/ProviderToken.md) \| \{ `optional?`: `boolean`; `token`: [`ProviderToken`](../../../../index/type-aliases/ProviderToken.md); \})[]; `isGlobal?`: `boolean`; `useFactory`: (...`args`) => \| [`RabbitMQModuleOptions`](../interfaces/RabbitMQModuleOptions.md) \| `Promise`\<[`RabbitMQModuleOptions`](../interfaces/RabbitMQModuleOptions.md)\>; \} |
| `options.inject?` | ( \| [`ProviderToken`](../../../../index/type-aliases/ProviderToken.md) \| \{ `optional?`: `boolean`; `token`: [`ProviderToken`](../../../../index/type-aliases/ProviderToken.md); \})[] |
| `options.isGlobal?` | `boolean` |
| `options.useFactory` | (...`args`) => \| [`RabbitMQModuleOptions`](../interfaces/RabbitMQModuleOptions.md) \| `Promise`\<[`RabbitMQModuleOptions`](../interfaces/RabbitMQModuleOptions.md)\> |

#### Returns

[`DynamicModule`](../../../../index/interfaces/DynamicModule.md)
