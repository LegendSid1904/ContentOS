import Link from "next/link";
import { notFound } from "next/navigation";
import { APPS, APP_MODULES } from "@/lib/constants";
import { ModuleGrid, ModuleCard } from "@/components/ui/module-card";

export function generateStaticParams() {
  return APPS.map((app) => ({ appId: app.id }));
}

export default async function AppPage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = await params;
  const app = APPS.find((a) => a.id === appId);
  if (!app) notFound();

  const appModules = APP_MODULES[appId] ?? [];

  return (
    <section className={`ds-section crt-accent-${appId}`}>
      {/* App header */}
      <div className="ascii-box rounded-r2 p-5 mb-8">
        <div className="flex items-center gap-4 mb-3">
          <span className="sec-eyebrow-dot" />
          <span className="font-mono text-[11px] text-tx-3 tracking-[0.2em] uppercase">
            app :: {app.id}
          </span>
        </div>
        <h1 className="font-display text-[28px] font-bold text-tx-1 tracking-tight mb-2">
          <span className="angle-bracket">&lt;</span>
          {app.name}
          <span className="angle-bracket">&gt;</span>
        </h1>
        <p className="font-display text-[13px] text-tx-3 leading-relaxed">
          &gt; {app.desc}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-4">
          {appModules.map((mod) => (
            <span key={mod.id} className="tag-terminal">
              <span className="text-vi-400">#</span>
              {mod.name.toLowerCase().replace(/\s+/g, "-")}
            </span>
          ))}
        </div>
      </div>

      {/* Module grid */}
      <div className="mb-6">
        <p className="sec-eyebrow mb-3">
          <span className="sec-eyebrow-dot" />
          Modules :: {app.name} Tools
        </p>
      </div>
      <ModuleGrid>
        {appModules.map((mod, i) => (
          <div key={mod.id} className={`reveal d${(i % 5) + 1}`}>
            <Link href={`/dashboard/app/${app.id}/${mod.id}`}>
              <ModuleCard module={mod} />
            </Link>
          </div>
        ))}
      </ModuleGrid>
    </section>
  );
}
