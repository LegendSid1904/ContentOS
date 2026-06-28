"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { PLATFORMS, APP_PLATFORM_MAP, APP_MODULES } from "@/lib/constants";
import { generatePageSetup, savePageSetup } from "@/lib/actions-page-setup";
import { getContentDefaults, getBrandKit } from "@/lib/actions";
import { useAuthGate } from "@/lib/use-auth-gate";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { StreamingLoader } from "@/components/streaming-loader";
import { ErrorBoundary } from "@/components/error-boundary";

type Step = "input" | "results";

interface BioVariant {
  variant: string;
  bio_text: string;
  keyword_usage: string;
  character_count: number;
}

interface PageSetupData {
  bios: BioVariant[];
  keywords: { keywords: string[]; hashtags: string[] };
  highlights: { name: string; description: string; content_to_include: string }[];
  audit: { keyword_optimization: number; bio_clarity: number; brand_consistency: number; cta_effectiveness: number; suggestions: string[] };
}

function ScoreMeter({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[12px] text-tx-3 uppercase tracking-wider w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/[0.03] rounded-sm overflow-hidden">
        <div
          className="h-full rounded-sm transition-colors duration-500"
          style={{
            width: `${value * 10}%`,
            background: value >= 7 ? "linear-gradient(90deg, #22c55e, #22d3ee)" : value >= 4 ? "linear-gradient(90deg, #eab308, #f97316)" : "linear-gradient(90deg, #ef4444, #f97316)",
          }}
        />
      </div>
      <span className="font-mono text-[13px] text-tx-2 w-4 text-right">{value}/10</span>
    </div>
  );
}

function PageSetupFallback() {
  return (
    <div className="font-mono text-[11px] text-tx-4 p-6 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-vi-400 animate-pulse" />
      loading session...
    </div>
  );
}

export default function PageSetupPage({ appId: _appId }: any = {}) {
  return (
    <Suspense fallback={<PageSetupFallback />}>
      <PageSetupContent appId={_appId} />
    </Suspense>
  );
}

