"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { PLATFORMS } from "@/lib/constants";
import { generateCarouselOutline, generateCoverHeadlines, generateCarouselCTA, generateCanvaPrompt, saveCarousel } from "@/lib/actions-carousel";
import { getContentDefaults, getBBStatus } from "@/lib/actions";
import { useAuthGate } from "@/lib/use-auth-gate";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { StreamingLoader } from "@/components/streaming-loader";

type Step = "input" | "headlines" | "slides" | "cta";

interface CTAOption {
  slide: number;
  text: string;
  style: string;
}

interface CanvaTemplate {
  name: string;
  prompt: string;
  colors: string[];
  fonts: string[];
}

interface Slide {
  slide_number: number;
  headline: string;
  copy: string;
  visual_direction: string;
}

const slideColors = [
  { bg: "linear-gradient(135deg, #0d9488, #14b8a6)", accent: "#14b8a6" },
  { bg: "linear-gradient(135deg, #7c3aed, #a78bfa)", accent: "#a78bfa" },
  { bg: "linear-gradient(135deg, #d946ef, #f0abfc)", accent: "#f0abfc" },
  { bg: "linear-gradient(135deg, #f59e0b, #fbbf24)", accent: "#fbbf24" },
  { bg: "linear-gradient(135deg, #06b6d4, #22d3ee)", accent: "#22d3ee" },
  { bg: "linear-gradient(135deg, #ef4444, #f87171)", accent: "#f87171" },
  { bg: "linear-gradient(135deg, #10b981, #34d399)", accent: "#34d399" },
  { bg: "linear-gradient(135deg, #f97316, #fb923c)", accent: "#fb923c" },
  { bg: "linear-gradient(135deg, #3b82f6, #60a5fa)", accent: "#60a5fa" },
  { bg: "linear-gradient(135deg, #ec4899, #f9a8d4)", accent: "#f9a8d4" },
];

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
  const [ctaOptions, setCtaOptions] = useState<CTAOption[]>([]);
  const [selectedCtas, setSelectedCtas] = useState<{ slide2: string; final: string }>({ slide2: "", final: "" });
  const [canvaTemplates, setCanvaTemplates] = useState<CanvaTemplate[]>([]);
  const [bbConnected, setBbConnected] = useState(false);
  const [bbTemplateId, setBbTemplateId] = useState("");
  const [bbImages, setBbImages] = useState<{ slide_number: number; pngUrl: string }[]>([]);
  const [generatingHeadlines, setGeneratingHeadlines] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useAuth();
  const { showModal, gate, closeModal, freeActionsLeft, savePreviewState, restorePreviewState } = useAuthGate("generate carousel");

  useEffect(() => {
    const saved = restorePreviewState<{ slides: Slide[]; headlines: string[]; step: Step; selectedHeadline: string | null; ctaOptions: CTAOption[]; selectedCtas: { slide2: string; final: string }; canvaTemplates: CanvaTemplate[] }>();
    if (saved) {
      setSlides(saved.slides ?? []);
      setHeadlines(saved.headlines ?? []);
      setStep(saved.step ?? "input");
      setSelectedHeadline(saved.selectedHeadline ?? null);
      setCtaOptions(saved.ctaOptions ?? []);
      setSelectedCtas(saved.selectedCtas ?? { slide2: "", final: "" });
      setCanvaTemplates(saved.canvaTemplates ?? []);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    getContentDefaults().then((defaults) => {
      if (!defaults) return;
      if (defaults.defaultPlatform && !platform) setPlatform(defaults.defaultPlatform);
    });
    getBBStatus().then((status) => {
      setBbConnected(status.connected);
      if (status.templateId) setBbTemplateId(status.templateId);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  const valid = topic.trim() && audience.trim() && platform;

  async function handleGenerateHeadlines() {
    if (!valid) return;
    savePreviewState({ slides, headlines, ctaOptions, selectedCtas, canvaTemplates, step, selectedHeadline });
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
    savePreviewState({ slides, headlines, ctaOptions, selectedCtas, canvaTemplates, step: "headlines", selectedHeadline: headline });
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
    savePreviewState({ slides, headlines, ctaOptions, selectedCtas, canvaTemplates, step, selectedHeadline });
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

  async function handleGenerateCTA() {
    if (!slides.length) return;
    savePreviewState({ slides, headlines, ctaOptions, selectedCtas, canvaTemplates, step, selectedHeadline });
    gate(async () => {
      setLoading(true);
      setError("");
      try {
        const result = await generateCarouselCTA(topic, audience, platform);
        if (!result.ok) { setError(result.error); setLoading(false); return; }
        setCtaOptions(result.data);
        setStep("cta");
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } catch (e) {
        setError(e instanceof Error ? e.message : "CTA generation failed");
      }
      setLoading(false);
    });
  }

  async function handleGenerateCanvaPrompts() {
    savePreviewState({ slides, headlines, ctaOptions, selectedCtas, canvaTemplates, step, selectedHeadline });
    gate(async () => {
      setLoading(true);
      setError("");
      try {
        if (bbConnected && bbTemplateId && slides.length > 0) {
          const res = await fetch("/api/bannerbear/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "carousel",
              slides: slides.map((s) => ({ headline: s.headline, copy: s.copy, slide_number: s.slide_number })),
              templateId: bbTemplateId,
            }),
          });
          const data = await res.json();
          if (!data.ok) { setError(data.error); setLoading(false); return; }
          setBbImages(data.images);
          setLoading(false);
          return;
        }
        const result = await generateCanvaPrompt(topic);
        if (!result.ok) { setError(result.error); setLoading(false); return; }
        setCanvaTemplates(result.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Bannerbear generation failed");
      }
      setLoading(false);
    });
  }

  function exportSlideAsPNG(slideEl: HTMLElement, filename: string) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080">
        <foreignObject width="1080" height="1080">
          <div xmlns="http://www.w3.org/1999/xhtml" style="width:1080px;height:1080px;font-family:'Courier New',monospace;">
            ${slideEl.innerHTML}
          </div>
        </foreignObject>
      </svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleSave() {
    if (!slides.length) return;
    savePreviewState({ slides, headlines, ctaOptions, selectedCtas, canvaTemplates, step, selectedHeadline });
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
  const isCTAStep = step === "cta" && !loading;

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
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-te-400/60">sys</span>
          <span className="text-tx-3">|</span>
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase">carousel_maker</span>
        </div>
        <div className="crt-micro-tr">
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-tx-3">v1.0.0</span>
          <span className="text-tx-3">|</span>
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-tx-3">id: {isSignedIn ? "active" : "preview"}</span>
        </div>

        <div className="crt-monitor-header">
          <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-tx-3">MODULE</span>
          <span className="font-mono text-[9px] text-tx-3">|</span>
          <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-te-400/70">CAROUSEL MAKER</span>
          <div className="flex-1" />
          <span className="font-mono text-[10px] tracking-[0.1em] text-tx-3">{"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
        </div>

        <div className="crt-monitor-content p-6 space-y-6">
          {loading && <StreamingLoader steps={["COMPOSING NARRATIVE ARC", "WRITING SLIDE COPY", "GENERATING VISUAL DIRECTION"]} />}

          {error && (
            <div className="font-mono text-[14px] text-err bg-err/10 border border-err/20 rounded-r3 p-3">
              <span className="text-err">[ERROR]</span> {error}
              <button onClick={() => setError("")} className="ml-2 text-err/60 hover:text-err underline">dismiss</button>
            </div>
          )}

          {isInputStep && (
            <>
              <div className="reveal d1">
                <label className="term-label mb-2 text-[12px]">TOPIC</label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. 10 AI Tools Every Creator Needs"
                  className="term-field"
                  autoFocus
                />
              </div>

              <div className="reveal d2">
                <label className="term-label mb-2 text-[12px]">TARGET_AUDIENCE</label>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Content creators, freelancers"
                  className="term-field"
                />
              </div>

              <div className="reveal d3">
                <label className="term-label mb-2 text-[12px]">PLATFORM</label>
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
                <label className="term-label mb-2 text-[12px]">SLIDES <span className="text-tx-3">({slideCount})</span></label>
                <input
                  type="range"
                  min={3}
                  max={10}
                  value={slideCount}
                  onChange={(e) => setSlideCount(Number(e.target.value))}
                  className="w-full accent-vi-500"
                />
                <div className="flex justify-between font-mono text-[10px] text-tx-3 mt-1">
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
                  <span className="font-mono text-[11px] text-tx-3 tracking-wider">AWAITING INPUT</span>
                )}
              </div>
            </>
          )}

          {isHeadlinesStep && (
            <>
              <div className="reveal d1">
                <label className="term-label mb-2 text-[12px]">SELECT_COVER_HEADLINE</label>
                <p className="font-mono text-[13px] text-tx-2 mb-3 leading-relaxed">
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

          {isCTAStep && ctaOptions.length > 0 && (
            <div ref={outputRef} className="space-y-4 reveal d1">
              <label className="term-label mb-2 text-[12px]">CTA_BUILDER</label>
              <p className="font-mono text-[13px] text-tx-2 mb-3 leading-relaxed">
                &gt; Select CTA for slide 2 (engagement) and final slide (conversion)
              </p>

              <div className="space-y-3">
                <div>
                  <label className="font-mono text-[9px] text-tx-4 tracking-wider uppercase mb-2 block">Slide 2 CTA (engagement)</label>
                  <div className="space-y-1">
                    {ctaOptions.filter((c) => c.slide === 2 || c.slide.toString() === "2").map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedCtas((prev) => ({ ...prev, slide2: c.text }))}
                        className={`boot-option ${selectedCtas.slide2 === c.text ? "active" : ""}`}
                      >
                        <span className="boot-option-arrow">{selectedCtas.slide2 === c.text ? "\u25B6" : `0${i + 1}`}</span>
                        <span className="boot-option-label flex flex-col gap-0.5">
                          <span className="text-[10px] text-tx-1">{c.text}</span>
                          <span className="text-[8px] text-tx-4 tracking-wider uppercase">style: {c.style}</span>
                        </span>
                        <span className={`diag-badge ${selectedCtas.slide2 === c.text ? "diag-ok" : "diag-idle"}`}>
                          {selectedCtas.slide2 === c.text ? "[SELECTED]" : "[IDLE]"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[9px] text-tx-4 tracking-wider uppercase mb-2 block">Final Slide CTA (conversion)</label>
                  <div className="space-y-1">
                    {ctaOptions.filter((c) => c.slide.toString() === "final" || c.slide === slides.length).map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedCtas((prev) => ({ ...prev, final: c.text }))}
                        className={`boot-option ${selectedCtas.final === c.text ? "active" : ""}`}
                      >
                        <span className="boot-option-arrow">{selectedCtas.final === c.text ? "\u25B6" : `0${i + 1}`}</span>
                        <span className="boot-option-label flex flex-col gap-0.5">
                          <span className="text-[10px] text-tx-1">{c.text}</span>
                          <span className="text-[8px] text-tx-4 tracking-wider uppercase">style: {c.style}</span>
                        </span>
                        <span className={`diag-badge ${selectedCtas.final === c.text ? "diag-ok" : "diag-idle"}`}>
                          {selectedCtas.final === c.text ? "[SELECTED]" : "[IDLE]"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button onClick={handleBackToHeadlines} className="btn-terminal">
                  {">>"} BACK TO SLIDES
                </button>
              </div>
            </div>
          )}

          {isSlidesStep && (
            <div ref={outputRef} className="space-y-4 reveal d1">
              <div className="flex items-center justify-between">
                <label className="term-label mb-0 text-[12px]">GENERATED_SLIDES</label>
                <div className="flex items-center gap-2">
                  {isSignedIn && (
                    <span className={`font-mono text-[8px] tracking-wider ${bbConnected ? "text-ok" : "text-tx-4"}`}>
                      {bbConnected ? "[BB:ON]" : "[BB:OFF]"}
                    </span>
                  )}
                  <button onClick={handleGenerateCTA} className="btn-terminal text-[9px]">
                    {"[CTA]"}
                  </button>
                  <button onClick={handleGenerateCanvaPrompts} className="btn-terminal text-[9px]">
                    {"[CANVA]"}
                  </button>
                  <button onClick={handleSave} className="btn-terminal text-[9px]">
                    {"[SAVE]"}
                  </button>
                  <button onClick={handleRegenerate} className="btn-terminal text-[9px]">
                    {"[REGEN]"}
                  </button>
                </div>
              </div>

              <p className="font-mono text-[13px] text-tx-2 leading-relaxed">
                &gt; Cover: <span className="text-te-400">{selectedHeadline}</span> &mdash; {slides.length} slides generated
              </p>

              {slides.map((slide, idx) => {
                const colors = slideColors[idx % slideColors.length];
                return (
                  <div key={slide.slide_number} className="crt-monitor relative crt-brackets" style={{ background: "rgba(0,0,0,0.25)" }}>
                    <div className="crt-scanlines" />
                    <div className="crt-grain" />
                    <div className="crt-vignette" />
                    <div className="crt-sweep" />
                    <div className="crt-micro-tl">
                      <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-te-400/60">slide</span>
                      <span className="text-tx-3">|</span>
                      <span className="font-mono text-[10px] tracking-[0.18em] uppercase">{slide.slide_number}/{slides.length}</span>
                    </div>
                    <div className="crt-micro-tr">
                      <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-tx-3">{slide.visual_direction}</span>
                    </div>
                    <div className="crt-monitor-header">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.accent }} />
                      <span className="font-mono text-[13px] font-semibold text-tx-1 tracking-tight ml-2">SLIDE PREVIEW</span>
                      <div className="flex-1" />
                      <button
                        onClick={() => exportSlideAsPNG(document.querySelector(`[data-slide="${slide.slide_number}"]`) as HTMLElement, `slide-${slide.slide_number}.png`)}
                        className="btn-terminal text-[8px]"
                      >
                        {"[PNG]"}
                      </button>
                    </div>
                    <div className="crt-monitor-content p-4">
                      <div
                        data-slide={slide.slide_number}
                        className="relative rounded-lg overflow-hidden"
                        style={{
                          background: colors.bg,
                          minHeight: "220px",
                          padding: "28px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          boxShadow: "inset 0 0 60px rgba(0,0,0,0.3)",
                        }}
                      >
                        <h3 className="font-mono text-[18px] font-bold text-white leading-tight mb-3">
                          {slide.headline}
                        </h3>
                        <p className="font-mono text-[14px] text-white/80 leading-relaxed whitespace-pre-line">
                          {slide.copy}
                        </p>
                        <div className="mt-auto pt-4">
                          <span className="font-mono text-[11px] text-white/50 italic">
                            {"\u25B6"} {slide.visual_direction}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="crt-micro-bl">
                      <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ok">SLIDE READY</span>
                    </div>
                  </div>
                );
              })}

              {isSignedIn && !bbConnected && (
                <div className="reveal d1 pt-2">
                  <span className="font-mono text-[9px] text-tx-4">Set Bannerbear template in </span>
                  <Link href="/dashboard/settings" className="font-mono text-[9px] text-te-400 underline">
                    Dashboard Settings
                  </Link>
                </div>
              )}

              {bbImages.length > 0 && (
                <div className="reveal d1 space-y-3">
                  <label className="term-label text-[11px]">BANNERBEAR_IMAGES</label>
                  <div className="grid grid-cols-2 gap-2">
                    {bbImages.map((img) => (
                      <div key={img.slide_number} className="crt-monitor relative crt-brackets" style={{ background: "rgba(0,0,0,0.15)" }}>
                        <div className="crt-monitor-content p-2 space-y-2">
                          <div className="font-mono text-[9px] text-te-400/60">slide_{img.slide_number}</div>
                          {img.pngUrl && (
                            <img src={img.pngUrl} alt={`Slide ${img.slide_number}`} className="w-full rounded-sm" />
                          )}
                          <a
                            href={img.pngUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="btn-terminal text-[8px] inline-block"
                          >
                            {"[DOWNLOAD]"}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {canvaTemplates.length > 0 && (
                <div className="reveal d1 space-y-3">
                  <label className="term-label text-[12px]">CANVA_TEMPLATES</label>
                  {canvaTemplates.map((t, i) => (
                    <div key={i} className="crt-monitor relative crt-brackets" style={{ background: "rgba(0,0,0,0.2)" }}>
                      <div className="crt-monitor-content p-3 space-y-2">
                        <div className="font-mono text-[11px] text-te-400/80 tracking-wider uppercase">{t.name}</div>
                        <div className="font-mono text-[10px] text-tx-2 leading-relaxed">{t.prompt}</div>
                        <div className="flex gap-2 flex-wrap">
                          {t.colors.map((c, j) => (
                            <span key={j} className="font-mono text-[8px] text-tx-4 tracking-wider">{c}</span>
                          ))}
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(t.prompt)}
                          className="btn-terminal text-[8px]"
                        >
                          {"[COPY PROMPT]"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button onClick={handleReset} className="btn-terminal text-[12px]">
                  {">>"} NEW CAROUSEL
                </button>
                <button onClick={handleBackToHeadlines} className="btn-terminal text-[12px]">
                  {"^C"} BACK TO HEADLINES
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="crt-micro-bl">
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase"
            style={{ color: step === "slides" ? "rgba(34,197,94,0.6)" : "rgba(86,86,128,0.6)" }}
          >
            {step === "input" ? "AWAITING INPUT" : step === "headlines" ? "HEADLINES READY" : step === "cta" ? "CTA READY" : "SLIDES READY"}
          </span>
        </div>
        <div className="crt-micro-br">
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-tx-3">
            {loading ? "GENERATING..." : "STANDBY"}
          </span>
        </div>

        <div className="crt-monitor-footer">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-tx-3">
            {step === "input" ? "INPUT" : step === "headlines" ? "HEADLINES" : step === "cta" ? "CTA" : "SLIDES"}
          </span>
          <span className="font-mono text-[9px] text-center">
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
              <span className="text-tx-3">[system ready]</span>
            )}
          </span>
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-tx-3">
            {loading ? "BUSY" : "STANDBY"}
          </span>
        </div>
      </div>

      <SignInModal open={showModal} onClose={closeModal} context="generate carousel" />
    </div>
  );
}
