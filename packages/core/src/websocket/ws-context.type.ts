import type { ElysiaWS } from "elysia/ws";

/**
 * The WebSocket context object passed to gateway handler methods.
 * Wraps Elysia's ElysiaWS with an untyped data payload for general use.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ElysiaWsContext = ElysiaWS<any, any>;
