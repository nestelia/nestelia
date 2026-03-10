import {
  Field,
  GraphQLDateTime,
  GraphQLJSON,
  GraphQLURL,
  Int,
  ObjectType,
} from "../../../packages/apollo/src";

@ObjectType()
export class Book {
  @Field(() => Int)
  id!: number;

  @Field(() => String)
  title!: string;

  @Field(() => String)
  author!: string;

  @Field(() => GraphQLDateTime)
  publishedAt!: Date;

  @Field(() => GraphQLURL, { nullable: true })
  coverUrl?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, unknown>;
}
