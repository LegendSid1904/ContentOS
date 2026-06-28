"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { PLATFORMS, APP_PLATFORM_MAP } from "@/lib/constants";
import { generateThumbnails, generateCanvaThumbnailPrompts, generateABTestPlan, saveThumbnailBrief } from "@/lib/actions-thumbnail";
import { getContentDefaults, getBrandKit, getBBStatus } from "@/lib/actions";
import { useAuthGate } from "@/lib/use-auth-gate";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { StreamingLoader } from "@/components/streaming-loader";
import { ErrorBoundary } from "@/components/error-boundary";

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

function getExpressionEmoji(hint: string): string {
  const lower = hint.toLowerCase();
  if (lower.includes("surprised") || lower.includes("shock") || lower.includes("amazed") || lower.includes("wow")) return "\uD83D\uDE2E";
  if (lower.includes("excited") || lower.includes("happy") || lower.includes("joy") || lower.includes("smile")) return "\uD83D\uDE04";
  if (lower.includes("curious") || lower.includes("intrigued") || lower.includes("wonder")) return "\uD83E\uDD14";
  if (lower.includes("serious") || lower.includes("intense") || lower.includes("focused") || lower.includes("determined")) return "\uD83D\uDE24";
  if (lower.includes("skeptical") || lower.includes("doubt") || lower.includes("suspicious") || lower.includes("side-eye")) return "\uD83D\uDE0F";
  if (lower.includes("sad") || lower.includes("disappointed") || lower.includes("upset")) return "\uD83D\uDE22";
  if (lower.includes("laugh") || lower.includes("funny") || lower.includes("humor")) return "\uD83D\uDE02";
  if (lower.includes("angry") || lower.includes("frustrated") || lower.includes("mad")) return "\uD83D\uDE20";
  if (lower.includes("confused") || lower.includes("confusion") || lower.includes("puzzled")) return "\uD83D\uDE15";
  if (lower.includes("fear") || lower.includes("scared") || lower.includes("terrified")) return "\uD83D\uDE28";
  return "\uD83C\uDFAF";
}

