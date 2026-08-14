import type { ChildProcess } from "child_process";

export interface FFmpegProcess {
  process: ChildProcess;
  outputPath: string;
}
