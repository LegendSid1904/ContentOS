import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { APP_NAME, APP_DESC, APPS, MODULES } from "@/lib/constants";
import LoadingGate from "@/components/loading-gate";
import Hero3DAsset from "@/components/hero-3d-asset";
import TiltWrapper from "@/components/tilt-wrapper";

const SvgIcon = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const platformIcons: Record<string, React.ReactNode> = {
  youtube: (
    <SvgIcon className="w-5 h-5">
      <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
    </SvgIcon>
  ),
  instagram: (
    <SvgIcon className="w-5 h-5">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </SvgIcon>
  ),
  tiktok: (
    <SvgIcon className="w-5 h-5">
      <path d="M9 12a4 4 0 100 8 4 4 0 000-8z" />
      <path d="M9 4v8" />
      <path d="M17 8a5 5 0 01-5-5" />
      <path d="M17 8v4" />
      <path d="M17 12a4 4 0 11-4-4" />
    </SvgIcon>
  ),
  linkedin: (
    <SvgIcon className="w-5 h-5">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </SvgIcon>
  ),
};

export default async function Home() {
  const { userId } = await auth();

  return (
    <LoadingGate>
      <div className="cyber-grid">
        <div className="cyber-grid-inner opacity-40" />
      </div>
      <div className="gradient-mesh" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[56px] flex items-center justify-between px-5 md:px-8 border-b border-white/[0.04] bg-bg-void/90 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-[7px] bg-gradient-to-br from-vi-500 to-te-400 flex items-center justify-center font-display text-[13px] font-bold text-white shadow-[0_0_16px_rgba(139,92,246,0.3)]">
            C
          </div>
          <span className="font-mono text-[14px] font-bold text-tx-1 tracking-[0.05em]">{APP_NAME.replace(" AI", "")}</span>
        </Link>

        <div className="flex items-center gap-4">
          {userId ? (
            <Link
              href="/dashboard"
              className="font-mono text-[12px] tracking-[0.12em] uppercase text-vi-400 hover:text-vi-300 transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-3">
                <Link
                  href="/sign-in"
                  className="font-mono text-[12px] tracking-[0.12em] uppercase text-tx-2 hover:text-tx-1 transition-colors"
                >
                  Sign in
                </Link>
              <Link
                href="/sign-up"
                className="btn btn-primary btn-md"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </nav>

      <main className="wrapper" style={{ paddingTop: "56px" }}>
        {/* Hero */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-20">
          <div className="lg:flex lg:items-center lg:gap-16 lg:justify-between">
            <div className="flex-1 max-w-2xl lg:max-w-xl">
              <div className="sec-eyebrow mb-5">
                <span className="sec-eyebrow-dot" />
                AI-powered toolkit for creators
              </div>
              <h1 className="font-display text-[36px] md:text-[52px] lg:text-[60px] font-bold text-tx-1 tracking-tight leading-[1.05] mb-5">
                Turn your ideas into{" "}
                <span className="bg-gradient-to-r from-vi-400 via-te-400 to-vi-400 bg-clip-text text-transparent">content that grows</span>{" "}
                your audience
              </h1>
              <p className="font-mono text-[14px] md:text-[15px] text-tx-2 leading-relaxed max-w-2xl mb-8">
                {APP_DESC} From viral scripts to CTR-optimized thumbnails — everything you need to create faster, post consistently, and grow across YouTube, Instagram, TikTok, and LinkedIn.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-10">
                {userId ? (
                  <Link
                    href="/dashboard"
                    className="btn btn-primary btn-lg"
                  >
                    Open dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/sign-up"
                      className="btn btn-primary btn-lg"
                    >
                      Start creating
                    </Link>
                    <Link
                      href="/sign-in"
                      className="btn btn-lg"
                    >
                      Sign in
                    </Link>
                  </>
                )}
              </div>

              <div className="sec-eyebrow mb-3">
                <span className="w-2 h-2 rounded-full bg-tx-4/40" />
                supported platforms
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {APPS.map((app) => (
                  <Link
                    key={app.id}
                    href={userId ? `/dashboard/app/${app.id}` : "/sign-up"}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-r3 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-150 group"
                  >
                    <span className="text-tx-3 group-hover:text-te-400 transition-colors">
                      {platformIcons[app.id]}
                    </span>
                    <span className="font-mono text-[12px] tracking-[0.08em] text-tx-2 group-hover:text-tx-1 transition-colors">
                      {app.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center shrink-0 w-[300px] h-[300px] mt-8 lg:mt-0">
              <Hero3DAsset />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="relative pb-20 overflow-hidden">
          <div className="crt-scanlines opacity-[0.03]" />
          <div className="crt-vignette opacity-[0.25]" />
          <div className="crt-sweep" />
          <div className="relative crt-brackets z-[5]">
            <div className="text-center mb-12">
              <div className="sec-eyebrow justify-center mb-3">
                <span className="sec-eyebrow-dot" />
                Tools
              </div>
              <h2 className="font-display text-[28px] md:text-[34px] font-bold text-tx-1 tracking-tight mb-3">
                Everything you need to create at scale
              </h2>
              <p className="font-mono text-[13px] text-tx-2 max-w-xl mx-auto">
                Seven tools purpose-built for the way creators work — from first idea to published post.
              </p>
            </div>

            <span className="term-label text-[10px] mb-4 block">available modules</span>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {MODULES.map((mod, i) => {
                const wide = i === 0 || i === 1 || i === 5;
                return (
                  <TiltWrapper key={mod.id}>
                    <div className={`ascii-box p-5 hover:bg-white/[0.04] hover:border-white/[0.10] transition-all duration-200 ${wide ? 'lg:col-span-2' : ''}`}>
                      <div className="mod-icon mb-3">{mod.icon}</div>
                      <div className="mod-name mb-1.5">{mod.name}</div>
                      <div className="mod-desc">{mod.desc}</div>
                    </div>
                  </TiltWrapper>
                );
              })}
            </div>
          </div>
        </section>

        {/* Platform app grid */}
        <section className="relative pb-20 overflow-hidden">
          <div className="crt-scanlines opacity-[0.03]" />
          <div className="crt-vignette opacity-[0.25]" />
          <div className="crt-sweep" />
          <div className="relative crt-brackets z-[5]">
            <div className="mb-8">
              <div className="sec-eyebrow mb-3">
                <span className="sec-eyebrow-dot" />
                Platforms
              </div>
              <h2 className="font-display text-[24px] md:text-[28px] font-bold text-tx-1 tracking-tight mb-2">
                Choose your platform
              </h2>
              <p className="font-mono text-[13px] text-tx-2 max-w-xl">
                Each platform comes with tools tailored to its format — scripts, thumbnails, carousels, competitor analysis, and growth strategy.
              </p>
            </div>

            <span className="term-label text-[10px] mb-4 block">supported networks</span>

          <div className="module-grid">
            {APPS.map((app) => {
              return (
                <TiltWrapper key={app.id}>
                  <Link
                    href={userId ? `/dashboard/app/${app.id}` : "/sign-up"}
                    className={`module-card-2a platform-${app.id}`}
                  >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className={`w-9 h-9 rounded-r4 flex items-center justify-center ${
                      app.id === "youtube" ? "bg-red-500/20 text-red-400" :
                      app.id === "instagram" ? "bg-pink-500/20 text-pink-400" :
                      app.id === "tiktok" ? "bg-white/10 text-tx-1" :
                      "bg-blue-500/20 text-blue-400"
                    }`}>
                      {platformIcons[app.id]}
                    </div>
                    <div>
                      <div className="font-mono text-[15px] font-bold text-tx-1 tracking-[0.03em]">{app.name}</div>
                    </div>
                  </div>
                  <p className="font-mono text-[12px] text-tx-3 leading-relaxed mb-4">{app.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {app.modules.map((modId) => {
                      const mod = MODULES.find((m) => m.id === modId);
                      return mod ? (
                        <span key={modId} className="font-mono text-[10px] text-tx-4 tracking-[0.08em] uppercase px-2 py-1 rounded-[2px] border border-white/[0.04] bg-white/[0.02]">
                          {mod.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                  </Link>
                  </TiltWrapper>
                );
              })}
            </div>
          </div>
          </section>

        {/* Video Editor — Auto-Edit Pipeline */}
        <section className="relative pb-20 overflow-hidden">
          <div className="crt-scanlines opacity-[0.03]" />
          <div className="crt-vignette opacity-[0.25]" />
          <div className="crt-sweep" />
          <div className="relative crt-brackets z-[5]">
            <div className="terminal-frame p-6 md:p-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12">
                {/* Left: Copy */}
                <div className="flex-1 mb-8 lg:mb-0">
                  <div className="sec-eyebrow mb-4">
                    <span className="sec-eyebrow-dot bg-te-400" />
                    <span className="text-te-400 tracking-[0.15em] uppercase text-[10px] font-mono font-bold">New</span>
                    <span className="text-tx-3">auto-edit pipeline</span>
                  </div>
                  <h2 className="font-display text-[28px] md:text-[34px] font-bold text-tx-1 tracking-tight mb-3">
                    Raw footage in, {" "}
                    <span className="bg-gradient-to-r from-te-400 to-vi-400 bg-clip-text text-transparent">
                      finished video out
                    </span>
                  </h2>
                  <p className="font-mono text-[13px] text-tx-2 leading-relaxed max-w-lg mb-6">
                    Upload one clip. Pick your format — explainer, TikTok raw, or long-form YouTube.
                    The pipeline handles rough cut, graphics, captions, music, and export automatically.
                    Pause, edit, or approve at any step.
                  </p>
                  <Link
                    href={userId ? "/dashboard/video-editor" : "/sign-up"}
                    className="btn btn-primary btn-lg inline-flex items-center gap-2"
                  >
                    <span>Try Video Editor</span>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                {/* Right: Pipeline Steps */}
                <div className="flex-1 max-w-md w-full">
                  <div className="space-y-0">
                    {[
                      { step: "01", label: "Intake", desc: "Upload & validate" },
                      { step: "02", label: "Rough Cut", desc: "Transcription & trim" },
                      { step: "03", label: "Graphics", desc: "Format-specific overlays" },
                      { step: "04", label: "QA Pass", desc: "Sync, loudness, frames" },
                      { step: "05", label: "Captions", desc: "On-beat burn-in" },
                      { step: "06", label: "Music", desc: "Sidechain ducking" },
                      { step: "07", label: "Export", desc: "Final render & delivery" },
                    ].map((item, i) => (
                      <div key={item.step} className="ve-pipeline-step">
                        <div className="ve-pipeline-num">{item.step}</div>
                        <div className="ve-pipeline-line" />
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-[12px] font-bold text-tx-1 tracking-[0.06em] uppercase">{item.label}</div>
                          <div className="font-mono text-[10px] text-tx-4">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-24">
          <div className="terminal-frame max-w-lg mx-auto p-8 md:p-10 text-center">
            <h2 className="font-display text-[28px] font-bold text-tx-1 mb-3 tracking-tight">
              Ready to grow?
            </h2>
            <p className="font-mono text-[13px] text-tx-2 mb-8">
              Your first script, thumbnail, or growth plan is minutes away — not hours.
            </p>
            {userId ? (
              <Link
                href="/dashboard"
                className="btn btn-primary btn-lg"
              >
                Open dashboard
              </Link>
            ) : (
              <Link
                href="/sign-up"
                className="btn btn-primary btn-lg"
              >
                Get started free
              </Link>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-6">
        <div className="wrapper flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[12px] font-bold text-tx-3 tracking-[0.05em]">
              {APP_NAME.replace(" AI", "")}
            </span>
            <span className="font-mono text-[11px] text-tx-4">
              &copy; 2026
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="font-mono text-[11px] text-tx-4 hover:text-tx-2 transition-colors tracking-[0.1em] uppercase">
              Sign in
            </Link>
            <Link href="/sign-up" className="font-mono text-[11px] text-tx-4 hover:text-tx-2 transition-colors tracking-[0.1em] uppercase">
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </LoadingGate>
  );
}
