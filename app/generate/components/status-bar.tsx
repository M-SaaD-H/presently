import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type RecordingStatus = "idle" | "queued" | "processing" | "done" | "failed";

interface StatusBarProps {
  status: RecordingStatus;
}

export function StatusBar({ status }: StatusBarProps) {
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
      <div className="flex items-center justify-between w-full">
        {steps.map((step, i) => {
          const isComplete = i < activeIdx || status === "done";
          const isActive = i === activeIdx && status !== "done";
          return (
            <div key={step.key} className={cn("flex items-center", i < steps.length - 1 ? "w-full" : "")}>
              <div className="flex flex-col items-center gap-1.5 relative z-10">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                    isComplete
                      ? "bg-primary text-primary-foreground shadow-md"
                      : isActive
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-md scale-110"
                        : "bg-muted text-muted-foreground border border-border/50",
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="size-4" />
                  ) : isActive ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium absolute -bottom-6 w-20 text-center",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "h-[2px] flex-1 mx-2 transition-colors duration-500",
                    isComplete ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Animated progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted mt-8">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-in-out",
            status === "processing"
              ? "animate-pulse bg-primary"
              : "bg-primary",
          )}
          style={{
            width:
              status === "queued"
                ? "5%"
                : status === "processing"
                  ? "50%"
                  : status === "done"
                    ? "100%"
                    : "0%",
          }}
          role="progressbar"
          aria-valuenow={
            status === "queued" ? 5 : status === "processing" ? 50 : status === "done" ? 100 : 0
          }
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <p className="text-center text-sm font-medium text-muted-foreground mt-2">
        {status === "queued"
          ? "Waiting for a recording slot…"
          : status === "processing"
            ? "Capturing your website, this takes about a minute"
            : status === "done"
              ? "Recording complete!"
              : ""}
      </p>
    </div>
  );
}
