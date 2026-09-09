import { useEffect, useState } from "react";
import { agentService } from "@/services/container";
import type { AgentSnapshot } from "@/services/agentService";

export function useAgent() {
  const [snapshot, setSnapshot] = useState<AgentSnapshot>(agentService.getSnapshot());

  useEffect(() => {
    void agentService.initialize();
    return agentService.subscribe(setSnapshot);
  }, []);

  return {
    ...snapshot,
    start: () => agentService.start(),
    stop: () => agentService.stop(),
    updateSettings: agentService.updateSettings.bind(agentService),
  };
}
