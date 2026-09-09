import { invoke } from "@tauri-apps/api/core";
import { DEFAULT_SETTINGS, type AgentSettings } from "@/domain/entities";
import type { SettingsStore } from "@/domain/interfaces";
import { isTauriRuntime } from "@/lib/tauriRuntime";
import { LocalSettingsStore } from "./localSettingsStore";

export class TauriSettingsStore implements SettingsStore {
  private readonly fallback = new LocalSettingsStore();

  async load(): Promise<AgentSettings> {
    if (!isTauriRuntime()) return this.fallback.load();
    const loaded = await invoke<Partial<AgentSettings>>("load_settings");
    return { ...DEFAULT_SETTINGS, ...loaded };
  }

  async save(settings: AgentSettings): Promise<AgentSettings> {
    if (!isTauriRuntime()) return this.fallback.save(settings);
    return invoke<AgentSettings>("save_settings", { settings });
  }
}

export const settingsStore = new TauriSettingsStore();
