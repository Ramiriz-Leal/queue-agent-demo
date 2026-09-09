import { useAgent } from "@/hooks/useAgent";
import { StatusBadge } from "@/components/StatusBadge";

export function DashboardPage() {
  const { isRunning, jobs, activeJobIds, settings, start, stop } = useAgent();

  const queuedCount = jobs.filter((job) => job.status === "queued").length;
  const succeededCount = jobs.filter((job) => job.status === "succeeded").length;
  const failedCount = jobs.filter((job) => job.status === "failed").length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Queue</h1>
          <p className="mt-1 text-sm text-slate-500">
            Polling every {settings.pollIntervalSeconds}s &middot; up to {settings.maxConcurrentJobs} jobs at once
          </p>
        </div>
        {isRunning ? (
          <button
            onClick={stop}
            className="rounded-md bg-rose-600/20 px-4 py-2 text-sm font-medium text-rose-400 hover:bg-rose-600/30"
          >
            Stop agent
          </button>
        ) : (
          <button
            onClick={start}
            className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-500"
          >
            Start agent
          </button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-4 gap-4">
        <StatCard label="Queued" value={queuedCount} />
        <StatCard label="Processing" value={activeJobIds.length} />
        <StatCard label="Succeeded" value={succeededCount} />
        <StatCard label="Failed" value={failedCount} />
      </div>

      <div className="mt-6 space-y-3">
        {jobs.length === 0 && <p className="text-sm text-slate-500">No jobs in the queue yet.</p>}
        {jobs.map((job) => (
          <div key={job.id} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{job.title}</p>
                <p className="text-xs text-slate-500">{job.payload}</p>
              </div>
              <StatusBadge status={job.status} />
            </div>
            {job.log.length > 0 && (
              <ul className="mt-3 space-y-0.5 border-t border-slate-800 pt-3 font-mono text-xs text-slate-500">
                {job.log.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
