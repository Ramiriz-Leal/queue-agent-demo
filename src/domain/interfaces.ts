import type { AgentSettings, JobStatus, QueueJob } from "./entities";

export interface QueueSource {
  fetchQueuedJobs(): Promise<QueueJob[]>;
  markStarted(jobId: string): Promise<QueueJob>;
  appendLog(jobId: string, line: string): Promise<QueueJob>;
  markFinished(jobId: string, status: Extract<JobStatus, "succeeded" | "failed">): Promise<QueueJob>;
  listAll(): Promise<QueueJob[]>;
}

export interface SettingsStore {
  load(): Promise<AgentSettings>;
  save(settings: AgentSettings): Promise<AgentSettings>;
}
