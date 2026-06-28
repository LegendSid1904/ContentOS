import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { APP_NAME, APP_TAGLINE, APP_DESC, APPS } from "@/lib/constants";
import LoadingGate from "@/components/loading-gate";

export default async function Home() {
  const { userId } = await auth();

  return (
    <LoadingGate>
      <div className="cyber-grid">
        <div className="cyber-grid-inner" />
      </div>
      <div className="gradient-mesh" />

      {/* Terminal bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[48px] flex items-center justify-between px-5 border-b border-white/[0.04] bg-bg-void/90 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <span className="font-mono text-[11px] text-tx-3 tracking-[0.15em] uppercase">
            {'contentos // field station 01'}
          </span>
          <span className="font-mono text-[10px] text-tx-4 tracking-[0.1em] uppercase hidden sm:inline">
            {'build dev //'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[11px] text-te-400/60 tracking-[0.15em] uppercase items-center gap-1.5 hidden sm:flex">
            <span className="w-1.5 h-1.5 rounded-full bg-te-400/60" />
            sound :: on
          </span>
          {userId ? (
            <Link href="/dashboard" className="font-mono text-[11px] text-vi-400 tracking-[0.15em] uppercase hover:text-vi-300 transition-colors">
              [dashboard]
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="font-mono text-[11px] text-tx-2 tracking-[0.15em] uppercase border border-white/[0.06] px-3 py-1.5 rounded-[2px] hover:border-vi-500/20 hover:text-vi-300 transition-colors duration-150"
              >
                {">>"} log in
              </Link>
              <Link href="/sign-up" className="font-mono text-[11px] text-vi-400 tracking-[0.15em] uppercase hover:text-vi-300 transition-colors">
                [get started]
              </Link>
            </div>
          )}
        </div>
      </nav>

      <main className="wrapper" style={{ paddingTop: "48px" }}>
        {/* NAVIGATE block */}
        <section className="pt-20 pb-12">
          <div className="ascii-box p-5">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2 h-2 rounded-full bg-vi-400/40" />
              <span className="font-mono text-[11px] text-tx-3 tracking-[0.2em] uppercase">navigate</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Link href="/dashboard" className="nav-link-terminal">
                <span className="arrow-prefix" />main terminal
              </Link>
              <Link href="/onboarding" className="nav-link-terminal">
                <span className="arrow-prefix" />onboarding decrypt
              </Link>
              <Link href="/dashboard/brand-kit" className="nav-link-terminal">
                <span className="arrow-prefix" />brand analysis
              </Link>
              <Link href="/dashboard/settings" className="nav-link-terminal">
                <span className="arrow-prefix" />system config
              </Link>
            </div>
          </div>
        </section>

        {/* Hero */}
        <section className="pb-16">
          <div className="mb-6">
            <p className="field-label mb-4">
              <span className="text-vi-400">{'//'}</span> system file
            </p>
            <h1 className="hero-title-2a">
              <span className="angle-line">
                <span className="angle-bracket">&lt;</span>
                <span className="angle-text">{APP_NAME}</span>
                <span className="angle-bracket">&gt;</span>
              </span>
              <span className="angle-line">
                <span className="angle-bracket">&lt;</span>
                <span className="angle-text gradient-text">{APP_TAGLINE}</span>
                <span className="angle-bracket">&gt;</span>
              </span>
            </h1>
            <div className="angle-line mt-4">
              <span className="angle-bracket">&lt;</span>
              <span className="angle-text text-[15px] text-tx-2 font-light leading-relaxed max-w-xl font-display block">
                {APP_DESC}
              </span>
              <span className="angle-bracket">&gt;</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            {userId ? (
              <Link href="/dashboard" className="btn-terminal btn-terminal-primary">
                <span className="arrow-prefix" />open dashboard
              </Link>
            ) : (
              <>
                <Link href="/sign-up" className="btn-terminal btn-terminal-primary">
                  <span className="arrow-prefix" />acquire the dossier
                </Link>
                <Link href="/sign-in" className="btn-terminal">
                  <span className="arrow-prefix" />resume session
                </Link>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {APPS.map((app) => (
              <span key={app.id} className="tag-terminal">
                <span className="text-vi-400">#</span>
                {app.name.toLowerCase()}
              </span>
            ))}
          </div>
        </section>

        {/* Terminal status panel */}
        <div className="max-w-2xl mx-auto mb-20">
          <div className="terminal-frame-2a p-5">
            <div className="flex items-center gap-2 mb-4 font-mono text-[11px] text-tx-3 tracking-[0.15em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-vi-400 animate-beat-pulse" />
              tty/0 :: field-station 01
            </div>
            <div className="terminal-welcome">
              <p className="leading-7 text-tx-2">
                <span className="text-vi-400">&gt;</span> initializing contentos — field station deployed
              </p>
              <p className="output leading-7">[OK] brand kit . . . . . . . . . . . . . . configured</p>
              <p className="output leading-7">[OK] ai engine . . . . . . . . . . . . . . . online</p>
              <p className="output leading-7">[OK] content pipeline . . . . . . . . . . . ready</p>
              <p className="output leading-7">[OK] session . . . . . . . . . . . . . . . active</p>
              <p className="leading-7 mt-4 text-tx-3">
                <span className="text-te-400">&gt;</span> standing by, operator<span className="ai-cursor" />
              </p>
            </div>
          </div>
        </div>

        {/* App grid */}
        <section className="pb-20">
          <div className="ascii-box p-5 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-vi-400/40" />
              <span className="font-mono text-[11px] text-tx-3 tracking-[0.2em] uppercase">{'platforms // apps'}</span>
            </div>
            <h2 className="font-display text-[28px] font-bold text-tx-1 tracking-tight mb-2">
              Choose your platform
            </h2>
            <p className="font-display text-[13px] text-tx-3 leading-relaxed max-w-xl">
              &gt; pick a platform to see the tools designed for it — scripts, carousels, thumbnails, competitor intel, and growth strategy, all tailored to where you create.
            </p>
          </div>

          <div className="module-grid">
            {APPS.map((app) => {
              const appModuleCount = app.modules.length;
              return (
                <Link key={app.id} href={`/dashboard/app/${app.id}`} className={`module-card-2a platform-${app.id}`}>
                  <span className="mod-badge">[app :: {app.name.toLowerCase()}]</span>
                  <div className="mod-icon">{app.id === "youtube" ? "▶" : app.id === "instagram" ? "◎" : app.id === "tiktok" ? "◈" : "⌘"}</div>
                  <div className="mod-name">{app.name}</div>
                  <div className="mod-desc">{app.desc}</div>
                  <div className="font-mono text-[10px] text-tx-4 tracking-[0.15em] uppercase mt-2">
                    {appModuleCount} modules
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="pb-24 text-center">
          <div className="ascii-box max-w-lg mx-auto p-8">
            <h2 className="font-display text-[22px] font-bold text-tx-1 mb-3 tracking-tight">
              <span className="angle-bracket">&lt;</span>
              Ready to create?
              <span className="angle-bracket">&gt;</span>
            </h2>
            <p className="font-display text-[13px] text-tx-3 mb-6">
              &gt; your first script is 60 seconds away
            </p>
            {userId ? (
              <Link href="/dashboard" className="btn-terminal btn-terminal-primary">
                <span className="arrow-prefix" />open dashboard
              </Link>
            ) : (
              <Link href="/sign-up" className="btn-terminal btn-terminal-primary">
                <span className="arrow-prefix" />get started free
              </Link>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-5">
        <div className="wrapper flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-tx-4 tracking-[0.15em] uppercase">
              [&copy;] 2026 contentos
            </span>
            <span className="font-mono text-[10px] text-tx-4 tracking-[0.1em] uppercase hidden sm:inline">
              {'fwa.featured // build --'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-tx-4 tracking-[0.15em] uppercase">
              &gt;end of transmission
            </span>
            <span className="font-mono text-[10px] text-tx-4 tracking-[0.15em] uppercase">
              &gt;session archived ............ ok
            </span>
          </div>
        </div>
      </footer>
    </LoadingGate>
  );
}
