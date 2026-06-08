import type { ChildProcess } from "child_process";

export interface RecordingJob {
  jobId: string;
  url: string;
  viewport: {
    width: number;
    height: number;
  };
}

export interface RecordingResult {
  jobId: string;
  /** Absolute path to the local MP4 file */
  outputPath: string;
  /** Public-facing URL */
  publicUrl: string;
  /** Measured duration of the recording in seconds */
  durationSeconds: number;
  fileSizeBytes: number;
}

export interface ScrollOptions {
  /** Milliseconds to pause at top before scrolling (lets opening animations play) */
  pauseAtTopMs: number;
  /** Milliseconds to pause at bottom after scrolling */
  pauseAtBottomMs: number;
  /** Extra settle time after page load event before scrolling starts */
  animationSettleMs: number;
}

export interface FFmpegProcess {
  process: ChildProcess;
  outputPath: string;
}
