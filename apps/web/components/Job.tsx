import Link from "next/link";
import { AlertCircle, Loader2, MoreHorizontal } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

export type Job = {
  _id: string;
  status: string;
  url: string;
  publicUrl?: string;
  error?: string;
  createdAt: string;
  duration?: number;
};

export function JobList({ jobs }: { jobs: Job[] }) {
  return (
    <div className="border border-border/50 rounded-xl overflow-hidden bg-surface">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead>Demo title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created date</TableHead>
            <TableHead>Video duration</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                No demos yet.
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => <JobRow key={job._id} job={job} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function JobRow({ job }: { job: Job }) {
  const isCompleted = job.status === "completed" || job.status === "done";
  const isFailed = job.status === "failed";

  return (
    <TableRow className="border-border/50 group">
      <TableCell>
        <Link href={`/demo/${job._id}`} className="flex flex-col">
          <span className="font-medium truncate max-w-[200px]" title={job.url}>
            {new URL(job.url).hostname}
          </span>
          <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={job.url}>
            {job.url}
          </span>
        </Link>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-500' : isFailed ? 'bg-destructive' : 'bg-yellow-500 animate-pulse'}`} />
          <span className="text-sm capitalize">{job.status === "done" ? "completed" : job.status}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(job.createdAt)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDuration(job.duration)}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href={`/demo/${job._id}`}>View Demo</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export const formatDuration = (seconds?: number) => {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};
