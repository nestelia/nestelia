import "reflect-metadata";

import { Module } from "nestelia";
import { GraphQLModule } from "../../../packages/apollo/src";

import { ChatResolver } from "./chat.resolver";
import { InMemoryPubSub } from "./in-memory-pubsub";

@Module({
  imports: [
    GraphQLModule.forRoot({
      path: "/graphql",
      autoSchemaFile: true,
      playground: true,
      subscriptions: {
        "graphql-ws": {
          connectionInitWaitTimeout: 5_000,
        },
      },
    }),
  ],
  providers: [InMemoryPubSub, ChatResolver],
})
export class AppModule {}
