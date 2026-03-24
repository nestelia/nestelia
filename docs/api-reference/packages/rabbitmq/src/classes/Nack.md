# Class: Nack

Defined in: [packages/rabbitmq/src/amqp/handlerResponses.ts:1](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/amqp/handlerResponses.ts#L1)

## Accessors

### requeue

#### Get Signature

```ts
get requeue(): boolean;
```

Defined in: [packages/rabbitmq/src/amqp/handlerResponses.ts:4](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/amqp/handlerResponses.ts#L4)

##### Returns

`boolean`

## Constructors

### Constructor

```ts
new Nack(_requeue?): Nack;
```

Defined in: [packages/rabbitmq/src/amqp/handlerResponses.ts:2](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/amqp/handlerResponses.ts#L2)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `_requeue` | `boolean` | `false` |

#### Returns

`Nack`
