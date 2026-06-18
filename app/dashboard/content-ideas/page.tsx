"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { generateIdeas, generateAngles, generateCalendar, generateRepurposingMap, saveIdeas, type Idea } from "@/lib/actions-content-ideas";
import { getContentDefaults } from "@/lib/actions";
import { useAuthGate } from "@/lib/use-auth-gate";
import { SignInModal } from "@/components/auth/sign-in-modal";

type Step = "input" | "ideas" | "angles" | "calendar" | "repurpose";

interface RepurposeFormat {
  format: string;
  title: string;
  hook: string;
  key_points: string[];
  platform: string;
}

interface RepurposeMap {
  original: string;
  formats: RepurposeFormat[];
}

function BootLoader({ type }: { type: string }) {
  const steps = type === "ideas"
    ? ["ANALYZING NICHE", "GENERATING 30 IDEAS", "ORGANIZING BY PILLAR"]
    : type === "angles"
    ? ["DECONSTRUCTING TOPIC", "GENERATING VIRAL ANGLES", "RANKING BY IMPACT"]
    : ["MAPPING CONTENT MIX", "ASSIGNING PLATFORMS", "BUILDING CALENDAR"];

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

function EffortBadge({ effort }: { effort: string }) {
  const colors: Record<string, string> = {
    Low: "text-ok border-ok/20 bg-ok/5",
    Medium: "text-warn border-warn/20 bg-warn/5",
    High: "text-err border-err/20 bg-err/5",
  };
  return (
    <span className={`font-mono text-[7px] tracking-wider uppercase px-1.5 py-0.5 border rounded-sm ${colors[effort] || colors.Low}`}>
      {effort}
    </span>
  );
}

function FormatBadge({ format }: { format: string }) {
  const colors: Record<string, string> = {
    video: "text-vi-400 border-vi-400/20 bg-vi-400/5",
    post: "text-te-400 border-te-400/20 bg-te-400/5",
    carousel: "text-fu-400 border-fu-400/20 bg-fu-400/5",
  };
  return (
    <span className={`font-mono text-[7px] tracking-wider uppercase px-1.5 py-0.5 border rounded-sm ${colors[format] || colors.post}`}>
      {format}
    </span>
  );
}

function ScoreBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="font-mono text-[7px] text-tx-4 uppercase tracking-wider flex-shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-white/[0.03] rounded-sm overflow-hidden min-w-[40px]">
        <div
          className="h-full rounded-sm transition-all duration-500"
          style={{
            width: `${value * 10}%`,
            background: value >= 8
              ? "linear-gradient(90deg, #22c55e, #22d3ee)"
              : value >= 5
              ? "linear-gradient(90deg, #eab308, #f97316)"
              : "linear-gradient(90deg, #ef4444, #f97316)",
          }}
        />
      </div>
      <span className="font-mono text-[8px] text-tx-3 w-4 text-right">{value}</span>
    </div>
  );
}

