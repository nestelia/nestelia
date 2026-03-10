import { describe, expect, it } from "bun:test";
import { Kind } from "graphql";

import { GraphQLBigInt, GraphQLDateTime, GraphQLEmailAddress, GraphQLJSON, GraphQLURL, GraphQLUUID } from "../src/scalars";

// ── DateTime ──────────────────────────────────────────────────────────────────

describe("GraphQLDateTime", () => {
  const date = new Date("2024-03-10T12:00:00.000Z");

  it("serialize: Date → ISO string", () => {
    expect(GraphQLDateTime.serialize(date)).toBe("2024-03-10T12:00:00.000Z");
  });

  it("serialize: ISO string → ISO string", () => {
    expect(GraphQLDateTime.serialize("2024-03-10T12:00:00.000Z")).toBe("2024-03-10T12:00:00.000Z");
  });

  it("serialize: timestamp number → ISO string", () => {
    expect(GraphQLDateTime.serialize(date.getTime())).toBe("2024-03-10T12:00:00.000Z");
  });

  it("serialize: invalid value throws", () => {
    expect(() => GraphQLDateTime.serialize("not-a-date")).toThrow(TypeError);
    expect(() => GraphQLDateTime.serialize({})).toThrow(TypeError);
  });

  it("parseValue: ISO string → Date", () => {
    const result = GraphQLDateTime.parseValue("2024-03-10T12:00:00.000Z");
    expect(result).toBeInstanceOf(Date);
    expect((result as Date).toISOString()).toBe("2024-03-10T12:00:00.000Z");
  });

  it("parseValue: Date → Date", () => {
    const result = GraphQLDateTime.parseValue(date);
    expect(result).toEqual(date);
  });

  it("parseValue: invalid string throws", () => {
    expect(() => GraphQLDateTime.parseValue("not-a-date")).toThrow(TypeError);
  });

  it("parseLiteral: STRING kind → Date", () => {
    const result = GraphQLDateTime.parseLiteral(
      { kind: Kind.STRING, value: "2024-03-10T12:00:00.000Z" },
      {}
    );
    expect(result).toBeInstanceOf(Date);
  });

  it("parseLiteral: non-string kind throws", () => {
    expect(() =>
      GraphQLDateTime.parseLiteral({ kind: Kind.BOOLEAN, value: true }, {})
    ).toThrow(TypeError);
  });
});

// ── JSON ──────────────────────────────────────────────────────────────────────

describe("GraphQLJSON", () => {
  it("serialize: passes value through", () => {
    expect(GraphQLJSON.serialize({ a: 1 })).toEqual({ a: 1 });
    expect(GraphQLJSON.serialize([1, 2])).toEqual([1, 2]);
    expect(GraphQLJSON.serialize(null)).toBeNull();
    expect(GraphQLJSON.serialize(42)).toBe(42);
  });

  it("parseValue: passes value through", () => {
    expect(GraphQLJSON.parseValue({ x: "y" })).toEqual({ x: "y" });
  });

  it("parseLiteral: STRING", () => {
    expect(GraphQLJSON.parseLiteral({ kind: Kind.STRING, value: "hello" }, {})).toBe("hello");
  });

  it("parseLiteral: INT", () => {
    expect(GraphQLJSON.parseLiteral({ kind: Kind.INT, value: "42" }, {})).toBe(42);
  });

  it("parseLiteral: FLOAT", () => {
    expect(GraphQLJSON.parseLiteral({ kind: Kind.FLOAT, value: "3.14" }, {})).toBeCloseTo(3.14);
  });

  it("parseLiteral: BOOLEAN", () => {
    expect(GraphQLJSON.parseLiteral({ kind: Kind.BOOLEAN, value: true }, {})).toBe(true);
  });

  it("parseLiteral: NULL", () => {
    expect(GraphQLJSON.parseLiteral({ kind: Kind.NULL }, {})).toBeNull();
  });

  it("parseLiteral: LIST", () => {
    const result = GraphQLJSON.parseLiteral({
      kind: Kind.LIST,
      values: [
        { kind: Kind.INT, value: "1" },
        { kind: Kind.STRING, value: "two" },
      ],
    }, {});
    expect(result).toEqual([1, "two"]);
  });

  it("parseLiteral: OBJECT", () => {
    const result = GraphQLJSON.parseLiteral({
      kind: Kind.OBJECT,
      fields: [
        { kind: Kind.OBJECT_FIELD, name: { kind: Kind.NAME, value: "key" }, value: { kind: Kind.STRING, value: "val" } },
      ],
    }, {});
    expect(result).toEqual({ key: "val" });
  });
});

// ── BigInt ────────────────────────────────────────────────────────────────────

