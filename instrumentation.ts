/**
 * Next.js Instrumentation file.
 *
 * Next.js calls register() exactly once when the server process boots —
 * before any requests are handled. This is the correct place to start
 * long-running background workers.
 *
 * The NEXT_RUNTIME guard is required because this file is evaluated in both
 * the Node.js runtime (where BullMQ/ioredis can run) and the Edge runtime
 * (where they cannot). We only start the worker in the Node.js runtime.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Dynamic import so the module (and its Redis connection) is only
    // instantiated in the Node.js runtime, never in the Edge runtime.
    const { getWorker } = await import("./lib/video/worker");
    getWorker();
    console.log("[instrumentation] BullMQ worker started");
  }
}
