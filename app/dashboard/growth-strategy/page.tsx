"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { PLATFORMS } from "@/lib/constants";
import { generateGrowthStrategy, saveGrowthStrategy } from "@/lib/actions-growth";
import { getContentDefaults } from "@/lib/actions";
import { useAuthGate } from "@/lib/use-auth-gate";
import { SignInModal } from "@/components/auth/sign-in-modal";

type Step = "input" | "results";

const GROWTH_GOALS = ["Brand awareness", "Monetization", "Community building", "Authority"];

interface GrowthStrategyData {
  audit: { content_quality: number; posting_consistency: number; seo_optimization: number; engagement_rate: number; strengths: string[]; weaknesses: string[]; growth_levers: string[] };
  plan: { week_number: number; theme: string; content_focus: string[]; growth_tactic: string; milestone: string }[];
  monetization: { phase: string; timeframe: string; tactics: string[]; revenue_target: string }[];
  algorithm_tips: string[];
}

function BootLoader() {
  const steps = ["AUDITING CURRENT POSITION", "BUILDING 90-DAY PLAN", "GENERATING MONETIZATION ROADMAP"];
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
      <span className="font-mono text-[7px] text-tx-4 uppercase tracking-wider w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/[0.03] rounded-sm overflow-hidden">
        <div
          className="h-full rounded-sm transition-all duration-500"
          style={{
            width: `${value * 10}%`,
            background: value >= 7 ? "linear-gradient(90deg, #22c55e, #22d3ee)" : value >= 4 ? "linear-gradient(90deg, #eab308, #f97316)" : "linear-gradient(90deg, #ef4444, #f97316)",
          }}
        />
      </div>
      <span className="font-mono text-[8px] text-tx-3 w-4 text-right">{value}/10</span>
    </div>
  );
}

