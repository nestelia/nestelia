import "reflect-metadata";

import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";

import { GraphQLWsHandler } from "../src/services/graphql-ws.handler";
import type {
  ApolloOptions,
  GraphQLWsSubscriptionsOptions,
} from "../src/interfaces";

/**
 * Delivery-focused e2e tests against a real Bun WebSocket server.
 *
 * These specifically emulate client behaviours common on Windows:
 * - .NET ClientWebSocket REQUIRES the server to echo the negotiated
 *   subprotocol (Sec-WebSocket-Protocol) or it aborts the connection.
 * - Some Windows clients/proxies deliver JSON payloads as BINARY frames.
 * - Windows tooling (.NET Encoding.UTF8 preamble, PowerShell) often
 *   prepends a UTF-8 BOM to serialized JSON.
 */

let nextPort = 39400;

function getTestPort(): number {
  return nextPort++;
}

/** A push-based event source so tests can emit real subscription events. */
function makePushSchema(): {
  schema: GraphQLSchema;
  push: (value: number) => void;
  end: () => void;
} {
  const queue: number[] = [];
  let notify: (() => void) | undefined;
  let ended = false;

  const push = (value: number): void => {
    queue.push(value);
    notify?.();
  };
  const end = (): void => {
    ended = true;
    notify?.();
  };

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: "Query",
      fields: { _: { type: GraphQLString, resolve: () => null } },
    }),
    subscription: new GraphQLObjectType({
      name: "Subscription",
      fields: {
        counter: {
          type: GraphQLInt,
          subscribe: () => ({
            [Symbol.asyncIterator]() {
              return {
                async next(): Promise<IteratorResult<number>> {
                  while (queue.length === 0 && !ended) {
                    await new Promise<void>((r) => {
                      notify = r;
                    });
                  }
                  if (queue.length > 0) {
                    return { value: queue.shift() as number, done: false };
                  }
                  return { value: undefined as unknown as number, done: true };
                },
                async return(): Promise<IteratorResult<number>> {
                  ended = true;
                  notify?.();
                  return { value: undefined as unknown as number, done: true };
                },
              };
            },
          }),
          resolve: (v: unknown) => v,
        },
      },
    }),
  });

  return { schema, push, end };
}

async function startServer(opts: Partial<GraphQLWsSubscriptionsOptions> = {}): Promise<{
  url: string;
  push: (value: number) => void;
  stop: () => void;
}> {
  const { schema, push, end } = makePushSchema();
  const app = new Elysia();
  const handler = new GraphQLWsHandler(
    schema,
    { connectionInitWaitTimeout: 1_000, keepAlive: false, ...opts },
    {} as ApolloOptions,
    app,
  );
  handler.register("/graphql");

  const port = getTestPort();
  const server = app.listen(port);
  await new Promise((r) => setTimeout(r, 30));
  return {
    url: `ws://localhost:${port}/graphql`,
    push,
    stop: () => {
      end();
      handler.dispose();
      (server as unknown as { stop: (active?: boolean) => void }).stop(true);
    },
  };
}

interface WsMessage {
  type: string;
  id?: string;
  payload?: unknown;
}

/** Opens a socket and collects every parsed server frame. */
function openCollectingWs(
  url: string,
  protocols?: string | string[],
): Promise<{ ws: WebSocket; received: WsMessage[] }> {
  return new Promise((resolve, reject) => {
    const ws = protocols ? new WebSocket(url, protocols) : new WebSocket(url);
    const received: WsMessage[] = [];
    const to = setTimeout(() => reject(new Error("WS open timeout")), 2_000);
    ws.addEventListener("message", (event) => {
      received.push(JSON.parse(String(event.data)) as WsMessage);
    });
    ws.addEventListener("open", () => {
      clearTimeout(to);
      resolve({ ws, received });
    });
    ws.addEventListener("error", (e) => {
      clearTimeout(to);
      reject(e);
    });
  });
}

const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

async function waitFor(
  predicate: () => boolean,
  timeoutMs = 2_000,
): Promise<void> {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error("waitFor timeout");
    }
    await sleep(10);
  }
}

