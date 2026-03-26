import "reflect-metadata";

import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from "bun:test";
import type { Elysia } from "elysia";

import { Injectable, Inject, Module } from "nestelia";
import {
  Args,
  Context,
  Field,
  ObjectType,
  Resolver,
  Subscription,
} from "../../../packages/apollo/src";
import { GraphQLModule } from "../../../packages/apollo/src";
import { GRAPHQL_PUBSUB } from "../../../packages/graphql-pubsub/src";
import type { PubSubEngine } from "../../../packages/graphql-pubsub/src";
import { createElysiaApplication } from "../../../index";
import { InMemoryPubSub } from "../../graphql-subscriptions/src/in-memory-pubsub";
import { NotificationsResolver } from "../src/notifications.resolver";

// ── asyncFilter (mirrors cweb's shared/utils/async-filter.ts) ─────────────────

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
        : Promise.reject(err as Error),
    [Symbol.asyncIterator]() { return this; },
  };
}

/** Extracts userId from the @Context("ctx") value (matches cweb's GraphqlContext shape). */
function ctxUserId(ctx: unknown): string | undefined {
  return (ctx as { connectionParams?: { userId?: string } } | undefined)
    ?.connectionParams?.userId;
}

// ── GraphQL types for subscription filter pattern tests ───────────────────────

@ObjectType()
class UserEvtResult {
  @Field() userId!: string;
  @Field() data!: string;
}

@ObjectType()
class BroadcastEvtResult {
  @Field() message!: string;
}

@ObjectType()
class ResourceEvtResult {
  @Field() resourceId!: string;
  @Field() value!: string;
}

@ObjectType()
class ArrayEvtItem {
  @Field() userId!: string;
  @Field() item!: string;
}

@ObjectType()
class MultiEvtResult {
  @Field() userId!: string;
  @Field() batchId!: string;
  @Field() data!: string;
}

@ObjectType()
class MixedEvtResult {
  @Field({ nullable: true }) userId?: string;
  @Field() message!: string;
  @Field(() => Boolean) isSystem!: boolean;
}

// ── Resolver for subscription filter pattern tests ────────────────────────────

@Resolver()
@Injectable()
class FilterPatternsResolver {
  constructor(
    @Inject(GRAPHQL_PUBSUB) private readonly pubSub: PubSubEngine,
  ) {}

  // Per-user filter via asyncFilter + @Context("ctx")
  @Subscription(() => UserEvtResult)
  userEvt(@Context("ctx") ctx: unknown) {
    const userId = ctxUserId(ctx);
    return asyncFilter(
      this.pubSub.asyncIterator<{ userEvt: UserEvtResult }>("userEvt"),
      (payload) => payload?.userEvt?.userId === userId,
    );
  }

  // Broadcast — no filter, all subscribers receive
  @Subscription(() => BroadcastEvtResult)
  broadcastEvt() {
    return this.pubSub.asyncIterator<{ broadcastEvt: BroadcastEvtResult }>("broadcastEvt");
  }

  // Argument-based filter
  @Subscription(() => ResourceEvtResult)
  resourceEvt(@Args("resourceId") resourceId: string) {
    return asyncFilter(
      this.pubSub.asyncIterator<{ resourceEvt: ResourceEvtResult }>("resourceEvt"),
      (payload) => payload?.resourceEvt?.resourceId === resourceId,
    );
  }

  // Array .some() filter
  @Subscription(() => [ArrayEvtItem])
  arrayEvt(@Context("ctx") ctx: unknown) {
    const userId = ctxUserId(ctx);
    return asyncFilter(
      this.pubSub.asyncIterator<{ arrayEvt: ArrayEvtItem[] }>("arrayEvt"),
      (payload) =>
        Array.isArray(payload?.arrayEvt) &&
        payload.arrayEvt.some((e) => e.userId === userId),
    );
  }

