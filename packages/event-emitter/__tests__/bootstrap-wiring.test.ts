import "reflect-metadata";
import { describe, expect, it } from "bun:test";

import { createElysiaApplication } from "../../../index";
import { Injectable, Module } from "nestelia";
import { EventEmitterModule } from "../src/event-emitter.module";
import { EventEmitterService } from "../src/event-emitter.service";
import { OnEvent } from "../src/decorators";

/**
 * Does @OnEvent actually wire when the app boots through the real framework
 * lifecycle (not by calling explorer.onApplicationBootstrap() manually)?
 */
describe("EventEmitter — real bootstrap wiring", () => {
  it("fires @OnEvent listeners after createElysiaApplication", async () => {
    const received: string[] = [];

    @Injectable()
    class Listener {
      @OnEvent("ping")
      handle(payload: string) {
        received.push(payload);
      }
    }

    @Module({
      imports: [EventEmitterModule.forRoot({ global: true })],
      providers: [Listener],
    })
    class AppModule {}

    const app = await createElysiaApplication(AppModule);
    void app;

    const { DIContainer } = await import("nestelia");
    const emitter =
      await DIContainer.get<EventEmitterService>(EventEmitterService);

    emitter!.emit("ping", "hello");

    expect(received).toEqual(["hello"]);
  });
});
