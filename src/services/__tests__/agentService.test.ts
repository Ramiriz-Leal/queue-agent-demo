import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AgentService } from "@/services/agentService";
import { FakeQueueSource, FakeSettingsStore } from "./fakes";

describe("AgentService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads settings and jobs on initialize", async () => {
    const queue = new FakeQueueSource();
    queue.enqueue("Rebuild index");
    const service = new AgentService(queue, new FakeSettingsStore());

    await service.initialize();

    const snapshot = service.getSnapshot();
    expect(snapshot.isRunning).toBe(false);
    expect(snapshot.jobs).toHaveLength(1);
  });

  it("processes a queued job to completion once started", async () => {
    const queue = new FakeQueueSource();
    queue.enqueue("Rebuild index");
    const settings = new FakeSettingsStore();
    settings.current = { ...settings.current, simulatedFailureRate: 0, pollIntervalSeconds: 5 };
    const service = new AgentService(queue, settings);
    await service.initialize();

    service.start();
    expect(service.getSnapshot().isRunning).toBe(true);

    await vi.advanceTimersByTimeAsync(5000);

    const snapshot = service.getSnapshot();
    expect(snapshot.jobs[0].status).toBe("succeeded");
    expect(snapshot.activeJobIds).toHaveLength(0);
  });

  it("stops polling when stop is called", async () => {
    const service = new AgentService(new FakeQueueSource(), new FakeSettingsStore());
    await service.initialize();

    service.start();
    service.stop();

    expect(service.getSnapshot().isRunning).toBe(false);
  });

  it("notifies subscribers on state changes", async () => {
    const service = new AgentService(new FakeQueueSource(), new FakeSettingsStore());
    await service.initialize();

    const listener = vi.fn();
    const unsubscribe = service.subscribe(listener);
    service.start();

    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it("persists updated settings", async () => {
    const settingsStore = new FakeSettingsStore();
    const service = new AgentService(new FakeQueueSource(), settingsStore);
    await service.initialize();

    await service.updateSettings({ ...settingsStore.current, maxConcurrentJobs: 7 });

    expect(settingsStore.current.maxConcurrentJobs).toBe(7);
    expect(service.getSnapshot().settings.maxConcurrentJobs).toBe(7);
  });
});
