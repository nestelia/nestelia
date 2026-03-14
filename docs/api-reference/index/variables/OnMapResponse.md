# Variable: OnMapResponse()

```ts
const OnMapResponse: (options?) => MethodDecorator;
```

Defined in: [packages/core/src/decorators/lifecycle.decorators.ts:171](https://github.com/nestelia/nestelia/blob/main/packages/core/src/decorators/lifecycle.decorators.ts#L171)

Hook called to map response

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | \{ `before?`: `boolean`; \} | - |
| `options.before?` | `boolean` | Insert before other hooks |

## Returns

`MethodDecorator`

## See

https://elysiajs.com/essential/life-cycle.html#on-map-response

## Example

```typescript
@Controller('/users')
export class UserController {
  @OnMapResponse()
  async formatResponse(context: Context) {
    return new Response(JSON.stringify(context.response), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```
