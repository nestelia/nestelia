import "reflect-metadata";

import { beforeEach, describe, expect, it } from "bun:test";

import { Test } from "../../../packages/testing/src";

import { ChatResolver } from "./chat.resolver";
import { InMemoryPubSub } from "./in-memory-pubsub";

describe("ChatResolver", () => {
  let resolver: ChatResolver;
  let pubSub: InMemoryPubSub;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [InMemoryPubSub, ChatResolver],
    }).compile();

    resolver = module.get(ChatResolver);
    pubSub = module.get(InMemoryPubSub);
  });

  it("chatHistory is empty initially", () => {
    expect(resolver.chatHistory()).toHaveLength(0);
  });

  it("sendMessage returns the new message", async () => {
    const msg = await resolver.sendMessage("Alice", "Hello!");
    expect(msg.author).toBe("Alice");
    expect(msg.text).toBe("Hello!");
    expect(msg.id).toBe(1);
    expect(msg.sentAt).toBeDefined();
  });

  it("sendMessage appends to chatHistory", async () => {
    await resolver.sendMessage("Alice", "First");
    await resolver.sendMessage("Bob", "Second");
    expect(resolver.chatHistory()).toHaveLength(2);
  });

  it("assigns incrementing ids across messages", async () => {
    const a = await resolver.sendMessage("Alice", "A");
    const b = await resolver.sendMessage("Bob", "B");
    expect(b.id).toBe(a.id + 1);
  });

  it("sendMessage publishes to pubSub", async () => {
    const received: unknown[] = [];
    await pubSub.subscribe("MESSAGE_SENT", (payload) => {
      received.push(payload);
    });

    await resolver.sendMessage("Alice", "Hi");

    expect(received).toHaveLength(1);
    expect((received[0] as { messageSent: { author: string } }).messageSent.author).toBe("Alice");
  });

  it("messageSent returns an async iterator", () => {
    const iter = resolver.messageSent();
    expect(iter).toBeDefined();
    expect(typeof (iter as AsyncIterator<unknown>).next).toBe("function");
  });

  it("subscriber receives messages via async iterator", async () => {
    const iter = resolver.messageSent() as AsyncIterator<{ messageSent: { text: string } }>;

    const resultPromise = iter.next();
    await resolver.sendMessage("Alice", "Hello subscriber!");
    const result = await resultPromise;

    expect(result.done).toBe(false);
    expect(result.value.messageSent.text).toBe("Hello subscriber!");

    await iter.return?.();
  });
});
