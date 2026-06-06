"use client";

import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2, RefreshCw, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";

type Job = {
  status: string;
  url: string;
  publicUrl?: string;
  error?: string;
}

export default function DemoResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/job/${id}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Job not found");
        }

        setJob(json.data.job);
      } catch (err: any) {
        toast.error(err.message || "Job not found.");
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchJob();
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-surface/30 px-4 py-12 items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) return null;

  // BullMQ might return 'done', DB model uses 'completed'
  const isCompleted = job.status === "completed" || job.status === "done";

  return (
    <div className="flex-1 flex flex-col bg-surface/30 px-4 py-12 md:py-16">
      <div className="container mx-auto max-w-5xl space-y-8">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl tracking-tight text-foreground truncate max-w-[300px] md:max-w-[500px]" title={job.url}>
              Demo: {new URL(job.url).hostname}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <span className={`flex h-2 w-2 rounded-full ${isCompleted ? 'bg-green-500' : job.status === 'failed' ? 'bg-destructive' : 'bg-yellow-500'}`}></span>
              <span className="capitalize">{job.status}</span>
              <span className="mx-2">•</span>
              <span>1080p HD</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </Button>
            {isCompleted && job.publicUrl && (
              <a href={job.publicUrl} download target="_blank" rel="noreferrer">
                <Button size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </a>
            )}
          </div>
        </div>

        <div className="aspect-video w-full rounded-xl overflow-hidden border border-border/50 bg-black shadow-sm flex items-center justify-center">
          {isCompleted && job.publicUrl ? (
            <video src={job.publicUrl} controls className="w-full h-full object-contain" />
          ) : (
            <div className="text-center space-y-2 p-4">
              <p className="text-muted-foreground">
                {job.status === "failed" ? "Video generation failed." : "Video is still generating..."}
              </p>
              {job.error && <p className="text-sm text-destructive max-w-2xl mx-auto">{job.error}</p>}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
