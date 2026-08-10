/**
 * apps/worker entrypoint.
 *
 * Starts the BullMQ worker and the Express HTTP server in the same process.
 */

import { startWorker } from "./bullWorker";
import { app } from "./server";

const PORT = parseInt(process.env.WORKER_PORT ?? "3001", 10);

// Start the BullMQ consumer
startWorker();

// Start the HTTP API server
app.listen(PORT, () => {
  console.log(`[server] Worker HTTP API listening on port ${PORT}`);
});
