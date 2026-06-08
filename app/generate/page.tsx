"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

type RecordingStatus = "idle" | "queued" | "processing" | "done" | "failed";

function GenerateDemoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobIdFromQuery = searchParams.get("jobId");

  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<RecordingStatus>("idle");

  // If we already have a jobId in the query params, we are polling
  const isPolling = !!jobIdFromQuery;

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!url) {
      toast.error("URL is required.");
      return;
    };

    setStatus("queued");

    try {
      const res = await fetch("/api/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to start generation");
      }

      // Add jobId to URL query params
      router.push(`?jobId=${json.data.jobId}`);
    } catch (err: any) {
      toast.error(err.message);
      setStatus("failed");
    }
  };

  useEffect(() => {
    if (!jobIdFromQuery || status === "done" || status === "failed") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/record/${jobIdFromQuery}`);
        const json = await res.json();

        if (json.success && json.data) {
          const jobStatus = json.data.status;

          if (jobStatus === "done") {
            toast.success("Demo generated successfully!")
            setStatus("done");
            clearInterval(interval);
            router.push(`/demo/${jobIdFromQuery}`);
          } else if (jobStatus === "failed") {
            toast.error("Generation failed.")
            setStatus("failed");
            clearInterval(interval);
            router.push("/dashboard");
          } else {
            setStatus(jobStatus); // queued or processing
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [jobIdFromQuery, status, router]);

  return (
    <div className="flex flex-col items-center justify-center px-4 my-26">
      <div className="w-full max-w-xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl md:text-4xl text-foreground">
            Create your demo
          </h1>
          <p className="text-muted-foreground">
            Enter any public URL to generate a high-quality walkthrough video.
          </p>
        </div>

        <div className="border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm bg-background">
          {isPolling ? (
            <StatusBar status={status} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium text-foreground">
                  Website URL
                </label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  disabled={!!jobIdFromQuery}
                  className="h-12 bg-surface/50 border-border/50 focus-visible:ring-1 focus-visible:ring-foreground/20"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={status === "queued"}
                className="w-full h-12 rounded-lg text-base"
              >
                {status === "queued" ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  "Generate Video"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

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
      <div className="flex items-center justify-between">
        {steps.map((step, i) => {
          const isComplete = i < activeIdx;
          const isActive = i === activeIdx;
          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs font-semibold transition-all",
                    isComplete
                      ? "bg-primary text-primary-foreground"
                      : isActive
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground",
                  )}
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
                  className={cn(
                    "text-xs font-medium",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "mb-4 flex-1 transition-colors",
                    i < activeIdx ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Animated progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            status === "processing"
              ? "animate-pulse bg-primary"
              : "bg-primary",
          )}
          style={{
            width:
              status === "queued"
                ? "4%"
                : status === "processing"
                  ? "50%"
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
          : "Capturing your website, this takes about a minute"}
      </p>
    </div>
  );
}

export default function GenerateDemoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-24">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
        </div>
      }
    >
      <GenerateDemoContent />
    </Suspense>
  );
}
