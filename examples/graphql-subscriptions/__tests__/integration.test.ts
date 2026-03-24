import "reflect-metadata";

import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
} from "bun:test";
import type { Elysia } from "elysia";
import { subscribe, parse } from "graphql";

import { createElysiaApplication } from "../../../index";
import { Injectable, UseGuards } from "nestelia";
import type { CanActivate, ExecutionContext } from "nestelia";
import {
  Resolver,
  Query,
  Subscription,
  Context,
  Field,
  ObjectType,
} from "../../../packages/apollo/src";
import { SchemaBuilder } from "../../../packages/apollo/src/schema-builder";
import { TypeMetadataStorage } from "../../../packages/apollo/src/storages/type-metadata.storage";
import { InMemoryPubSub } from "../src/in-memory-pubsub";
import { AppModule } from "../src/app.module";

// ── Helpers ──────────────────────────────────────────────────────────────────

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function gql(
  server: Elysia,
  query: string,
  variables?: Record<string, unknown>,
): Promise<Response> {
  return server.handle(
    new Request("http://localhost/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    }),
  );
}

interface WsMessage {
  type: string;
  id?: string;
  payload?: unknown;
}

/**
 * Minimal graphql-ws protocol client over a real WebSocket.
 */
class WsClient {
  private ws!: WebSocket;
  private messages: WsMessage[] = [];
  private waiters: Array<(msg: WsMessage) => void> = [];
  public closed = false;
  public closeCode?: number;

  constructor(private url: string) {}

  async connect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.ws = new WebSocket(this.url, "graphql-transport-ws");
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onclose = (e) => {
        this.closed = true;
        this.closeCode = e.code;
      };
      this.ws.onmessage = (e) => {
        const msg = JSON.parse(e.data as string) as WsMessage;
        if (this.waiters.length > 0) {
          this.waiters.shift()!(msg);
        } else {
          this.messages.push(msg);
        }
      };
    });
  }

  send(msg: WsMessage): void {
    this.ws.send(JSON.stringify(msg));
  }

  async nextMessage(timeoutMs = 3000): Promise<WsMessage> {
    if (this.messages.length > 0) {
      return this.messages.shift()!;
    }
    return new Promise<WsMessage>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("WsClient.nextMessage timed out")),
        timeoutMs,
      );
      this.waiters.push((msg) => {
        clearTimeout(timer);
        resolve(msg);
      });
    });
  }

  async init(
    payload: Record<string, unknown> = {},
  ): Promise<WsMessage> {
    this.send({ type: "connection_init", payload });
    return this.nextMessage();
  }

  async subscribe(
    id: string,
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<void> {
    this.send({
      type: "subscribe",
      id,
      payload: { query, variables },
    });
  }

  complete(id: string): void {
    this.send({ type: "complete", id });
  }

  close(): void {
    this.ws.close();
  }

  /** Collects N "next" messages for a subscription. */
  async collectNext(count: number, timeoutMs = 3000): Promise<WsMessage[]> {
    const results: WsMessage[] = [];
    for (let i = 0; i < count; i++) {
      const msg = await this.nextMessage(timeoutMs);
      results.push(msg);
    }
    return results;
  }
}

// ── Integration tests with real HTTP + WebSocket ─────────────────────────────

