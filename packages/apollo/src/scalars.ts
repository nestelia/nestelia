import { GraphQLScalarType, Kind } from "graphql";

// ── DateTime ──────────────────────────────────────────────────────────────────

function serializeDate(value: unknown): string {
  if (value instanceof Date) {
    if (isNaN(value.getTime())) throw new TypeError("DateTime cannot represent an invalid Date");
    return value.toISOString();
  }
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (isNaN(date.getTime())) throw new TypeError(`DateTime cannot represent value: ${String(value)}`);
    return date.toISOString();
  }
  throw new TypeError(`DateTime cannot represent value: ${String(value)}`);
}

function parseDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (isNaN(date.getTime())) throw new TypeError(`DateTime cannot parse value: ${String(value)}`);
    return date;
  }
  throw new TypeError(`DateTime cannot parse value: ${String(value)}`);
}

/** GraphQL scalar that serializes JS Date to/from ISO 8601 strings. */
export const GraphQLDateTime = new GraphQLScalarType({
  name: "DateTime",
  description: "ISO 8601 date-time string (e.g. 2024-01-01T00:00:00.000Z). Parsed to JS Date.",
  serialize: serializeDate,
  parseValue: parseDate,
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return parseDate(ast.value);
    if (ast.kind === Kind.INT) return parseDate(parseInt(ast.value, 10));
    throw new TypeError(`DateTime cannot parse literal of kind: ${ast.kind}`);
  },
});

// ── JSON ──────────────────────────────────────────────────────────────────────

function identity(value: unknown): unknown {
  return value;
}

function parseLiteralJSON(ast: import("graphql").ValueNode): unknown {
  switch (ast.kind) {
    case Kind.STRING:  return ast.value;
    case Kind.BOOLEAN: return ast.value;
    case Kind.INT:     return parseInt(ast.value, 10);
    case Kind.FLOAT:   return parseFloat(ast.value);
    case Kind.NULL:    return null;
    case Kind.LIST:    return ast.values.map(parseLiteralJSON);
    case Kind.OBJECT:  return Object.fromEntries(
      ast.fields.map((f) => [f.name.value, parseLiteralJSON(f.value)])
    );
    default: throw new TypeError(`JSON cannot parse literal of kind: ${ast.kind}`);
  }
}

/** GraphQL scalar that accepts any JSON-serializable value. */
export const GraphQLJSON = new GraphQLScalarType({
  name: "JSON",
  description: "Arbitrary JSON value (object, array, string, number, boolean, or null).",
  serialize: identity,
  parseValue: identity,
  parseLiteral: parseLiteralJSON,
});

// ── URL ───────────────────────────────────────────────────────────────────────

function parseURL(value: unknown): string {
  if (typeof value !== "string") throw new TypeError(`URL must be a string, got: ${typeof value}`);
  try {
    const parsed = new URL(value);
    if (!parsed.href) throw new Error();
  } catch {
    throw new TypeError(`URL is not a valid URL: ${value}`);
  }
  return value;
}

/** GraphQL scalar for validated URL strings. */
export const GraphQLURL = new GraphQLScalarType({
  name: "URL",
  description: "A valid URL string (validated via the URL constructor).",
  serialize: parseURL,
  parseValue: parseURL,
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return parseURL(ast.value);
    throw new TypeError(`URL cannot parse literal of kind: ${ast.kind}`);
  },
});

// ── BigInt ────────────────────────────────────────────────────────────────────

function serializeBigInt(value: unknown): string {
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "number" && Number.isInteger(value)) return BigInt(value).toString();
  if (typeof value === "string" && /^-?\d+$/.test(value)) return value;
  throw new TypeError(`BigInt cannot represent value: ${String(value)}`);
}

function parseBigInt(value: unknown): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isInteger(value)) return BigInt(value);
  if (typeof value === "string") {
    try { return BigInt(value); } catch { /* fall through */ }
  }
  throw new TypeError(`BigInt cannot parse value: ${String(value)}`);
}

/** GraphQL scalar for JavaScript bigint values. Serialized as a string to avoid precision loss. */
export const GraphQLBigInt = new GraphQLScalarType({
  name: "BigInt",
  description: "64-bit integer. Serialized as a string to preserve precision. Parsed to JS bigint.",
  serialize: serializeBigInt,
  parseValue: parseBigInt,
  parseLiteral(ast) {
    if (ast.kind === Kind.INT || ast.kind === Kind.STRING) return parseBigInt(ast.value);
    throw new TypeError(`BigInt cannot parse literal of kind: ${ast.kind}`);
  },
});

// ── EmailAddress ──────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEmail(value: unknown): string {
  if (typeof value !== "string") throw new TypeError(`EmailAddress must be a string, got: ${typeof value}`);
  if (!EMAIL_RE.test(value)) throw new TypeError(`EmailAddress is not a valid email: ${value}`);
  return value;
}

/** GraphQL scalar for email address strings (basic RFC format validation). */
export const GraphQLEmailAddress = new GraphQLScalarType({
  name: "EmailAddress",
  description: "A valid email address string (user@domain.tld format).",
  serialize: parseEmail,
  parseValue: parseEmail,
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return parseEmail(ast.value);
    throw new TypeError(`EmailAddress cannot parse literal of kind: ${ast.kind}`);
  },
});

// ── UUID ──────────────────────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseUUID(value: unknown): string {
  if (typeof value !== "string") throw new TypeError(`UUID must be a string, got: ${typeof value}`);
  if (!UUID_RE.test(value)) throw new TypeError(`UUID is not a valid UUID: ${value}`);
  return value.toLowerCase();
}

/** GraphQL scalar for UUID strings (any version, canonical lowercase format). */
export const GraphQLUUID = new GraphQLScalarType({
  name: "UUID",
  description: "A UUID string (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx). Normalized to lowercase.",
  serialize: parseUUID,
  parseValue: parseUUID,
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return parseUUID(ast.value);
    throw new TypeError(`UUID cannot parse literal of kind: ${ast.kind}`);
  },
});
