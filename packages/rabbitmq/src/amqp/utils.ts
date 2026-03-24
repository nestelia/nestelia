import type { Options } from "amqplib";

export function matchesRoutingKey(
  routingKey: string,
  pattern: string[] | string | undefined,
): boolean {
  if (
    pattern === undefined ||
    (Array.isArray(pattern) && pattern.length === 0)
  )
    return false;

  const patterns = Array.isArray(pattern) ? pattern : [pattern];
  for (const p of patterns) {
    if (routingKey === p) return true;
    const splitKey = routingKey.split(".");
    const splitPattern = p.split(".");
    let starFailed = false;
    for (let i = 0; i < splitPattern.length; i++) {
      if (splitPattern[i] === "#") return true;

      if (splitPattern[i] !== "*" && splitPattern[i] !== splitKey[i]) {
        starFailed = true;
        break;
      }
    }

    if (!starFailed && splitKey.length === splitPattern.length) return true;
  }

  return false;
}

export type RabbitMQUriConfig = Options.Connect | string;

export const validateRabbitMqUris = (uri: string[]) => {
  for (const u of uri) {
    const rmqUri = new URL(u);
    if (!rmqUri.protocol.startsWith("amqp")) {
      throw new Error("RabbitMQ URI protocol must start with amqp or amqps");
    }
  }
};

export const convertUriConfigObjectsToUris = (
  uri: RabbitMQUriConfig | RabbitMQUriConfig[],
): string[] => {
  const uris = [uri].flat();

  return uris.map((u) => {
    if (typeof u === "string") return u;
    return amqplibUriConfigToUrl(u);
  });
};

const amqplibUriConfigToUrl = ({
  hostname,
  username,
  password,
  frameMax,
  heartbeat,
  vhost,
  protocol = "amqp",
  port = 5672,
}: Options.Connect): string => {
  if (!hostname) {
    throw new Error("Configuration object must contain a 'hostname' key.");
  }

  const auth =
    username && password
      ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
      : "";

  const params = new URLSearchParams();
  if (frameMax) params.set("frameMax", frameMax.toString());
  if (heartbeat) params.set("heartbeat", heartbeat.toString());

  return `${protocol}://${auth}${hostname}:${port}${vhost ?? ""}${params.size === 0 ? "" : `?${params.toString()}`}`;
};

/**
 * Simple deep-equal for comparing queue/consumer options.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;

  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;

  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (!deepEqual(aObj[key], bObj[key])) return false;
  }
  return true;
}

/**
 * Simple deep-merge for merging handler options.
 */
export function deepMerge<T>(target: T, ...sources: Partial<T>[]): T {
  const result = { ...target } as Record<string, unknown>;
  for (const source of sources) {
    const src = source as Record<string, unknown>;
    for (const key of Object.keys(src)) {
      const sv = src[key];
      const tv = result[key];
      if (
        sv &&
        typeof sv === "object" &&
        !Array.isArray(sv) &&
        tv &&
        typeof tv === "object" &&
        !Array.isArray(tv)
      ) {
        result[key] = deepMerge(
          tv as Record<string, unknown>,
          sv as Record<string, unknown>,
        );
      } else if (sv !== undefined) {
        result[key] = sv;
      }
    }
  }
  return result as T;
}
