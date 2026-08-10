export interface RecordingJob {
  jobId: string;
  url: string;
  options: RecordingOptions;
}

export interface RecordingOptions {
  enableDarkMode: boolean;
  viewport: {
    width: number;
    height: number;
  };
  showBrowserFrame: boolean;
  scroll: ScrollOptions;
}

export interface RecordingResult {
  jobId: string;
  /** Absolute path to the local MP4 file (or temp path before storage) */
  outputPath: string;
  /** Public-facing URL (local API path or CDN URL) */
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
