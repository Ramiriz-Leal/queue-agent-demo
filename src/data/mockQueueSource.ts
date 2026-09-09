import type { JobStatus, QueueJob } from "@/domain/entities";
import type { QueueSource } from "@/domain/interfaces";
import { newId } from "@/lib/utils";

const JOB_TEMPLATES = [
  { title: "Rebuild search index", payload: "index=products" },
  { title: "Generate weekly report", payload: "report=weekly-summary" },
  { title: "Sync inventory snapshot", payload: "target=warehouse-3" },
  { title: "Compress log archive", payload: "range=last-24h" },
  { title: "Validate uploaded batch", payload: "batch=incoming-csv" },
];

function randomTemplate() {
  return JOB_TEMPLATES[Math.floor(Math.random() * JOB_TEMPLATES.length)];
}

export class MockQueueSource implements QueueSource {
  private jobs: QueueJob[] = [];
  private lastSpawnAt = 0;

  constructor() {
    this.spawnJob();
    this.spawnJob();
  }

  private spawnJob(): void {
    const template = randomTemplate();
    const job: QueueJob = {
      id: newId("job"),
      title: template.title,
      payload: template.payload,
      status: "queued",
      log: [],
      createdAt: new Date().toISOString(),
      startedAt: null,
      finishedAt: null,
    };
    this.jobs.push(job);
  }

  private maybeSpawnNewArrivals(): void {
    const now = Date.now();
    if (now - this.lastSpawnAt < 4000) return;
    if (Math.random() < 0.5) {
      this.spawnJob();
      this.lastSpawnAt = now;
    }
  }

  async fetchQueuedJobs(): Promise<QueueJob[]> {
    this.maybeSpawnNewArrivals();
    return this.jobs.filter((job) => job.status === "queued");
  }

  async listAll(): Promise<QueueJob[]> {
    return [...this.jobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async markStarted(jobId: string): Promise<QueueJob> {
    const job = this.find(jobId);
    job.status = "processing";
    job.startedAt = new Date().toISOString();
    return job;
  }

  async appendLog(jobId: string, line: string): Promise<QueueJob> {
    const job = this.find(jobId);
    job.log.push(`[${new Date().toLocaleTimeString()}] ${line}`);
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
    if (!job) throw new Error(`Job ${jobId} not found`);
    return job;
  }
}

export const queueSource = new MockQueueSource();
