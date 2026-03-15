import "reflect-metadata";

import { beforeAll, describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { Elysia } from "elysia";

import { createElysiaApplication } from "../../../index";
import { AppModule } from "../src/app.module";
import { todosSchema } from "../src/todo.controller";
import type { Todo } from "../src/todo.service";

// ─── App type ─────────────────────────────────────────────────────────────────
//
// Each controller exports its own schema (co-located in the same file).
// Here we compose them and export a single App type for clients to import.
//
// In main.ts this looks like:
//   const typedServer = app.withSchema(new Elysia().use(todosSchema).use(...))
//   export type App = typeof typedServer

const appSchema = new Elysia().use(todosSchema);
export type App = typeof appSchema;

let client: ReturnType<typeof treaty<App>>;

beforeAll(async () => {
  const app = await createElysiaApplication(AppModule);
  // Pass the composed schema — runtime uses actual controller routes,
  // TypeScript sees route types from the schema.
  client = treaty<App>(app.withSchema(appSchema));
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Eden Treaty — GET /todos", () => {
  it("returns an empty array initially", async () => {
    const { data, error } = await client.todos.get();
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
});

describe("Eden Treaty — POST /todos", () => {
  it("creates a todo", async () => {
    const { data, error } = await client.todos.post({ title: "Buy milk" });
    expect(error).toBeNull();
    expect(data).toMatchObject({ title: "Buy milk", done: false });

    // TypeScript knows data is Todo | null
    const _typed: Todo | null = data;
    void _typed;
  });
});

describe("Eden Treaty — GET /todos/:id", () => {
  it("returns the created todo", async () => {
    const { data, error } = await client.todos({ id: "1" }).get();
    expect(error).toBeNull();
    expect(data).toMatchObject({ id: 1, title: "Buy milk" });
  });
});

describe("Eden Treaty — DELETE /todos/:id", () => {
  it("deletes a todo", async () => {
    const { data, error } = await client.todos({ id: "1" }).delete();
    expect(error).toBeNull();
    expect(data).toEqual({ success: true });

    // TypeScript knows data is { success: boolean } | null
    const _typed: { success: boolean } | null = data;
    void _typed;
  });
});
