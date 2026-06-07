/**
 * End-to-end test for the recording pipeline.
 *
 * Tests both paths:
 *   1. Direct call: recordWebsite() invoked without the queue
 *   2. Queue path: job enqueued via addRecordingJob(), polled until done
 */

import { recordWebsite } from "../worker/video/recorder";
import { addRecordingJob, getJobStatus } from "../worker/video/queue";
import { getWorker } from "../worker/video/worker";
import { nanoid } from "nanoid";

const TEST_URL = "https://heysaad.me/writing/chasing-bottlenecks-in-ember";

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function testDirect(): Promise<void> {
  console.log("\n=== Checkpoint 1: Direct recordWebsite() ===");

  const job = {
    jobId: `test-direct-${nanoid(6)}`,
    url: TEST_URL,
    viewport: { width: 1280, height: 800 },
  };

  console.log(`Job ID: ${job.jobId}`);
  console.log(`URL: ${job.url}`);

  const result = await recordWebsite(job);

  console.log("✅ Result:", JSON.stringify(result, null, 2));
}

async function testQueue(): Promise<void> {
  console.log("\n=== Checkpoint 2: Queue path ===");

  // Start the worker so it processes jobs
  getWorker();

  const jobId = await addRecordingJob("123", TEST_URL);
  console.log(`Job enqueued: ${jobId}`);

  // Poll until done or failed
  while (true) {
    await sleep(2000);
    const { status, result, error } = await getJobStatus(jobId);
    console.log(`  Status: ${status}`);

    if (status === "done") {
      console.log("✅ Queue result:", JSON.stringify(result, null, 2));
      break;
    }

    if (status === "failed") {
      console.error("❌ Job failed:", error);
      process.exit(1);
    }
  }
}

async function main(): Promise<void> {
  const mode = process.argv[2];

  try {
    if (!mode || mode === "direct") {
      await testDirect();
    }
    if (!mode || mode === "queue") {
      await testQueue();
    }
  } catch (err) {
    console.error("❌ Test failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  }

  process.exit(0);
}

main();
