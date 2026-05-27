import { currentUser } from "@clerk/nextjs/server";
import { ModuleGrid, ModuleCard } from "@/components/ui/module-card";
import { MODULES } from "@/lib/constants";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <>
      <section className="ds-section">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="sec-eyebrow">
              <span className="sec-eyebrow-dot" />
              Dashboard :: Terminal
            </p>
            <div className="terminal-frame p-4 mb-4 max-w-xl">
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

        <ModuleGrid>
          {MODULES.map((mod, i) => (
            <div key={mod.id} className={`reveal d${(i % 5) + 1}`}>
              <ModuleCard
                module={mod}
                onClick={() => {
                  window.location.href = `/dashboard/${mod.id}`;
                }}
              />
            </div>
          ))}
        </ModuleGrid>
      </section>
    </>
  );
}
