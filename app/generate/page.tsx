"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";
import {
  Video,
  Download,
  Loader2,
  RotateCcw,
  CirclePlay,
  Sparkles,
  Globe,
  CheckCircle2,
  XCircle,
} from "lucide-react"

type RecordingStatus = "idle" | "queued" | "processing" | "done" | "failed";

interface RecordingState {
  status: RecordingStatus;
  jobId: string | null;
  publicUrl: string | null;
  error: string | null;
}

const POLL_INTERVAL_MS = 2000;

export default function GeneratePage() {
  const [url, setUrl] = useState("");
  const [recording, setRecording] = useState<RecordingState>({
    status: "idle",
    jobId: null,
    publicUrl: null,
    error: null,
  });

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Polling

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(
    async (jobId: string) => {
      try {
        const res = await fetch(`/api/record/${jobId}`);
        if (!res.ok) {
          const { message } = await res.json().catch(() => ({ message: "Unknown error" }));
          throw new Error(message);
        }
        const data = await res.json() as {
          status: RecordingStatus;
          publicUrl?: string;
          error?: string;
        };

        if (data.status === "done") {
          stopPolling();
          setRecording({
            status: "done",
            jobId,
            publicUrl: data.publicUrl ?? `/api/download/${jobId}`,
            error: null,
          });
          toast.success("Recording complete!", {
            description: "Your demo video is ready to preview.",
          });
        } else if (data.status === "failed") {
          stopPolling();
          const errMsg = data.error ?? "Recording failed";
          setRecording((prev) => ({
            ...prev,
            status: "failed",
            error: errMsg,
          }));
          toast.error("Recording failed", { description: errMsg });
        } else {
          setRecording((prev) => ({ ...prev, status: data.status }));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to check status";
        stopPolling();
        setRecording((prev) => ({ ...prev, status: "failed", error: msg }));
        toast.error("Status check failed", { description: msg });
      }
    },
    [stopPolling]
  );

  useEffect(() => {
    if (recording.jobId && (recording.status === "queued" || recording.status === "processing")) {
      stopPolling();
      pollRef.current = setInterval(() => pollStatus(recording.jobId!), POLL_INTERVAL_MS);
    }
    return stopPolling;
  }, [recording.jobId, recording.status, pollStatus, stopPolling]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleRecord = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      toast.warning("Please enter a URL");
      return;
    }

    // Prepend https:// if the user typed a bare domain
    const fullUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
      new URL(fullUrl);
    } catch {
      toast.error("Invalid URL", { description: "Please enter a valid website address." });
      return;
    }

    setRecording({ status: "queued", jobId: null, publicUrl: null, error: null });

    try {
      const res = await fetch("/api/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fullUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? "Failed to start recording");
      }

      setRecording((prev) => ({ ...prev, jobId: data.jobId }));
      toast.info("Recording started", {
        description: "Your demo video is being recorded…",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to start recording";
      setRecording({ status: "failed", jobId: null, publicUrl: null, error: msg });
      toast.error("Could not start recording", { description: msg });
    }
  };

  const handleReset = () => {
    stopPolling();
    setRecording({ status: "idle", jobId: null, publicUrl: null, error: null });
  };

  const isActive = recording.status === "queued" || recording.status === "processing";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen overflow-hidden">
      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-10 p-6 mt-24">

        {/* Hero */}
        <header className="flex flex-col items-center gap-4 text-center">
          <h1 className="bg-gradient-to-br from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
            Record your
            <br />
            website demo
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground">
            Paste any URL and get a smooth, human-like demo video - complete with
            natural scrolling and animation capture. Ready in seconds.
          </p>
        </header>

        {/* Input Card */}
        <section
          aria-label="Recording controls"
          className="w-full rounded-2xl border border-border bg-card/80 p-6 shadow-xl shadow-black/5 backdrop-blur-md"
        >
          {/* URL */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex w-full flex-1 gap-2">
              <Globe className="absolute left-8 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="url-input"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isActive && handleRecord()}
                disabled={isActive}
                className="h-10 pl-9 text-sm"
                aria-label="Website URL"
              />
            </div>

            {/* Action button */}
            <div className="flex justify-end">
              {recording.status === "done" || recording.status === "failed" ? (
                <Button
                  id="reset-button"
                  variant="outline"
                  onClick={handleReset}
                  className="gap-2 h-full"
                >
                  <RotateCcw className="size-4" />
                  Record another
                </Button>
              ) : (
                <Button
                  id="record-button"
                  onClick={handleRecord}
                  disabled={isActive}
                  className="h-full px-4"
                >
                  {isActive ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Video className="size-4" />
                  )}
                  {isActive ? "Recording…" : "Record"}
                </Button>
              )}
            </div>
          </div>


          {/* Status indicator */}
          {isActive && (
            <div className="mt-5" role="status" aria-live="polite">
              <StatusBar status={recording.status} />
            </div>
          )}
        </section>

        {/* Result: Video Player */}
        {recording.status === "done" && recording.publicUrl && (
          <section
            aria-label="Recording result"
            className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/10">
              {/* Video */}
              <div className="relative bg-black">
                <video
                  ref={videoRef}
                  id="result-video"
                  src={recording.publicUrl}
                  controls
                  autoPlay
                  className="aspect-video w-full"
                  aria-label="Recorded website demo"
                />
                <div className="pointer-events-none absolute inset-0 rounded-t-2xl ring-1 ring-inset ring-white/5" />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  Recording complete
                </div>
                <a
                  id="download-button"
                  href={`/api/download/${recording.jobId}`}
                  download={`presently-${recording.jobId}.mp4`}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
                >
                  <Download className="size-4" />
                  Download MP4
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Result: Error */}
        {recording.status === "failed" && recording.error && (
          <section
            aria-label="Recording error"
            className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
              <div className="flex items-start gap-3">
                <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">
                    Recording failed
                  </p>
                  <p className="text-sm text-muted-foreground">{recording.error}</p>
                </div>
              </div>
              <Button
                id="retry-button"
                variant="outline"
                size="sm"
                onClick={handleRecord}
                className="self-start gap-2"
              >
                <RotateCcw className="size-3.5" />
                Try again
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// Status Bar Component

function StatusBar({ status }: { status: RecordingStatus }) {
  const steps = [
    { key: "queued", label: "Queued" },
    { key: "processing", label: "Recording" },
    { key: "done", label: "Complete" },
  ] as const;

  const currentIdx = steps.findIndex((s) => s.key === status);
  const activeIdx = currentIdx === -1 ? 0 : currentIdx;

  return (
    <div className="flex flex-col gap-3">
      {/* Step indicators */}
      <div className="flex items-center gap-0">
        {steps.map((step, i) => {
          const isComplete = i < activeIdx;
          const isActive = i === activeIdx;
          return (
            <div key={step.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={[
                    "flex size-6 items-center justify-center rounded-full text-xs font-semibold transition-all",
                    isComplete
                      ? "bg-emerald-500 text-white"
                      : isActive
                        ? "bg-violet-600 text-white ring-4 ring-violet-600/25"
                        : "bg-muted text-muted-foreground",
                  ].join(" ")}
                >
                  {isComplete ? (
                    <CheckCircle2 className="size-3.5" />
                  ) : isActive ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={[
                    "text-xs font-medium",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={[
                    "mb-4 h-px flex-1 transition-colors",
                    i < activeIdx ? "bg-emerald-500" : "bg-border",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Animated progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={[
            "h-full rounded-full transition-all duration-700",
            status === "processing"
              ? "animate-pulse bg-gradient-to-r from-violet-600 to-fuchsia-500"
              : "bg-gradient-to-r from-violet-600 to-fuchsia-500",
          ].join(" ")}
          style={{
            width:
              status === "queued"
                ? "15%"
                : status === "processing"
                  ? "70%"
                  : "100%",
          }}
          role="progressbar"
          aria-valuenow={
            status === "queued" ? 15 : status === "processing" ? 70 : 100
          }
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {status === "queued"
          ? "Waiting for a recording slot…"
          : "Capturing your website — this takes about a minute"}
      </p>
    </div>
  );
}
