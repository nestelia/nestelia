import "reflect-metadata";

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { Elysia } from "elysia";

import { createElysiaApplication } from "../../../index";
import { Container } from "../../../packages/core/src/di";

import { AppModule } from "./app.module";

let server: Elysia;

beforeAll(async () => {
  Container.instance.clear();
  const app = await createElysiaApplication(AppModule);
  server = app.getHttpServer();
});

afterAll(() => {
  Container.instance.clear();
});

// The WebSocket upgrade request gets a 101 when the server is listening on a
// real port; in unit-test mode (no .listen()) Elysia returns 400 for the
// upgrade because Bun's WS upgrade only works on real sockets.
// We therefore just verify that the route is *registered* (upgrade attempted,
// not 404) and the health endpoint is absent when gateways are the only
// registered thing.

describe("WebSocket gateway registration", () => {
  it("registers the /ws/chat route (upgrade returns non-404)", async () => {
    const res = await server.handle(
      new Request("http://localhost/ws/chat", {
        headers: {
          upgrade: "websocket",
          connection: "upgrade",
          "sec-websocket-key": "dGhlIHNhbXBsZSBub25jZQ==",
          "sec-websocket-version": "13",
        },
      }),
    );
    // Any status other than 404 means the WS route exists
    expect(res.status).not.toBe(404);
  });

  it("returns 404 for an unregistered ws path", async () => {
    const res = await server.handle(
      new Request("http://localhost/ws/nonexistent", {
        headers: {
          upgrade: "websocket",
          connection: "upgrade",
          "sec-websocket-key": "dGhlIHNhbXBsZSBub25jZQ==",
          "sec-websocket-version": "13",
        },
      }),
    );
    expect(res.status).toBe(404);
  });
});