function PageSetupContent({ appId: propAppId }: { appId?: string | null }) {
  const searchParams = useSearchParams();
  const appId = propAppId ?? searchParams?.get("app") ?? null;

  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState(() => {
    if (!appId) return "";
    const platforms = APP_PLATFORM_MAP[appId as keyof typeof APP_PLATFORM_MAP];
    return platforms?.[0] ?? "";
  });
  const [niche, setNiche] = useState("");
  const [currentBio, setCurrentBio] = useState("");
  const [data, setData] = useState<PageSetupData | null>(null);
  const [error, setError] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useAuth();
  const { showModal, gate, closeModal, freeActionsLeft, savePreviewState, restorePreviewState } = useAuthGate("generate page setup");

  const appModule = appId ? APP_MODULES[appId]?.find((m) => m.id === "page-setup") : null;
  const appModuleName = appModule?.name ?? "PAGE SETUP";

  useEffect(() => {
    const saved = restorePreviewState<{ data: PageSetupData | null; step: Step }>();
    if (saved) {
      setData(saved.data ?? null);
      setStep(saved.step ?? "input");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    getContentDefaults().then((defaults) => {
      if (!defaults) return;
      if (defaults.defaultPlatform && !platform) setPlatform(defaults.defaultPlatform);
    });
    getBrandKit().then((kit) => {
      if (kit && kit.niche && !niche) setNiche(kit.niche);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  const valid = platform && niche.trim();

  async function handleGenerate() {
    if (!valid) return;
    savePreviewState({ data, step });
    gate(async () => {
      setLoading(true);
      setError("");
      try {
        const result = await generatePageSetup(platform, niche, currentBio);
        if (!result.ok) { setError(result.error); setLoading(false); return; }
        setData(result.data);
        setStep("results");
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Generation failed");
      }
      setLoading(false);
    });
  }

  async function handleSave() {
    if (!data) return;
    savePreviewState({ data, step });
    gate(async () => {
      try {
        const result = await savePageSetup(`Page Setup: ${platform}`, data);
        if (!result.ok) { setError(result.error); return; }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  function handleReset() {
    setStep("input");
    setData(null);
    setError("");
  }

  const isInputStep = step === "input" && !loading;
  const isResultsStep = step === "results" && !loading;

  return (
    <ErrorBoundary>
    <div className="max-w-3xl space-y-6 relative z-10">
      <div>
        <p className="sec-eyebrow">
          <span className="sec-eyebrow-dot" />
          Module :: Setup
        </p>
        <h1 className="sec-title !text-[28px]">Page Setup</h1>
        <p className="sec-desc !text-[13px]">
          Bio, keywords, highlights &mdash; fully AI-optimized
        </p>
      </div>

      <div className="crt-monitor relative crt-brackets">
        <div className="crt-scanlines" />
        <div className="crt-grain" />
        <div className="crt-vignette" />
        <div className="crt-sweep" />

        <div className="crt-micro-tl">
          <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-te-400/60">sys</span>
          <span className="text-tx-4">|</span>
          <span className="font-mono text-[9px] tracking-[0.18em] uppercase">{appModuleName.toLowerCase().replace(/\s+/g, "_")}</span>
        </div>
        <div className="crt-micro-tr">
          <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-tx-4">v1.0.0</span>
          <span className="text-tx-4">|</span>
          <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-tx-4">id: {isSignedIn ? "active" : "preview"}</span>
        </div>

        <div className="crt-monitor-header">
          <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-tx-4">MODULE</span>
          <span className="font-mono text-[9px] text-tx-4">|</span>
          <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-te-400/70">{appModuleName}</span>
          <div className="flex-1" />
          <span className="font-mono text-[9px] tracking-[0.1em] text-tx-4">{"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
        </div>

        <div className="crt-monitor-content p-6 space-y-6">
          {loading && <StreamingLoader steps={["GENERATING BIO VARIANTS", "ANALYZING KEYWORDS", "BUILDING OPTIMIZATION REPORT"]} />}

          {error && (
            <div className="font-mono text-[14px] text-err bg-err/10 border border-err/20 rounded-r3 p-3">
              <span className="text-err">[ERROR]</span> {error}
              <button onClick={() => setError("")} className="ml-2 text-err/60 hover:text-err underline">dismiss</button>
            </div>
          )}

          {isInputStep && (
            <>
              <div className="font-mono text-[11px] text-vi-400/70 border border-vi-500/15 bg-vi-500/5 rounded-r3 p-3 text-center tracking-wider leading-relaxed">
                <span className="text-vi-400/90">[READY]</span> {appModule ? appModule.desc : "select a platform below to generate AI-optimized bio variants, keyword suggestions, highlights, and a full profile audit."}
              </div>
              {appId ? (
                <div className="reveal d1">
                  <label className="term-label text-[13px] mb-2">PLATFORM</label>
                  <div className="font-mono text-[11px] text-vi-400/70 border border-vi-500/15 bg-vi-500/5 rounded-r3 p-2 text-center tracking-wider">
                    [LOCKED] {platform || "auto-detected from app"}
                  </div>
                </div>
              ) : (
                <div className="reveal d1">
                  <label className="term-label text-[13px] mb-2">PLATFORM</label>
                  <div className="space-y-1">
                    {[...PLATFORMS, "Twitter"].map((p, i) => (
                      <button
                        key={p}
                        onClick={() => setPlatform(p === platform ? "" : p)}
                        className={`boot-option ${p === platform ? "active" : ""}`}
                        style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                      >
                        <span className="boot-option-arrow">
                          {p === platform ? "\u25B6" : ">>"}
                        </span>
                        <span className="boot-option-label">{p}</span>
                        <span className={`diag-badge ${p === platform ? "diag-ok" : "diag-idle"}`}>
                          {p === platform ? "[SELECTED]" : "[IDLE]"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="reveal d2">
                <label className="term-label text-[13px] mb-2">NICHE</label>
                <input
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. Personal Finance, Fitness, Tech Reviews"
                  className="term-field"
                />
              </div>

              <div className="reveal d3">
                <label className="term-label text-[13px] mb-2">CURRENT_BIO <span className="text-tx-3">(optional)</span></label>
                <textarea
                  value={currentBio}
                  onChange={(e) => setCurrentBio(e.target.value)}
                  placeholder="Paste your current bio or description for improvement..."
                  className="term-field min-h-[80px] resize-y"
                  rows={3}
                />
              </div>

              <div className="reveal d4 flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button
                  onClick={handleGenerate}
                  disabled={!valid}
                  className="btn-terminal btn-terminal-primary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {">>"} OPTIMIZE PAGE
                </button>
                {!valid && (
                  <span className="font-mono text-[13px] text-tx-3 tracking-wider">AWAITING INPUT</span>
                )}
              </div>
            </>
          )}

          {isResultsStep && data && (
            <div ref={outputRef} className="space-y-6">
              <div className="flex items-center justify-between reveal d1">
                <label className="term-label text-[13px] mb-0">PAGE_OPTIMIZATION</label>
                <div className="flex items-center gap-2">
                  <button onClick={handleSave} className="btn-terminal text-[12px]">
                    {"[SAVE]"}
                  </button>
                  <button onClick={handleGenerate} className="btn-terminal text-[12px]">
                    {"[REGEN]"}
                  </button>
                </div>
              </div>

              <div className="crt-monitor relative crt-brackets reveal d2" style={{ background: "rgba(0,0,0,0.25)" }}>
                <div className="crt-micro-tl">
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-te-400/60">audit</span>
                  <span className="text-tx-4">|</span>
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase">profile_score</span>
                </div>
                <div className="crt-monitor-header">
                  <span className="w-2 h-2 rounded-full bg-vi-400/60" />
                  <span className="font-mono text-[13px] font-semibold text-tx-1 tracking-tight ml-2">Profile Audit</span>
                </div>
                <div className="crt-monitor-content p-4 space-y-2">
                  <ScoreMeter value={data.audit.keyword_optimization} label="Keywords" />
                  <ScoreMeter value={data.audit.bio_clarity} label="Bio Clarity" />
                  <ScoreMeter value={data.audit.brand_consistency} label="Branding" />
                  <ScoreMeter value={data.audit.cta_effectiveness} label="CTA" />
                  <div className="pt-2 border-t border-white/[0.04] space-y-1">
                    {data.audit.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="font-mono text-[12px] text-te-400 mt-0.5">{">>"}</span>
                        <span className="font-mono text-[13px] text-tx-1">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="crt-micro-bl">
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-ok">AUDIT COMPLETE</span>
                </div>
              </div>

              <div className="crt-monitor relative crt-brackets reveal d3" style={{ background: "rgba(0,0,0,0.25)" }}>
                <div className="crt-micro-tl">
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-te-400/60">bios</span>
                  <span className="text-tx-4">|</span>
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase">variants</span>
                </div>
                <div className="crt-monitor-header">
                  <span className="w-2 h-2 rounded-full bg-te-400/60" />
                  <span className="font-mono text-[13px] font-semibold text-tx-1 tracking-tight ml-2">Bio Variants</span>
                </div>
                <div className="crt-monitor-content p-4 space-y-3">
                  {data.bios.map((bio, i) => (
                    <div key={i} className="pb-2 border-b border-white/[0.04] last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[12px] text-fu-400 uppercase tracking-wider">[{bio.variant}]</span>
                        <span className="font-mono text-[12px] text-tx-3">{bio.character_count} chars</span>
                      </div>
                      <p className="font-mono text-[13px] text-tx-1 leading-relaxed">{bio.bio_text}</p>
                      <p className="font-mono text-[12px] text-tx-3 mt-0.5 italic">Keywords: {bio.keyword_usage}</p>
                    </div>
                  ))}
                </div>
                <div className="crt-micro-bl">
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-ok">BIOS READY</span>
                </div>
              </div>

              <div className="crt-monitor relative crt-brackets reveal d4" style={{ background: "rgba(0,0,0,0.25)" }}>
                <div className="crt-micro-tl">
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-te-400/60">seo</span>
                  <span className="text-tx-4">|</span>
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase">keywords</span>
                </div>
                <div className="crt-monitor-header">
                  <span className="w-2 h-2 rounded-full bg-fu-400/60" />
                  <span className="font-mono text-[13px] font-semibold text-tx-1 tracking-tight ml-2">Keywords & Hashtags</span>
                </div>
                <div className="crt-monitor-content p-4 space-y-3">
                  <div>
                    <span className="font-mono text-[12px] text-tx-3 uppercase tracking-wider">Keywords</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {data.keywords.keywords.map((kw, i) => (
                        <span key={i} className="font-mono text-[13px] text-te-400 bg-te-400/10 px-1.5 py-0.5 rounded-r2">{kw}</span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/[0.04]">
                    <span className="font-mono text-[12px] text-tx-3 uppercase tracking-wider">Hashtags</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {data.keywords.hashtags.map((ht, i) => (
                        <span key={i} className="font-mono text-[12px] text-fu-400 bg-fu-400/10 px-1.5 py-0.5 rounded-r2">#{ht}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="crt-micro-bl">
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-ok">KEYWORDS READY</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button onClick={handleReset} className="btn-terminal text-[12px]">
                  {">>"} NEW SETUP
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="crt-micro-bl">
          <span className="font-mono text-[9px] tracking-[0.18em] uppercase"
            style={{ color: step === "results" ? "rgba(34,197,94,0.6)" : "rgba(86,86,128,0.6)" }}
          >
            {step === "input" ? "AWAITING INPUT" : "OPTIMIZATION READY"}
          </span>
        </div>
        <div className="crt-micro-br">
          <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-tx-4">
            {loading ? "GENERATING..." : "STANDBY"}
          </span>
        </div>

        <div className="crt-monitor-footer">
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-tx-4">
            {step === "input" ? "INPUT" : "RESULTS"}
          </span>
          <span className="font-mono text-[9px] text-center">
            {!isSignedIn ? (
              <span className="text-vi-400/60">
                {freeActionsLeft > 0 ? `FREE: ${freeActionsLeft} gen` : "FREE: 0 "}
              {!isSignedIn && freeActionsLeft <= 0 && (
                <Link href="/sign-in?redirect_url=%2Fdashboard%2Fpage-setup" className="text-vi-400/80 hover:text-vi-300 underline">
                  [sign in]
                </Link>
              )}
              </span>
            ) : (
              <span className="text-tx-4">[system ready]</span>
            )}
          </span>
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-tx-4">
            {loading ? "BUSY" : "STANDBY"}
          </span>
        </div>
      </div>

      <SignInModal open={showModal} onClose={closeModal} context="generate page setup" />
    </div></ErrorBoundary>
  );
}
