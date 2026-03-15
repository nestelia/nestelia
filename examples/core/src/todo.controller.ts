import { Elysia, t, type Static } from "elysia";

import { Body, Controller, Delete, Get, Param, Post, Put } from "nestelia";

import type { Todo } from "./todo.service";
import { TodoService } from "./todo.service";

const IdParams = t.Object({ id: t.String() });
const TodoBody = t.Object({ title: t.String() });

// ─── Eden Treaty schema ───────────────────────────────────────────────────────
// Co-located with the controller — single source of truth for client types.
// Import and compose in main.ts: app.withSchema(new Elysia().use(todosSchema))
export const todosSchema = new Elysia({ prefix: "/todos" })
  .get("/", (): Todo[] => [])
  .post("/", (): Todo => ({ id: 0, title: "", done: false }), { body: TodoBody })
  .get("/:id", (): Todo | null => null, { params: IdParams })
  .put("/:id", (): Todo | null => null, { params: IdParams, body: TodoBody })
  .delete("/:id", (): { success: boolean } => ({ success: true }), { params: IdParams });

@Controller("/todos")
export class TodoController {
  constructor(private readonly todos: TodoService) {}

  @Get("/")
  getAll(): Todo[] {
    return this.todos.findAll();
  }

  @Get("/:id")
  getOne(@Param(IdParams) params: Static<typeof IdParams>): Todo | null {
    const todo = this.todos.findOne(Number(params.id));
    if (!todo) return new Response("Not found", { status: 404 }) as never;
    return todo;
  }

  @Post("/")
  create(@Body(TodoBody) body: Static<typeof TodoBody>): Todo {
    return this.todos.create(body.title);
  }

  @Put("/:id")
  update(
    @Param(IdParams) params: Static<typeof IdParams>,
    @Body(TodoBody) body: Static<typeof TodoBody>,
  ): Todo | null {
    const todo = this.todos.update(Number(params.id), body.title);
    if (!todo) return new Response("Not found", { status: 404 }) as never;
    return todo;
  }

  @Delete("/:id")
  remove(@Param(IdParams) params: Static<typeof IdParams>): { success: boolean } {
    const ok = this.todos.remove(Number(params.id));
    if (!ok) return new Response("Not found", { status: 404 }) as never;
    return { success: true };
  }
}
