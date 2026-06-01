export interface GenerateVideoOptions {
  jobId: string | null,
  videoFormat: "webm" | "mp4" | "gif",
  viewport: {
    width: number,
    height: number,
  } | null
}
