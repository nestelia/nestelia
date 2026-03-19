# Interface: GraphQLSubscriptionTransportWsOptions

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:130](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L130)

Options for legacy subscriptions-transport-ws protocol.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="keepalive"></a> `keepAlive?` | `number` | Keep-alive interval in milliseconds. | [packages/apollo/src/interfaces/apollo-options.interface.ts:134](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L134) |
| <a id="onconnect"></a> `onConnect?` | (`connectionParams?`) => `unknown` | Callback when a client connects. | [packages/apollo/src/interfaces/apollo-options.interface.ts:136](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L136) |
| <a id="ondisconnect"></a> `onDisconnect?` | () => `void` | Callback when a client disconnects. | [packages/apollo/src/interfaces/apollo-options.interface.ts:138](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L138) |
| <a id="onoperation"></a> `onOperation?` | (`message`, `params`) => `unknown` | Callback for each operation. | [packages/apollo/src/interfaces/apollo-options.interface.ts:140](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L140) |
| <a id="path"></a> `path?` | `string` | WebSocket endpoint path. | [packages/apollo/src/interfaces/apollo-options.interface.ts:132](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L132) |
