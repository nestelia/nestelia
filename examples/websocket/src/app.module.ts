import "reflect-metadata";

import { Module } from "nestelia";

import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";

@Module({
  providers: [ChatGateway, ChatService],
  gateways: [ChatGateway],
})
export class AppModule {}