describe("GraphQLWsHandler delivery e2e (Windows-client emulation)", () => {
  it("echoes the graphql-transport-ws subprotocol in the handshake", async () => {
    // .NET ClientWebSocket (the default client on Windows) aborts the
    // connection when the server does not ack the requested subprotocol.
    const { url, stop } = await startServer();
    try {
      const { ws } = await openCollectingWs(url, "graphql-transport-ws");
      expect(ws.protocol).toBe("graphql-transport-ws");
      ws.close();
    } finally {
      stop();
    }
  });

  it("delivers next events end-to-end: init → subscribe → publish → next → complete", async () => {
    const { url, push, stop } = await startServer();
    try {
      const { ws, received } = await openCollectingWs(url, "graphql-transport-ws");
      ws.send(JSON.stringify({ type: "connection_init", payload: {} }));
      await waitFor(() => received.some((m) => m.type === "connection_ack"));

      ws.send(
        JSON.stringify({
          type: "subscribe",
          id: "s1",
          payload: { query: "subscription { counter }" },
        }),
      );
      await sleep(50);

      push(1);
      push(2);
      await waitFor(() => received.filter((m) => m.type === "next").length >= 2);

      const values = received
        .filter((m) => m.type === "next" && m.id === "s1")
        .map((m) => (m.payload as { data: { counter: number } }).data.counter);
      expect(values).toEqual([1, 2]);

      ws.send(JSON.stringify({ type: "complete", id: "s1" }));
      ws.close();
    } finally {
      stop();
    }
  });

  it("accepts protocol messages sent as BINARY frames", async () => {
    // Some Windows clients (.NET WebSocketMessageType.Binary, certain
    // proxies) deliver the JSON payload in binary frames instead of text.
    const { url, push, stop } = await startServer();
    try {
      const { ws, received } = await openCollectingWs(url, "graphql-transport-ws");
      const sendBinary = (msg: object): void => {
        ws.send(new TextEncoder().encode(JSON.stringify(msg)));
      };

      sendBinary({ type: "connection_init", payload: {} });
      await waitFor(() => received.some((m) => m.type === "connection_ack"));

      sendBinary({
        type: "subscribe",
        id: "b1",
        payload: { query: "subscription { counter }" },
      });
      await sleep(50);

      push(7);
      await waitFor(() => received.some((m) => m.type === "next"));
      const next = received.find((m) => m.type === "next" && m.id === "b1");
      expect(
        (next?.payload as { data: { counter: number } }).data.counter,
      ).toBe(7);
      ws.close();
    } finally {
      stop();
    }
  });

  it("tolerates a UTF-8 BOM prefix on JSON messages", async () => {
    // .NET Encoding.UTF8 with preamble / PowerShell prepend U+FEFF.
    // The connection must not be killed with CloseCode.BadRequest.
    const { url, stop } = await startServer();
    try {
      const { ws, received } = await openCollectingWs(url, "graphql-transport-ws");
      let closeCode: number | undefined;
      ws.addEventListener("close", (e) => {
        closeCode = (e as CloseEvent).code;
      });

      ws.send("﻿" + JSON.stringify({ type: "connection_init", payload: {} }));
      await waitFor(() => received.some((m) => m.type === "connection_ack"));
      expect(closeCode).toBeUndefined();
      ws.close();
    } finally {
      stop();
    }
  });

  it("answers graphql-ws ping with pong (client keepalive)", async () => {
    const { url, stop } = await startServer();
    try {
      const { ws, received } = await openCollectingWs(url, "graphql-transport-ws");
      ws.send(JSON.stringify({ type: "connection_init", payload: {} }));
      await waitFor(() => received.some((m) => m.type === "connection_ack"));

      ws.send(JSON.stringify({ type: "ping" }));
      await waitFor(() => received.some((m) => m.type === "pong"));

      ws.send(JSON.stringify({ type: "ping", payload: { ts: 1 } }));
      await waitFor(() =>
        received.some(
          (m) => m.type === "pong" && (m.payload as { ts?: number })?.ts === 1,
        ),
      );
      ws.close();
    } finally {
      stop();
    }
  });
});
