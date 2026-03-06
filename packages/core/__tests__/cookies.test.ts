import "reflect-metadata";

import { describe, expect, it } from "bun:test";

import { Cookies } from "../src/decorators/http.decorators";
import { PARAMS_METADATA } from "../src/decorators/constants";
import { resolveParam } from "../src/core/param-resolver";
import type { ParamMetadata } from "../src/decorators/types";

// --- Decorator metadata tests ---

describe("@Cookies decorator", () => {
  it("stores type=cookies without property", () => {
    class Controller {
      handler(@Cookies() cookies: unknown) {}
    }

    const meta: ParamMetadata[] = Reflect.getOwnMetadata(
      PARAMS_METADATA,
      Controller,
      "handler",
    );
    expect(meta).toHaveLength(1);
    expect(meta[0].type).toBe("cookies");
    expect(meta[0].data).toBeUndefined();
    expect(meta[0].index).toBe(0);
  });

  it("stores type=cookies with property name", () => {
    class Controller {
      handler(@Cookies("session") session: unknown) {}
    }

    const meta: ParamMetadata[] = Reflect.getOwnMetadata(
      PARAMS_METADATA,
      Controller,
      "handler",
    );
    expect(meta[0].type).toBe("cookies");
    expect(meta[0].data).toBe("session");
  });

  it("accumulates multiple @Cookies decorators", () => {
    class Controller {
      handler(@Cookies() all: unknown, @Cookies("token") token: unknown) {}
    }

    const meta: ParamMetadata[] = Reflect.getOwnMetadata(
      PARAMS_METADATA,
      Controller,
      "handler",
    );
    expect(meta).toHaveLength(2);
    const types = meta.map((m) => m.type);
    expect(types).toEqual(["cookies", "cookies"]);
  });
});

// --- resolveParam tests ---

function makeContext(cookie?: Record<string, { value: unknown }>) {
  return {
    cookie,
    body: {},
    params: {},
    query: {},
    request: new Request("http://localhost"),
    set: { headers: {}, status: 200 },
  } as unknown as Parameters<typeof resolveParam>[2];
}

describe("resolveParam cookies", () => {
  it("returns all cookies when no property", async () => {
    const cookieJar = { session: { value: "abc123" } };
    const result = await resolveParam(
      { index: 0, type: "cookies" },
      undefined,
      makeContext(cookieJar),
    );
    expect(result).toBe(cookieJar);
  });

  it("returns specific cookie value when property provided", async () => {
    const cookieJar = { token: { value: "xyz" }, other: { value: "foo" } };
    const result = await resolveParam(
      { index: 0, type: "cookies", data: "token" },
      undefined,
      makeContext(cookieJar),
    );
    expect(result).toBe("xyz");
  });

  it("returns undefined for missing cookie name", async () => {
    const cookieJar = { session: { value: "abc" } };
    const result = await resolveParam(
      { index: 0, type: "cookies", data: "missing" },
      undefined,
      makeContext(cookieJar),
    );
    expect(result).toBeUndefined();
  });

  it("returns undefined when cookie jar is absent", async () => {
    const result = await resolveParam(
      { index: 0, type: "cookies", data: "session" },
      undefined,
      makeContext(undefined),
    );
    expect(result).toBeUndefined();
  });
});