describe("GraphQLBigInt", () => {
  it("serialize: bigint → string", () => {
    expect(GraphQLBigInt.serialize(9007199254740993n)).toBe("9007199254740993");
  });

  it("serialize: safe integer → string", () => {
    expect(GraphQLBigInt.serialize(42)).toBe("42");
  });

  it("serialize: numeric string → passes through", () => {
    expect(GraphQLBigInt.serialize("123")).toBe("123");
  });

  it("serialize: invalid throws", () => {
    expect(() => GraphQLBigInt.serialize("abc")).toThrow(TypeError);
    expect(() => GraphQLBigInt.serialize(3.14)).toThrow(TypeError);
  });

  it("parseValue: string → bigint", () => {
    expect(GraphQLBigInt.parseValue("9007199254740993")).toBe(9007199254740993n);
  });

  it("parseValue: number → bigint", () => {
    expect(GraphQLBigInt.parseValue(42)).toBe(42n);
  });

  it("parseValue: bigint → bigint", () => {
    expect(GraphQLBigInt.parseValue(100n)).toBe(100n);
  });

  it("parseValue: invalid throws", () => {
    expect(() => GraphQLBigInt.parseValue("not-a-number")).toThrow(TypeError);
  });

  it("parseLiteral: INT kind → bigint", () => {
    expect(GraphQLBigInt.parseLiteral({ kind: Kind.INT, value: "42" }, {})).toBe(42n);
  });
});

// ── EmailAddress ──────────────────────────────────────────────────────────────

describe("GraphQLEmailAddress", () => {
  it("serialize: valid email passes through", () => {
    expect(GraphQLEmailAddress.serialize("user@example.com")).toBe("user@example.com");
  });

  it("serialize: invalid email throws", () => {
    expect(() => GraphQLEmailAddress.serialize("not-an-email")).toThrow(TypeError);
    expect(() => GraphQLEmailAddress.serialize("@no-user.com")).toThrow(TypeError);
  });

  it("serialize: non-string throws", () => {
    expect(() => GraphQLEmailAddress.serialize(42)).toThrow(TypeError);
  });

  it("parseValue: valid email", () => {
    expect(GraphQLEmailAddress.parseValue("admin@nestelia.dev")).toBe("admin@nestelia.dev");
  });

  it("parseLiteral: STRING kind → email", () => {
    expect(GraphQLEmailAddress.parseLiteral({ kind: Kind.STRING, value: "a@b.co" }, {})).toBe("a@b.co");
  });

  it("parseLiteral: non-STRING throws", () => {
    expect(() => GraphQLEmailAddress.parseLiteral({ kind: Kind.INT, value: "42" }, {})).toThrow(TypeError);
  });
});

// ── UUID ──────────────────────────────────────────────────────────────────────

describe("GraphQLUUID", () => {
  const uuid = "550e8400-e29b-41d4-a716-446655440000";

  it("serialize: valid UUID passes through (lowercased)", () => {
    expect(GraphQLUUID.serialize(uuid)).toBe(uuid);
    expect(GraphQLUUID.serialize(uuid.toUpperCase())).toBe(uuid);
  });

  it("serialize: invalid UUID throws", () => {
    expect(() => GraphQLUUID.serialize("not-a-uuid")).toThrow(TypeError);
    expect(() => GraphQLUUID.serialize("550e8400-e29b-41d4-a716")).toThrow(TypeError);
  });

  it("parseValue: valid UUID", () => {
    expect(GraphQLUUID.parseValue(uuid)).toBe(uuid);
  });

  it("parseLiteral: STRING kind → UUID", () => {
    expect(GraphQLUUID.parseLiteral({ kind: Kind.STRING, value: uuid }, {})).toBe(uuid);
  });

  it("parseLiteral: non-STRING throws", () => {
    expect(() => GraphQLUUID.parseLiteral({ kind: Kind.BOOLEAN, value: true }, {})).toThrow(TypeError);
  });
});

// ── URL ───────────────────────────────────────────────────────────────────────

describe("GraphQLURL", () => {
  it("serialize: valid URL passes through", () => {
    expect(GraphQLURL.serialize("https://example.com")).toBe("https://example.com");
  });

  it("serialize: invalid URL throws", () => {
    expect(() => GraphQLURL.serialize("not-a-url")).toThrow(TypeError);
  });

  it("serialize: non-string throws", () => {
    expect(() => GraphQLURL.serialize(123)).toThrow(TypeError);
  });

  it("parseValue: valid URL passes through", () => {
    expect(GraphQLURL.parseValue("https://nestelia.dev/docs")).toBe("https://nestelia.dev/docs");
  });

  it("parseValue: URL with path and query", () => {
    expect(GraphQLURL.parseValue("https://example.com/path?q=1")).toBe("https://example.com/path?q=1");
  });

  it("parseValue: invalid URL throws", () => {
    expect(() => GraphQLURL.parseValue("ftp//bad")).toThrow(TypeError);
  });

  it("parseLiteral: STRING kind → URL", () => {
    const result = GraphQLURL.parseLiteral(
      { kind: Kind.STRING, value: "https://example.com" },
      {}
    );
    expect(result).toBe("https://example.com");
  });

  it("parseLiteral: non-string kind throws", () => {
    expect(() =>
      GraphQLURL.parseLiteral({ kind: Kind.INT, value: "42" }, {})
    ).toThrow(TypeError);
  });
});
