# Interface: GraphQLRuntimeContext

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:32](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L32)

Runtime context for GraphQL operations.

## Indexable

```ts
[key: string]: unknown
```

Additional context properties.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="connectionparams"></a> `connectionParams?` | `Record`\<`string`, `unknown`\> | WebSocket connection parameters. | [packages/apollo/src/interfaces/apollo-options.interface.ts:44](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L44) |
| <a id="extra"></a> `extra?` | \{ `socket?`: `unknown`; \} | Extra data including WebSocket socket reference. | [packages/apollo/src/interfaces/apollo-options.interface.ts:34](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L34) |
| `extra.socket?` | `unknown` | - | [packages/apollo/src/interfaces/apollo-options.interface.ts:35](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L35) |
| <a id="headers"></a> `headers?` | `Record`\<`string`, `string` \| `undefined`\> | HTTP headers. | [packages/apollo/src/interfaces/apollo-options.interface.ts:42](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L42) |
| <a id="req"></a> `req?` | `Request` | HTTP request object. | [packages/apollo/src/interfaces/apollo-options.interface.ts:38](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L38) |
| <a id="request"></a> `request?` | `Request` | HTTP request object (alias). | [packages/apollo/src/interfaces/apollo-options.interface.ts:40](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L40) |