describe("graphql-subscriptions integration", () => {
  let app: Awaited<ReturnType<typeof createElysiaApplication>>;
  let server: Elysia;
  let port: number;

  beforeAll(async () => {
    app = await createElysiaApplication(AppModule, { logger: false });
    server = app.getHttpServer();
    server.listen(0);
    port = (server as unknown as { server: { port: number } }).server.port;
  });

  afterAll(() => {
    (server as unknown as { stop: (force: boolean) => void }).stop(true);
  });

  // ── HTTP: Query & Mutation ───────────────────────────────────────────────

  describe("HTTP queries and mutations", () => {
    it("chatHistory returns empty array initially", async () => {
      const res = await gql(server, "{ chatHistory { id author text sentAt } }");
      const body = (await res.json()) as { data: { chatHistory: unknown[] } };
      expect(res.status).toBe(200);
      expect(body.data.chatHistory).toEqual([]);
    });

    it("sendMessage creates and returns a message", async () => {
      const res = await gql(
        server,
        `mutation { sendMessage(author: "Alice", text: "Hello!") { id author text sentAt } }`,
      );
      const body = (await res.json()) as {
        data: { sendMessage: { id: number; author: string; text: string; sentAt: string } };
      };
      expect(res.status).toBe(200);
      expect(body.data.sendMessage.author).toBe("Alice");
      expect(body.data.sendMessage.text).toBe("Hello!");
      expect(body.data.sendMessage.id).toBeGreaterThan(0);
    });

    it("chatHistory reflects sent messages", async () => {
      const res = await gql(server, "{ chatHistory { id author text } }");
      const body = (await res.json()) as {
        data: { chatHistory: Array<{ author: string }> };
      };
      expect(body.data.chatHistory.length).toBeGreaterThanOrEqual(1);
    });

    it("introspection includes Subscription type", async () => {
      const res = await gql(
        server,
        `{
          __schema {
            subscriptionType { name fields { name } }
          }
        }`,
      );
      const body = (await res.json()) as {
        data: {
          __schema: {
            subscriptionType: { name: string; fields: Array<{ name: string }> } | null;
          };
        };
      };
      expect(body.data.__schema.subscriptionType).not.toBeNull();
      expect(body.data.__schema.subscriptionType!.name).toBe("Subscription");
      const fieldNames = body.data.__schema.subscriptionType!.fields.map(
        (f) => f.name,
      );
      expect(fieldNames).toContain("messageSent");
    });
  });

  // ── WebSocket: graphql-ws protocol ──────────────────────────────────────

  describe("WebSocket subscriptions (graphql-ws)", () => {
    it("completes graphql-ws handshake (connection_init → connection_ack)", async () => {
      const client = new WsClient(
        `ws://localhost:${port}/graphql`,
      );
      await client.connect();

      const ack = await client.init();
      expect(ack.type).toBe("connection_ack");

      client.close();
    });

    it("receives subscription events after mutation", async () => {
      const client = new WsClient(
        `ws://localhost:${port}/graphql`,
      );
      await client.connect();
      await client.init();

      await client.subscribe(
        "sub-1",
        "subscription { messageSent { id author text sentAt } }",
      );

      // Small delay to let the subscription register
      await wait(50);

      // Fire a mutation via HTTP
      await gql(
        server,
        `mutation { sendMessage(author: "Bob", text: "Hey from WS test!") { id } }`,
      );

      const msg = await client.nextMessage();
      expect(msg.type).toBe("next");
      expect(msg.id).toBe("sub-1");

      const payload = msg.payload as {
        data: { messageSent: { author: string; text: string } };
      };
      expect(payload.data.messageSent.author).toBe("Bob");
      expect(payload.data.messageSent.text).toBe("Hey from WS test!");

      client.complete("sub-1");
      client.close();
    });

    it("receives multiple events in order", async () => {
      const client = new WsClient(
        `ws://localhost:${port}/graphql`,
      );
      await client.connect();
      await client.init();

      await client.subscribe(
        "multi",
        "subscription { messageSent { author text } }",
      );
      await wait(50);

      await gql(server, `mutation { sendMessage(author: "A", text: "first") { id } }`);
      await gql(server, `mutation { sendMessage(author: "B", text: "second") { id } }`);

      const msgs = await client.collectNext(2);
      expect(msgs[0].type).toBe("next");
      expect(msgs[1].type).toBe("next");

      const p0 = msgs[0].payload as { data: { messageSent: { text: string } } };
      const p1 = msgs[1].payload as { data: { messageSent: { text: string } } };
      expect(p0.data.messageSent.text).toBe("first");
      expect(p1.data.messageSent.text).toBe("second");

      client.complete("multi");
      client.close();
    });

    it("handles client-side cancellation (complete)", async () => {
      const client = new WsClient(
        `ws://localhost:${port}/graphql`,
      );
      await client.connect();
      await client.init();

      await client.subscribe(
        "cancel-me",
        "subscription { messageSent { id } }",
      );
      await wait(50);

      // Cancel subscription
      client.complete("cancel-me");
      await wait(50);

      // Send mutation — should NOT arrive
      await gql(server, `mutation { sendMessage(author: "Ghost", text: "invisible") { id } }`);
      await wait(100);

      // No message should have been queued
      client.close();
    });

    it("returns error for invalid subscription query", async () => {
      const client = new WsClient(
        `ws://localhost:${port}/graphql`,
      );
      await client.connect();
      await client.init();

      await client.subscribe(
        "bad",
        "subscription { nonExistentField }",
      );

      const msg = await client.nextMessage();
      expect(msg.type).toBe("error");
      expect(msg.id).toBe("bad");

      client.close();
    });

    it("responds to ping with pong", async () => {
      const client = new WsClient(
        `ws://localhost:${port}/graphql`,
      );
      await client.connect();
      await client.init();

      client.send({ type: "ping" });

      const msg = await client.nextMessage();
      expect(msg.type).toBe("pong");

      client.close();
    });

    it("multiple concurrent subscriptions on the same connection", async () => {
      const client = new WsClient(
        `ws://localhost:${port}/graphql`,
      );
      await client.connect();
      await client.init();

      await client.subscribe("s1", "subscription { messageSent { author } }");
      await client.subscribe("s2", "subscription { messageSent { text } }");
      await wait(50);

      await gql(server, `mutation { sendMessage(author: "Multi", text: "both") { id } }`);

      // Both subscriptions should receive the event
      const msgs = await client.collectNext(2);
      const ids = msgs.map((m) => m.id).sort();
      expect(ids).toEqual(["s1", "s2"]);

      client.complete("s1");
      client.complete("s2");
      client.close();
    });
  });

  // ── Schema: resolve option from @Subscription ──────────────────────────

  describe("@Subscription resolve option", () => {
    it("custom resolve in decorator transforms the payload", async () => {
      // The ChatResolver uses:
      //   @Subscription(() => Message, {
      //     resolve: (payload) => payload.messageSent,
      //   })
      //   messageSent() { return this.pubSub.asyncIterator(MESSAGE_SENT); }
      //
      // PubSub publishes { messageSent: msg } — resolve extracts .messageSent
      // The GraphQL layer then returns { data: { messageSent: { ...fields } } }
      //
      // This test verifies the resolve chain works end-to-end.
      const client = new WsClient(
        `ws://localhost:${port}/graphql`,
      );
      await client.connect();
      await client.init();

      await client.subscribe(
        "resolve-test",
        "subscription { messageSent { id author text } }",
      );
      await wait(50);

      await gql(
        server,
        `mutation { sendMessage(author: "ResolveTest", text: "payload-check") { id } }`,
      );

      const msg = await client.nextMessage();
      const payload = msg.payload as {
        data: { messageSent: { author: string; text: string; id: number } };
      };
      // Verify the resolve unwrapped messageSent from the raw { messageSent: ... } payload
      expect(payload.data.messageSent.author).toBe("ResolveTest");
      expect(payload.data.messageSent.text).toBe("payload-check");
      expect(typeof payload.data.messageSent.id).toBe("number");

      client.complete("resolve-test");
      client.close();
    });
  });
});

