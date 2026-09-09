export type JobStatus = "queued" | "processing" | "succeeded" | "failed";

export interface QueueJob {
  id: string;
  title: string;
  payload: string;
  status: JobStatus;
  log: string[];
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}

export type AiModel = "nova-fast" | "nova-core" | "nova-pro" | "nova-max";
export type EffortLevel = "low" | "medium" | "high" | "xhigh" | "max";

export interface AgentSettings {
  aiModel: AiModel;
  effortLevel: EffortLevel;
  workingDirectory: string;
  launchAtStartup: boolean;
  pollIntervalSeconds: number;
  maxConcurrentJobs: number;
  autoStartAgent: boolean;
  simulatedFailureRate: number;
}

export const AI_MODEL_OPTIONS: { value: AiModel; label: string }[] = [
  { value: "nova-fast", label: "Nova Fast" },
  { value: "nova-core", label: "Nova Core" },
  { value: "nova-pro", label: "Nova Pro" },
  { value: "nova-max", label: "Nova Max" },
];

export const EFFORT_LEVEL_OPTIONS: { value: EffortLevel; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "xhigh", label: "Very high" },
  { value: "max", label: "Maximum" },
];

export const DEFAULT_SETTINGS: AgentSettings = {
  aiModel: "nova-core",
  effortLevel: "medium",
  workingDirectory: "",
  launchAtStartup: false,
  pollIntervalSeconds: 5,
  maxConcurrentJobs: 1,
  autoStartAgent: false,
  simulatedFailureRate: 0.15,
};
