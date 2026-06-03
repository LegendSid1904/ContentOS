"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { PLATFORMS } from "@/lib/constants";
import { generateCarouselOutline, generateCoverHeadlines, saveCarousel } from "@/lib/actions-carousel";
import { getContentDefaults } from "@/lib/actions";
import { useAuthGate } from "@/lib/use-auth-gate";
import { SignInModal } from "@/components/auth/sign-in-modal";

type Step = "input" | "headlines" | "slides";

interface Slide {
  slide_number: number;
  headline: string;
  copy: string;
  visual_direction: string;
}

function BootLoader() {
  const steps = ["COMPOSING NARRATIVE ARC", "WRITING SLIDE COPY", "GENERATING VISUAL DIRECTION"];
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

export default function CarouselMakerPage() {
  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [selectedHeadline, setSelectedHeadline] = useState<string | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [error, setError] = useState("");
  const [generatingHeadlines, setGeneratingHeadlines] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useAuth();
  const { showModal, gate, closeModal, freeActionsLeft, savePreviewState, restorePreviewState } = useAuthGate("generate carousel");

  useEffect(() => {
    const saved = restorePreviewState<{ slides: Slide[]; headlines: string[]; step: Step; selectedHeadline: string | null }>();
    if (saved) {
      setSlides(saved.slides ?? []);
      setHeadlines(saved.headlines ?? []);
      setStep(saved.step ?? "input");
      setSelectedHeadline(saved.selectedHeadline ?? null);
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

  async function handleGenerateHeadlines() {
    if (!valid) return;
    savePreviewState({ slides, headlines, step, selectedHeadline });
    gate(async () => {
      setLoading(true);
      setGeneratingHeadlines(true);
      setError("");
      try {
        const result = await generateCoverHeadlines(topic, audience);
        if (!result.ok) { setError(result.error); setLoading(false); return; }
        setHeadlines(result.data);
        setStep("headlines");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Generation failed");
      }
      setLoading(false);
    });
  }

  async function handleSelectHeadline(headline: string) {
    setSelectedHeadline(headline);
    savePreviewState({ slides, headlines, step: "headlines", selectedHeadline: headline });
    gate(async () => {
      setLoading(true);
      setGeneratingHeadlines(false);
      setError("");
      try {
        const result = await generateCarouselOutline(topic, audience, platform, slideCount);
        if (!result.ok) { setError(result.error); setLoading(false); return; }
        setSlides(result.data);
        setStep("slides");
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Generation failed");
      }
      setLoading(false);
    });
  }

  async function handleRegenerate() {
    if (!selectedHeadline) return;
    savePreviewState({ slides, headlines, step, selectedHeadline });
    gate(async () => {
      setLoading(true);
      setError("");
      try {
        const result = await generateCarouselOutline(topic, audience, platform, slideCount);
        if (!result.ok) { setError(result.error); setLoading(false); return; }
        setSlides(result.data);
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Generation failed");
      }
      setLoading(false);
    });
  }

  async function handleSave() {
    if (!slides.length) return;
    savePreviewState({ slides, headlines, step, selectedHeadline });
    gate(async () => {
      try {
        const result = await saveCarousel(`Carousel: ${topic}`, slides, headlines);
        if (!result.ok) { setError(result.error); return; }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  function handleReset() {
    setStep("input");
    setHeadlines([]);
    setSelectedHeadline(null);
    setSlides([]);
    setError("");
  }

  function handleBackToHeadlines() {
    setStep("headlines");
    setSlides([]);
  }

  const isInputStep = step === "input" && !loading;
  const isHeadlinesStep = step === "headlines" && !loading;
  const isSlidesStep = step === "slides" && !loading;

  return (
    <div className="max-w-3xl space-y-6 relative z-10">
      <div>
        <p className="sec-eyebrow">
          <span className="sec-eyebrow-dot" />
          Module :: Carousel
        </p>
        <h1 className="sec-title !text-[28px]">Carousel Maker</h1>
        <p className="sec-desc !text-[13px]">
          AI-written slides + cover headlines &rarr; export in 2 minutes
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
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase">carousel_maker</span>
        </div>
        <div className="crt-micro-tr">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">v1.0.0</span>
          <span className="text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">id: {isSignedIn ? "active" : "preview"}</span>
        </div>

        <div className="crt-monitor-header">
          <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-tx-4">MODULE</span>
          <span className="font-mono text-[6px] text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-te-400/70">CAROUSEL MAKER</span>
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
                <label className="term-label mb-2">TOPIC</label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. 10 AI Tools Every Creator Needs"
                  className="term-field"
                  autoFocus
                />
              </div>

              <div className="reveal d2">
                <label className="term-label mb-2">TARGET_AUDIENCE</label>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Content creators, freelancers"
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

              <div className="reveal d4">
                <label className="term-label mb-2">SLIDES <span className="text-tx-4">({slideCount})</span></label>
                <input
                  type="range"
                  min={3}
                  max={10}
                  value={slideCount}
                  onChange={(e) => setSlideCount(Number(e.target.value))}
                  className="w-full accent-vi-500"
                />
                <div className="flex justify-between font-mono text-[7px] text-tx-4 mt-1">
                  <span>3</span>
                  <span>10</span>
                </div>
              </div>

              <div className="reveal d5 flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button
                  onClick={handleGenerateHeadlines}
                  disabled={!valid}
                  className="btn-terminal btn-terminal-primary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {">>"} GENERATE CAROUSEL
                </button>
                {!valid && (
                  <span className="font-mono text-[8px] text-tx-4 tracking-wider">AWAITING INPUT</span>
                )}
              </div>
            </>
          )}

          {isHeadlinesStep && (
            <>
              <div className="reveal d1">
                <label className="term-label mb-2">SELECT_COVER_HEADLINE</label>
                <p className="font-mono text-[10px] text-tx-3 mb-3 leading-relaxed">
                  &gt; {headlines.length} headline variants generated. Pick one to build your carousel.
                </p>
              </div>

              <div className="space-y-1">
                {headlines.map((headline, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectHeadline(headline)}
                    className={`boot-option ${selectedHeadline === headline ? "active" : ""}`}
                    style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                  >
                    <span className="boot-option-arrow">
                      {selectedHeadline === headline ? "\u25B6" : `0${i + 1}`}
                    </span>
                    <span className="boot-option-label">{headline}</span>
                    <span className={`diag-badge ${selectedHeadline === headline ? "diag-ok" : "diag-idle"}`}>
                      {selectedHeadline === headline ? "[SELECTED]" : "[IDLE]"}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button onClick={handleGenerateHeadlines} className="btn-terminal">
                  {">>"} REGENERATE
                </button>
                <button onClick={handleReset} className="btn-terminal" style={{ color: "rgba(239,68,68,0.5)", borderColor: "rgba(239,68,68,0.1)" }}>
                  {"^C"} BACK
                </button>
              </div>
            </>
          )}

          {isSlidesStep && (
            <div ref={outputRef} className="space-y-4 reveal d1">
              <div className="flex items-center justify-between">
                <label className="term-label mb-0">GENERATED_SLIDES</label>
                <div className="flex items-center gap-2">
                  <button onClick={handleSave} className="btn-terminal text-[9px]">
                    {"[SAVE]"}
                  </button>
                  <button onClick={handleRegenerate} className="btn-terminal text-[9px]">
                    {"[REGEN]"}
                  </button>
                </div>
              </div>

              <p className="font-mono text-[10px] text-tx-3 leading-relaxed">
                &gt; Cover: <span className="text-te-400">{selectedHeadline}</span> &mdash; {slides.length} slides generated
              </p>

              {slides.map((slide) => (
                <div key={slide.slide_number} className="crt-monitor relative crt-brackets" style={{ background: "rgba(0,0,0,0.25)" }}>
                  <div className="crt-micro-tl">
                    <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-te-400/60">slide</span>
                    <span className="text-tx-4">|</span>
                    <span className="font-mono text-[7px] tracking-[0.18em] uppercase">{slide.slide_number}/{slides.length}</span>
                  </div>
                  <div className="crt-micro-tr">
                    <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">{slide.visual_direction}</span>
                  </div>
                  <div className="crt-monitor-header">
                    <span className="w-2 h-2 rounded-full bg-fu-400/60" />
                    <span className="font-mono text-[10px] font-semibold text-tx-1 tracking-tight ml-2">{slide.headline}</span>
                  </div>
                  <div className="crt-monitor-content p-4">
                    <p className="font-mono text-[11px] text-tx-1 leading-[1.7] whitespace-pre-line">{slide.copy}</p>
                    <div className="mt-3 pt-2 border-t border-white/[0.04]">
                      <span className="font-mono text-[8px] text-tx-4 italic">
                        &gt; Visual: {slide.visual_direction}
                      </span>
                    </div>
                  </div>
                  <div className="crt-micro-bl">
                    <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-ok">SLIDE READY</span>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button onClick={handleReset} className="btn-terminal text-[9px]">
                  {">>"} NEW CAROUSEL
                </button>
                <button onClick={handleBackToHeadlines} className="btn-terminal text-[9px]">
                  {"^C"} BACK TO HEADLINES
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="crt-micro-bl">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase"
            style={{ color: step === "slides" ? "rgba(34,197,94,0.6)" : "rgba(86,86,128,0.6)" }}
          >
            {step === "input" ? "AWAITING INPUT" : step === "headlines" ? "HEADLINES READY" : "SLIDES READY"}
          </span>
        </div>
        <div className="crt-micro-br">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">
            {loading ? "GENERATING..." : "STANDBY"}
          </span>
        </div>

        <div className="crt-monitor-footer">
          <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-tx-4">
            {step === "input" ? "INPUT" : step === "headlines" ? "HEADLINES" : "SLIDES"}
          </span>
          <span className="font-mono text-[6px] text-center">
            {!isSignedIn ? (
              <span className="text-vi-400/60">
                {freeActionsLeft > 0 ? `FREE: ${freeActionsLeft} gen` : "FREE: 0 "}
              {!isSignedIn && freeActionsLeft <= 0 && (
                <Link href="/sign-in?redirect_url=%2Fdashboard%2Fcarousel-maker" className="text-vi-400/80 hover:text-vi-300 underline">
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

      <SignInModal open={showModal} onClose={closeModal} context="generate carousel" />
    </div>
  );
}