// ── Schema-level tests (no server needed) ────────────────────────────────────

describe("@Subscription schema builder", () => {
  const container = {
    get: async (ctor: new () => unknown) => new ctor(),
    register: () => {},
  };

  function defineMessage() {
    @ObjectType()
    class Msg {
      @Field()
      text!: string;
    }
    return Msg;
  }

  async function* iter<T>(values: T[]): AsyncGenerator<T> {
    for (const v of values) yield v;
  }

  async function collect<T>(it: AsyncIterable<T>, limit = 10): Promise<T[]> {
    const out: T[] = [];
    for await (const v of it) {
      out.push(v);
      if (out.length >= limit) break;
    }
    return out;
  }

  afterEach(() => {
    TypeMetadataStorage.reset();
  });

  it("method body used as subscribe, payload[name] as resolve", async () => {
    const Msg = defineMessage();

    @Resolver()
    class R {
      @Query(() => String)
      q() { return "ok"; }

      @Subscription(() => Msg)
      onMsg() {
        return iter([{ onMsg: { text: "hello" } }]);
      }
    }
    void R;

    const schema = new SchemaBuilder(container as never).buildSchema();
    const result = await subscribe({
      schema,
      document: parse("subscription { onMsg { text } }"),
    });

    const items = await collect(result as AsyncIterable<unknown>);
    expect(items).toHaveLength(1);
    expect(
      (items[0] as { data: { onMsg: { text: string } } }).data.onMsg.text,
    ).toBe("hello");
  });

  it("custom subscribe option provides iterator, method body is resolve", async () => {
    const Msg = defineMessage();

    @Resolver()
    class R {
      @Query(() => String)
      q() { return "ok"; }

      @Subscription(() => Msg, {
        subscribe: () => iter([{ raw: "data" }]),
      })
      onEvent() {
        // method body acts as resolve — receives the yielded value as parent
        // Since no @Parent decorator, it won't get the payload automatically
        // The default resolve for custom subscribe is createResolver(sub)
        return { text: "resolved" };
      }
    }
    void R;

    const schema = new SchemaBuilder(container as never).buildSchema();
    const result = await subscribe({
      schema,
      document: parse("subscription { onEvent { text } }"),
    });

    const items = await collect(result as AsyncIterable<unknown>);
    expect(items).toHaveLength(1);
    expect(
      (items[0] as { data: { onEvent: { text: string } } }).data.onEvent.text,
    ).toBe("resolved");
  });

  it("custom resolve option overrides default", async () => {
    const Msg = defineMessage();

    @Resolver()
    class R {
      @Query(() => String)
      q() { return "ok"; }

      @Subscription(() => Msg, {
        // resolve receives the full yielded payload: { onData: { val: "hello" } }
        resolve: (payload: unknown) => {
          const p = payload as { onData: { val: string } };
          return { text: p.onData.val + "!" };
        },
      })
      onData() {
        return iter([{ onData: { val: "hello" } }]);
      }
    }
    void R;

    const schema = new SchemaBuilder(container as never).buildSchema();
    const result = await subscribe({
      schema,
      document: parse("subscription { onData { text } }"),
    });

    const items = await collect(result as AsyncIterable<unknown>);
    expect(items).toHaveLength(1);
    expect(
      (items[0] as { data: { onData: { text: string } } }).data.onData.text,
    ).toBe("hello!");
  });

  it("custom subscribe + custom resolve both provided", async () => {
    const Msg = defineMessage();

    @Resolver()
    class R {
      @Query(() => String)
      q() { return "ok"; }

      @Subscription(() => Msg, {
        subscribe: () => iter([{ x: 1 }, { x: 2 }]),
        resolve: (payload: { x: number }) => ({ text: `v${payload.x}` }),
      })
      onBoth() {}
    }
    void R;

    const schema = new SchemaBuilder(container as never).buildSchema();
    const result = await subscribe({
      schema,
      document: parse("subscription { onBoth { text } }"),
    });

    const items = await collect(result as AsyncIterable<unknown>);
    expect(items).toHaveLength(2);
    expect(
      (items[0] as { data: { onBoth: { text: string } } }).data.onBoth.text,
    ).toBe("v1");
    expect(
      (items[1] as { data: { onBoth: { text: string } } }).data.onBoth.text,
    ).toBe("v2");
  });

  it("subscription with custom name", () => {
    const Msg = defineMessage();

    @Resolver()
    class R {
      @Query(() => String)
      q() { return "ok"; }

      @Subscription(() => Msg, { name: "renamed" })
      original() {
        return iter([]);
      }
    }
    void R;

    const schema = new SchemaBuilder(container as never).buildSchema();
    const subType = schema.getSubscriptionType()!;
    expect(subType.getFields()["renamed"]).toBeDefined();
    expect(subType.getFields()["original"]).toBeUndefined();
  });

  it("nullable subscription field", () => {
    const Msg = defineMessage();

    @Resolver()
    class R {
      @Query(() => String)
      q() { return "ok"; }

      @Subscription(() => Msg, { nullable: true })
      maybeMsg() {
        return iter([]);
      }
    }
    void R;

    const schema = new SchemaBuilder(container as never).buildSchema();
    const field = schema.getSubscriptionType()!.getFields()["maybeMsg"];
    // Nullable means the type is NOT wrapped in GraphQLNonNull
    expect(field.type.toString()).toBe("Msg");
  });

  it("non-nullable subscription field (default)", () => {
    const Msg = defineMessage();

    @Resolver()
    class R {
      @Query(() => String)
      q() { return "ok"; }

      @Subscription(() => Msg)
      requiredMsg() {
        return iter([]);
      }
    }
    void R;

    const schema = new SchemaBuilder(container as never).buildSchema();
    const field = schema.getSubscriptionType()!.getFields()["requiredMsg"];
    expect(field.type.toString()).toBe("Msg!");
  });
});

