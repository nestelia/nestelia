import express from "express";

const port = Number(process.env.PORT) || 3000;
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  if (process.send) process.send("ready");
});
