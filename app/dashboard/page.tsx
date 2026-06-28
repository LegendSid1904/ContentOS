import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { MODULES, APPS, APP_MODULES } from "@/lib/constants";
import { getModuleUsage, getRecentProjects, getDashboardStats } from "@/lib/actions";
import { UsageGrid, UsageCard } from "@/components/ui/module-card";

function getAppForModule(moduleId: string): string | null {
  for (const app of APPS) {
    if ((app.modules as readonly string[]).includes(moduleId)) return app.id;
  }
  return null;
}

function formatDate(date: Date) {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const allAppModules = Object.values(APP_MODULES).flat();
const dedupedModules = allAppModules.filter((m, i, a) => a.findIndex((x) => x.id === m.id) === i);

const moduleIcons: Record<string, string> = {
  "script-writer": "⌨",
  "content-ideas": "◈",
  "competitor-intel": "◎",
  "video-brief": "▷",
  "page-setup": "⌘",
  "growth-strategy": "↗",
};

export default async function DashboardPage() {
  const user = await currentUser();

  let usageMap: Record<string, number> = {};
  let recentProjects: Awaited<ReturnType<typeof getRecentProjects>> = [];
  let stats: Awaited<ReturnType<typeof getDashboardStats>> = null;

  try {
    const [usage, projects, dashStats] = await Promise.all([
      getModuleUsage(),
      getRecentProjects(12),
      getDashboardStats(),
    ]);
    usageMap = Object.fromEntries(usage.map((u) => [u.module, u.count]));
    recentProjects = projects;
    stats = dashStats;
  } catch {}

  const hasProjects = stats && stats.totalProjects > 0;

  return (
    <>
      <section className="ds-section">
        <div className="flex items-center justify-between mb-8">
          <div className="w-full">
            <p className="sec-eyebrow mb-3">
              <span className="sec-eyebrow-dot" />
              Dashboard :: Terminal
            </p>
            <div className="ascii-box p-4 max-w-xl">
              <div className="terminal-welcome">
                <p className="leading-7">
                  <span className="prompt">❯ </span>
                  <span className="cmd">echo &quot;SESSION :: {user ? user.firstName : "PREVIEW"}&quot;</span>
                </p>
                <p className="output leading-7">
                  {user ? `[OK] Welcome back, ${user.firstName ?? "Creator"}. System restored.` : "[OK] Status: preview mode  ·  sign in to save & unlock unlimited use"}
                </p>
                <p className="output leading-7 text-tx-3">
                   [INFO] {stats ? `${stats.totalProjects} projects across ${stats.modulesUsed} modules` : `${dedupedModules.length} tools across ${APPS.length} platforms — 1 free generation each`}  ·  standby for input
                </p>
                <p className="leading-7 mt-1">
                  <span className="prompt">❯ </span>
                  <span className="cmd ai-cursor" />
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="sec-eyebrow mb-3">
            <span className="sec-eyebrow-dot" />
            System :: Overview
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="ascii-box p-4 text-center">
              <div className="font-mono text-[22px] font-bold text-te-400 leading-none mb-1">{stats ? stats.totalProjects : 0}</div>
              <div className="font-mono text-[11px] text-tx-3 tracking-[0.15em] uppercase">total projects</div>
            </div>
            <div className="ascii-box p-4 text-center">
              <div className="font-mono text-[22px] font-bold text-vi-400 leading-none mb-1">{stats ? stats.modulesUsed : 0}</div>
              <div className="font-mono text-[11px] text-tx-3 tracking-[0.15em] uppercase">modules used</div>
            </div>
            <div className="ascii-box p-4 text-center">
              <div className="font-mono text-[22px] font-bold text-te-400 leading-none mb-1">{stats ? stats.recentCount : 0}</div>
              <div className="font-mono text-[11px] text-tx-3 tracking-[0.15em] uppercase">last 7 days</div>
            </div>
          </div>
          {!stats && (
            <p className="font-mono text-[11px] text-tx-4 mt-2 text-center tracking-wider">
              &gt; sign in to track project statistics
            </p>
          )}
          {stats && !hasProjects && (
            <p className="font-mono text-[11px] text-tx-4 mt-2 text-center tracking-wider">
              &gt; no projects yet — create your first one below
            </p>
          )}
        </div>

        {recentProjects.length > 0 ? (
          <div className="mb-8">
            <p className="sec-eyebrow mb-3">
              <span className="sec-eyebrow-dot" />
              Activity :: Recent Projects
            </p>
            <div className="ascii-box p-4">
              <div className="space-y-1">
                {recentProjects.map((project, i) => {
                  const modIcon = moduleIcons[project.module] || "○";
                  const appId = getAppForModule(project.module);
                  const href = appId ? `/dashboard/app/${appId}/${project.module}` : `/dashboard/${project.module}`;

                  return (
                    <Link
                      key={`${project.id}-${i}`}
                      href={href}
                      className="flex items-center gap-3 px-3 py-2 rounded-[2px] hover:bg-white/[0.03] transition-colors group"
                    >
                      <span className="font-mono text-[13px] text-tx-2 flex-shrink-0 w-5 text-center">{modIcon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-[13px] text-tx-1 truncate group-hover:text-te-400 transition-colors">{project.title}</div>
                      </div>
                      <span className="font-mono text-[10px] text-tx-4 tracking-[0.08em] uppercase flex-shrink-0">{project.module.replace(/-/g, " ")}</span>
                      <span className="font-mono text-[10px] text-tx-4 flex-shrink-0 w-14 text-right">{formatDate(project.createdAt)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <p className="sec-eyebrow mb-3">
              <span className="sec-eyebrow-dot" />
              Activity :: No Projects
            </p>
            <div className="ascii-box p-6 text-center">
              <div className="font-mono text-[12px] text-tx-3 leading-relaxed">
                <p>&gt; echo &quot;no recent projects found&quot;</p>
                <p className="mt-2 text-tx-4">
                  [INFO] select a module from the sidebar to create your first project
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 mt-4">
                {dedupedModules.slice(0, 4).map((mod) => (
                  <Link
                    key={mod.id}
                    href={`/dashboard/${mod.id}`}
                    className="btn-terminal text-[11px]"
                  >
                    {mod.icon} {mod.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <p className="sec-eyebrow mb-3">
            <span className="sec-eyebrow-dot" />
            Usage :: Module Activity
          </p>
          <UsageGrid>
            {dedupedModules.map((mod, i) => (
              <UsageCard
                key={mod.id}
                module={mod}
                count={usageMap[mod.id] ?? 0}
                index={i}
              />
            ))}
          </UsageGrid>
        </div>

      </section>
    </>
  );
}
