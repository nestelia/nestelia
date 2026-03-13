import Fastify from "fastify";

const port = Number(process.env.PORT) || 3000;
const app = Fastify({ logger: false });

app.get("/", () => "Hello World");

app.listen({ port }).then(() => {
  if (process.send) process.send("ready");
});
