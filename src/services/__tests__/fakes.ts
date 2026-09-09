import { DEFAULT_SETTINGS, type AgentSettings, type JobStatus, type QueueJob } from "@/domain/entities";
import type { QueueSource, SettingsStore } from "@/domain/interfaces";
import { newId } from "@/lib/utils";

export class FakeQueueSource implements QueueSource {
  jobs: QueueJob[] = [];

  enqueue(title: string): QueueJob {
    const job: QueueJob = {
      id: newId("job"),
      title,
      payload: "test-payload",
      status: "queued",
      log: [],
      createdAt: new Date().toISOString(),
      startedAt: null,
      finishedAt: null,
    };
    this.jobs.push(job);
    return job;
  }

  async fetchQueuedJobs(): Promise<QueueJob[]> {
    return this.jobs.filter((job) => job.status === "queued");
  }

  async listAll(): Promise<QueueJob[]> {
    return [...this.jobs];
  }

  async markStarted(jobId: string): Promise<QueueJob> {
    const job = this.find(jobId);
    job.status = "processing";
    job.startedAt = new Date().toISOString();
    return job;
  }

  async appendLog(jobId: string, line: string): Promise<QueueJob> {
    const job = this.find(jobId);
    job.log.push(line);
    return job;
  }

  async markFinished(jobId: string, status: Extract<JobStatus, "succeeded" | "failed">): Promise<QueueJob> {
    const job = this.find(jobId);
    job.status = status;
    job.finishedAt = new Date().toISOString();
    return job;
  }

  private find(jobId: string): QueueJob {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job) throw new Error("job not found");
    return job;
  }
}

export class FakeSettingsStore implements SettingsStore {
  current: AgentSettings = { ...DEFAULT_SETTINGS };

  async load(): Promise<AgentSettings> {
    return this.current;
  }

  async save(settings: AgentSettings): Promise<AgentSettings> {
    this.current = settings;
    return settings;
  }
}