  // Multi-field filter (userId AND batchId)
  @Subscription(() => MultiEvtResult)
  multiEvt(
    @Args("batchId") batchId: string,
    @Context("ctx") ctx: unknown,
  ) {
    const userId = ctxUserId(ctx);
    return asyncFilter(
      this.pubSub.asyncIterator<{ multiEvt: MultiEvtResult }>("multiEvt"),
      (payload) =>
        payload?.multiEvt?.userId === userId &&
        payload?.multiEvt?.batchId === batchId,
    );
  }

  // Conditional filter — system events go to all, user events only to target
  @Subscription(() => MixedEvtResult)
  mixedEvt(@Context("ctx") ctx: unknown) {
    const userId = ctxUserId(ctx);
    return asyncFilter(
      this.pubSub.asyncIterator<{ mixedEvt: MixedEvtResult }>("mixedEvt"),
      (payload) => {
        const e = payload?.mixedEvt;
        if (!e) return false;
        if (e.isSystem) return true;
        return e.userId === userId;
      },
    );
  }
}

// ── Test module using InMemoryPubSub instead of Redis ─────────────────────────

const pubSub = new InMemoryPubSub();

@Module({
  imports: [
    GraphQLModule.forRoot({
      path: "/graphql",
      autoSchemaFile: true,
      subscriptions: {
        "graphql-ws": {
          connectionInitWaitTimeout: 5_000,
          keepAlive: false,
        },
      },
    }),
  ],
  providers: [
    { provide: GRAPHQL_PUBSUB, useValue: pubSub },
    NotificationsResolver,
    FilterPatternsResolver,
  ],
})
class TestAppModule {}