function PillarSection({ name, ideas, onRepurpose }: { name: string; ideas: Idea[]; onRepurpose: (idea: Idea) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 py-1.5 border-b border-white/[0.03]">
        <span className="w-1.5 h-1.5 rounded-full bg-vi-400/60" />
        <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-tx-2">{name}</span>
        <span className="font-mono text-[7px] text-tx-4">({ideas.length})</span>
      </div>
      {ideas.map((idea) => (
        <div key={idea.id}>
          <button
            onClick={() => setExpanded(expanded === idea.id ? null : idea.id)}
            className="w-full text-left boot-option"
          >
            <span className="boot-option-arrow">
              {expanded === idea.id ? "\u25BC" : "\u25B6"}
            </span>
            <span className="boot-option-label flex flex-col gap-1 min-w-0">
              <span className="text-[11px] text-tx-1 leading-relaxed">{idea.title}</span>
              <span className="flex items-center gap-2 flex-wrap">
                <FormatBadge format={idea.format} />
                <EffortBadge effort={idea.effort} />
                <span className="font-mono text-[7px] text-tx-4 italic truncate">{idea.viral_angle}</span>
              </span>
            </span>
          </button>
          {expanded === idea.id && (
            <div className="ml-6 pl-4 border-l border-white/[0.04] space-y-2 py-2 reveal d1">
              <ScoreBar value={idea.shareability} label="share" />
              <ScoreBar value={idea.seo_value} label="seo" />
              <button
                onClick={(e) => { e.stopPropagation(); onRepurpose(idea); }}
                className="btn-terminal text-[8px] mt-1"
              >
                {"[REPURPOSE]"} 6 formats
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CalendarGrid({ days }: { days: { day: number; title: string; format: string; platform: string; pillar: string }[] }) {
  const weekDays = days.reduce<{ day: number; title: string; format: string; platform: string; pillar: string }[][]>((acc, d, i) => {
    const weekIdx = Math.floor(i / 7);
    if (!acc[weekIdx]) acc[weekIdx] = [];
    acc[weekIdx].push(d);
    return acc;
  }, []);

  return (
    <div className="space-y-3">
      {weekDays.map((week, wi) => (
        <div key={wi}>
          <div className="font-mono text-[8px] text-tx-4 tracking-wider uppercase mb-1.5">
            Week {wi + 1}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {week.map((day) => (
              <div
                key={day.day}
                className="border border-white/[0.04] bg-black/20 rounded-sm p-1.5 min-h-[60px]"
              >
                <span className="font-mono text-[7px] text-tx-4 block mb-0.5">D{day.day}</span>
                <span className="font-mono text-[7px] text-tx-1 leading-tight block line-clamp-2">{day.title}</span>
                <div className="flex gap-0.5 mt-1 flex-wrap">
                  <FormatBadge format={day.format} />
                  <span className="font-mono text-[6px] text-tx-4 uppercase tracking-wider">{day.platform}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ContentIdeasPage() {
  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<string>("ideas");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [trendMode, setTrendMode] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [pillars, setPillars] = useState<string[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [angles, setAngles] = useState<string[]>([]);
  const [repurposeMap, setRepurposeMap] = useState<RepurposeMap | null>(null);
  const [calendar, setCalendar] = useState<{ day: number; title: string; format: string; platform: string; pillar: string }[]>([]);
  const [error, setError] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useAuth();
  const { showModal, gate, closeModal, freeActionsLeft, savePreviewState, restorePreviewState } = useAuthGate("generate ideas");

  useEffect(() => {
    const saved = restorePreviewState<{ ideas: Idea[]; pillars: string[]; angles: string[]; calendar: typeof calendar; step: Step; selectedIdea: Idea | null; repurposeMap: RepurposeMap | null }>();
    if (saved) {
      setIdeas(saved.ideas ?? []);
      setPillars(saved.pillars ?? []);
      setAngles(saved.angles ?? []);
      setCalendar(saved.calendar ?? []);
      setStep(saved.step ?? "input");
      setSelectedIdea(saved.selectedIdea ?? null);
      setRepurposeMap(saved.repurposeMap ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    getContentDefaults().then((defaults) => {
      if (!defaults) return;
    });
  }, [isSignedIn]);

  const valid = niche.trim() && audience.trim();

  async function handleGenerateIdeas() {
    if (!valid) return;
    savePreviewState({ ideas, pillars, angles, calendar, repurposeMap, step, selectedIdea });
    gate(async () => {
      setLoading(true);
      setLoadingType("ideas");
      setError("");
      try {
        const result = await generateIdeas(niche, audience, trendMode ? "trending" : undefined);
        if (!result.ok) { setError(result.error); setLoading(false); return; }
        setPillars(result.data.pillars);
        setIdeas(result.data.ideas);
        setStep("ideas");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Generation failed");
      }
      setLoading(false);
    });
  }

  async function handleSelectIdea(idea: Idea) {
    setSelectedIdea(idea);
    savePreviewState({ ideas, pillars, angles, calendar, repurposeMap, step, selectedIdea: idea });
    gate(async () => {
      setLoading(true);
      setLoadingType("angles");
      setError("");
      try {
        const result = await generateAngles(niche, audience, idea.title);
        if (!result.ok) { setError(result.error); setLoading(false); return; }
        setAngles(result.data);
        setStep("angles");
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Angle generation failed");
      }
      setLoading(false);
    });
  }

  async function handleRepurpose(idea: Idea) {
    setSelectedIdea(idea);
    savePreviewState({ ideas, pillars, angles, calendar, repurposeMap, step, selectedIdea: idea });
    gate(async () => {
      setLoading(true);
      setLoadingType("ideas");
      setError("");
      try {
        const result = await generateRepurposingMap(idea.title, niche, audience);
        if (!result.ok) { setError(result.error); setLoading(false); return; }
        setRepurposeMap(result.data);
        setStep("repurpose");
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Repurposing failed");
      }
      setLoading(false);
    });
  }

  async function handleGenerateCalendar() {
    savePreviewState({ ideas, pillars, angles, calendar, repurposeMap, step, selectedIdea });
    gate(async () => {
      setLoading(true);
      setLoadingType("calendar");
      setError("");
      try {
        const result = await generateCalendar(ideas.map((i) => ({ title: i.title, format: i.format })));
        if (!result.ok) { setError(result.error); setLoading(false); return; }
        setCalendar(result.data);
        setStep("calendar");
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Calendar generation failed");
      }
      setLoading(false);
    });
  }

  async function handleSave() {
    savePreviewState({ ideas, pillars, angles, calendar, repurposeMap, step, selectedIdea });
    gate(async () => {
      try {
        const result = await saveIdeas(`Ideas: ${niche}`, { pillars, ideas });
        if (!result.ok) { setError(result.error); return; }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  function handleReset() {
    setStep("input");
    setIdeas([]);
    setPillars([]);
    setSelectedIdea(null);
    setAngles([]);
    setCalendar([]);
    setError("");
  }

  function handleBackToIdeas() {
    setStep("ideas");
    setSelectedIdea(null);
    setAngles([]);
  }

  const isInputStep = step === "input" && !loading;
  const isIdeasStep = step === "ideas" && !loading;
  const isAnglesStep = step === "angles" && !loading;
  const isRepurposeStep = step === "repurpose" && !loading;
  const isCalendarStep = step === "calendar" && !loading;

  return (
    <div className="max-w-3xl space-y-6 relative z-10">
      <div>
        <p className="sec-eyebrow">
          <span className="sec-eyebrow-dot" />
          Module :: Ideas
        </p>
        <h1 className="sec-title !text-[28px] font-display">Content Ideas</h1>
        <p className="sec-desc !text-[13px] font-display">
          30 niche ideas with viral angles and full calendar
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
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase">content_ideas</span>
        </div>
        <div className="crt-micro-tr">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">v1.0.0</span>
          <span className="text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">id: {isSignedIn ? "active" : "preview"}</span>
        </div>

        <div className="crt-monitor-header">
          <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-tx-4">MODULE</span>
          <span className="font-mono text-[6px] text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-te-400/70">CONTENT IDEAS</span>
          <div className="flex-1" />
          <span className="font-mono text-[7px] tracking-[0.1em] text-tx-4">{"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
        </div>

        <div className="crt-monitor-content p-6 space-y-6">
          {loading && <BootLoader type={loadingType} />}

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
                  placeholder="e.g. Personal Finance India, Fitness for Busy Professionals"
                  className="term-field"
                  autoFocus
                />
              </div>

              <div className="reveal d2">
                <label className="term-label mb-2">TARGET_AUDIENCE</label>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Salaried employees aged 25-40"
                  className="term-field"
                />
              </div>

              <div className="reveal d3">
                <label className="term-label mb-2">TREND_MODE</label>
                <button
                  onClick={() => setTrendMode(!trendMode)}
                  className={`boot-option ${trendMode ? "active" : ""}`}
                >
                  <span className="boot-option-arrow">
                    {trendMode ? "\u25B6" : ">>"}
                  </span>
                  <span className="boot-option-label">
                    Enable trend surfing
                    <span className="block font-mono text-[8px] text-tx-4 mt-0.5">
                      Scans current trending topics in your niche for maximum relevance
                    </span>
                  </span>
                  <span className={`diag-badge ${trendMode ? "diag-ok" : "diag-idle"}`}>
                    {trendMode ? "[ENABLED]" : "[OFF]"}
                  </span>
                </button>
              </div>

              <div className="reveal d4 flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button
                  onClick={handleGenerateIdeas}
                  disabled={!valid}
                  className="btn-terminal btn-terminal-primary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {">>"} GENERATE 30 IDEAS
                </button>
                {!valid && (
                  <span className="font-mono text-[8px] text-tx-4 tracking-wider">AWAITING INPUT</span>
                )}
              </div>
            </>
          )}

          {isIdeasStep && (
            <div ref={outputRef} className="space-y-4">
              <div className="flex items-center justify-between reveal d1">
                <label className="term-label mb-0">IDEAS_BY_PILLAR</label>
                <div className="flex items-center gap-2">
                  <button onClick={handleGenerateCalendar} className="btn-terminal text-[9px]">
                    {"[CALENDAR]"}
                  </button>
                  <button onClick={handleSave} className="btn-terminal text-[9px]">
                    {"[SAVE]"}
                  </button>
                  <button onClick={handleGenerateIdeas} className="btn-terminal text-[9px]">
                    {"[REGEN]"}
                  </button>
                </div>
              </div>

              <p className="font-mono text-[10px] text-tx-3 reveal d2">
                &gt; {ideas.length} ideas across {pillars.length} pillars. Click an idea to expand scores.
              </p>

              <div className="space-y-4 reveal d3">
                {pillars.map((pillar) => (
                  <PillarSection
                    key={pillar}
                    name={pillar}
                    ideas={ideas.filter((i) => i.pillar === pillar)}
                    onRepurpose={handleRepurpose}
                  />
                ))}
              </div>

              <div className="reveal d4 flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button
                  onClick={() => {
                    const firstIdea = ideas[0];
                    if (firstIdea) handleSelectIdea(firstIdea);
                  }}
                  className="btn-terminal btn-terminal-primary text-[9px]"
                >
                  {">>"} VIRAL ANGLES
                </button>
                <button onClick={handleReset} className="btn-terminal text-[9px]">
                  {"^C"} BACK
                </button>
              </div>
            </div>
          )}

          {isAnglesStep && selectedIdea && (
            <div ref={outputRef} className="space-y-4">
              <div className="flex items-center justify-between reveal d1">
                <label className="term-label mb-0">VIRAL_ANGLES</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleSelectIdea(selectedIdea)} className="btn-terminal text-[9px]">
                    {"[REGEN]"}
                  </button>
                </div>
              </div>

              <div className="crt-monitor relative crt-brackets reveal d2" style={{ background: "rgba(0,0,0,0.25)" }}>
                <div className="crt-micro-tl">
                  <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-te-400/60">topic</span>
                  <span className="text-tx-4">|</span>
                  <span className="font-mono text-[7px] tracking-[0.18em] uppercase">selected</span>
                </div>

                <div className="crt-monitor-header">
                  <span className="w-2 h-2 rounded-full bg-fu-400/60" />
                  <span className="font-mono text-[10px] font-semibold text-tx-1 tracking-tight ml-2">{selectedIdea.title}</span>
                  <div className="flex-1" />
                  <FormatBadge format={selectedIdea.format} />
                </div>

                <div className="crt-monitor-content p-4 space-y-1">
                  {angles.map((angle, i) => (
                    <div key={i} className="flex items-start gap-2 py-1.5 border-b border-white/[0.02] last:border-0">
                      <span className="font-mono text-[8px] text-te-400/60 tracking-wider flex-shrink-0 w-5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-mono text-[11px] text-tx-1 leading-relaxed">{angle}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button onClick={handleBackToIdeas} className="btn-terminal text-[9px]">
                  {">>"} BACK TO IDEAS
                </button>
                <button onClick={handleReset} className="btn-terminal text-[9px]" style={{ color: "rgba(239,68,68,0.5)", borderColor: "rgba(239,68,68,0.1)" }}>
                  {"^C"} RESET
                </button>
              </div>
            </div>
          )}

          {isRepurposeStep && repurposeMap && (
            <div ref={outputRef} className="space-y-4">
              <div className="flex items-center justify-between reveal d1">
                <label className="term-label mb-0">REPURPOSE_MAP</label>
                <button onClick={() => handleSelectIdea(selectedIdea!)} className="btn-terminal text-[9px]">
                  {"[REGEN]"}
                </button>
              </div>

              <p className="font-mono text-[10px] text-tx-3 reveal d2">
                &gt; 6 formats for &ldquo;{repurposeMap.original}&rdquo;
              </p>

              <div className="space-y-3 reveal d3">
                {repurposeMap.formats.map((f, i) => (
                  <div key={i} className="crt-monitor relative crt-brackets" style={{ background: "rgba(0,0,0,0.25)" }}>
                    <div className="crt-micro-tl">
                      <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-te-400/60">fmt</span>
                      <span className="text-tx-4">|</span>
                      <span className="font-mono text-[7px] tracking-[0.18em] uppercase">{f.format.toUpperCase().replace(/\s+/g, "_")}</span>
                    </div>
                    <div className="crt-micro-tr">
                      <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">{f.platform}</span>
                    </div>

                    <div className="crt-monitor-content p-3 space-y-2">
                      <div className="font-mono text-[11px] text-tx-1 font-semibold">{f.title}</div>
                      <div className="font-mono text-[9px] text-te-400/70 italic">&gt; {f.hook}</div>
                      <ul className="space-y-0.5">
                        {f.key_points.map((kp, j) => (
                          <li key={j} className="font-mono text-[9px] text-tx-3 flex items-start gap-1.5">
                            <span className="text-tx-4 mt-0.5">&bull;</span>
                            {kp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04] reveal d4">
                <button onClick={handleBackToIdeas} className="btn-terminal text-[9px]">
                  {">>"} BACK TO IDEAS
                </button>
                <button onClick={handleReset} className="btn-terminal text-[9px]">
                  {"[NEW]"} NEW BATCH
                </button>
              </div>
            </div>
          )}

          {isCalendarStep && (
            <div ref={outputRef} className="space-y-4">
              <div className="flex items-center justify-between reveal d1">
                <label className="term-label mb-0">30_DAY_CALENDAR</label>
                <div className="flex items-center gap-2">
                  <button onClick={handleGenerateCalendar} className="btn-terminal text-[9px]">
                    {"[REGEN]"}
                  </button>
                </div>
              </div>

              <div className="reveal d2">
                <CalendarGrid days={calendar} />
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button onClick={handleBackToIdeas} className="btn-terminal text-[9px]">
                  {">>"} BACK TO IDEAS
                </button>
                <button onClick={handleReset} className="btn-terminal text-[9px]">
                  {"[NEW]"} NEW BATCH
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="crt-micro-bl">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase"
            style={{ color: step === "calendar" ? "rgba(34,197,94,0.6)" : "rgba(86,86,128,0.6)" }}
          >
            {step === "input" ? "AWAITING INPUT" : step === "ideas" ? "IDEAS READY" : step === "angles" ? "ANGLES READY" : step === "repurpose" ? "REPURPOSE MAP READY" : "CALENDAR READY"}
          </span>
        </div>
        <div className="crt-micro-br">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">
            {loading ? "GENERATING..." : "STANDBY"}
          </span>
        </div>

        <div className="crt-monitor-footer">
          <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-tx-4">
            {step === "input" ? "INPUT" : step === "ideas" ? "IDEAS" : step === "angles" ? "ANGLES" : step === "repurpose" ? "REPURPOSE" : "CALENDAR"}
          </span>
          <span className="font-mono text-[6px] text-center">
            {!isSignedIn ? (
              <span className="text-vi-400/60">
                {freeActionsLeft > 0 ? `FREE: ${freeActionsLeft} gen` : "FREE: 0 "}
                {!isSignedIn && freeActionsLeft <= 0 && (
                  <Link href="/sign-in?redirect_url=%2Fdashboard%2Fcontent-ideas" className="text-vi-400/80 hover:text-vi-300 underline">
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

      <SignInModal open={showModal} onClose={closeModal} context="generate ideas" />
    </div>
  );
}
