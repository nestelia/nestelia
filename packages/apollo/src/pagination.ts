import "reflect-metadata";

import { typeMetadataStorage } from "./storages/type-metadata.storage";
import { Field, ObjectType } from "./decorators/type.decorator";
import { Int } from "./decorators/type.decorator";

type Constructor<T = unknown> = new (...args: unknown[]) => T;

// ── PageInfo ──────────────────────────────────────────────────────────────────

/**
 * Standard Relay-style PageInfo object. Included in every Connection type.
 *
 * @publicApi
 */
@ObjectType({ description: "Pagination metadata for cursor-based navigation." })
export class PageInfo {
  @Field(() => Boolean)
  hasNextPage!: boolean;

  @Field(() => Boolean)
  hasPreviousPage!: boolean;

  @Field(() => String, { nullable: true })
  startCursor?: string;

  @Field(() => String, { nullable: true })
  endCursor?: string;
}

// ── Paginated (simple offset-based) ──────────────────────────────────────────

/**
 * Creates a simple paginated response type for a given item class.
 * Fields: `items`, `total`, `hasNextPage`, `hasPreviousPage`.
 *
 * @example
 * ```typescript
 * @ObjectType()
 * class BooksPage extends Paginated(Book) {}
 *
 * @Query(() => BooksPage)
 * books(@Args('offset', { type: () => Int }) offset: number): BooksPage { ... }
 * ```
 *
 * @publicApi
 */
export function Paginated<T>(ItemType: Constructor<T>): Constructor {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType {
    @Field(() => [ItemType])
    items!: T[];

    @Field(() => Int)
    total!: number;

    @Field(() => Boolean)
    hasNextPage!: boolean;

    @Field(() => Boolean)
    hasPreviousPage!: boolean;
  }

  // Copy field metadata from the abstract class so concrete subclasses inherit it
  const fields = typeMetadataStorage.getFieldsByConstructor(PaginatedType.prototype.constructor);
  for (const field of fields) {
    typeMetadataStorage.addField(PaginatedType.prototype.constructor, field);
  }

  return PaginatedType;
}

// ── Relay Connection / Edge ───────────────────────────────────────────────────

/**
 * Creates a Relay-style Edge type for a given node class.
 * Fields: `node`, `cursor`.
 *
 * @publicApi
 */
export function createEdgeType<T>(NodeType: Constructor<T>): Constructor {
  @ObjectType({ isAbstract: true })
  abstract class EdgeType {
    @Field(() => NodeType)
    node!: T;

    @Field(() => String)
    cursor!: string;
  }

  return EdgeType;
}

/**
 * Creates a Relay-style Connection type for a given node class.
 * Fields: `edges`, `pageInfo`, `totalCount`.
 *
 * @example
 * ```typescript
 * @ObjectType()
 * class BookEdge extends createEdgeType(Book) {}
 *
 * @ObjectType()
 * class BookConnection extends createConnectionType(Book, BookEdge) {}
 *
 * @Query(() => BookConnection)
 * booksConnection(@Args('after', { nullable: true }) after?: string): BookConnection { ... }
 * ```
 *
 * @publicApi
 */
export function createConnectionType<T>(
  NodeType: Constructor<T>,
  EdgeType?: Constructor,
): Constructor {
  const EdgeClass = EdgeType ?? createEdgeType(NodeType);

  @ObjectType({ isAbstract: true })
  abstract class ConnectionType {
    @Field(() => [EdgeClass])
    edges!: unknown[];

    @Field(() => PageInfo)
    pageInfo!: PageInfo;

    @Field(() => Int)
    totalCount!: number;
  }

  return ConnectionType;
}
