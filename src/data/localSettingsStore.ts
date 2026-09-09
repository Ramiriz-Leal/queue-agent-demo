import { DEFAULT_SETTINGS, type AgentSettings } from "@/domain/entities";
import type { SettingsStore } from "@/domain/interfaces";
import { loadFromStorage, saveToStorage } from "@/lib/utils";

const STORAGE_KEY = "demo.agent-settings";

export class LocalSettingsStore implements SettingsStore {
  async load(): Promise<AgentSettings> {
    return loadFromStorage(STORAGE_KEY, DEFAULT_SETTINGS);
  }

  async save(settings: AgentSettings): Promise<AgentSettings> {
    saveToStorage(STORAGE_KEY, settings);
    return settings;
  }
}

export const settingsStore = new LocalSettingsStore();
