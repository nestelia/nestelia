import "reflect-metadata";

import { createElysiaApplication } from "nestelia";

import { AppModule } from "./src/app.module";

const app = await createElysiaApplication(AppModule);
app.listen(3000, () => {
  console.log("HTTP  → http://localhost:3000");
  console.log("WS    → ws://localhost:3000/ws/chat");
});
