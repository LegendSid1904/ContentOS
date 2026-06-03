"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { analyzeCompetitor, saveCompetitorIntel } from "@/lib/actions-competitor";
import { useAuthGate } from "@/lib/use-auth-gate";
import { SignInModal } from "@/components/auth/sign-in-modal";

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

function BootLoader() {
  const steps = ["ANALYZING COMPETITOR PROFILE", "IDENTIFYING CONTENT PATTERNS", "MAPPING GAP OPPORTUNITIES"];
  return (
    <div className="boot-loader">
      {steps.map((s, i) => (
        <div key={i} className="boot-loader-line" style={{ animationDelay: `${0.1 + i * 0.2}s` }}>
          <span className="boot-loader-arrow">{">>"}</span>
          <span className="boot-loader-text">{s}</span>
          <span className="boot-loader-ok">
            {i < 2 ? (
              <span className="flex gap-0.5 items-center">
                <span className="w-1 h-1 rounded-full bg-te-400 animate-pulse" style={{ animationDelay: "0s" }} />
                <span className="w-1 h-1 rounded-full bg-te-400 animate-pulse" style={{ animationDelay: "0.15s" }} />
                <span className="w-1 h-1 rounded-full bg-te-400 animate-pulse" style={{ animationDelay: "0.3s" }} />
              </span>
            ) : (
              <span className="text-te-400/80 tracking-wider">LOADING</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

function ScoreGauge({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] text-tx-3 uppercase tracking-wider w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/[0.03] rounded-sm overflow-hidden">
        <div
          className="h-full rounded-sm transition-all duration-500"
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
      <span className="font-mono text-[11px] text-tx-2 w-4 text-right">{value}/10</span>
    </div>
  );
}

export default function CompetitorIntelPage() {
  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [niche, setNiche] = useState("");
  const [depth, setDepth] = useState<"basic" | "deep">("basic");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useAuth();
  const { showModal, gate, closeModal, freeActionsLeft, savePreviewState, restorePreviewState } = useAuthGate("analyze competitor");

  useEffect(() => {
    const saved = restorePreviewState<{ analysis: Analysis | null; step: Step }>();
    if (saved) {
      setAnalysis(saved.analysis ?? null);
      setStep(saved.step ?? "input");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valid = url.trim() && niche.trim();

  async function handleAnalyze() {
    if (!valid) return;
    savePreviewState({ analysis, step });
    gate(async () => {
      setLoading(true);
      setError("");
      try {
        const result = await analyzeCompetitor(url, niche, depth);
        if (!result.ok) { setError(result.error); setLoading(false); return; }
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
        if (!result.ok) { setError(result.error); return; }
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
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-te-400/60">sys</span>
          <span className="text-tx-3">|</span>
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase">competitor_intel</span>
        </div>
        <div className="crt-micro-tr">
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-tx-3">v1.0.0</span>
          <span className="text-tx-3">|</span>
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-tx-3">id: {isSignedIn ? "active" : "preview"}</span>
        </div>

        <div className="crt-monitor-header">
          <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-tx-3">MODULE</span>
          <span className="font-mono text-[9px] text-tx-3">|</span>
          <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-te-400/70">COMPETITOR INTEL</span>
          <div className="flex-1" />
          <span className="font-mono text-[10px] tracking-[0.1em] text-tx-3">{"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
        </div>

        <div className="crt-monitor-content p-6 space-y-6">
          {loading && <BootLoader />}

          {error && (
            <div className="font-mono text-[14px] text-err bg-err/10 border border-err/20 rounded-r3 p-3">
              <span className="text-err">[ERROR]</span> {error}
              <button onClick={() => setError("")} className="ml-2 text-err/60 hover:text-err underline">dismiss</button>
            </div>
          )}

          {isInputStep && (
            <>
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
                      <span className="block font-mono text-[11px] text-tx-3 mt-0.5">Top content analysis + pattern identification</span>
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
                      <span className="block font-mono text-[11px] text-tx-3 mt-0.5">Full channel audit + comprehensive recommendations</span>
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
                  <span className="font-mono text-[11px] text-tx-3 tracking-wider">AWAITING INPUT</span>
                )}
              </div>
            </>
          )}

          {isResultsStep && analysis && (
            <div ref={outputRef} className="space-y-6">
              <div className="flex items-center justify-between reveal d1">
                <label className="term-label text-[12px] mb-0">COMPETITOR_ANALYSIS</label>
                <div className="flex items-center gap-2">
                  <button onClick={handleSave} className="btn-terminal text-[12px]">
                    {"[SAVE]"}
                  </button>
                  <button onClick={handleAnalyze} className="btn-terminal text-[12px]">
                    {"[REGEN]"}
                  </button>
                </div>
              </div>

              {analysis.competitorName && (
                <div className="crt-monitor relative crt-brackets reveal d2" style={{ background: "rgba(0,0,0,0.25)" }}>
                  <div className="crt-micro-tl">
                    <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-te-400/60">target</span>
                    <span className="text-tx-3">|</span>
                    <span className="font-mono text-[10px] tracking-[0.18em] uppercase">competitor</span>
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
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-te-400/60">audit</span>
                  <span className="text-tx-3">|</span>
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase">profile</span>
                </div>
                <div className="crt-micro-tr">
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-tx-3">{depth} mode</span>
                </div>
                <div className="crt-monitor-header">
                  <span className="w-2 h-2 rounded-full bg-vi-400/60" />
                  <span className="font-mono text-[13px] font-semibold text-tx-1 tracking-tight ml-2">Profile Score: {analysis.profile.overall_score}/10</span>
                </div>
                <div className="crt-monitor-content p-4 space-y-3">
                  <ScoreGauge value={analysis.profile.overall_score} label="Overall" />

                  <div className="pt-2 border-t border-white/[0.04]">
                    <span className="font-mono text-[11px] text-tx-3 uppercase tracking-wider">Content Pillars</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {analysis.profile.content_pillars.map((p, i) => (
                        <span key={i} className="font-mono text-[11px] text-te-400 bg-te-400/10 px-2 py-0.5 rounded-r2">{p}</span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04]">
                    <span className="font-mono text-[11px] text-tx-3 uppercase tracking-wider">Posting Frequency</span>
                    <p className="font-mono text-[13px] text-tx-1 mt-1">{analysis.profile.posting_frequency}</p>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04]">
                    <span className="font-mono text-[11px] text-tx-3 uppercase tracking-wider">Hook Styles</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {analysis.profile.hook_styles.map((h, i) => (
                        <span key={i} className="font-mono text-[11px] text-fu-400 bg-fu-400/10 px-2 py-0.5 rounded-r2">{h}</span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04]">
                    <span className="font-mono text-[11px] text-tx-3 uppercase tracking-wider">Engagement Patterns</span>
                    <div className="space-y-1 mt-1">
                      {analysis.profile.engagement_patterns.map((ep, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="font-mono text-[10px] text-te-400 mt-0.5">{">>"}</span>
                          <span className="font-mono text-[12px] text-tx-1">{ep}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="crt-micro-bl">
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ok">ANALYSIS COMPLETE</span>
                </div>
              </div>

              <div className="crt-monitor relative crt-brackets reveal d3" style={{ background: "rgba(0,0,0,0.25)" }}>
                <div className="crt-micro-tl">
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-te-400/60">gaps</span>
                  <span className="text-tx-3">|</span>
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase">opportunities</span>
                </div>
                <div className="crt-monitor-header">
                  <span className="w-2 h-2 rounded-full bg-te-400/60" />
                  <span className="font-mono text-[13px] font-semibold text-tx-1 tracking-tight ml-2">Content Gaps ({analysis.gaps.length})</span>
                </div>
                <div className="crt-monitor-content p-4 space-y-2">
                  {analysis.gaps.map((gap, i) => (
                    <div key={i} className="flex items-start gap-2 py-1.5 border-b border-white/[0.02] last:border-0">
                      <span className="font-mono text-[10px] text-vi-400 tracking-wider flex-shrink-0 w-4">{String(i + 1).padStart(2, "0")}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-[13px] text-tx-1">{gap.topic}</span>
                        <p className="font-mono text-[11px] text-tx-3 mt-0.5">{gap.rationale}</p>
                      </div>
                      <span className="font-mono text-[10px] text-ok bg-ok/10 px-1.5 py-0.5 rounded-r2 flex-shrink-0">score: {gap.opportunity_score}</span>
                    </div>
                  ))}
                </div>
                <div className="crt-micro-bl">
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ok">GAPS IDENTIFIED</span>
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
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase"
            style={{ color: step === "results" ? "rgba(34,197,94,0.6)" : "rgba(86,86,128,0.6)" }}
          >
            {step === "input" ? "AWAITING INPUT" : "ANALYSIS READY"}
          </span>
        </div>
        <div className="crt-micro-br">
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-tx-3">
            {loading ? "GENERATING..." : "STANDBY"}
          </span>
        </div>

        <div className="crt-monitor-footer">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-tx-3">
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
              <span className="text-tx-3">[system ready]</span>
            )}
          </span>
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-tx-3">
            {loading ? "BUSY" : "STANDBY"}
          </span>
        </div>
      </div>

      <SignInModal open={showModal} onClose={closeModal} context="analyze competitor" />
    </div>
  );
}
