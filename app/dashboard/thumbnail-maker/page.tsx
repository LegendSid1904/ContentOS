"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { PLATFORMS } from "@/lib/constants";
import { generateThumbnails, saveThumbnailBrief } from "@/lib/actions-thumbnail";
import { getContentDefaults } from "@/lib/actions";
import { useAuthGate } from "@/lib/use-auth-gate";
import { SignInModal } from "@/components/auth/sign-in-modal";

type Step = "input" | "concepts";

interface ThumbnailConcept {
  concept_name: string;
  headline_text: string;
  visual_description: string;
  color_palette: string[];
  facial_expression_hint: string;
  background_suggestion: string;
  props: string[];
}

function BootLoader() {
  const steps = ["ANALYZING TOPIC", "GENERATING CONCEPTS", "OPTIMIZING FOR CTR"];
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

function ColorSwatch({ hex }: { hex: string }) {
  return (
    <span
      className="inline-block w-4 h-4 rounded-sm border border-white/[0.1]"
      style={{ background: hex }}
    />
  );
}

export default function ThumbnailMakerPage() {
  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState("");
  const [concepts, setConcepts] = useState<ThumbnailConcept[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useAuth();
  const { showModal, gate, closeModal, freeActionsLeft, savePreviewState, restorePreviewState } = useAuthGate("generate thumbnails");

  useEffect(() => {
    const saved = restorePreviewState<{ concepts: ThumbnailConcept[]; step: Step; selectedIndex: number | null }>();
    if (saved) {
      setConcepts(saved.concepts ?? []);
      setStep(saved.step ?? "input");
      setSelectedIndex(saved.selectedIndex ?? null);
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

  const valid = topic.trim() && audience.trim() && platform;

  async function handleGenerate() {
    if (!valid) return;
    savePreviewState({ concepts, step, selectedIndex });
    gate(async () => {
      setLoading(true);
      setError("");
      try {
        const result = await generateThumbnails(topic, platform, audience);
        if (!result.ok) { setError(result.error); setLoading(false); return; }
        setConcepts(result.data);
        setStep("concepts");
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Generation failed");
      }
      setLoading(false);
    });
  }

  async function handleSave() {
    if (!concepts.length) return;
    savePreviewState({ concepts, step, selectedIndex });
    gate(async () => {
      try {
        const result = await saveThumbnailBrief(`Thumbnails: ${topic}`, concepts);
        if (!result.ok) { setError(result.error); return; }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  function handleReset() {
    setStep("input");
    setConcepts([]);
    setSelectedIndex(null);
    setError("");
  }

  const isInputStep = step === "input" && !loading;
  const isConceptsStep = step === "concepts" && !loading;

  return (
    <div className="max-w-3xl space-y-6 relative z-10">
      <div>
        <p className="sec-eyebrow">
          <span className="sec-eyebrow-dot" />
          Module :: Thumbnail
        </p>
        <h1 className="sec-title !text-[28px]">Thumbnail Maker</h1>
        <p className="sec-desc !text-[13px]">
          5 CTR-optimized thumbnail concepts per video
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
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase">thumbnail_maker</span>
        </div>
        <div className="crt-micro-tr">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">v1.0.0</span>
          <span className="text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">id: {isSignedIn ? "active" : "preview"}</span>
        </div>

        <div className="crt-monitor-header">
          <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-tx-4">MODULE</span>
          <span className="font-mono text-[6px] text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-te-400/70">THUMBNAIL MAKER</span>
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
                <label className="term-label mb-2">VIDEO_TOPIC</label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. I Tried 100 AI Tools — Here Are The Best"
                  className="term-field"
                  autoFocus
                />
              </div>

              <div className="reveal d2">
                <label className="term-label mb-2">TARGET_AUDIENCE</label>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Tech enthusiasts, early adopters"
                  className="term-field"
                />
              </div>

              <div className="reveal d3">
                <label className="term-label mb-2">PLATFORM</label>
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

              <div className="reveal d4 flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button
                  onClick={handleGenerate}
                  disabled={!valid}
                  className="btn-terminal btn-terminal-primary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {">>"} GENERATE CONCEPTS
                </button>
                {!valid && (
                  <span className="font-mono text-[8px] text-tx-4 tracking-wider">AWAITING INPUT</span>
                )}
              </div>
            </>
          )}

          {isConceptsStep && (
            <div ref={outputRef} className="space-y-4">
              <div className="flex items-center justify-between reveal d1">
                <label className="term-label mb-0">THUMBNAIL_CONCEPTS</label>
                <div className="flex items-center gap-2">
                  <button onClick={handleSave} className="btn-terminal text-[9px]">
                    {"[SAVE]"}
                  </button>
                  <button onClick={handleGenerate} className="btn-terminal text-[9px]">
                    {"[REGEN]"}
                  </button>
                </div>
              </div>

              <p className="font-mono text-[10px] text-tx-3 reveal d2">
                &gt; {concepts.length} concepts generated. Click to expand details.
              </p>

              <div className="space-y-2">
                {concepts.map((concept, i) => (
                  <div key={i}>
                    <button
                      onClick={() => setSelectedIndex(selectedIndex === i ? null : i)}
                      className={`w-full text-left boot-option ${selectedIndex === i ? "active" : ""}`}
                    >
                      <span className="boot-option-arrow">
                        {selectedIndex === i ? "\u25BC" : "\u25B6"}
                      </span>
                      <span className="boot-option-label flex flex-col gap-1 min-w-0">
                        <span className="text-[10px] text-tx-1 font-semibold">{concept.concept_name}</span>
                        <span className="text-[12px] text-te-400 font-bold tracking-tight">&ldquo;{concept.headline_text}&rdquo;</span>
                      </span>
                      <span className={`diag-badge ${selectedIndex === i ? "diag-ok" : "diag-idle"}`}>
                        {selectedIndex === i ? "[VIEWING]" : "[IDLE]"}
                      </span>
                    </button>
                    {selectedIndex === i && (
                      <div className="ml-6 pl-4 border-l border-white/[0.04] space-y-2 py-2 reveal d1">
                        <div>
                          <span className="font-mono text-[7px] text-tx-4 uppercase tracking-wider">Visual</span>
                          <p className="font-mono text-[9px] text-tx-2 mt-0.5">{concept.visual_description}</p>
                        </div>
                        <div>
                          <span className="font-mono text-[7px] text-tx-4 uppercase tracking-wider">Colors</span>
                          <div className="flex gap-1 mt-0.5">
                            {concept.color_palette.map((c, j) => (
                              <ColorSwatch key={j} hex={c} />
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-mono text-[7px] text-tx-4 uppercase tracking-wider">Expression</span>
                          <p className="font-mono text-[9px] text-tx-2 mt-0.5">{concept.facial_expression_hint}</p>
                        </div>
                        <div>
                          <span className="font-mono text-[7px] text-tx-4 uppercase tracking-wider">Background</span>
                          <p className="font-mono text-[9px] text-tx-2 mt-0.5">{concept.background_suggestion}</p>
                        </div>
                        {concept.props.length > 0 && (
                          <div>
                            <span className="font-mono text-[7px] text-tx-4 uppercase tracking-wider">Props</span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {concept.props.map((prop, j) => (
                                <span key={j} className="font-mono text-[7px] text-fu-400 bg-fu-400/10 px-1.5 py-0.5 rounded-r2">{prop}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button onClick={handleReset} className="btn-terminal text-[9px]">
                  {">>"} NEW BATCH
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="crt-micro-bl">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase"
            style={{ color: step === "concepts" ? "rgba(34,197,94,0.6)" : "rgba(86,86,128,0.6)" }}
          >
            {step === "input" ? "AWAITING INPUT" : "CONCEPTS READY"}
          </span>
        </div>
        <div className="crt-micro-br">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">
            {loading ? "GENERATING..." : "STANDBY"}
          </span>
        </div>

        <div className="crt-monitor-footer">
          <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-tx-4">
            {step === "input" ? "INPUT" : "CONCEPTS"}
          </span>
          <span className="font-mono text-[6px] text-center">
            {!isSignedIn ? (
              <span className="text-vi-400/60">
                {freeActionsLeft > 0 ? `FREE: ${freeActionsLeft} gen` : "FREE: 0 "}
              {!isSignedIn && freeActionsLeft <= 0 && (
                <Link href="/sign-in?redirect_url=%2Fdashboard%2Fthumbnail-maker" className="text-vi-400/80 hover:text-vi-300 underline">
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

      <SignInModal open={showModal} onClose={closeModal} context="generate thumbnails" />
    </div>
  );
}
