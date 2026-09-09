import { isTauriRuntime } from "@/lib/tauriRuntime";

export async function setLaunchAtStartup(enabled: boolean): Promise<void> {
  if (!isTauriRuntime()) return;
  const { enable, disable } = await import("@tauri-apps/plugin-autostart");
  if (enabled) {
    await enable();
  } else {
    await disable();
  }
}

export async function pickWorkingDirectory(): Promise<string | null> {
  if (!isTauriRuntime()) return null;
  const { open } = await import("@tauri-apps/plugin-dialog");
  const selected = await open({ directory: true, multiple: false });
  return typeof selected === "string" ? selected : null;
}
