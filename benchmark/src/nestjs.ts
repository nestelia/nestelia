import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Controller, Get, Module } from "@nestjs/common";

@Controller()
class AppController {
  @Get("/")
  index(): string {
    return "Hello World";
  }
}

@Module({ controllers: [AppController] })
class AppModule {}

const port = Number(process.env.PORT) || 3000;
const app = await NestFactory.create(AppModule, { logger: false });
await app.listen(port);
if (process.send) process.send("ready");