// ── Helpers ───────────────────────────────────────────────────────────────────

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
  public messages: WsMessage[] = [];
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

  async init(payload: Record<string, unknown> = {}): Promise<WsMessage> {
    this.send({ type: "connection_init", payload });
    return this.nextMessage();
  }

  async subscribe(
    id: string,
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<void> {
    this.send({ type: "subscribe", id, payload: { query, variables } });
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

// ── Suite setup ───────────────────────────────────────────────────────────────

describe("graphql-pubsub integration", () => {
  let app: Awaited<ReturnType<typeof createElysiaApplication>>;
  let server: Elysia;
  let port: number;

  beforeAll(async () => {
    app = await createElysiaApplication(TestAppModule, { logger: false });
    server = app.getHttpServer();
    server.listen(0);
    port = (server as unknown as { server: { port: number } }).server.port;
  });

  afterAll(() => {
    (server as unknown as { stop: (force: boolean) => void }).stop(true);
  });

  // ── HTTP ─────────────────────────────────────────────────────────────────

  describe("HTTP queries and mutations", () => {
    it("ping returns pong", async () => {
      const res = await gql(server, "{ ping }");
      const body = (await res.json()) as { data: { ping: string } };
      expect(res.status).toBe(200);
      expect(body.data.ping).toBe("pong");
    });

    it("sendNotification returns notification with message", async () => {
      const res = await gql(
        server,
        `mutation { sendNotification(message: "hello") { id message createdAt } }`,
      );
      const body = (await res.json()) as {
        data: {
          sendNotification: { id: number; message: string; createdAt: string };
        };
      };
      expect(res.status).toBe(200);
      expect(body.data.sendNotification.message).toBe("hello");
      expect(body.data.sendNotification.id).toBeGreaterThan(0);
      expect(body.data.sendNotification.createdAt).toBeDefined();
    });

    it("introspection includes Subscription type with notificationAdded", async () => {
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
            subscriptionType: {
              name: string;
              fields: Array<{ name: string }>;
            } | null;
          };
        };
      };
      expect(body.data.__schema.subscriptionType).not.toBeNull();
      expect(
        body.data.__schema.subscriptionType!.fields.map((f) => f.name),
      ).toContain("notificationAdded");
    });
  });

  // ── WebSocket subscriptions ───────────────────────────────────────────────

  describe("WebSocket subscriptions (graphql-ws)", () => {
    it("completes handshake (connection_init → connection_ack)", async () => {
      const client = new WsClient(`ws://localhost:${port}/graphql`);
      await client.connect();

      const ack = await client.init();
      expect(ack.type).toBe("connection_ack");

      client.close();
    });

    it("receives a notification after sendNotification mutation", async () => {
      const client = new WsClient(`ws://localhost:${port}/graphql`);
      await client.connect();
      await client.init();

      await client.subscribe(
        "sub-1",
        "subscription { notificationAdded { id message createdAt } }",
      );

      // Wait for subscription to be registered before publishing
      await wait(50);

      await gql(
        server,
        `mutation { sendNotification(message: "integration test") { id } }`,
      );

      const msg = await client.nextMessage();
      expect(msg.type).toBe("next");
      expect(msg.id).toBe("sub-1");

      const payload = msg.payload as {
        data: {
          notificationAdded: {
            id: number;
            message: string;
            createdAt: string;
          };
        };
      };
      expect(payload.data.notificationAdded.message).toBe("integration test");
      expect(payload.data.notificationAdded.id).toBeGreaterThan(0);
      expect(payload.data.notificationAdded.createdAt).toBeDefined();

      client.complete("sub-1");
      client.close();
    });

    it("receives multiple notifications in order", async () => {
      const client = new WsClient(`ws://localhost:${port}/graphql`);
      await client.connect();
      await client.init();

      await client.subscribe(
        "ordered",
        "subscription { notificationAdded { message } }",
      );
      await wait(50);

      await gql(
        server,
        `mutation { sendNotification(message: "first") { id } }`,
      );
      await gql(
        server,
        `mutation { sendNotification(message: "second") { id } }`,
      );
      await gql(
        server,
        `mutation { sendNotification(message: "third") { id } }`,
      );

      const msgs = await client.collectNext(3);
      const texts = msgs.map(
        (m) =>
          (
            m.payload as {
              data: { notificationAdded: { message: string } };
            }
          ).data.notificationAdded.message,
      );

      expect(texts).toEqual(["first", "second", "third"]);

      client.complete("ordered");
      client.close();
    });

    it("delivers all events when mutations are sent rapidly (no intermittent drops)", async () => {
      const COUNT = 10;
      const client = new WsClient(`ws://localhost:${port}/graphql`);
      await client.connect();
      await client.init();

      await client.subscribe(
        "rapid",
        "subscription { notificationAdded { message } }",
      );
      await wait(50);

      // Fire all mutations without waiting between them
      await Promise.all(
        Array.from({ length: COUNT }, (_, i) =>
          gql(
            server,
            `mutation { sendNotification(message: "msg-${i}") { id } }`,
          ),
        ),
      );

      const msgs = await client.collectNext(COUNT, 5000);
      expect(msgs).toHaveLength(COUNT);
      expect(msgs.every((m) => m.type === "next")).toBe(true);

      const texts = msgs
        .map(
          (m) =>
            (
              m.payload as {
                data: { notificationAdded: { message: string } };
              }
            ).data.notificationAdded.message,
        )
        .sort();

      // All 10 messages must arrive (order may vary due to concurrent mutations)
      for (let i = 0; i < COUNT; i++) {
        expect(texts).toContain(`msg-${i}`);
      }

      client.complete("rapid");
      client.close();
    });

    it("multiple concurrent subscribers all receive the same event", async () => {
      const clients = await Promise.all(
        [1, 2, 3].map(async (n) => {
          const c = new WsClient(`ws://localhost:${port}/graphql`);
          await c.connect();
          await c.init();
          await c.subscribe(
            `fan-${n}`,
            "subscription { notificationAdded { message } }",
          );
          return c;
        }),
      );

      await wait(50);

      await gql(
        server,
        `mutation { sendNotification(message: "broadcast") { id } }`,
      );

      const results = await Promise.all(
        clients.map((c) => c.nextMessage(3000)),
      );

      for (const msg of results) {
        expect(msg.type).toBe("next");
        const payload = msg.payload as {
          data: { notificationAdded: { message: string } };
        };
        expect(payload.data.notificationAdded.message).toBe("broadcast");
      }

      for (const c of clients) {
        c.close();
      }
    });

    it("multiple concurrent subscriptions on the same connection", async () => {
      const client = new WsClient(`ws://localhost:${port}/graphql`);
      await client.connect();
      await client.init();

      await client.subscribe(
        "s1",
        "subscription { notificationAdded { id } }",
      );
      await client.subscribe(
        "s2",
        "subscription { notificationAdded { message } }",
      );
      await wait(50);

      await gql(
        server,
        `mutation { sendNotification(message: "multi-sub") { id } }`,
      );

      const msgs = await client.collectNext(2);
      const ids = msgs.map((m) => m.id).sort();
      expect(ids).toEqual(["s1", "s2"]);
      expect(msgs.every((m) => m.type === "next")).toBe(true);

      client.complete("s1");
      client.complete("s2");
      client.close();
    });

    it("cancelled subscription does not receive subsequent events", async () => {
      const client = new WsClient(`ws://localhost:${port}/graphql`);
      await client.connect();
      await client.init();

      await client.subscribe(
        "cancel-me",
        "subscription { notificationAdded { id } }",
      );
      await wait(50);

      client.complete("cancel-me");
      await wait(50);

      // Publish after cancel — nothing should arrive
      await gql(
        server,
        `mutation { sendNotification(message: "after-cancel") { id } }`,
      );
      await wait(100);

      // No pending messages expected
      expect(client.messages).toHaveLength(0);
      client.close();
    });

    it("returns error for invalid subscription query", async () => {
      const client = new WsClient(`ws://localhost:${port}/graphql`);
      await client.connect();
      await client.init();

      await client.subscribe("bad", "subscription { nonExistentField }");

      const msg = await client.nextMessage();
      expect(msg.type).toBe("error");
      expect(msg.id).toBe("bad");

      client.close();
    });

    it("responds to ping with pong echoing payload", async () => {
      const client = new WsClient(`ws://localhost:${port}/graphql`);
      await client.connect();
      await client.init();

      client.send({ type: "ping", payload: { ts: 42 } } as WsMessage);

      const msg = await client.nextMessage();
      expect(msg.type).toBe("pong");
      expect((msg as { payload?: unknown }).payload).toEqual({ ts: 42 });

      client.close();
    });

    it("new subscriber after mutation does NOT receive past events", async () => {
      // Publish first
      await gql(
        server,
        `mutation { sendNotification(message: "past-event") { id } }`,
      );

      // Subscribe after the fact
      const client = new WsClient(`ws://localhost:${port}/graphql`);
      await client.connect();
      await client.init();
      await client.subscribe(
        "late",
        "subscription { notificationAdded { message } }",
      );
      await wait(50);

      // No new mutation — nothing should arrive
      await wait(200);
      expect(client.messages).toHaveLength(0);

      client.close();
    });
  });

  // ── subscription filter patterns ─────────────────────────────────────────

  describe("subscription filter patterns", () => {
    // ── per-user filter ─────────────────────────────────────────────────────

    it("per-user filter: only the target user receives the event", async () => {
      const alice = new WsClient(`ws://localhost:${port}/graphql`);
      const bob = new WsClient(`ws://localhost:${port}/graphql`);

      await alice.connect();
      await alice.init({ userId: "alice" });
      await alice.subscribe("a", "subscription { userEvt { userId data } }");

      await bob.connect();
      await bob.init({ userId: "bob" });
      await bob.subscribe("b", "subscription { userEvt { userId data } }");

      await wait(50);

      await pubSub.publish("userEvt", { userEvt: { userId: "alice", data: "for-alice" } });

      const msg = await alice.nextMessage();
      expect(msg.type).toBe("next");
      expect(
        (msg.payload as { data: { userEvt: { data: string } } }).data.userEvt.data,
      ).toBe("for-alice");

      // Bob should receive nothing
      await wait(100);
      expect(bob.messages).toHaveLength(0);

      alice.close();
      bob.close();
    });

    it("per-user filter: asyncFilter skips non-matching events and delivers only the matching one", async () => {
      const client = new WsClient(`ws://localhost:${port}/graphql`);
      await client.connect();
      await client.init({ userId: "alice" });
      await client.subscribe("s", "subscription { userEvt { data } }");
      await wait(50);

      // Publish events for bob (skipped), carol (skipped), then alice (passes)
      await pubSub.publish("userEvt", { userEvt: { userId: "bob", data: "for-bob" } });
      await pubSub.publish("userEvt", { userEvt: { userId: "carol", data: "for-carol" } });
      await pubSub.publish("userEvt", { userEvt: { userId: "alice", data: "for-alice" } });

      const msg = await client.nextMessage(3000);
      expect(msg.type).toBe("next");
      expect(
        (msg.payload as { data: { userEvt: { data: string } } }).data.userEvt.data,
      ).toBe("for-alice");

      // No more messages queued
      await wait(50);
      expect(client.messages).toHaveLength(0);

      client.close();
    });

    // ── broadcast ──────────────────────────────────────────────────────────

    it("broadcast: all subscribers receive the event regardless of userId", async () => {
      const clients = await Promise.all(
        ["alice", "bob", "carol"].map(async (uid) => {
          const c = new WsClient(`ws://localhost:${port}/graphql`);
          await c.connect();
          await c.init({ userId: uid });
          await c.subscribe(uid, "subscription { broadcastEvt { message } }");
          return c;
        }),
      );
      await wait(50);

      await pubSub.publish("broadcastEvt", { broadcastEvt: { message: "hello-all" } });

      const msgs = await Promise.all(clients.map((c) => c.nextMessage(3000)));
      for (const msg of msgs) {
        expect(msg.type).toBe("next");
        expect(
          (msg.payload as { data: { broadcastEvt: { message: string } } }).data.broadcastEvt.message,
        ).toBe("hello-all");
      }

      for (const c of clients) c.close();
    });

    // ── argument-based filter ──────────────────────────────────────────────

    it("argument filter: subscriber receives only events matching the resourceId argument", async () => {
      const sub1 = new WsClient(`ws://localhost:${port}/graphql`);
      const sub2 = new WsClient(`ws://localhost:${port}/graphql`);

      await sub1.connect();
      await sub1.init();
      await sub1.subscribe("r1", `subscription { resourceEvt(resourceId: "res-1") { resourceId value } }`);

      await sub2.connect();
      await sub2.init();
      await sub2.subscribe("r2", `subscription { resourceEvt(resourceId: "res-2") { resourceId value } }`);

      await wait(50);

      await pubSub.publish("resourceEvt", { resourceEvt: { resourceId: "res-1", value: "v1" } });

      const msg = await sub1.nextMessage(3000);
      expect(msg.type).toBe("next");
      expect(
        (msg.payload as { data: { resourceEvt: { resourceId: string; value: string } } })
          .data.resourceEvt.value,
      ).toBe("v1");

      // sub2 should not receive the res-1 event
      await wait(100);
      expect(sub2.messages).toHaveLength(0);

      sub1.close();
      sub2.close();
    });

    it("argument filter: events for different resources are routed to the correct subscriber", async () => {
      const sub1 = new WsClient(`ws://localhost:${port}/graphql`);
      const sub2 = new WsClient(`ws://localhost:${port}/graphql`);

      await sub1.connect();
      await sub1.init();
      await sub1.subscribe("r1", `subscription { resourceEvt(resourceId: "pub-A") { resourceId value } }`);

      await sub2.connect();
      await sub2.init();
      await sub2.subscribe("r2", `subscription { resourceEvt(resourceId: "pub-B") { resourceId value } }`);

      await wait(50);

      await pubSub.publish("resourceEvt", { resourceEvt: { resourceId: "pub-A", value: "valA" } });
      await pubSub.publish("resourceEvt", { resourceEvt: { resourceId: "pub-B", value: "valB" } });

      const msgA = await sub1.nextMessage(3000);
      const msgB = await sub2.nextMessage(3000);

      expect(
        (msgA.payload as { data: { resourceEvt: { value: string } } }).data.resourceEvt.value,
      ).toBe("valA");
      expect(
        (msgB.payload as { data: { resourceEvt: { value: string } } }).data.resourceEvt.value,
      ).toBe("valB");

      // No cross-delivery
      expect(sub1.messages).toHaveLength(0);
      expect(sub2.messages).toHaveLength(0);

      sub1.close();
      sub2.close();
    });

    // ── array .some() filter ──────────────────────────────────────────────

    it("array filter: subscriber receives event when their userId is in the payload array", async () => {
      const alice = new WsClient(`ws://localhost:${port}/graphql`);
      const carol = new WsClient(`ws://localhost:${port}/graphql`);

      await alice.connect();
      await alice.init({ userId: "alice" });
      await alice.subscribe("a", "subscription { arrayEvt { userId item } }");

      await carol.connect();
      await carol.init({ userId: "carol" });
      await carol.subscribe("c", "subscription { arrayEvt { userId item } }");

      await wait(50);

      // Event targets alice and bob — carol is not in the list
      await pubSub.publish("arrayEvt", {
        arrayEvt: [
          { userId: "alice", item: "item-for-alice" },
          { userId: "bob", item: "item-for-bob" },
        ],
      });

      const msg = await alice.nextMessage(3000);
      expect(msg.type).toBe("next");
      const items = (msg.payload as { data: { arrayEvt: Array<{ userId: string }> } })
        .data.arrayEvt;
      expect(items.some((e) => e.userId === "alice")).toBe(true);

      await wait(100);
      expect(carol.messages).toHaveLength(0);

      alice.close();
      carol.close();
    });

    // ── multi-field filter ─────────────────────────────────────────────────

    it("multi-field filter: requires both userId and batchId to match", async () => {
      const client = new WsClient(`ws://localhost:${port}/graphql`);
      await client.connect();
      await client.init({ userId: "alice" });
      await client.subscribe(
        "m",
        `subscription { multiEvt(batchId: "batch-1") { userId batchId data } }`,
      );
      await wait(50);

      // Wrong userId — skipped
      await pubSub.publish("multiEvt", { multiEvt: { userId: "bob", batchId: "batch-1", data: "wrong-user" } });
      // Wrong batchId — skipped
      await pubSub.publish("multiEvt", { multiEvt: { userId: "alice", batchId: "batch-2", data: "wrong-batch" } });
      // Both match — delivered
      await pubSub.publish("multiEvt", { multiEvt: { userId: "alice", batchId: "batch-1", data: "correct" } });

      const msg = await client.nextMessage(3000);
      expect(msg.type).toBe("next");
      expect(
        (msg.payload as { data: { multiEvt: { data: string } } }).data.multiEvt.data,
      ).toBe("correct");

      await wait(50);
      expect(client.messages).toHaveLength(0);

      client.close();
    });

    // ── conditional filter ─────────────────────────────────────────────────

    it("conditional filter: system events reach all users, user events only the target", async () => {
      const alice = new WsClient(`ws://localhost:${port}/graphql`);
      const bob = new WsClient(`ws://localhost:${port}/graphql`);

      await alice.connect();
      await alice.init({ userId: "alice" });
      await alice.subscribe("a", "subscription { mixedEvt { userId message isSystem } }");

      await bob.connect();
      await bob.init({ userId: "bob" });
      await bob.subscribe("b", "subscription { mixedEvt { userId message isSystem } }");

      await wait(50);

      // System event — both should receive
      await pubSub.publish("mixedEvt", { mixedEvt: { message: "system-wide", isSystem: true } });

      const [sysAlice, sysBob] = await Promise.all([
        alice.nextMessage(3000),
        bob.nextMessage(3000),
      ]);
      expect(
        (sysAlice.payload as { data: { mixedEvt: { message: string } } }).data.mixedEvt.message,
      ).toBe("system-wide");
      expect(
        (sysBob.payload as { data: { mixedEvt: { message: string } } }).data.mixedEvt.message,
      ).toBe("system-wide");

      // User event for alice only
      await pubSub.publish("mixedEvt", {
        mixedEvt: { userId: "alice", message: "only-for-alice", isSystem: false },
      });

      const userMsg = await alice.nextMessage(3000);
      expect(
        (userMsg.payload as { data: { mixedEvt: { message: string } } }).data.mixedEvt.message,
      ).toBe("only-for-alice");

      await wait(100);
      expect(bob.messages).toHaveLength(0);

      alice.close();
      bob.close();
    });
  });
});
