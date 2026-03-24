# Class: AmqpConnectionManager

Defined in: [packages/rabbitmq/src/amqp/connectionManager.ts:3](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/amqp/connectionManager.ts#L3)

## Constructors

### Constructor

```ts
new AmqpConnectionManager(): AmqpConnectionManager;
```

#### Returns

`AmqpConnectionManager`

## Methods

### addConnection()

```ts
addConnection(connection): void;
```

Defined in: [packages/rabbitmq/src/amqp/connectionManager.ts:6](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/amqp/connectionManager.ts#L6)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `connection` | [`AmqpConnection`](AmqpConnection.md) |

#### Returns

`void`

***

### clearConnections()

```ts
clearConnections(): void;
```

Defined in: [packages/rabbitmq/src/amqp/connectionManager.ts:18](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/amqp/connectionManager.ts#L18)

#### Returns

`void`

***

### close()

```ts
close(): Promise<void>;
```

Defined in: [packages/rabbitmq/src/amqp/connectionManager.ts:22](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/amqp/connectionManager.ts#L22)

#### Returns

`Promise`\<`void`\>

***

### getConnection()

```ts
getConnection(name): AmqpConnection | undefined;
```

Defined in: [packages/rabbitmq/src/amqp/connectionManager.ts:10](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/amqp/connectionManager.ts#L10)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |

#### Returns

[`AmqpConnection`](AmqpConnection.md) \| `undefined`

***

### getConnections()

```ts
getConnections(): AmqpConnection[];
```

Defined in: [packages/rabbitmq/src/amqp/connectionManager.ts:14](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/amqp/connectionManager.ts#L14)

#### Returns

[`AmqpConnection`](AmqpConnection.md)[]
