# Class: ScheduleModule

Defined in: [packages/scheduler/src/schedule.module.ts:34](https://github.com/nestelia/nestelia/blob/main/packages/scheduler/src/schedule.module.ts#L34)

Module for scheduling tasks (cron, interval, timeout)

## Constructors

### Constructor

```ts
new ScheduleModule(): ScheduleModule;
```

#### Returns

`ScheduleModule`

## Methods

### forRoot()

```ts
static forRoot(): DynamicModule;
```

Defined in: [packages/scheduler/src/schedule.module.ts:38](https://github.com/nestelia/nestelia/blob/main/packages/scheduler/src/schedule.module.ts#L38)

Configure the scheduling module with default options

#### Returns

`DynamicModule`

***

### forRootWithOptions()

```ts
static forRootWithOptions(options): DynamicModule;
```

Defined in: [packages/scheduler/src/schedule.module.ts:45](https://github.com/nestelia/nestelia/blob/main/packages/scheduler/src/schedule.module.ts#L45)

Configure the scheduling module with custom options

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`ScheduleModuleOptions`](../interfaces/ScheduleModuleOptions.md) |

#### Returns

`DynamicModule`
