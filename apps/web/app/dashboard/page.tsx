"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "@/components/ui/toaster";
import { Loader2, Plus } from "lucide-react";
import { JobList, type Job } from "@/components/Job";

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch("/api/job");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to fetch demos");
        }

        setJobs(json.data.jobs);
      } catch (err: any) {
        toast.error(err.message || "Failed to load demos.");
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-background px-4 py-12 md:py-16">
      <div className="container mx-auto max-w-5xl space-y-12">
        
        <div className="flex flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-serif font-medium tracking-tight text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your generated demos.</p>
          </div>
          <Link href="/generate">
            <Button className="flex gap-1 items-center">
              <Plus />
              New Demo
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 border border-border/50 rounded-xl bg-surface">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <JobList jobs={jobs} />
        )}

      </div>
    </div>
  );
}
