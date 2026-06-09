/**
 * Shared Redis connection factory for BullMQ Queue and Worker.
 *
 * BullMQ v5 bundles its own ioredis internally and expects connection options
 * (host/port/url) rather than an external IORedis instance. Passing a raw
 * connection string as options is the correct approach.
 */

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

// Parse the URL into the host/port/password shape BullMQ expects
function parseRedisUrl(url: string): { host: string; port: number; password?: string; tls?: unknown } {
  const parsed = new URL(url);
  return {
    host: parsed.hostname || "127.0.0.1",
    port: parsed.port ? parseInt(parsed.port, 10) : 6379,
    ...(parsed.password ? { password: decodeURIComponent(parsed.password) } : {}),
    ...(parsed.protocol === "rediss:" ? { tls: {} } : {}),
  };
}

export type RedisConnectionOptions = ReturnType<typeof parseRedisUrl> & {
  maxRetriesPerRequest: null;
  enableReadyCheck: boolean;
};

export function getRedisConnectionOptions(): RedisConnectionOptions {
  return {
    ...parseRedisUrl(REDIS_URL),
    // Both required by BullMQ
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}
