import { DEFAULT_SETTINGS, type AgentSettings, type QueueJob } from "@/domain/entities";
import type { QueueSource, SettingsStore } from "@/domain/interfaces";
import { delay } from "@/lib/utils";

export interface AgentSnapshot {
  isRunning: boolean;
  settings: AgentSettings;
  jobs: QueueJob[];
  activeJobIds: string[];
}

type Listener = (snapshot: AgentSnapshot) => void;

const PROCESSING_STEPS = ["Fetching payload", "Running task", "Persisting result"];

export class AgentService {
  private settings: AgentSettings = DEFAULT_SETTINGS;
  private jobs: QueueJob[] = [];
  private activeJobIds = new Set<string>();
  private isRunning = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<Listener>();

  constructor(
    private readonly queue: QueueSource,
    private readonly settingsRepository: SettingsStore,
  ) {}

  async initialize(): Promise<void> {
    this.settings = await this.settingsRepository.load();
    this.jobs = await this.queue.listAll();
    this.emit();
    if (this.settings.autoStartAgent) this.start();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  getSnapshot(): AgentSnapshot {
    return {
      isRunning: this.isRunning,
      settings: this.settings,
      jobs: this.jobs,
      activeJobIds: [...this.activeJobIds],
    };
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timer = setInterval(() => void this.poll(), this.settings.pollIntervalSeconds * 1000);
    void this.poll();
    this.emit();
  }

  stop(): void {
    this.isRunning = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.emit();
  }

  async updateSettings(next: AgentSettings): Promise<void> {
    this.settings = await this.settingsRepository.save(next);
    if (this.isRunning) {
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(() => void this.poll(), this.settings.pollIntervalSeconds * 1000);
    }
    this.emit();
  }

  private async poll(): Promise<void> {
    const queued = await this.queue.fetchQueuedJobs();
    const capacity = this.settings.maxConcurrentJobs - this.activeJobIds.size;
    const toStart = queued.slice(0, Math.max(0, capacity));

    for (const job of toStart) {
      this.activeJobIds.add(job.id);
      void this.processJob(job.id);
    }

    this.jobs = await this.queue.listAll();
    this.emit();
  }

  private async processJob(jobId: string): Promise<void> {
    await this.queue.markStarted(jobId);
    this.jobs = await this.queue.listAll();
    this.emit();

    for (const step of PROCESSING_STEPS) {
      await this.queue.appendLog(jobId, step);
      this.jobs = await this.queue.listAll();
      this.emit();
      await delay(undefined, 700);
    }

    const failed = Math.random() < this.settings.simulatedFailureRate;
    await this.queue.appendLog(jobId, failed ? "Task failed" : "Task completed successfully");
    await this.queue.markFinished(jobId, failed ? "failed" : "succeeded");

    this.activeJobIds.delete(jobId);
    this.jobs = await this.queue.listAll();
    this.emit();
  }

  private emit(): void {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}
