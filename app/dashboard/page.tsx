import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { ModuleGrid, ModuleCard } from "@/components/ui/module-card";
import { MODULES } from "@/lib/constants";
import { getModuleUsage } from "@/lib/actions";
import { UsageGrid, UsageCard } from "@/components/ui/module-card";

export default async function DashboardPage() {
  const user = await currentUser();

  let usageMap: Record<string, number> = {};
  try {
    const usage = await getModuleUsage();
    usageMap = Object.fromEntries(usage.map((u) => [u.module, u.count]));
  } catch {} // usage tracking is non-critical

  return (
    <>
      <section className="ds-section">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="sec-eyebrow">
              <span className="sec-eyebrow-dot" />
              Dashboard :: Terminal
            </p>
            <div className="bg-[#0f1011] border border-[#23252a] rounded-r2 p-4 mb-4 max-w-xl">
              <div className="terminal-welcome">
                <p className="leading-7">
                  <span className="prompt">❯ </span>
                  <span className="cmd">echo &quot;SESSION :: {user?.firstName ?? "CREATOR"}&quot;</span>
                </p>
                <p className="output leading-7">
                  [OK] Welcome back, {user?.firstName ?? "Creator"}. System restored.
                </p>
                <p className="output leading-7 text-tx-3">
                  [INFO] {MODULES.length} modules available  ·  standby for input
                </p>
                <p className="leading-7 mt-1">
                  <span className="prompt">❯ </span>
                  <span className="cmd ai-cursor" />
                </p>
              </div>
            </div>
          </div>
        </div>

        {Object.keys(usageMap).length > 0 && (
          <div className="mb-8">
            <p className="sec-eyebrow mb-3">
              <span className="sec-eyebrow-dot" />
              Usage :: Module Activity
            </p>
            <UsageGrid>
              {MODULES.map((mod, i) => (
                <UsageCard
                  key={mod.id}
                  module={mod}
                  count={usageMap[mod.id] ?? 0}
                  index={i}
                />
              ))}
            </UsageGrid>
          </div>
        )}

        <div>
          <p className="sec-eyebrow mb-3">
            <span className="sec-eyebrow-dot" />
            Modules :: All Tools
          </p>
          <ModuleGrid>
            {MODULES.map((mod, i) => (
              <div key={mod.id} className={`reveal d${(i % 5) + 1}`}>
                <Link href={`/dashboard/${mod.id}`}>
                  <ModuleCard module={mod} />
                </Link>
              </div>
            ))}
          </ModuleGrid>
        </div>
      </section>
    </>
  );
}
