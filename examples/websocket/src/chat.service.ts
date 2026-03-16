import { Injectable } from "nestelia";

export interface Message {
  from: string;
  text: string;
  at: string;
}

@Injectable()
export class ChatService {
  private readonly history: Message[] = [];

  record(from: string, text: string): Message {
    const msg: Message = { from, text, at: new Date().toISOString() };
    this.history.push(msg);
    return msg;
  }

  getHistory(): Message[] {
    return this.history;
  }
}
