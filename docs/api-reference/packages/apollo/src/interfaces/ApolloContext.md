# Interface: ApolloContext

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:190](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L190)

Elysia-specific GraphQL request context.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="elysiacontext"></a> `elysiaContext` | `unknown` | Original Elysia context. | [packages/apollo/src/interfaces/apollo-options.interface.ts:200](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L200) |
| <a id="params"></a> `params` | `Record`\<`string`, `string`\> | Route parameters. | [packages/apollo/src/interfaces/apollo-options.interface.ts:196](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L196) |
| <a id="request"></a> `request` | `Request` | HTTP request object. | [packages/apollo/src/interfaces/apollo-options.interface.ts:192](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L192) |
| <a id="response"></a> `response` | `Response` | HTTP response object. | [packages/apollo/src/interfaces/apollo-options.interface.ts:194](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L194) |
| <a id="store"></a> `store` | `Record`\<`string`, `unknown`\> | Elysia store. | [packages/apollo/src/interfaces/apollo-options.interface.ts:198](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L198) |
