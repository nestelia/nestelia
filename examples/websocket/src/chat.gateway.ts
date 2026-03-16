import { Injectable } from "nestelia";
import {
  OnClose,
  OnMessage,
  OnOpen,
  WebSocketGateway,
  type ElysiaWsContext,
} from "nestelia";

import { ChatService } from "./chat.service";

@Injectable()
@WebSocketGateway("/ws/chat")
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @OnOpen()
  handleOpen(ws: ElysiaWsContext) {
    const history = this.chatService.getHistory();
    ws.send(JSON.stringify({ event: "connected", history }));
    console.log("[WS] client connected");
  }

  @OnMessage()
  handleMessage(ws: ElysiaWsContext, message: unknown) {
    const text = typeof message === "string" ? message : JSON.stringify(message);
    const recorded = this.chatService.record("anonymous", text);
    ws.send(JSON.stringify({ event: "message", data: recorded }));
  }

  @OnClose()
  handleClose(_ws: ElysiaWsContext) {
    console.log("[WS] client disconnected");
  }
}
