# Interface: GraphQLWsSubscriptionsOptions

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:92](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L92)

Options for GraphQL WebSocket subscriptions (graphql-ws protocol).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="connectioninitwaittimeout"></a> `connectionInitWaitTimeout?` | `number` | Timeout for connection initialization in milliseconds. | [packages/apollo/src/interfaces/apollo-options.interface.ts:96](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L96) |
| <a id="onclose"></a> `onClose?` | (`context`) => `void` \| `Promise`\<`void`\> | Callback when a connection closes. | [packages/apollo/src/interfaces/apollo-options.interface.ts:108](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L108) |
| <a id="onconnect"></a> `onConnect?` | (`context`) => \| `boolean` \| `void` \| `Record`\<`string`, `unknown`\> \| `Promise`\<`boolean` \| `void` \| `Record`\<`string`, `unknown`\>\> | Callback when a client connects. | [packages/apollo/src/interfaces/apollo-options.interface.ts:98](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L98) |
| <a id="ondisconnect"></a> `onDisconnect?` | (`context`) => `void` \| `Promise`\<`void`\> | Callback when a client disconnects. | [packages/apollo/src/interfaces/apollo-options.interface.ts:106](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L106) |
| <a id="onnext"></a> `onNext?` | (`context`, `id`, `payload`, `args`, `result`) => `void` \| `Promise`\<`void`\> | Callback when a subscription emits a value. | [packages/apollo/src/interfaces/apollo-options.interface.ts:120](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L120) |
| <a id="onsubscribe"></a> `onSubscribe?` | (`context`, `id`, `payload`) => \| `void` \| `ExecutionArgs` \| readonly `GraphQLError`[] \| `Promise`\<`void` \| `ExecutionArgs` \| readonly `GraphQLError`[]\> | Callback when a subscription is created. | [packages/apollo/src/interfaces/apollo-options.interface.ts:110](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L110) |
| <a id="path"></a> `path?` | `string` | WebSocket endpoint path. | [packages/apollo/src/interfaces/apollo-options.interface.ts:94](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L94) |
