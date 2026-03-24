import { Injectable } from "nestelia";
import { AmqpConnection } from "../../../packages/rabbitmq/src";
import { Inject } from "nestelia";

@Injectable()
export class OrdersService {
  constructor(
    @Inject(AmqpConnection) private readonly rabbit: AmqpConnection,
  ) {}

  async createOrder(amount: number, userId: string) {
    const orderId = crypto.randomUUID();
    await this.rabbit.publish("orders", "order.created", {
      orderId,
      amount,
      userId,
    });
    return { orderId };
  }
}