function ThumbnailPreview({ concept, size }: { concept: ThumbnailConcept; size: "sm" | "lg" }) {
  const gradient = concept.color_palette.length >= 2
    ? `linear-gradient(135deg, ${concept.color_palette[0]}, ${concept.color_palette[1]})`
    : concept.color_palette[0] || "#1a1a2e";

  const borderColor = concept.color_palette[0] || "#6366f1";
  const emoji = getExpressionEmoji(concept.facial_expression_hint);

  if (size === "sm") {
    return (
      <div
        className="relative overflow-hidden rounded-md flex-shrink-0"
        style={{
          width: 120,
          height: 67,
          background: gradient,
          border: `1px solid ${borderColor}`,
          boxShadow: `0 0 8px ${borderColor}40`,
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative p-1.5 flex flex-col h-full">
          <span className="text-[9px] font-bold text-white leading-tight line-clamp-2 drop-shadow-lg">
            {concept.headline_text}
          </span>
          <div className="flex-1" />
          <div className="flex justify-end">
            <span className="text-[10px]">{emoji}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-lg w-full"
      style={{
        aspectRatio: "16/9",
        background: gradient,
        border: `2px solid ${borderColor}`,
        boxShadow: `0 0 24px ${borderColor}50`,
      }}
    >
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      <div className="relative p-4 md:p-6 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between">
          <span className="text-[12px] md:text-[12px] font-bold text-white/80 uppercase tracking-wider">
            {concept.concept_name}
          </span>
          <span className="text-lg md:text-2xl">{emoji}</span>
        </div>
        <div className="space-y-1">
          <h3 className="text-sm md:text-lg font-extrabold text-white leading-tight drop-shadow-lg">
            {concept.headline_text}
          </h3>
          <p className="text-[11px] md:text-[13px] text-white/60">{concept.background_suggestion}</p>
        </div>
      </div>
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
  const [canvaPrompts, setCanvaPrompts] = useState<{ concept: string; canva_prompt: string; template_type: string }[]>([]);
  const [bbConnected, setBbConnected] = useState(false);
  const [bbTemplateId, setBbTemplateId] = useState("");
  const [bbImages, setBbImages] = useState<{ concept_name: string; pngUrl: string }[]>([]);
  const [abTestPlan, setAbTestPlan] = useState<{ variant_a: string; variant_b: string; hypothesis: string; metric: string; duration_days: number }[]>([]);
  const [brandColors, setBrandColors] = useState<string[]>([]);
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
    const params = new URLSearchParams(window.location.search);
    const appId = params.get("app");
    if (appId && APP_PLATFORM_MAP[appId as keyof typeof APP_PLATFORM_MAP]) {
      const platforms = APP_PLATFORM_MAP[appId as keyof typeof APP_PLATFORM_MAP];
      if (platforms.length > 0 && !platform) setPlatform(platforms[0]);
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
      if (kit && kit.colors && kit.colors.length > 0) {
        setBrandColors(kit.colors);
      }
    });
    getBBStatus().then((status) => {
      setBbConnected(status.connected);
      if (status.templateId) setBbTemplateId(status.templateId);
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
        const result = await generateThumbnails(topic, platform, audience, null, brandColors);
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

  function exportPDF() {
    if (!concepts.length) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Thumbnail Concepts - ${topic}</title><style>
      @page { margin: 0.75in; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Courier New', monospace; font-size: 10pt; line-height: 1.5; color: #111; padding: 20px; }
      h1 { font-size: 16pt; margin-bottom: 8px; }
      .sub { color: #666; margin-bottom: 20px; font-size: 9pt; }
      .concept { margin-bottom: 20px; border: 1px solid #ddd; padding: 12px; page-break-inside: avoid; }
      .concept h2 { font-size: 13pt; margin-bottom: 6px; }
      .label { font-weight: bold; color: #555; font-size: 8pt; text-transform: uppercase; margin-top: 8px; }
      .colors { display: flex; gap: 4px; margin-top: 4px; }
      .color { width: 20px; height: 20px; border-radius: 3px; border: 1px solid #ccc; }
      .footer { margin-top: 24px; font-size: 8pt; color: #999; text-align: center; border-top: 1px solid #ddd; padding-top: 8px; }
    </style></head><body>
    <h1>Thumbnail Concepts</h1>
    <p class="sub">Topic: ${topic} | Platform: ${platform} | Audience: ${audience}</p>
    ${concepts.map(c => `<div class="concept"><h2>${c.concept_name}</h2><div class="label">Headline</div><p style="font-size:14pt;font-weight:bold">${c.headline_text}</p><div class="label">Visual Direction</div><p>${c.visual_description}</p><div class="label">Color Palette</div><div class="colors">${c.color_palette.map(col => `<div class="color" style="background:${col}"></div>`).join("")}</div><div class="label">Expression</div><p>${c.facial_expression_hint}</p><div class="label">Background</div><p>${c.background_suggestion}</p></div>`).join("")}
    <div class="footer">Generated by ContentOS AI</div>
    <script>window.onload=function(){window.print()}</script></body></html>`);
    win.document.close();
  }

  async function handleCanvaPrompts() {
    gate(async () => {
      setLoading(true);
      setError("");
      try {
        if (bbConnected && bbTemplateId && concepts.length > 0) {
          const res = await fetch("/api/bannerbear/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "thumbnail",
              concepts: concepts.map((c) => ({
                concept_name: c.concept_name,
                headline_text: c.headline_text,
                visual_description: c.visual_description,
              })),
              templateId: bbTemplateId,
            }),
          });
          const data = await res.json();
          if (!data.ok) { setError(data.error); setLoading(false); return; }
          setBbImages(data.images);
          setLoading(false);
          return;
        }
        const result = await generateCanvaThumbnailPrompts(concepts);
        if (!result.ok) { setError(result.error); setLoading(false); return; }
        setCanvaPrompts(result.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Bannerbear generation failed");
      }
      setLoading(false);
    });
  }

  async function handleABTest() {
    gate(async () => {
      setLoading(true);
      setError("");
      try {
        const result = await generateABTestPlan(topic, concepts);
        if (!result.ok) { setError(result.error); setLoading(false); return; }
        setAbTestPlan(result.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Test plan generation failed");
      }
      setLoading(false);
    });
  }

  const isInputStep = step === "input" && !loading;
  const isConceptsStep = step === "concepts" && !loading;

  return (
    <ErrorBoundary>
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
          <span className="font-mono text-[12px] tracking-[0.18em] uppercase text-te-400/60">sys</span>
          <span className="text-tx-3">|</span>
          <span className="font-mono text-[12px] tracking-[0.18em] uppercase">thumbnail_maker</span>
        </div>
        <div className="crt-micro-tr">
          <span className="font-mono text-[12px] tracking-[0.18em] uppercase text-tx-3">v1.0.0</span>
          <span className="text-tx-3">|</span>
          <span className="font-mono text-[12px] tracking-[0.18em] uppercase text-tx-3">id: {isSignedIn ? "active" : "preview"}</span>
        </div>

        <div className="crt-monitor-header">
          <span className="font-mono text-[12px] tracking-[0.24em] uppercase text-tx-3">MODULE</span>
          <span className="font-mono text-[11px] text-tx-3">|</span>
          <span className="font-mono text-[12px] tracking-[0.24em] uppercase text-te-400/70">THUMBNAIL MAKER</span>
          <div className="flex-1" />
          <span className="font-mono text-[12px] tracking-[0.1em] text-tx-3">{"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
        </div>

        <div className="crt-monitor-content p-6 space-y-6">
          {loading && <StreamingLoader steps={["ANALYZING TOPIC", "GENERATING CONCEPTS", "OPTIMIZING FOR CTR"]} />}

          {error && (
            <div className="font-mono text-[14px] text-err bg-err/10 border border-err/20 rounded-r3 p-3">
              <span className="text-err">[ERROR]</span> {error}
              <button onClick={() => setError("")} className="ml-2 text-err/60 hover:text-err underline">dismiss</button>
            </div>
          )}

          {isInputStep && (
            <>
              <div className="reveal d1">
                <label className="term-label text-[13px] mb-2">VIDEO_TOPIC</label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. I Tried 100 AI Tools \u2014 Here Are The Best"
                  className="term-field"
                  autoFocus
                />
              </div>

              <div className="reveal d2">
                <label className="term-label text-[13px] mb-2">TARGET_AUDIENCE</label>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Tech enthusiasts, early adopters"
                  className="term-field"
                />
              </div>

              <div className="reveal d3">
                <label className="term-label text-[13px] mb-2">PLATFORM</label>
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
                  <span className="font-mono text-[13px] text-tx-3 tracking-wider">AWAITING INPUT</span>
                )}
              </div>
            </>
          )}

          {isConceptsStep && (
            <div ref={outputRef} className="space-y-4">
              <div className="flex items-center justify-between reveal d1">
                <label className="term-label text-[13px] mb-0">THUMBNAIL_CONCEPTS</label>
                <div className="flex items-center gap-2">
                  {isSignedIn && (
                    <span className={`font-mono text-[10px] tracking-wider ${bbConnected ? "text-ok" : "text-tx-4"}`}>
                      {bbConnected ? "[BB:ON]" : "[BB:OFF]"}
                    </span>
                  )}
                  <button onClick={exportPDF} className="btn-terminal text-[11px]">{"[PDF]"}</button>
                  <button onClick={handleCanvaPrompts} className="btn-terminal text-[11px]">{"[CANVA]"}</button>
                  <button onClick={handleABTest} className="btn-terminal text-[11px]">{"[A/B]"}</button>
                  <button onClick={handleSave} className="btn-terminal text-[11px]">{"[SAVE]"}</button>
                  <button onClick={handleGenerate} className="btn-terminal text-[11px]">{"[REGEN]"}</button>
                </div>
              </div>

              <p className="font-mono text-[13px] text-tx-2 reveal d2">
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
                        <span className="text-[13px] text-tx-1 font-semibold">{concept.concept_name}</span>
                        <span className="text-[12px] text-te-400 font-bold tracking-tight">&ldquo;{concept.headline_text}&rdquo;</span>
                      </span>
                      <span className="flex items-center gap-2 ml-auto">
                        <ThumbnailPreview concept={concept} size="sm" />
                        <span className={`diag-badge ${selectedIndex === i ? "diag-ok" : "diag-idle"}`}>
                          {selectedIndex === i ? "[VIEWING]" : "[IDLE]"}
                        </span>
                      </span>
                    </button>
                    {selectedIndex === i && (
                      <div className="ml-6 pl-4 border-l border-white/[0.04] space-y-3 py-3 reveal d1">
                        <ThumbnailPreview concept={concept} size="lg" />
                        <div>
                          <span className="font-mono text-[12px] text-tx-3 uppercase tracking-wider">Visual</span>
                          <p className="font-mono text-[12px] text-tx-1 mt-0.5">{concept.visual_description}</p>
                        </div>
                        <div>
                          <span className="font-mono text-[12px] text-tx-3 uppercase tracking-wider">Colors</span>
                          <div className="flex gap-1 mt-0.5">
                            {concept.color_palette.map((c, j) => (
                              <ColorSwatch key={j} hex={c} />
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-mono text-[12px] text-tx-3 uppercase tracking-wider">Expression</span>
                          <p className="font-mono text-[12px] text-tx-1 mt-0.5">{concept.facial_expression_hint}</p>
                        </div>
                        <div>
                          <span className="font-mono text-[12px] text-tx-3 uppercase tracking-wider">Background</span>
                          <p className="font-mono text-[12px] text-tx-1 mt-0.5">{concept.background_suggestion}</p>
                        </div>
                        {concept.props.length > 0 && (
                          <div>
                            <span className="font-mono text-[12px] text-tx-3 uppercase tracking-wider">Props</span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {concept.props.map((prop, j) => (
                                <span key={j} className="font-mono text-[12px] text-fu-400 bg-fu-400/10 px-1.5 py-0.5 rounded-r2">{prop}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {isSignedIn && !bbConnected && (
                <div className="reveal d3">
                  <span className="font-mono text-[11px] text-tx-4">Set Bannerbear template in </span>
                  <Link href="/dashboard/settings" className="font-mono text-[11px] text-te-400 underline">
                    Dashboard Settings
                  </Link>
                </div>
              )}

              {bbImages.length > 0 && (
                <div className="reveal d3 space-y-3">
                  <label className="term-label text-[13px]">BANNERBEAR_IMAGES</label>
                  <div className="grid grid-cols-2 gap-2">
                    {bbImages.map((img) => (
                      <div key={img.concept_name} className="crt-monitor relative crt-brackets" style={{ background: "rgba(0,0,0,0.15)" }}>
                        <div className="crt-monitor-content p-2 space-y-2">
                          <div className="font-mono text-[11px] text-te-400/60">{img.concept_name}</div>
                          {img.pngUrl && (
                            <img src={img.pngUrl} alt={img.concept_name} className="w-full rounded-sm" />
                          )}
                          <a
                            href={img.pngUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="btn-terminal text-[10px] inline-block"
                          >
                            {"[DOWNLOAD]"}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {canvaPrompts.length > 0 && (
                <div className="reveal d3 space-y-3">
                  <label className="term-label text-[13px]">CANVA_PROMPTS</label>
                  {canvaPrompts.map((p, i) => (
                    <div key={i} className="crt-monitor relative crt-brackets" style={{ background: "rgba(0,0,0,0.2)" }}>
                      <div className="crt-monitor-content p-3 space-y-2">
                        <div className="font-mono text-[12px] text-te-400/80 tracking-wider uppercase">{p.concept} — {p.template_type}</div>
                        <div className="font-mono text-[12px] text-tx-2 leading-relaxed">{p.canva_prompt}</div>
                        <button onClick={() => navigator.clipboard.writeText(p.canva_prompt)} className="btn-terminal text-[10px]">{"[COPY]"}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {abTestPlan.length > 0 && (
                <div className="reveal d4 space-y-3">
                  <label className="term-label text-[13px]">A/B_TEST_PLAN</label>
                  {abTestPlan.map((test, i) => (
                    <div key={i} className="crt-monitor relative crt-brackets" style={{ background: "rgba(0,0,0,0.2)" }}>
                      <div className="crt-monitor-content p-3 space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[12px] text-fu-400 bg-fu-400/10 px-1.5 py-0.5 rounded-r2">A: {test.variant_a}</span>
                          <span className="font-mono text-[10px] text-tx-4">vs</span>
                          <span className="font-mono text-[12px] text-te-400 bg-te-400/10 px-1.5 py-0.5 rounded-r2">B: {test.variant_b}</span>
                        </div>
                        <p className="font-mono text-[12px] text-tx-2">{test.hypothesis}</p>
                        <div className="flex gap-3 font-mono text-[10px] text-tx-4 uppercase tracking-wider">
                          <span>Metric: {test.metric}</span>
                          <span>Duration: {test.duration_days}d</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button onClick={handleReset} className="btn-terminal text-[12px]">
                  {">>"} NEW BATCH
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="crt-micro-bl">
          <span className="font-mono text-[12px] tracking-[0.18em] uppercase"
            style={{ color: step === "concepts" ? "rgba(34,197,94,0.6)" : "rgba(86,86,128,0.6)" }}
          >
            {step === "input" ? "AWAITING INPUT" : "CONCEPTS READY"}
          </span>
        </div>
        <div className="crt-micro-br">
          <span className="font-mono text-[12px] tracking-[0.18em] uppercase text-tx-3">
            {loading ? "GENERATING..." : "STANDBY"}
          </span>
        </div>

        <div className="crt-monitor-footer">
          <span className="font-mono text-[12px] tracking-[0.2em] uppercase text-tx-3">
            {step === "input" ? "INPUT" : "CONCEPTS"}
          </span>
          <span className="font-mono text-[11px] text-center">
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
              <span className="text-tx-3">[system ready]</span>
            )}
          </span>
          <span className="font-mono text-[12px] tracking-[0.2em] uppercase text-tx-3">
            {loading ? "BUSY" : "STANDBY"}
          </span>
        </div>
      </div>

      <SignInModal open={showModal} onClose={closeModal} context="generate thumbnails" />
    </div></ErrorBoundary>
  );
}
