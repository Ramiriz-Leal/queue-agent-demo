import type { JobStatus } from "@/domain/entities";

const STYLES: Record<JobStatus, string> = {
  queued: "bg-slate-700 text-slate-200",
  processing: "bg-accent-600/20 text-accent-400",
  succeeded: "bg-emerald-500/20 text-emerald-400",
  failed: "bg-rose-500/20 text-rose-400",
};

const LABELS: Record<JobStatus, string> = {
  queued: "Queued",
  processing: "Processing",
  succeeded: "Succeeded",
  failed: "Failed",
};

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}>{LABELS[status]}</span>
  );
}
