import { useState } from "react";
import { useAgent } from "@/hooks/useAgent";
import {
  AI_MODEL_OPTIONS,
  EFFORT_LEVEL_OPTIONS,
  type AgentSettings,
  type AiModel,
  type EffortLevel,
} from "@/domain/entities";
import { pickWorkingDirectory, setLaunchAtStartup } from "@/services/autostart";

export function SettingsPage() {
  const { settings, updateSettings } = useAgent();
  const [form, setForm] = useState<AgentSettings>(settings);
  const [saved, setSaved] = useState(false);

  async function handleSubmit() {
    await updateSettings(form);
    await setLaunchAtStartup(form.launchAtStartup);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handlePickFolder() {
    const folder = await pickWorkingDirectory();
    if (folder) setForm({ ...form, workingDirectory: folder });
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Configure the AI model, execution folder and polling behavior.</p>

      <div className="mt-6 space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">AI Model</p>

        <div>
          <label className="text-sm font-medium">Model</label>
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={form.aiModel}
            onChange={(e) => setForm({ ...form, aiModel: e.target.value as AiModel })}
          >
            {AI_MODEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Effort</label>
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={form.effortLevel}
            onChange={(e) => setForm({ ...form, effortLevel: e.target.value as EffortLevel })}
          >
            {EFFORT_LEVEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Working directory</label>
          <div className="mt-1 flex gap-2">
            <input
              readOnly
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-400"
              value={form.workingDirectory || "No folder selected"}
            />
            <button
              onClick={handlePickFolder}
              className="shrink-0 rounded-md border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
            >
              Select folder
            </button>
          </div>
        </div>

        <hr className="border-slate-800" />
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Agent</p>

        <div>
          <label className="text-sm font-medium">Poll interval (seconds)</label>
          <input
            type="number"
            min={1}
            max={60}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={form.pollIntervalSeconds}
            onChange={(e) => setForm({ ...form, pollIntervalSeconds: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Max concurrent jobs</label>
          <input
            type="number"
            min={1}
            max={10}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={form.maxConcurrentJobs}
            onChange={(e) => setForm({ ...form, maxConcurrentJobs: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Simulated failure rate</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            className="mt-2 w-full"
            value={form.simulatedFailureRate}
            onChange={(e) => setForm({ ...form, simulatedFailureRate: Number(e.target.value) })}
          />
          <p className="text-xs text-slate-500">{Math.round(form.simulatedFailureRate * 100)}% of jobs will fail</p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.autoStartAgent}
            onChange={(e) => setForm({ ...form, autoStartAgent: e.target.checked })}
          />
          Start polling automatically when the app opens
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.launchAtStartup}
            onChange={(e) => setForm({ ...form, launchAtStartup: e.target.checked })}
          />
          Launch this app when Windows starts
        </label>

        <button
          onClick={handleSubmit}
          className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-500"
        >
          Save settings
        </button>
        {saved && <p className="text-sm text-emerald-400">Settings saved.</p>}
      </div>
    </div>
  );
}
