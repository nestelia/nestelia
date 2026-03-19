import { Injectable } from "nestelia";
import {
  Args,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from "../../../packages/apollo/src";

import { InMemoryPubSub } from "./in-memory-pubsub";
import { Message } from "./message.type";

const MESSAGE_SENT = "MESSAGE_SENT";

@Resolver(() => Message)
@Injectable()
export class ChatResolver {
  private readonly history: Message[] = [];
  private counter = 0;

  constructor(private readonly pubSub: InMemoryPubSub) {}

  @Query(() => [Message], { description: "Returns all messages sent so far." })
  chatHistory(): Message[] {
    return this.history;
  }

  @Mutation(() => Message, { description: "Send a chat message." })
  async sendMessage(
    @Args("author") author: string,
    @Args("text") text: string,
  ): Promise<Message> {
    const msg: Message = {
      id: ++this.counter,
      author,
      text,
      sentAt: new Date().toISOString(),
    };
    this.history.push(msg);
    await this.pubSub.publish(MESSAGE_SENT, { messageSent: msg });
    return msg;
  }

  @Subscription(() => Message, {
    description: "Receive new messages in real time.",
    resolve: (payload: unknown) => (payload as { messageSent: Message }).messageSent,
  })
  messageSent() {
    return this.pubSub.asyncIterator(MESSAGE_SENT);
  }
}
