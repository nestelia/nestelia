# Interface: GraphQLContext

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:50](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L50)

GraphQL context available in resolvers.

## Indexable

```ts
[key: string]: unknown
```

Additional context properties.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="ctx"></a> `ctx?` | [`GraphQLRuntimeContext`](GraphQLRuntimeContext.md) | Runtime context. | [packages/apollo/src/interfaces/apollo-options.interface.ts:54](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L54) |
| <a id="req"></a> `req?` | `Request` | HTTP request object. | [packages/apollo/src/interfaces/apollo-options.interface.ts:52](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L52) |
| <a id="user"></a> `user?` | \| \{ `userId?`: `string`; \} \| `null` | Current user (if authenticated). | [packages/apollo/src/interfaces/apollo-options.interface.ts:56](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L56) |
