import { queueSource } from "@/data/mockQueueSource";
import { settingsStore } from "@/data/tauriSettingsStore";
import { AgentService } from "./agentService";

export const agentService = new AgentService(queueSource, settingsStore);
