import type { DelayDuration } from "./interfaces";

/**
 * Convert a {@link DelayDuration} (or a raw millisecond number) into
 * milliseconds.
 *
 * @example
 * ```typescript
 * durationToMs({ minutes: 1, seconds: 30 }); // 90_000
 * durationToMs(500);                          // 500
 * ```
 */
export function durationToMs(duration: DelayDuration | number): number {
  if (typeof duration === "number") return duration;

  return (
    (duration.milliseconds ?? 0) +
    (duration.seconds ?? 0) * 1_000 +
    (duration.minutes ?? 0) * 60_000 +
    (duration.hours ?? 0) * 3_600_000 +
    (duration.days ?? 0) * 86_400_000
  );
}
