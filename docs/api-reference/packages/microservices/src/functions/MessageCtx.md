# Function: MessageCtx()

```ts
function MessageCtx(): ParameterDecorator;
```

Defined in: [packages/microservices/src/decorators/ctx.decorator.ts:16](https://github.com/nestelia/nestelia/blob/main/packages/microservices/src/decorators/ctx.decorator.ts#L16)

Injects the microservice execution context into a method parameter.
The context contains transport information and the matched pattern.

## Returns

`ParameterDecorator`

## Example

```typescript
@MessagePattern('greet')
greet(@Payload() data: unknown, @MessageCtx() ctx: Record<string, unknown>) {
  console.log(ctx.transport); // e.g. "redis"
}
```