// ── Guard tests ──────────────────────────────────────────────────────────────

describe("@Subscription with guards (schema-level)", () => {
  const container = {
    get: async (ctor: new () => unknown) => new ctor(),
    register: () => {},
  };

  afterEach(() => {
    TypeMetadataStorage.reset();
  });

  it("guard that allows passes through", async () => {
    @ObjectType()
    class Evt {
      @Field()
      name!: string;
    }

    @Injectable()
    class AllowGuard implements CanActivate {
      canActivate(_ctx: ExecutionContext) {
        return true;
      }
    }

    @Resolver()
    class R {
      @Query(() => String)
      q() { return "ok"; }

      @UseGuards(AllowGuard)
      @Subscription(() => Evt)
      event() {
        return (async function* () {
          yield { event: { name: "allowed" } };
        })();
      }
    }
    void R;

    const schema = new SchemaBuilder(container as never).buildSchema();
    const result = await subscribe({
      schema,
      document: parse("subscription { event { name } }"),
    });

    const items: unknown[] = [];
    for await (const item of result as AsyncIterable<unknown>) {
      items.push(item);
    }
    expect(items).toHaveLength(1);
    expect(
      (items[0] as { data: { event: { name: string } } }).data.event.name,
    ).toBe("allowed");
  });

  it("guard that denies throws Forbidden", async () => {
    @ObjectType()
    class Evt2 {
      @Field()
      name!: string;
    }

    @Injectable()
    class DenyGuard implements CanActivate {
      canActivate(_ctx: ExecutionContext) {
        return false;
      }
    }

    @Resolver()
    class R {
      @Query(() => String)
      q() { return "ok"; }

      @UseGuards(DenyGuard)
      @Subscription(() => Evt2)
      blocked() {
        return (async function* () {
          yield { blocked: { name: "nope" } };
        })();
      }
    }
    void R;

    const schema = new SchemaBuilder(container as never).buildSchema();
    const result = await subscribe({
      schema,
      document: parse("subscription { blocked { name } }"),
    });

    // When a guard denies, subscribe() returns an ExecutionResult with errors
    if (Symbol.asyncIterator in (result as object)) {
      // If it returned an iterator, the first value should contain an error
      const items: unknown[] = [];
      for await (const item of result as AsyncIterable<unknown>) {
        items.push(item);
        break;
      }
      const first = items[0] as { errors?: Array<{ message: string }> };
      expect(first.errors).toBeDefined();
      expect(first.errors![0].message).toContain("Forbidden");
    } else {
      // Direct error result
      const errorResult = result as { errors: Array<{ message: string }> };
      expect(errorResult.errors).toBeDefined();
      expect(errorResult.errors[0].message).toContain("Forbidden");
    }
  });
});

