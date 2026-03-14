# Function: InjectRabbitMQConnection()

```ts
function InjectRabbitMQConnection(connectionName): ParameterDecorator;
```

Defined in: [packages/rabbitmq/src/decorators/rabbitmq.decorators.ts:131](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/decorators/rabbitmq.decorators.ts#L131)

Inject RabbitMQ connection name
Useful when multiple connections are configured

## Parameters

| Parameter | Type |
| ------ | ------ |
| `connectionName` | `string` |

## Returns

`ParameterDecorator`
