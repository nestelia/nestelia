import { Elysia } from "elysia";

const port = Number(process.env.PORT) || 3000;
new Elysia()
  .get("/", () => "Hello World")
  .listen(port, () => {
    process.send?.("ready");
  });
