# Interface: GqlExecutionContext\<TContext\>

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:204](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L204)

Context accessor for GraphQL resolvers - mirrors the GqlExecutionContext API.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TContext` | [`GraphQLContext`](GraphQLContext.md) |

## Methods

### getArgs()

```ts
getArgs<T>(): T;
```

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:206](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L206)

Gets the resolver arguments.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `Record`\<`string`, `unknown`\> |

#### Returns

`T`

***

### getContext()

```ts
getContext(): TContext;
```

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:214](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L214)

Gets the GraphQL context.

#### Returns

`TContext`

***

### getFieldName()

```ts
getFieldName(): string;
```

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:208](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L208)

Gets the name of the current field being resolved.

#### Returns

`string`

***

### getInfo()

```ts
getInfo(): GraphQLResolveInfo;
```

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:218](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L218)

Gets the GraphQL resolve info.

#### Returns

`GraphQLResolveInfo`

***

### getOperation()

```ts
getOperation(): string | undefined;
```

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:210](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L210)

Gets the operation type (query, mutation, subscription).

#### Returns

`string` \| `undefined`

***

### getParent()

```ts
getParent<T>(): T;
```

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:216](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L216)

Gets the parent object (for field resolvers).

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

#### Returns

`T`

***

### getVariables()

```ts
getVariables<T>(): T;
```

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:212](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L212)

Gets the GraphQL variables.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `Record`\<`string`, `unknown`\> |

#### Returns

`T`
