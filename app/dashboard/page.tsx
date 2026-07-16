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
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-te-400/60" />
            <span className="font-mono text-[11px] text-tx-3 tracking-[0.15em] uppercase">Dashboard</span>
          </div>
          <div className="max-w-xl">
            <h1 className="font-display text-[26px] font-bold text-tx-1 tracking-tight mb-2">
              {user ? `Welcome back, ${user.firstName ?? "creator"}` : "Welcome"}
            </h1>
            <p className="font-mono text-[13px] text-tx-2 leading-relaxed">
              {stats
                ? `${stats.totalProjects} projects across ${stats.modulesUsed} tools`
                : `${dedupedModules.length} tools across ${APPS.length} platforms`}
              {!stats && " — sign in to save your work and unlock unlimited use"}
            </p>
          </div>
        </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-vi-400/60" />
              <span className="font-mono text-[11px] text-tx-3 tracking-[0.15em] uppercase">Overview</span>
            </div>
            <div className="relative crt-brackets">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4">
                <div className="text-center">
                  <div className="font-mono text-[26px] font-bold text-te-400 leading-none mb-1">{stats ? stats.totalProjects : 0}</div>
                  <div className="font-mono text-[11px] text-tx-3 tracking-[0.08em] uppercase">Total projects</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-[26px] font-bold text-vi-400 leading-none mb-1">{stats ? stats.modulesUsed : 0}</div>
                  <div className="font-mono text-[11px] text-tx-3 tracking-[0.08em] uppercase">Tools used</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-[26px] font-bold text-te-400 leading-none mb-1">{stats ? stats.recentCount : 0}</div>
                  <div className="font-mono text-[11px] text-tx-3 tracking-[0.08em] uppercase">Created this week</div>
                </div>
              </div>
            </div>
            {!stats && (
              <p className="font-mono text-[11px] text-tx-4 mt-2 text-center">
                Sign in to track your project stats
              </p>
            )}
            {stats && !hasProjects && (
              <p className="font-mono text-[11px] text-tx-4 mt-2 text-center">
                No projects yet — create your first one below
              </p>
            )}
          </div>

        {recentProjects.length > 0 ? (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-te-400/60" />
              <span className="font-mono text-[11px] text-tx-3 tracking-[0.15em] uppercase">Recent projects</span>
            </div>
            <div className="relative crt-brackets p-4">
              <div className="space-y-1">
                {recentProjects.map((project, i) => {
                  const modIcon = moduleIcons[project.module] || "○";
                  const appId = getAppForModule(project.module);
                  const href = appId ? `/dashboard/app/${appId}/${project.module}` : `/dashboard/${project.module}`;

                  return (
                    <Link
                      key={`${project.id}-${i}`}
                      href={href}
                      className="flex items-center gap-3 px-3 py-2 rounded-r3 hover:bg-white/[0.03] transition-colors group"
                    >
                      <span className="font-mono text-[13px] text-tx-2 flex-shrink-0 w-5 text-center">{modIcon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-[13px] text-tx-1 truncate group-hover:text-te-400 transition-colors">{project.title}</div>
                      </div>
                      <span className="font-mono text-[10px] text-tx-4 flex-shrink-0 uppercase tracking-[0.08em]">{project.module.replace(/-/g, " ")}</span>
                      <span className="font-mono text-[10px] text-tx-4 flex-shrink-0 w-14 text-right">{formatDate(project.createdAt)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-te-400/60" />
              <span className="font-mono text-[11px] text-tx-3 tracking-[0.15em] uppercase">Recent projects</span>
            </div>
            <div className="relative crt-brackets p-6 text-center">
              <p className="font-mono text-[12px] text-tx-3 mb-4">
                No projects yet. Pick a tool below to create your first one.
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {dedupedModules.slice(0, 4).map((mod) => (
                  <Link
                    key={mod.id}
                    href={`/dashboard/${mod.id}`}
                    className="font-mono text-[12px] font-medium text-tx-2 border border-white/[0.06] px-3 py-2 hover:bg-white/[0.04] hover:text-tx-1 transition-all uppercase tracking-[0.08em]"
                  >
                    {mod.icon} {mod.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-vi-400/60" />
            <span className="font-mono text-[11px] text-tx-3 tracking-[0.15em] uppercase">Tools</span>
          </div>
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
