"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { APP_MODULES } from "@/lib/constants";
import { analyzeTranscript, saveEditingBrief } from "@/lib/actions-video-brief";
import { getBrandKit } from "@/lib/actions";
import { useAuthGate } from "@/lib/use-auth-gate";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { StreamingLoader } from "@/components/streaming-loader";
import { ErrorBoundary } from "@/components/error-boundary";

type Step = "input" | "results";

const EDITING_STYLES = ["Fast-cut", "Storytelling", "Educational", "Cinematic"];

interface EditPoint {
  timestamp: string;
  type: "hook" | "key_point" | "transition" | "cta";
  description: string;
}

interface BrollKeyword {
  timestamp: string;
  keywords: string[];
}

interface EditingBrief {
  analysis: {
    hook_moment: string;
    edit_points: EditPoint[];
    retention_markers: string[];
    section_breaks: { timestamp: string; label: string }[];
    pacing_suggestion: string;
  };
  broll_keywords: BrollKeyword[];
  caption_style: string;
  caption_examples: string[];
}

const typeColors: Record<string, string> = {
  hook: "text-fu-400 border-fu-400/20 bg-fu-400/5",
  key_point: "text-te-400 border-te-400/20 bg-te-400/5",
  transition: "text-vi-400 border-vi-400/20 bg-vi-400/5",
  cta: "text-ok border-ok/20 bg-ok/5",
};

function VideoBriefFallback() {
  return (
    <div className="font-mono text-[11px] text-tx-4 p-6 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-vi-400 animate-pulse" />
      loading session...
    </div>
  );
}

export default function VideoBriefPage({ appId: _appId }: any = {}) {
  return (
    <Suspense fallback={<VideoBriefFallback />}>
      <VideoBriefContent appId={_appId} />
    </Suspense>
  );
}

