import { Field, Int, ObjectType } from "../../../packages/apollo/src";

@ObjectType()
export class Message {
  @Field(() => Int)
  id!: number;

  @Field(() => String)
  author!: string;

  @Field(() => String)
  text!: string;

  @Field(() => String)
  sentAt!: string;
}
