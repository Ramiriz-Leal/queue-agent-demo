import { NavLink, Outlet } from "react-router-dom";
import { useAgent } from "@/hooks/useAgent";

export function Layout() {
  const { isRunning } = useAgent();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full" style={{ background: isRunning ? "#34d399" : "#64748b" }} />
          <div>
            <p className="text-sm font-semibold">Automation Agent Console</p>
            <p className="text-xs text-slate-500">Standalone demo &middot; mocked queue, no external backend</p>
          </div>
        </div>
        <nav className="flex gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `rounded-md px-3 py-1.5 text-sm font-medium ${
                isActive ? "bg-accent-600/20 text-accent-400" : "text-slate-400 hover:text-slate-200"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `rounded-md px-3 py-1.5 text-sm font-medium ${
                isActive ? "bg-accent-600/20 text-accent-400" : "text-slate-400 hover:text-slate-200"
              }`
            }
          >
            Settings
          </NavLink>
        </nav>
      </header>
      <main className="flex-1 bg-slate-950 p-6">
        <Outlet />
      </main>
    </div>
  );
}
