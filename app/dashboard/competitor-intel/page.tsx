"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { APP_MODULES } from "@/lib/constants";
import { analyzeCompetitor, saveCompetitorIntel } from "@/lib/actions-competitor";
import { useAuthGate } from "@/lib/use-auth-gate";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { StreamingLoader } from "@/components/streaming-loader";
import { ErrorBoundary } from "@/components/error-boundary";

type Step = "input" | "results";

interface CompetitorProfile {
  content_pillars: string[];
  posting_frequency: string;
  engagement_patterns: string[];
  hook_styles: string[];
  thumbnail_patterns: string[];
  overall_score: number;
}

interface ContentGap {
  topic: string;
  rationale: string;
  opportunity_score: number;
}

interface Analysis {
  profile: CompetitorProfile;
  gaps: ContentGap[];
  competitorName?: string;
}

function ScoreGauge({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[12px] text-tx-3 uppercase tracking-wider w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/[0.03] rounded-sm overflow-hidden">
        <div
          className="h-full rounded-sm transition-colors duration-500"
          style={{
            width: `${value * 10}%`,
            background: value >= 7
              ? "linear-gradient(90deg, #22c55e, #22d3ee)"
              : value >= 4
              ? "linear-gradient(90deg, #eab308, #f97316)"
              : "linear-gradient(90deg, #ef4444, #f97316)",
          }}
        />
      </div>
      <span className="font-mono text-[13px] text-tx-2 w-4 text-right">{value}/10</span>
    </div>
  );
}

function CompetitorFallback() {
  return (
    <div className="font-mono text-[11px] text-tx-4 p-6 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-vi-400 animate-pulse" />
      loading session...
    </div>
  );
}

export default function CompetitorIntelPage({ appId: _appId }: any = {}) {
  return (
    <Suspense fallback={<CompetitorFallback />}>
      <CompetitorIntelContent appId={_appId} />
    </Suspense>
  );
}