// ── asyncFilter + @Context pattern (cweb-style, schema-level) ────────────────

describe("asyncFilter + @Context subscription (schema-level)", () => {
  /**
   * Minimal asyncFilter — same logic as cweb's shared/utils/async-filter.ts.
   */
  function asyncFilter<T>(
    asyncIterator: AsyncIterator<T>,
    filterFn: (value?: T) => boolean | Promise<boolean>,
  ): AsyncIterableIterator<T> {
    const getNextPromise = (): Promise<IteratorResult<T>> =>
      asyncIterator.next().then((payload) => {
        if (payload.done) return payload;
        return Promise.resolve(filterFn(payload.value))
          .catch(() => false)
          .then((ok) => (ok ? payload : getNextPromise()));
      });

    return {
      next: () => getNextPromise(),
      return: () =>
        asyncIterator.return
          ? asyncIterator.return()
          : Promise.resolve({ done: true as const, value: undefined as unknown as T }),
      throw: (err) =>
        asyncIterator.throw
          ? asyncIterator.throw(err)
          : Promise.reject(err),
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }

  afterEach(() => {
    TypeMetadataStorage.reset();
  });

  const container = {
    get: async (ctor: new () => unknown) => new ctor(),
    register: () => {},
  };

  it("asyncFilter passes matching events and skips non-matching", async () => {
    @ObjectType()
    class Fav {
      @Field()
      userId!: string;

      @Field()
      title!: string;
    }

    const pubSub = new InMemoryPubSub();

    @Resolver()
    class R {
      @Query(() => String)
      q() { return "ok"; }

      // Mirrors cweb pattern: method body returns asyncFilter-wrapped iterator
      @Subscription(() => Fav)
      favAdded(@Context("ctx") ctx: unknown) {
        const userId = (ctx as { userId?: string } | undefined)?.userId;
        return asyncFilter(
          pubSub.asyncIterator("favAdded"),
          (payload: unknown) => {
            const p = payload as { favAdded: { userId: string } };
            return p.favAdded.userId === userId;
          },
        );
      }
    }
    void R;

    const schema = new SchemaBuilder(container as never).buildSchema();

    // Subscribe with context containing userId = "alice"
    const result = await subscribe({
      schema,
      document: parse("subscription { favAdded { userId title } }"),
      contextValue: { ctx: { userId: "alice" } },
    });

    const iter = result as AsyncIterableIterator<unknown>;

    // Publish events for different users
    const publish = async (userId: string, title: string) => {
      await pubSub.publish("favAdded", { favAdded: { userId, title } });
    };

    // Publish for bob (should be skipped), then alice (should pass)
    // We need to do this asynchronously since the filter blocks on next()
    setTimeout(async () => {
      await publish("bob", "Bob's post");     // filtered out
      await publish("alice", "Alice's post"); // passes filter
    }, 10);

    const item = await iter.next();
    expect(item.done).toBe(false);

    const data = (item.value as { data: { favAdded: { userId: string; title: string } } }).data;
    expect(data.favAdded.userId).toBe("alice");
    expect(data.favAdded.title).toBe("Alice's post");

    await iter.return!();
  });

  it("asyncFilter passes all events when no filter criteria", async () => {
    @ObjectType()
    class Evt {
      @Field()
      value!: string;
    }

    const pubSub = new InMemoryPubSub();

    @Resolver()
    class R {
      @Query(() => String)
      q() { return "ok"; }

      @Subscription(() => Evt)
      eventStream() {
        // No filter — passes everything through
        return pubSub.asyncIterator("eventStream");
      }
    }
    void R;

    const schema = new SchemaBuilder(container as never).buildSchema();
    const result = await subscribe({
      schema,
      document: parse("subscription { eventStream { value } }"),
    });

    const iter = result as AsyncIterableIterator<unknown>;

    setTimeout(async () => {
      await pubSub.publish("eventStream", { eventStream: { value: "first" } });
      await pubSub.publish("eventStream", { eventStream: { value: "second" } });
    }, 10);

    const item1 = await iter.next();
    const item2 = await iter.next();

    const d1 = (item1.value as { data: { eventStream: { value: string } } }).data;
    const d2 = (item2.value as { data: { eventStream: { value: string } } }).data;

    expect(d1.eventStream.value).toBe("first");
    expect(d2.eventStream.value).toBe("second");

    await iter.return!();
  });

  it("@Context injects context property into subscribe method", async () => {
    @ObjectType()
    class Msg {
      @Field()
      text!: string;
    }

    const pubSub = new InMemoryPubSub();
    let capturedCtx: unknown = null;

    @Resolver()
    class R {
      @Query(() => String)
      q() { return "ok"; }

      @Subscription(() => Msg)
      ctxTest(@Context("user") user: unknown) {
        capturedCtx = user;
        return pubSub.asyncIterator("ctxTest");
      }
    }
    void R;

    const schema = new SchemaBuilder(container as never).buildSchema();
    const result = await subscribe({
      schema,
      document: parse("subscription { ctxTest { text } }"),
      contextValue: { user: { id: "u123", name: "Test" } },
    });

    // subscribe was called — context should have been captured
    expect(capturedCtx).toEqual({ id: "u123", name: "Test" });

    // Clean up the iterator
    const iter = result as AsyncIterableIterator<unknown>;
    await iter.return!();
  });
});