function VideoBriefContent({ appId: propAppId }: { appId?: string | null }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appId = propAppId ?? searchParams?.get("app") ?? null;

  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [videoLength, setVideoLength] = useState<"short" | "long">("short");
  const [style, setStyle] = useState("");
  const [brief, setBrief] = useState<EditingBrief | null>(null);
  const [niche, setNiche] = useState("");
  const [error, setError] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useAuth();
  const { showModal, gate, closeModal, triggerModal, freeActionsLeft, savePreviewState, restorePreviewState } = useAuthGate("analyze transcript");

  const appModule = appId ? APP_MODULES[appId]?.find((m) => m.id === "video-brief") : null;
  const appModuleName = appModule?.name ?? "VIDEO BRIEF";

  useEffect(() => {
    const saved = restorePreviewState<{ brief: EditingBrief | null; step: Step }>();
    if (saved) {
      setBrief(saved.brief ?? null);
      setStep(saved.step ?? "input");
    }
    if (isSignedIn) {
      getBrandKit().then((kit) => {
        if (kit && kit.niche) setNiche(kit.niche);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  useEffect(() => {
    if (!appId) {
      router.push('/dashboard');
    }
  }, [appId, router]);

  const valid = transcript.trim().length > 20;

  async function handleAnalyze() {
    if (!valid) return;
    savePreviewState({ brief, step });
    gate(async () => {
      setLoading(true);
      setError("");
      try {
        const result = await analyzeTranscript(transcript, videoLength, style, niche);
        if (!result.ok) { if (result.error?.includes("sign in")) { triggerModal(); return; } setError(result.error); setLoading(false); return; }
        setBrief(result.data);
        setStep("results");
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Analysis failed");
      }
      setLoading(false);
    });
  }

  async function handleSave() {
    if (!brief) return;
    savePreviewState({ brief, step });
    gate(async () => {
      try {
        const result = await saveEditingBrief("Editing Brief", brief);
        if (!result.ok) { if (result.error?.includes("sign in")) { triggerModal(); return; } setError(result.error); return; }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  function handleReset() {
    setStep("input");
    setBrief(null);
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
          Module :: Brief
        </p>
        <h1 className="sec-title !text-[28px]">Video Brief</h1>
        <p className="sec-desc !text-[13px]">
          Transcript &rarr; editing brief + full B-roll list
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
          {loading && <StreamingLoader steps={["ANALYZING TRANSCRIPT", "IDENTIFYING EDIT POINTS", "GENERATING B-ROLL LIST"]} />}

          {error && (
            <div className="font-mono text-[14px] text-err bg-err/10 border border-err/20 rounded-r3 p-3">
              <span className="text-err">[ERROR]</span> {error}
              <button onClick={() => setError("")} className="ml-2 text-err/60 hover:text-err underline">dismiss</button>
            </div>
          )}

          {isInputStep && (
            <>
              <div className="font-mono text-[11px] text-vi-400/70 border border-vi-500/15 bg-vi-500/5 rounded-r3 p-3 text-center tracking-wider leading-relaxed">
                <span className="text-vi-400/90">[READY]</span> {appModule ? appModule.desc : "paste a transcript or script below to generate edit points, b-roll keywords, pacing suggestions, and caption styles."}
              </div>
              <div className="reveal d1">
                <label className="term-label text-[13px] mb-2">TRANSCRIPT / SCRIPT</label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste your full video transcript or script here..."
                  className="term-field min-h-[200px] resize-y"
                  rows={8}
                  autoFocus
                />
              </div>

              <div className="reveal d2">
                <label className="term-label text-[13px] mb-2">VIDEO_LENGTH</label>
                <div className="space-y-1">
                  <button
                    onClick={() => setVideoLength("short")}
                    className={`boot-option ${videoLength === "short" ? "active" : ""}`}
                  >
                    <span className="boot-option-arrow">
                      {videoLength === "short" ? "\u25B6" : ">>"}
                    </span>
                    <span className="boot-option-label">Short-form (under 90s)</span>
                    <span className={`diag-badge ${videoLength === "short" ? "diag-ok" : "diag-idle"}`}>
                      {videoLength === "short" ? "[ACTIVE]" : "[IDLE]"}
                    </span>
                  </button>
                  <button
                    onClick={() => setVideoLength("long")}
                    className={`boot-option ${videoLength === "long" ? "active" : ""}`}
                  >
                    <span className="boot-option-arrow">
                      {videoLength === "long" ? "\u25B6" : ">>"}
                    </span>
                    <span className="boot-option-label">Long-form (8+ minutes)</span>
                    <span className={`diag-badge ${videoLength === "long" ? "diag-ok" : "diag-idle"}`}>
                      {videoLength === "long" ? "[ACTIVE]" : "[IDLE]"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="reveal d3">
                <label className="term-label text-[13px] mb-2">EDITING_STYLE <span className="text-tx-3">(optional)</span></label>
                <div className="space-y-1">
                  {EDITING_STYLES.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => setStyle(s === style ? "" : s)}
                      className={`boot-option ${s === style ? "active" : ""}`}
                      style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                    >
                      <span className="boot-option-arrow">
                        {s === style ? "\u25B6" : ">>"}
                      </span>
                      <span className="boot-option-label">{s}</span>
                      <span className={`diag-badge ${s === style ? "diag-ok" : "diag-idle"}`}>
                        {s === style ? "[SELECTED]" : "[IDLE]"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="reveal d4 flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button
                  onClick={handleAnalyze}
                  disabled={!valid}
                  className="btn-terminal btn-terminal-primary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {">>"} ANALYZE TRANSCRIPT
                </button>
                {!valid && (
                  <span className="font-mono text-[13px] text-tx-3 tracking-wider">NEED MORE TEXT</span>
                )}
              </div>
            </>
          )}

          {isResultsStep && brief && (
            <div ref={outputRef} className="space-y-6">
              <div className="flex items-center justify-between reveal d1">
                <label className="term-label text-[13px] mb-0">EDITING_BRIEF</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => {
                    if (!brief) return;
                    const win = window.open("", "_blank");
                    if (!win) return;
                    win.document.write(`<!DOCTYPE html><html><head><title>Editing Brief</title><style>
                      @page { margin: 0.75in; }
                      * { box-sizing: border-box; margin: 0; padding: 0; }
                      body { font-family: 'Courier New', monospace; font-size: 11pt; line-height: 1.6; color: #111; padding: 20px; }
                      h1 { font-size: 16pt; margin-bottom: 16px; border-bottom: 2px solid #333; padding-bottom: 8px; }
                      h2 { font-size: 13pt; margin: 16px 0 8px; color: #444; }
                      .ep { display: flex; gap: 8px; margin-bottom: 4px; }
                      .ts { font-weight: bold; color: #888; }
                      .broll-section { margin-bottom: 12px; }
                      .kw { display: inline-block; background: #f0f0f0; padding: 2px 6px; margin: 2px; border-radius: 3px; font-size: 9pt; }
                      .caption { font-style: italic; background: #f9f9f9; padding: 8px; margin-bottom: 4px; }
                      .footer { margin-top: 24px; font-size: 8pt; color: #999; text-align: center; border-top: 1px solid #ddd; padding-top: 8px; }
                    </style></head><body>
                    <h1>Editing Brief</h1>
                    <p><strong>Hook Moment:</strong> ${brief.analysis.hook_moment}</p>
                    <h2>Edit Points</h2>
                    ${brief.analysis.edit_points.map(e => `<div class="ep"><span class="ts">[${e.timestamp}]</span> <strong>${e.type}</strong> &mdash; ${e.description}</div>`).join("")}
                    <h2>Pacing</h2>
                    <p>${brief.analysis.pacing_suggestion}</p>
                    <h2>B-Roll Keywords</h2>
                    ${brief.broll_keywords.map(b => `<div class="broll-section"><strong>[${b.timestamp}]</strong> ${b.keywords.map(k => `<span class="kw">${k}</span>`).join("")}</div>`).join("")}
                    <h2>Caption Style: ${brief.caption_style}</h2>
                    ${brief.caption_examples.map(c => `<div class="caption">&ldquo;${c}&rdquo;</div>`).join("")}
                    <div class="footer">Generated by ContentOS AI</div>
                    <script>window.onload=function(){window.print()}</script></body></html>`);
                    win.document.close();
                  }} className="btn-terminal text-[11px]">
                    {"[PDF]"}
                  </button>
                  <button onClick={handleSave} className="btn-terminal text-[11px]">
                    {"[SAVE]"}
                  </button>
                  <button onClick={handleAnalyze} className="btn-terminal text-[11px]">
                    {"[REGEN]"}
                  </button>
                </div>
              </div>

              <div className="crt-monitor relative crt-brackets reveal d2" style={{ background: "rgba(0,0,0,0.25)" }}>
                <div className="crt-micro-tl">
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-te-400/60">analysis</span>
                  <span className="text-tx-4">|</span>
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase">edit_points</span>
                </div>
                <div className="crt-monitor-header">
                  <span className="w-2 h-2 rounded-full bg-fu-400/60" />
                  <span className="font-mono text-[13px] font-semibold text-tx-1 tracking-tight ml-2">Hook Moment</span>
                  <div className="flex-1" />
                  <span className="font-mono text-[12px] text-fu-400">{brief.analysis.hook_moment}</span>
                </div>
                <div className="crt-monitor-content p-4 space-y-3">
                  <div>
                    <span className="font-mono text-[13px] text-tx-3 uppercase tracking-wider">Edit Points</span>
                    <div className="space-y-1 mt-1">
                      {brief.analysis.edit_points.map((ep, i) => (
                        <div key={i} className="flex items-start gap-2 py-1 border-b border-white/[0.02] last:border-0">
                          <span className="font-mono text-[12px] text-tx-3 w-12 flex-shrink-0">{ep.timestamp}</span>
                          <span className={`font-mono text-[12px] tracking-wider uppercase px-1 py-0.5 border rounded-sm ${typeColors[ep.type] || typeColors.key_point}`}>
                            {ep.type}
                          </span>
                          <span className="font-mono text-[12px] text-tx-1">{ep.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/[0.04]">
                    <span className="font-mono text-[13px] text-tx-3 uppercase tracking-wider">Pacing</span>
                    <p className="font-mono text-[12px] text-tx-1 mt-1 italic">{brief.analysis.pacing_suggestion}</p>
                  </div>
                </div>
                <div className="crt-micro-bl">
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-ok">ANALYSIS COMPLETE</span>
                </div>
              </div>

              <div className="crt-monitor relative crt-brackets reveal d3" style={{ background: "rgba(0,0,0,0.25)" }}>
                <div className="crt-micro-tl">
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-te-400/60">assets</span>
                  <span className="text-tx-4">|</span>
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase">b-roll</span>
                </div>
                <div className="crt-monitor-header">
                  <span className="w-2 h-2 rounded-full bg-te-400/60" />
                  <span className="font-mono text-[13px] font-semibold text-tx-1 tracking-tight ml-2">B-Roll Keywords</span>
                </div>
                <div className="crt-monitor-content p-4 space-y-3">
                  {brief.broll_keywords.map((br, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="font-mono text-[12px] text-te-400/60 w-12 flex-shrink-0">{br.timestamp}</span>
                      <div className="flex flex-wrap gap-1">
                        {br.keywords.map((kw, j) => (
                          <span key={j} className="font-mono text-[13px] text-tx-1 bg-white/[0.03] px-1.5 py-0.5 rounded-r2">{kw}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="crt-micro-bl">
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-ok">ROLL READY</span>
                </div>
              </div>

              <div className="crt-monitor relative crt-brackets reveal d4" style={{ background: "rgba(0,0,0,0.25)" }}>
                <div className="crt-micro-tl">
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-te-400/60">captions</span>
                  <span className="text-tx-4">|</span>
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase">style</span>
                </div>
                <div className="crt-monitor-header">
                  <span className="w-2 h-2 rounded-full bg-vi-400/60" />
                  <span className="font-mono text-[13px] font-semibold text-tx-1 tracking-tight ml-2">{brief.caption_style}</span>
                </div>
                <div className="crt-monitor-content p-4 space-y-2">
                  {brief.caption_examples.map((ex, i) => (
                    <div key={i} className="font-mono text-[12px] text-tx-1 bg-white/[0.02] p-2 rounded-r2 italic">
                      &ldquo;{ex}&rdquo;
                    </div>
                  ))}
                </div>
                <div className="crt-micro-bl">
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-ok">CAPTIONS READY</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button onClick={handleReset} className="btn-terminal text-[12px]">
                  {">>"} NEW BRIEF
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="crt-micro-bl">
          <span className="font-mono text-[9px] tracking-[0.18em] uppercase"
            style={{ color: step === "results" ? "rgba(34,197,94,0.6)" : "rgba(86,86,128,0.6)" }}
          >
            {step === "input" ? "AWAITING INPUT" : "BRIEF READY"}
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
                <Link href="/sign-in?redirect_url=%2Fdashboard%2Fvideo-brief" className="text-vi-400/80 hover:text-vi-300 underline">
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

      <SignInModal open={showModal} onClose={closeModal} context="analyze transcript" />
    </div></ErrorBoundary>
  );
}
