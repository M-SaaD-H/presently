"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { StatusBar, RecordingStatus } from "./components/status-bar";
import { RecordingOptionsPanel } from "./components/recording-options-panel";
import { RecordingOptions } from "@/worker/video/types";

const DEFAULT_OPTIONS: RecordingOptions = {
  enableDarkMode: false,
  viewport: {
    width: 1200,
    height: 800
  },
  showBrowserFrame: true,
  scroll: {
    pauseAtTopMs: 2000,
    pauseAtBottomMs: 1000,
    animationSettleMs: 1000
  }
};

function GenerateDemoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobIdFromQuery = searchParams.get("jobId");

  const [url, setUrl] = useState("");
  const [options, setOptions] = useState<RecordingOptions>(DEFAULT_OPTIONS);
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
        body: JSON.stringify({
          url,
          recordingOptions: options
        }),
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
    <div className="flex flex-col items-center justify-center px-4 my-12">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground tracking-tight">
            Create your demo
          </h1>
          <p className="text-muted-foreground">
            Enter any public URL to generate a high-quality walkthrough video.
          </p>
        </div>

        <div className="border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm bg-background/50 backdrop-blur-sm">
          {isPolling ? (
            <div className="py-8">
              <StatusBar status={status} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
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

              <RecordingOptionsPanel
                options={options}
                onChange={setOptions}
                disabled={status === "queued" || !!jobIdFromQuery}
              />

              <Button
                type="submit"
                size="lg"
                disabled={status === "queued"}
                className="w-full h-14 rounded-xl text-lg font-medium shadow-md hover:shadow-lg transition-all"
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
