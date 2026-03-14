# Function: Cron()

```ts
function Cron(cronExpression, options?): MethodDecorator;
```

Defined in: [packages/scheduler/src/decorators/scheduler.decorators.ts:50](https://github.com/nestelia/nestelia/blob/main/packages/scheduler/src/decorators/scheduler.decorators.ts#L50)

Decorator for cron jobs

## Parameters

| Parameter | Type |
| ------ | ------ |
| `cronExpression` | `string` \| [`CronExpression`](../interfaces/CronExpression.md) |
| `options?` | [`CronTaskOptions`](../interfaces/CronTaskOptions.md) |

## Returns

`MethodDecorator`
