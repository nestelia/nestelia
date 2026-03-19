import EventEmitter from "node:events";

import { Injectable } from "nestelia";

import type {
  MessageHandler,
  PubSubEngine,
} from "../../../packages/graphql-pubsub/src";
import { PubSubAsyncIterator } from "../../../packages/graphql-pubsub/src";

/**
 * Simple in-memory PubSub engine backed by Node's EventEmitter.
 * Suitable for single-process use; for multi-instance deployments use
 * a distributed engine such as `RedisPubSub` from `@nestelia/graphql-pubsub`.
 */
@Injectable()
export class InMemoryPubSub implements PubSubEngine {
  private readonly ee = new EventEmitter();
  private nextSubId = 1;
  private readonly subs = new Map<
    number,
    { trigger: string; handler: MessageHandler }
  >();

  async publish(trigger: string, payload: unknown): Promise<void> {
    this.ee.emit(trigger, payload);
  }

  async subscribe(
    trigger: string,
    onMessage: MessageHandler,
  ): Promise<number> {
    const id = this.nextSubId++;
    this.ee.on(trigger, onMessage);
    this.subs.set(id, { trigger, handler: onMessage });
    return id;
  }

  unsubscribe(subId: number): void {
    const sub = this.subs.get(subId);
    if (sub) {
      this.ee.off(sub.trigger, sub.handler);
      this.subs.delete(subId);
    }
  }

  asyncIterator<T>(triggers: string | string[]): AsyncIterator<T> {
    const list = Array.isArray(triggers) ? triggers : [triggers];
    return new PubSubAsyncIterator<T>(this, list);
  }
}