function CompetitorIntelContent({ appId: propAppId }: { appId?: string | null }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appId = propAppId ?? searchParams?.get("app") ?? null;

  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [niche, setNiche] = useState("");
  const [depth, setDepth] = useState<"basic" | "deep">("basic");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useAuth();
  const { showModal, gate, closeModal, triggerModal, freeActionsLeft, savePreviewState, restorePreviewState } = useAuthGate("analyze competitor");

  const appModule = appId ? APP_MODULES[appId]?.find((m) => m.id === "competitor-intel") : null;
  const appModuleName = appModule?.name ?? "COMPETITOR INTEL";

  useEffect(() => {
    const saved = restorePreviewState<{ analysis: Analysis | null; step: Step }>();
    if (saved) {
      setAnalysis(saved.analysis ?? null);
      setStep(saved.step ?? "input");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!appId) {
      router.push('/dashboard');
    }
  }, [appId, router]);

  const valid = url.trim() && niche.trim();

  async function handleAnalyze() {
    if (!valid) return;
    savePreviewState({ analysis, step });
    gate(async () => {
      setLoading(true);
      setError("");
      try {
        const result = await analyzeCompetitor(url, niche, depth);
        if (!result.ok) { if (result.error?.includes("sign in")) { triggerModal(); return; } setError(result.error); setLoading(false); return; }
        setAnalysis(result.data);
        setStep("results");
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Analysis failed");
      }
      setLoading(false);
    });
  }

  async function handleSave() {
    if (!analysis) return;
    savePreviewState({ analysis, step });
    gate(async () => {
      try {
        const result = await saveCompetitorIntel(`Competitor: ${url}`, analysis);
        if (!result.ok) { if (result.error?.includes("sign in")) { triggerModal(); return; } setError(result.error); return; }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  function handleReset() {
    setStep("input");
    setAnalysis(null);
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
          Module :: Intel
        </p>
        <h1 className="sec-title !text-[28px]">Competitor Intel</h1>
        <p className="sec-desc !text-[13px]">
          Deep scan of top performers in your niche
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
          {loading && <StreamingLoader steps={["ANALYZING COMPETITOR PROFILE", "IDENTIFYING CONTENT PATTERNS", "MAPPING GAP OPPORTUNITIES"]} />}

          {error && (
            <div className="font-mono text-[14px] text-err bg-err/10 border border-err/20 rounded-r3 p-3">
              <span className="text-err">[ERROR]</span> {error}
              <button onClick={() => setError("")} className="ml-2 text-err/60 hover:text-err underline">dismiss</button>
            </div>
          )}

          {isInputStep && (
            <>
              <div className="font-mono text-[11px] text-vi-400/70 border border-vi-500/15 bg-vi-500/5 rounded-r3 p-3 text-center tracking-wider leading-relaxed">
                <span className="text-vi-400/90">[READY]</span> {appModule ? appModule.desc : "drop a competitor URL below to analyze their content strategy, identify patterns, and surface gap opportunities."}
              </div>
              <div className="reveal d1">
                <label className="term-label text-[12px] mb-2">COMPETITOR_URL</label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. youtube.com/@channel or instagram.com/username"
                  className="term-field"
                  autoFocus
                />
              </div>

              <div className="reveal d2">
                <label className="term-label text-[12px] mb-2">NICHE</label>
                <input
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. Personal Finance, Fitness, Tech Reviews"
                  className="term-field"
                />
              </div>

              <div className="reveal d3">
                <label className="term-label text-[12px] mb-2">ANALYSIS_DEPTH</label>
                <div className="space-y-1">
                  <button
                    onClick={() => setDepth("basic")}
                    className={`boot-option ${depth === "basic" ? "active" : ""}`}
                  >
                    <span className="boot-option-arrow">
                      {depth === "basic" ? "\u25B6" : ">>"}
                    </span>
                    <span className="boot-option-label">
                      Basic
                      <span className="block font-mono text-[13px] text-tx-3 mt-0.5">Top content analysis + pattern identification</span>
                    </span>
                    <span className={`diag-badge ${depth === "basic" ? "diag-ok" : "diag-idle"}`}>
                      {depth === "basic" ? "[ACTIVE]" : "[IDLE]"}
                    </span>
                  </button>
                  <button
                    onClick={() => setDepth("deep")}
                    className={`boot-option ${depth === "deep" ? "active" : ""}`}
                  >
                    <span className="boot-option-arrow">
                      {depth === "deep" ? "\u25B6" : ">>"}
                    </span>
                    <span className="boot-option-label">
                      Deep
                      <span className="block font-mono text-[13px] text-tx-3 mt-0.5">Full channel audit + comprehensive recommendations</span>
                    </span>
                    <span className={`diag-badge ${depth === "deep" ? "diag-ok" : "diag-idle"}`}>
                      {depth === "deep" ? "[ACTIVE]" : "[IDLE]"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="reveal d4 flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button
                  onClick={handleAnalyze}
                  disabled={!valid}
                  className="btn-terminal btn-terminal-primary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {">>"} ANALYZE COMPETITOR
                </button>
                {!valid && (
                  <span className="font-mono text-[13px] text-tx-3 tracking-wider">AWAITING INPUT</span>
                )}
              </div>
            </>
          )}

          {isResultsStep && analysis && (
            <div ref={outputRef} className="space-y-6">
              <div className="flex items-center justify-between reveal d1">
                <label className="term-label text-[12px] mb-0">COMPETITOR_ANALYSIS</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => {
                    if (!analysis) return;
                    const win = window.open("", "_blank");
                    if (!win) return;
                    const name = analysis.competitorName || "competitor";
                    win.document.write(`<!DOCTYPE html><html><head><title>Competitor Analysis - ${name}</title><style>
                      @page { margin: 0.75in; }
                      * { box-sizing: border-box; margin: 0; padding: 0; }
                      body { font-family: 'Courier New', monospace; font-size: 11pt; line-height: 1.6; color: #111; padding: 20px; }
                      h1 { font-size: 16pt; margin-bottom: 16px; border-bottom: 2px solid #333; padding-bottom: 8px; }
                      h2 { font-size: 13pt; margin: 16px 0 8px; color: #444; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
                      .pillar { display: inline-block; background: #e8f5e9; padding: 2px 8px; margin: 2px; border-radius: 3px; font-size: 9pt; }
                      .hook { display: inline-block; background: #f3e5f5; padding: 2px 8px; margin: 2px; border-radius: 3px; font-size: 9pt; }
                      .gap { margin-bottom: 12px; padding: 8px; background: #f5f5f5; border-left: 3px solid #4caf50; }
                      .gap h3 { font-size: 11pt; margin-bottom: 4px; }
                      .score { color: #4caf50; font-weight: bold; }
                      .footer { margin-top: 24px; font-size: 8pt; color: #999; text-align: center; border-top: 1px solid #ddd; padding-top: 8px; }
                    </style></head><body>
                    <h1>Competitor Analysis: ${name}</h1>
                    <p><strong>Overall Score:</strong> ${analysis.profile.overall_score}/10</p>
                    <h2>Content Pillars</h2>
                    ${analysis.profile.content_pillars.map(p => `<span class="pillar">${p}</span>`).join("")}
                    <h2>Posting Frequency</h2>
                    <p>${analysis.profile.posting_frequency}</p>
                    <h2>Hook Styles</h2>
                    ${analysis.profile.hook_styles.map(h => `<span class="hook">${h}</span>`).join("")}
                    <h2>Engagement Patterns</h2>
                    <ul>${analysis.profile.engagement_patterns.map(e => `<li>${e}</li>`).join("")}</ul>
                    <h2>Content Gaps (${analysis.gaps.length})</h2>
                    ${analysis.gaps.map(g => `<div class="gap"><h3>${g.topic}</h3><p>${g.rationale}</p><span class="score">Opportunity: ${g.opportunity_score}/10</span></div>`).join("")}
                    <div class="footer">Generated by ContentOS AI</div>
                    <script>window.onload=function(){window.print()}</script></body></html>`);
                    win.document.close();
                  }} className="btn-terminal text-[11px]">
                    {"[PDF]"}
                  </button>
                  <button onClick={() => {
                    if (!analysis) return;
                    const name = analysis.competitorName || "competitor";
                    const text = `Competitor: ${name}\nScore: ${analysis.profile.overall_score}/10\nPillars: ${analysis.profile.content_pillars.join(", ")}\nHooks: ${analysis.profile.hook_styles.join(", ")}\nFrequency: ${analysis.profile.posting_frequency}\nGaps: ${analysis.gaps.map(g => g.topic).join(", ")}`;
                    navigator.clipboard.writeText(text);
                  }} className="btn-terminal text-[11px]">
                    {"[SWIPE]"}
                  </button>
                  <button onClick={handleSave} className="btn-terminal text-[11px]">
                    {"[SAVE]"}
                  </button>
                  <button onClick={handleAnalyze} className="btn-terminal text-[11px]">
                    {"[REGEN]"}
                  </button>
                </div>
              </div>

              {analysis.competitorName && (
                <div className="crt-monitor relative crt-brackets reveal d2" style={{ background: "rgba(0,0,0,0.25)" }}>
                  <div className="crt-micro-tl">
                    <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-te-400/60">target</span>
                    <span className="text-tx-4">|</span>
                    <span className="font-mono text-[9px] tracking-[0.18em] uppercase">competitor</span>
                  </div>
                  <div className="crt-monitor-header">
                    <span className="w-2 h-2 rounded-full bg-te-400/60" />
                    <span className="font-mono text-[16px] font-bold text-tx-1 tracking-tight ml-2">
                      COMPETITOR: @{analysis.competitorName}
                    </span>
                  </div>
                </div>
              )}

              <div className="crt-monitor relative crt-brackets reveal d2" style={{ background: "rgba(0,0,0,0.25)" }}>
                <div className="crt-micro-tl">
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-te-400/60">audit</span>
                  <span className="text-tx-4">|</span>
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase">profile</span>
                </div>
                <div className="crt-micro-tr">
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-tx-4">{depth} mode</span>
                </div>
                <div className="crt-monitor-header">
                  <span className="w-2 h-2 rounded-full bg-vi-400/60" />
                  <span className="font-mono text-[13px] font-semibold text-tx-1 tracking-tight ml-2">Profile Score: {analysis.profile.overall_score}/10</span>
                </div>
                <div className="crt-monitor-content p-4 space-y-3">
                  <ScoreGauge value={analysis.profile.overall_score} label="Overall" />

                  <div className="pt-2 border-t border-white/[0.04]">
                    <span className="font-mono text-[13px] text-tx-3 uppercase tracking-wider">Content Pillars</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {analysis.profile.content_pillars.map((p, i) => (
                        <span key={i} className="font-mono text-[13px] text-te-400 bg-te-400/10 px-2 py-0.5 rounded-r2">{p}</span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04]">
                    <span className="font-mono text-[13px] text-tx-3 uppercase tracking-wider">Posting Frequency</span>
                    <p className="font-mono text-[13px] text-tx-1 mt-1">{analysis.profile.posting_frequency}</p>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04]">
                    <span className="font-mono text-[13px] text-tx-3 uppercase tracking-wider">Hook Styles</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {analysis.profile.hook_styles.map((h, i) => (
                        <span key={i} className="font-mono text-[13px] text-fu-400 bg-fu-400/10 px-2 py-0.5 rounded-r2">{h}</span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04]">
                    <span className="font-mono text-[13px] text-tx-3 uppercase tracking-wider">Engagement Patterns</span>
                    <div className="space-y-1 mt-1">
                      {analysis.profile.engagement_patterns.map((ep, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="font-mono text-[12px] text-te-400 mt-0.5">{">>"}</span>
                          <span className="font-mono text-[12px] text-tx-1">{ep}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="crt-micro-bl">
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-ok">ANALYSIS COMPLETE</span>
                </div>
              </div>

              <div className="crt-monitor relative crt-brackets reveal d3" style={{ background: "rgba(0,0,0,0.25)" }}>
                <div className="crt-micro-tl">
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-te-400/60">gaps</span>
                  <span className="text-tx-4">|</span>
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase">opportunities</span>
                </div>
                <div className="crt-monitor-header">
                  <span className="w-2 h-2 rounded-full bg-te-400/60" />
                  <span className="font-mono text-[13px] font-semibold text-tx-1 tracking-tight ml-2">Content Gaps ({analysis.gaps.length})</span>
                </div>
                <div className="crt-monitor-content p-4 space-y-2">
                  {analysis.gaps.map((gap, i) => (
                    <div key={i} className="flex items-start gap-2 py-1.5 border-b border-white/[0.02] last:border-0">
                      <span className="font-mono text-[12px] text-vi-400 tracking-wider flex-shrink-0 w-4">{String(i + 1).padStart(2, "0")}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-[13px] text-tx-1">{gap.topic}</span>
                        <p className="font-mono text-[13px] text-tx-3 mt-0.5">{gap.rationale}</p>
                      </div>
                      <span className="font-mono text-[12px] text-ok bg-ok/10 px-1.5 py-0.5 rounded-r2 flex-shrink-0">score: {gap.opportunity_score}</span>
                    </div>
                  ))}
                </div>
                <div className="crt-micro-bl">
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-ok">GAPS IDENTIFIED</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button onClick={handleReset} className="btn-terminal text-[12px]">
                  {">>"} NEW ANALYSIS
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="crt-micro-bl">
          <span className="font-mono text-[9px] tracking-[0.18em] uppercase"
            style={{ color: step === "results" ? "rgba(34,197,94,0.6)" : "rgba(86,86,128,0.6)" }}
          >
            {step === "input" ? "AWAITING INPUT" : "ANALYSIS READY"}
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
                <Link href="/sign-in?redirect_url=%2Fdashboard%2Fcompetitor-intel" className="text-vi-400/80 hover:text-vi-300 underline">
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

      <SignInModal open={showModal} onClose={closeModal} context="analyze competitor" />
    </div></ErrorBoundary>
  );
}