export default function GrowthStrategyPage() {
  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [niche, setNiche] = useState("");
  const [followers, setFollowers] = useState("");
  const [platform, setPlatform] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [data, setData] = useState<GrowthStrategyData | null>(null);
  const [error, setError] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useAuth();
  const { showModal, gate, closeModal, freeActionsLeft, savePreviewState, restorePreviewState } = useAuthGate("generate strategy");

  useEffect(() => {
    const saved = restorePreviewState<{ data: GrowthStrategyData | null; step: Step }>();
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  const valid = niche.trim() && followers.trim() && platform && goals.length > 0;

  function toggleGoal(goal: string) {
    setGoals((prev) => prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]);
  }

  async function handleGenerate() {
    if (!valid) return;
    savePreviewState({ data, step });
    gate(async () => {
      setLoading(true);
      setError("");
      try {
        const result = await generateGrowthStrategy(niche, Number(followers), platform, goals.join(", "));
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
        const result = await saveGrowthStrategy(`Growth: ${niche}`, data);
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
    <div className="max-w-3xl space-y-6 relative z-10">
      <div>
        <p className="sec-eyebrow">
          <span className="sec-eyebrow-dot" />
          Module :: Growth
        </p>
        <h1 className="sec-title !text-[28px]">Growth Strategy</h1>
        <p className="sec-desc !text-[13px]">
          90-day plan + monetization roadmap
        </p>
      </div>

      <div className="crt-monitor relative crt-brackets">
        <div className="crt-scanlines" />
        <div className="crt-grain" />
        <div className="crt-vignette" />
        <div className="crt-sweep" />

        <div className="crt-micro-tl">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-te-400/60">sys</span>
          <span className="text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase">growth_strategy</span>
        </div>
        <div className="crt-micro-tr">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">v1.0.0</span>
          <span className="text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">id: {isSignedIn ? "active" : "preview"}</span>
        </div>

        <div className="crt-monitor-header">
          <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-tx-4">MODULE</span>
          <span className="font-mono text-[6px] text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-te-400/70">GROWTH STRATEGY</span>
          <div className="flex-1" />
          <span className="font-mono text-[7px] tracking-[0.1em] text-tx-4">{"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
        </div>

        <div className="crt-monitor-content p-6 space-y-6">
          {loading && <BootLoader />}

          {error && (
            <div className="font-mono text-[11px] text-err bg-err/10 border border-err/20 rounded-r3 p-3">
              <span className="text-err">[ERROR]</span> {error}
              <button onClick={() => setError("")} className="ml-2 text-err/60 hover:text-err underline">dismiss</button>
            </div>
          )}

          {isInputStep && (
            <>
              <div className="reveal d1">
                <label className="term-label mb-2">NICHE</label>
                <input
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. Personal Finance India, Fitness Tips"
                  className="term-field"
                  autoFocus
                />
              </div>

              <div className="reveal d2">
                <label className="term-label mb-2">CURRENT_FOLLOWERS</label>
                <input
                  value={followers}
                  onChange={(e) => setFollowers(e.target.value)}
                  placeholder="e.g. 5000"
                  type="number"
                  className="term-field"
                />
              </div>

              <div className="reveal d3">
                <label className="term-label mb-2">PRIMARY_PLATFORM</label>
                <div className="space-y-1">
                  {PLATFORMS.map((p, i) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p === platform ? "" : p)}
                      className={`boot-option ${p === platform ? "active" : ""}`}
                      style={{ animationDelay: `${0.3 + i * 0.08}s` }}
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

              <div className="reveal d4">
                <label className="term-label mb-2">GOALS <span className="text-tx-4">(select one or more)</span></label>
                <div className="space-y-1">
                  {GROWTH_GOALS.map((g, i) => (
                    <button
                      key={g}
                      onClick={() => toggleGoal(g)}
                      className={`boot-option ${goals.includes(g) ? "active" : ""}`}
                      style={{ animationDelay: `${0.5 + i * 0.08}s` }}
                    >
                      <span className="boot-option-arrow">
                        {goals.includes(g) ? "\u25B6" : ">>"}
                      </span>
                      <span className="boot-option-label">{g}</span>
                      <span className={`diag-badge ${goals.includes(g) ? "diag-ok" : "diag-idle"}`}>
                        {goals.includes(g) ? "[SELECTED]" : "[IDLE]"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="reveal d5 flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button
                  onClick={handleGenerate}
                  disabled={!valid}
                  className="btn-terminal btn-terminal-primary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {">>"} GENERATE STRATEGY
                </button>
                {!valid && (
                  <span className="font-mono text-[8px] text-tx-4 tracking-wider">AWAITING INPUT</span>
                )}
              </div>
            </>
          )}

          {isResultsStep && data && (
            <div ref={outputRef} className="space-y-6">
              <div className="flex items-center justify-between reveal d1">
                <label className="term-label mb-0">GROWTH_STRATEGY</label>
                <div className="flex items-center gap-2">
                  <button onClick={handleSave} className="btn-terminal text-[9px]">
                    {"[SAVE]"}
                  </button>
                  <button onClick={handleGenerate} className="btn-terminal text-[9px]">
                    {"[REGEN]"}
                  </button>
                </div>
              </div>

              <div className="crt-monitor relative crt-brackets reveal d2" style={{ background: "rgba(0,0,0,0.25)" }}>
                <div className="crt-micro-tl">
                  <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-te-400/60">audit</span>
                  <span className="text-tx-4">|</span>
                  <span className="font-mono text-[7px] tracking-[0.18em] uppercase">scorecard</span>
                </div>
                <div className="crt-monitor-header">
                  <span className="w-2 h-2 rounded-full bg-vi-400/60" />
                  <span className="font-mono text-[10px] font-semibold text-tx-1 tracking-tight ml-2">Growth Audit</span>
                </div>
                <div className="crt-monitor-content p-4 space-y-3">
                  <ScoreGauge value={data.audit.content_quality} label="Content Quality" />
                  <ScoreGauge value={data.audit.posting_consistency} label="Consistency" />
                  <ScoreGauge value={data.audit.seo_optimization} label="SEO" />
                  <ScoreGauge value={data.audit.engagement_rate} label="Engagement" />

                  <div className="pt-2 border-t border-white/[0.04]">
                    <span className="font-mono text-[7px] text-ok uppercase tracking-wider">Strengths</span>
                    {data.audit.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 mt-1">
                        <span className="font-mono text-[7px] text-ok mt-0.5">+</span>
                        <span className="font-mono text-[8px] text-tx-2">{s}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-white/[0.04]">
                    <span className="font-mono text-[7px] text-err uppercase tracking-wider">Weaknesses</span>
                    {data.audit.weaknesses.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 mt-1">
                        <span className="font-mono text-[7px] text-err mt-0.5">&mdash;</span>
                        <span className="font-mono text-[8px] text-tx-2">{w}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-white/[0.04]">
                    <span className="font-mono text-[7px] text-te-400 uppercase tracking-wider">Growth Levers</span>
                    {data.audit.growth_levers.map((gl, i) => (
                      <div key={i} className="flex items-start gap-2 mt-1">
                        <span className="font-mono text-[7px] text-te-400 mt-0.5">{">>"}</span>
                        <span className="font-mono text-[8px] text-tx-2">{gl}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="crt-micro-bl">
                  <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-ok">AUDIT COMPLETE</span>
                </div>
              </div>

              <div className="crt-monitor relative crt-brackets reveal d3" style={{ background: "rgba(0,0,0,0.25)" }}>
                <div className="crt-micro-tl">
                  <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-te-400/60">plan</span>
                  <span className="text-tx-4">|</span>
                  <span className="font-mono text-[7px] tracking-[0.18em] uppercase">90_day</span>
                </div>
                <div className="crt-monitor-header">
                  <span className="w-2 h-2 rounded-full bg-te-400/60" />
                  <span className="font-mono text-[10px] font-semibold text-tx-1 tracking-tight ml-2">90-Day Plan ({data.plan.length} weeks)</span>
                </div>
                <div className="crt-monitor-content p-4 space-y-3 max-h-[500px] overflow-y-auto">
                  {data.plan.map((week) => (
                    <div key={week.week_number} className="pb-3 border-b border-white/[0.04] last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[7px] text-fu-400 tracking-wider">W{String(week.week_number).padStart(2, "0")}</span>
                        <span className="font-mono text-[9px] text-tx-1 font-semibold">{week.theme}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {week.content_focus.map((cf, j) => (
                          <span key={j} className="font-mono text-[7px] text-tx-3 bg-white/[0.03] px-1.5 py-0.5 rounded-r2">{cf}</span>
                        ))}
                      </div>
                      <p className="font-mono text-[8px] text-te-400 mt-1">&gt; {week.growth_tactic}</p>
                      <p className="font-mono text-[7px] text-tx-4 italic mt-0.5">Milestone: {week.milestone}</p>
                    </div>
                  ))}
                </div>
                <div className="crt-micro-bl">
                  <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-ok">PLAN READY</span>
                </div>
              </div>

              <div className="crt-monitor relative crt-brackets reveal d4" style={{ background: "rgba(0,0,0,0.25)" }}>
                <div className="crt-micro-tl">
                  <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-te-400/60">monetize</span>
                  <span className="text-tx-4">|</span>
                  <span className="font-mono text-[7px] tracking-[0.18em] uppercase">roadmap</span>
                </div>
                <div className="crt-monitor-header">
                  <span className="w-2 h-2 rounded-full bg-fu-400/60" />
                  <span className="font-mono text-[10px] font-semibold text-tx-1 tracking-tight ml-2">Monetization Roadmap</span>
                </div>
                <div className="crt-monitor-content p-4 space-y-4">
                  {data.monetization.map((phase, i) => (
                    <div key={i} className="pb-3 border-b border-white/[0.04] last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[7px] text-vi-400 tracking-wider uppercase">{phase.phase}</span>
                        <span className="font-mono text-[7px] text-tx-4">({phase.timeframe})</span>
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {phase.tactics.map((t, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <span className="font-mono text-[7px] text-te-400 mt-0.5">&bull;</span>
                            <span className="font-mono text-[8px] text-tx-2">{t}</span>
                          </div>
                        ))}
                      </div>
                      <p className="font-mono text-[7px] text-ok mt-1">Target: {phase.revenue_target}</p>
                    </div>
                  ))}
                </div>
                <div className="crt-micro-bl">
                  <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-ok">ROADMAP READY</span>
                </div>
              </div>

              {data.algorithm_tips.length > 0 && (
                <div className="crt-monitor relative crt-brackets reveal d5" style={{ background: "rgba(0,0,0,0.25)" }}>
                  <div className="crt-micro-tl">
                    <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-te-400/60">tips</span>
                    <span className="text-tx-4">|</span>
                    <span className="font-mono text-[7px] tracking-[0.18em] uppercase">algorithm</span>
                  </div>
                  <div className="crt-monitor-header">
                    <span className="w-2 h-2 rounded-full bg-ok/60" />
                    <span className="font-mono text-[10px] font-semibold text-tx-1 tracking-tight ml-2">Algorithm Tips</span>
                  </div>
                  <div className="crt-monitor-content p-4 space-y-2">
                    {data.algorithm_tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="font-mono text-[7px] text-te-400 mt-0.5">{">>"}</span>
                        <span className="font-mono text-[8px] text-tx-2">{tip}</span>
                      </div>
                    ))}
                  </div>
                  <div className="crt-micro-bl">
                    <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-ok">TIPS READY</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button onClick={handleReset} className="btn-terminal text-[9px]">
                  {">>"} NEW STRATEGY
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="crt-micro-bl">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase"
            style={{ color: step === "results" ? "rgba(34,197,94,0.6)" : "rgba(86,86,128,0.6)" }}
          >
            {step === "input" ? "AWAITING INPUT" : "STRATEGY READY"}
          </span>
        </div>
        <div className="crt-micro-br">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">
            {loading ? "GENERATING..." : "STANDBY"}
          </span>
        </div>

        <div className="crt-monitor-footer">
          <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-tx-4">
            {step === "input" ? "INPUT" : "STRATEGY"}
          </span>
          <span className="font-mono text-[6px] text-center">
            {!isSignedIn ? (
              <span className="text-vi-400/60">
                {freeActionsLeft > 0 ? `FREE: ${freeActionsLeft} gen` : "FREE: 0 "}
              {!isSignedIn && freeActionsLeft <= 0 && (
                <Link href="/sign-in?redirect_url=%2Fdashboard%2Fgrowth-strategy" className="text-vi-400/80 hover:text-vi-300 underline">
                  [sign in]
                </Link>
              )}
              </span>
            ) : (
              <span className="text-tx-4">[system ready]</span>
            )}
          </span>
          <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-tx-4">
            {loading ? "BUSY" : "STANDBY"}
          </span>
        </div>
      </div>

      <SignInModal open={showModal} onClose={closeModal} context="generate strategy" />
    </div>
  );
}
