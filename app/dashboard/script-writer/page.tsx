"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { PLATFORMS, TONES, LANGUAGES } from "@/lib/constants";
import { SERIES_FORMATS } from "@/lib/series-formats";
import { generateHooks, generateScript, generateSeriesScript, saveScript, getScriptVersions, getScriptVersionByOutputId } from "@/lib/actions-script";
import { getContentDefaults } from "@/lib/actions";
import { useAuthGate } from "@/lib/use-auth-gate";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { StreamingLoader } from "@/components/streaming-loader";

type Step = "input" | "hooks" | "script";

interface Hook {
  id: string;
  hook_text: string;
  framework: string;
}

interface ScriptSection {
  timestamp: string;
  content: string;
  broll: string;
}

interface FullScript {
  title: string;
  sections: ScriptSection[];
  cta: string;
}

export default function ScriptWriterPage() {
  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState("");
  const [tone, setTone] = useState("");
  const [language, setLanguage] = useState("English");
  const [context, setContext] = useState("");
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [selectedHookId, setSelectedHookId] = useState<string | null>(null);
  const [script, setScript] = useState<FullScript | null>(null);
  const [seriesFormat, setSeriesFormat] = useState("");
  const [seriesScript, setSeriesScript] = useState("");
  const [error, setError] = useState("");
  const [loadingType, setLoadingType] = useState<"hooks" | "script" | "series">("hooks");
  const [teleprompter, setTeleprompter] = useState(false);
  const [prompterSpeed, setPrompterSpeed] = useState(180);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<{ projectId: string; projectTitle: string; outputId: string; version: number; createdAt: string }[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const prompterRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useAuth();
  const { showModal, gate, closeModal, freeActionsLeft, savePreviewState, restorePreviewState } = useAuthGate("generate hooks");

  useEffect(() => {
    const saved = restorePreviewState<{ hooks: Hook[]; script: FullScript | null; step: Step; selectedHookId: string | null; language?: string }>();
    if (saved) {
      setHooks(saved.hooks ?? []);
      setScript(saved.script ?? null);
      setStep(saved.step ?? "input");
      setSelectedHookId(saved.selectedHookId ?? null);
      if (saved.language) setLanguage(saved.language);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    getContentDefaults().then((defaults) => {
      if (!defaults) return;
      if (defaults.defaultPlatform && !platform) setPlatform(defaults.defaultPlatform);
      if (defaults.defaultTone && !tone) setTone(defaults.defaultTone);
    });
    // only on mount when signed in
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  const valid = topic.trim() && audience.trim() && platform && tone;

  async function handleGenerateHooks() {
    if (!valid) return;
    savePreviewState({ hooks, script, step, selectedHookId, language });
    gate(async () => {
      setLoading(true);
      setLoadingType("hooks");
      setError("");
      try {
        const result = await generateHooks(topic, audience, platform, tone, language);
        if (!result.ok) { setError(result.error); return; }
        setHooks(result.data);
        setStep("hooks");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Generation failed");
      } finally {
        setLoading(false);
      }
    });
  }

  function handleSelectHook(id: string) {
    setSelectedHookId(id === selectedHookId ? null : id);
  }

  async function handleGenerateFromHook() {
    if (!selectedHookId) return;
    const hook = hooks.find((h) => h.id === selectedHookId);
    if (!hook) return;
    savePreviewState({ hooks, script, step: "hooks", selectedHookId, language });
    gate(async () => {
      setLoading(true);
      setLoadingType("script");
      setError("");
      try {
        const result = await generateScript(topic, audience, platform, tone, hook.hook_text, context, language);
        if (!result.ok) { setError(result.error); return; }
        setScript(result.data);
        setStep("script");
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Script generation failed");
      } finally {
        setLoading(false);
      }
    });
  }

  async function handleRegenerate() {
    if (!selectedHookId) return;
    const hook = hooks.find((h) => h.id === selectedHookId);
    if (!hook) return;
    savePreviewState({ hooks, script, step, selectedHookId, language });
    gate(async () => {
      setLoading(true);
      setLoadingType("script");
      setError("");
      try {
        const result = await generateScript(topic, audience, platform, tone, hook.hook_text, context, language);
        if (!result.ok) { setError(result.error); return; }
        setScript(result.data);
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Script generation failed");
      } finally {
        setLoading(false);
      }
    });
  }

  async function handleGenerateSeriesScript() {
    if (!valid || !seriesFormat || !selectedHookId) return;
    const hook = hooks.find((h) => h.id === selectedHookId);
    if (!hook) return;
    savePreviewState({ hooks, script, step, selectedHookId, language });
    gate(async () => {
      setLoading(true);
      setLoadingType("series");
      setError("");
      try {
        const result = await generateSeriesScript(topic, audience, platform, tone, seriesFormat, hook.hook_text, language);
        if (!result.ok) { setError(result.error); setLoading(false); return; }
        let text = result.data.content;
        const format = SERIES_FORMATS.find((f) => f.id === seriesFormat);
        text = `[SERIES FORMAT: ${format?.name ?? seriesFormat}]\n\n${text}`;
        setSeriesScript(text);
        setStep("script");
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Series generation failed");
      }
      setLoading(false);
    });
  }

  async function handleSave() {
    if (!script) return;
    savePreviewState({ hooks, script, step, selectedHookId });
    gate(async () => {
      try {
        const result = await saveScript(script.title, script);
        if (!result.ok) { setError(result.error); return; }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  async function handleOpenHistory() {
    setHistoryLoading(true);
    try {
      const result = await getScriptVersions(10);
      if (result.ok) {
        setHistory(result.data.map((v) => ({ projectId: v.projectId, projectTitle: v.projectTitle, outputId: v.outputId, version: v.version, createdAt: v.createdAt })));
        setShowHistory(true);
      }
    } catch {
      // silently fail
    }
    setHistoryLoading(false);
  }

  async function handleLoadVersion(outputId: string) {
    try {
      const result = await getScriptVersionByOutputId(outputId);
      if (!result.ok || !result.data) return;
      const loaded = result.data.contentJson as unknown as FullScript;
      if (loaded) {
        setScript(loaded);
        setStep("script");
        setShowHistory(false);
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      }
    } catch {
      // silently fail
    }
  }

  function handleReset() {
    setStep("input");
    setHooks([]);
    setSelectedHookId(null);
    setScript(null);
    setSeriesScript("");
    setError("");
  }

  function copyToClipboard() {
    if (seriesScript) {
      navigator.clipboard.writeText(seriesScript);
      return;
    }
    if (!script) return;
    const text = script.sections.map((s) => `[${s.timestamp}] ${s.content}\n[B-ROLL] ${s.broll}`).join("\n\n") + `\n\nCTA: ${script.cta}`;
    navigator.clipboard.writeText(text);
  }

  function exportPDF() {
    if (seriesScript) {
      const win = window.open("", "_blank");
      if (!win) return;
      win.document.write(`<!DOCTYPE html><html><head><title>Series Script</title>
<style>@page{margin:0.75in}*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Courier New',monospace;font-size:10pt;line-height:1.5;color:#111;padding:20px;white-space:pre-wrap}
h1{font-size:14pt;margin-bottom:16px;border-bottom:2px solid #333;padding-bottom:8px}
</style></head><body><h1>Series Script</h1>${seriesScript.replace(/\n/g, "<br>")}</body></html>`);
      win.document.close();
      return;
    }
    if (!script) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${script.title}</title>
<style>
  @page { margin: 0.75in; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Courier New', monospace; font-size: 11pt; line-height: 1.6; color: #111; padding: 20px; }
  h1 { font-size: 16pt; margin-bottom: 16px; border-bottom: 2px solid #333; padding-bottom: 8px; }
  .section { margin-bottom: 16px; }
  .timestamp { font-weight: bold; color: #555; font-size: 9pt; margin-bottom: 4px; }
  .content { margin-bottom: 4px; }
  .broll { color: #888; font-style: italic; font-size: 9pt; }
  .cta { margin-top: 16px; padding: 12px; background: #f5f5f5; border-left: 3px solid #333; }
  .footer { margin-top: 24px; font-size: 8pt; color: #999; text-align: center; border-top: 1px solid #ddd; padding-top: 8px; }
</style></head><body>
<h1>${script.title}</h1>
${script.sections.map((s) => `<div class="section"><div class="timestamp">[${s.timestamp}]</div><div class="content">${s.content}</div>${s.broll ? `<div class="broll">&gt; B-roll: ${s.broll}</div>` : ""}</div>`).join("")}
<div class="cta"><strong>CTA:</strong> ${script.cta}</div>
<div class="footer">Generated by ContentOS AI</div>
<script>window.onload = function() { window.print(); }</script>
</body></html>`);
    win.document.close();
  }

  const scrollPrompter = useCallback(() => {
    if (!prompterRef.current) return;
    const start = prompterRef.current.scrollTop;
    const target = prompterRef.current.scrollHeight - prompterRef.current.clientHeight;
    const duration = (target / prompterSpeed) * 1000;
    const startTime = performance.now();
    function step(time: number) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      if (prompterRef.current) prompterRef.current.scrollTop = start + (target - start) * progress;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [prompterSpeed]);

  const isInputStep = step === "input" && !loading;
  const isHooksStep = step === "hooks" && !loading;
  const isScriptStep = step === "script" && !loading;

  return (
    <div className="max-w-3xl space-y-6 relative z-10">
      <div>
        <p className="sec-eyebrow">
          <span className="sec-eyebrow-dot" />
          Module :: Writer
        </p>
        <h1 className="sec-title !text-[28px]">Script Writer</h1>
        <p className="sec-desc !text-[13px]">
          Hook &rarr; full script &rarr; export in 60 seconds
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
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase">script_writer</span>
        </div>
        <div className="crt-micro-tr">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">v1.0.0</span>
          <span className="text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">id: {isSignedIn ? "active" : "preview"}</span>
        </div>

        <div className="crt-monitor-header">
          <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-tx-4">MODULE</span>
          <span className="font-mono text-[6px] text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-te-400/70">SCRIPT WRITER</span>
          <div className="flex-1" />
          <span className="font-mono text-[7px] tracking-[0.1em] text-tx-4">{"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
        </div>

        <div className="crt-monitor-content p-6 space-y-6">
          {loading && <StreamingLoader steps={loadingType === "hooks" ? ["ANALYZING TOPIC", "GENERATING HOOK VARIANTS", "OPTIMIZING FOR PLATFORM"] : loadingType === "series" ? ["APPLYING SERIES FORMAT", "MAPPING TO TEMPLATES", "GENERATING EPISODE SCRIPT"] : ["COMPOSING SCRIPT STRUCTURE", "WRITING SECTIONS", "FINALIZING OUTPUT"]} />}

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
                  placeholder="e.g. Top 10 AI Tools for Creators"
                  className="term-field"
                  autoFocus
                />
              </div>

              <div className="reveal d2">
                <label className="term-label mb-2">TARGET_AUDIENCE</label>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Content creators, solopreneurs"
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
                <label className="term-label mb-2">VOICE_TONE</label>
                <div className="space-y-1">
                  {TONES.map((t, i) => (
                    <button
                      key={t}
                      onClick={() => setTone(t === tone ? "" : t)}
                      className={`boot-option ${t === tone ? "active" : ""}`}
                      style={{ animationDelay: `${0.5 + i * 0.08}s` }}
                    >
                      <span className="boot-option-arrow">
                        {t === tone ? "\u25B6" : ">>"}
                      </span>
                      <span className="boot-option-label">{t}</span>
                      <span className={`diag-badge ${t === tone ? "diag-ok" : "diag-idle"}`}>
                        {t === tone ? "[SELECTED]" : "[IDLE]"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="reveal d5">
                <label className="term-label mb-2">LANGUAGE</label>
                <div className="flex gap-2">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      className={`boot-option ${l === language ? "active" : ""}`}
                    >
                      <span className="boot-option-arrow">{l === language ? "\u25B6" : ">>"}</span>
                      <span className="boot-option-label">{l}</span>
                      <span className={`diag-badge ${l === language ? "diag-ok" : "diag-idle"}`}>
                        {l === language ? "[SELECTED]" : "[IDLE]"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="reveal d6">
                <label className="term-label mb-2">SERIES_FORMAT <span className="text-tx-4">(optional — for short-form series)</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {SERIES_FORMATS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSeriesFormat(f.id === seriesFormat ? "" : f.id)}
                      className={`boot-option ${f.id === seriesFormat ? "active" : ""}`}
                    >
                      <span className="boot-option-arrow">{f.id === seriesFormat ? "\u25B6" : ">>"}</span>
                      <div className="min-w-0 flex-1">
                        <span className="boot-option-label block">{f.name}</span>
                        <span className="font-mono text-[7px] text-tx-4 tracking-wider block leading-tight">{f.description}</span>
                      </div>
                      <span className={`diag-badge ${f.id === seriesFormat ? "diag-ok" : "diag-idle"}`}>
                        {f.id === seriesFormat ? "[SELECTED]" : "[OFF]"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="reveal d7">
                <label className="term-label mb-2">ADDITIONAL_CONTEXT <span className="text-tx-4">(optional)</span></label>
                <input
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g. Focus on budget-friendly tools"
                  className="term-field"
                />
              </div>

              <div className="reveal d8 flex items-center gap-3 pt-2 border-t border-white/[0.04] flex-wrap">
                <button
                  onClick={handleGenerateHooks}
                  disabled={!valid}
                  className="btn-terminal btn-terminal-primary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {">>"} GENERATE HOOKS
                </button>
                {seriesFormat && (
                  <button
                    onClick={handleGenerateSeriesScript}
                    disabled={!valid}
                    className="btn-terminal text-[9px] border-vi-500/30 text-vi-400 hover:bg-vi-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {"[SERIES SCRIPT]"}
                  </button>
                )}
                {!valid && (
                  <span className="font-mono text-[8px] text-tx-4 tracking-wider">AWAITING INPUT</span>
                )}
              </div>
            </>
          )}

          {isHooksStep && (
            <>
              <div className="reveal d1">
                <label className="term-label mb-2">SELECT_HOOK</label>
                <p className="font-mono text-[10px] text-tx-3 mb-3 leading-relaxed">
                  &gt; {hooks.length} hooks generated. Pick one to build your script.
                </p>
              </div>

              <div className="space-y-1">
                {hooks.map((hook, i) => (
                  <button
                    key={hook.id}
                    onClick={() => handleSelectHook(hook.id)}
                    className={`boot-option ${selectedHookId === hook.id ? "active" : ""}`}
                    style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                  >
                    <span className="boot-option-arrow">
                      {selectedHookId === hook.id ? "\u25B6" : `0${i + 1}`}
                    </span>
                    <span className="boot-option-label flex flex-col gap-0.5">
                      <span className="text-[9px] tracking-[0.15em] uppercase text-tx-4">
                        [{hook.framework}]
                      </span>
                      <span className="font-mono text-[11px] text-tx-1 leading-relaxed">
                        {hook.hook_text}
                      </span>
                    </span>
                    <span className={`diag-badge ${selectedHookId === hook.id ? "diag-ok" : "diag-idle"}`}>
                      {selectedHookId === hook.id ? "[SELECTED]" : "[IDLE]"}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04] flex-wrap">
                <button
                  onClick={handleGenerateFromHook}
                  disabled={!selectedHookId}
                  className="btn-terminal btn-terminal-primary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {">>"} GENERATE SCRIPT
                </button>
                {seriesFormat && (
                  <button
                    onClick={handleGenerateSeriesScript}
                    disabled={!selectedHookId}
                    className="btn-terminal text-[9px] border-vi-500/30 text-vi-400 hover:bg-vi-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {"[SERIES SCRIPT]"}
                  </button>
                )}
                <button onClick={handleGenerateHooks} className="btn-terminal">
                  {">>"} REGENERATE
                </button>
                <button onClick={handleReset} className="btn-terminal" style={{ color: "rgba(239,68,68,0.5)", borderColor: "rgba(239,68,68,0.1)" }}>
                  {"^C"} BACK
                </button>
              </div>
            </>
          )}

          {isScriptStep && script && !seriesScript && (
            <div ref={outputRef} className="space-y-6 reveal d1">
              <div className="flex items-center justify-between">
                <label className="term-label">GENERATED_SCRIPT</label>
                <div className="flex items-center gap-2">
                  <button onClick={copyToClipboard} className="btn-terminal text-[9px]">
                    {"[COPY]"}
                  </button>
                  <button onClick={exportPDF} className="btn-terminal text-[9px]">
                    {"[PDF]"}
                  </button>
                  <button onClick={() => setTeleprompter(true)} className="btn-terminal text-[9px]">
                    {"[PROM]"}
                  </button>
                  <button onClick={handleOpenHistory} className="btn-terminal text-[9px]">
                    {"[VERS]"}
                  </button>
                  <button onClick={handleSave} className="btn-terminal text-[9px]">
                    {"[SAVE]"}
                  </button>
                  <button onClick={handleRegenerate} className="btn-terminal text-[9px]">
                    {"[REGEN]"}
                  </button>
                </div>
              </div>

              <div className="crt-monitor relative crt-brackets" style={{ background: "rgba(0,0,0,0.25)" }}>
                <div className="crt-micro-tl">
                  <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-te-400/60">out</span>
                  <span className="text-tx-4">|</span>
                  <span className="font-mono text-[7px] tracking-[0.18em] uppercase">script</span>
                </div>
                <div className="crt-micro-tr">
                  <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">{script.sections.length} sections</span>
                </div>

                <div className="crt-monitor-header">
                  <span className="w-2 h-2 rounded-full bg-vi-400/60" />
                  <span className="font-mono text-[10px] font-semibold text-tx-1 tracking-tight ml-2">{script.title}</span>
                  <div className="flex-1" />
                  <span className="font-mono text-[7px] tracking-[0.1em] text-tx-4">{"\u2022\u2022"}</span>
                </div>

                <div className="crt-monitor-content p-4 space-y-4">
                  {script.sections.map((section, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] text-te-400/80 tracking-wider bg-te-400/10 px-2 py-0.5 rounded-r2">
                          {section.timestamp}
                        </span>
                        {i === 0 && (
                          <span className="font-mono text-[8px] text-fu-400/60 tracking-wider uppercase">[hook]</span>
                        )}
                      </div>
                      <p className="font-mono text-[12px] text-tx-1 leading-[1.7]">
                        {section.content}
                      </p>
                      {section.broll && (
                        <p className="font-mono text-[9px] text-tx-4 italic leading-relaxed">
                          &gt; B-roll: {section.broll}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="crt-micro-bl">
                  <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-ok">OUTPUT READY</span>
                </div>
              </div>

              <div className="border border-vi-500/10 bg-vi-500/5 rounded-r3 p-3 flex items-start gap-3">
                <span className="font-mono text-[9px] text-vi-400/80 font-bold tracking-wider flex-shrink-0 mt-0.5">CTA</span>
                <span className="font-mono text-[11px] text-tx-1 leading-relaxed">{script.cta}</span>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button onClick={handleReset} className="btn-terminal text-[9px]">
                  {">>"} NEW SCRIPT
                </button>
              </div>
            </div>
          )}

          {isScriptStep && seriesScript && (
            <div ref={outputRef} className="space-y-6 reveal d1">
              <div className="flex items-center justify-between">
                <label className="term-label">SERIES_SCRIPT</label>
                <div className="flex items-center gap-2">
                  <button onClick={copyToClipboard} className="btn-terminal text-[9px]">
                    {"[COPY]"}
                  </button>
                  <button onClick={exportPDF} className="btn-terminal text-[9px]">
                    {"[PDF]"}
                  </button>
                  <button onClick={() => setTeleprompter(true)} className="btn-terminal text-[9px]">
                    {"[PROM]"}
                  </button>
                  <button onClick={() => { setSeriesScript(""); setStep("hooks"); }} className="btn-terminal text-[9px]">
                    {"[BACK]"}
                  </button>
                </div>
              </div>

              <div className="crt-monitor relative crt-brackets" style={{ background: "rgba(0,0,0,0.25)" }}>
                <div className="crt-micro-tl">
                  <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-te-400/60">out</span>
                  <span className="text-tx-4">|</span>
                  <span className="font-mono text-[7px] tracking-[0.18em] uppercase">series_script</span>
                </div>
                <div className="crt-micro-tr">
                  <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">{SERIES_FORMATS.find(f => seriesScript.startsWith(`[SERIES FORMAT: ${f.name}`))?.steps ?? 6} steps</span>
                </div>

                <div className="crt-monitor-header">
                  <span className="w-2 h-2 rounded-full bg-vi-400/60" />
                  <span className="font-mono text-[10px] font-semibold text-tx-1 tracking-tight ml-2">
                    {SERIES_FORMATS.find(f => seriesScript.startsWith(`[SERIES FORMAT: ${f.name}`))?.name ?? "Series Script"}
                  </span>
                  <div className="flex-1" />
                  <span className="font-mono text-[7px] tracking-[0.1em] text-tx-4">{"\u2022\u2022"}</span>
                </div>

                <div className="crt-monitor-content p-4">
                  <div className="font-mono text-[11px] text-tx-1 leading-[1.7] whitespace-pre-wrap">
                    {seriesScript.replace(/^\[SERIES FORMAT:[^\]]+\]\n\n/, "")}
                  </div>
                </div>

                <div className="crt-micro-bl">
                  <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-ok">OUTPUT READY</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button onClick={() => { setSeriesScript(""); setStep("hooks"); }} className="btn-terminal text-[9px]">
                  {">>"} BACK TO HOOKS
                </button>
                <button onClick={handleReset} className="btn-terminal text-[9px]">
                  {">>"} NEW SCRIPT
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="crt-micro-bl">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase"
            style={{ color: step === "script" ? "rgba(34,197,94,0.6)" : "rgba(86,86,128,0.6)" }}
          >
            {step === "input" ? "AWAITING INPUT" : step === "hooks" ? "HOOKS READY" : "SCRIPT READY"}
          </span>
        </div>
        <div className="crt-micro-br">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">
            {loading ? "GENERATING..." : "STANDBY"}
          </span>
        </div>

        <div className="crt-monitor-footer">
          <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-tx-4">
            {step === "input" ? "INPUT" : step === "hooks" ? "HOOKS" : "SCRIPT"}
          </span>
          <span className="font-mono text-[6px] text-center">
            {!isSignedIn ? (
              <span className="text-vi-400/60">
                {freeActionsLeft > 0 ? `FREE: ${freeActionsLeft} gen` : "FREE: 0 "}
              {!isSignedIn && freeActionsLeft <= 0 && (
                <Link href="/sign-in?redirect_url=%2Fdashboard%2Fscript-writer" className="text-vi-400/80 hover:text-vi-300 underline">
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

      {teleprompter && (script || seriesScript) && (
        <div className="fixed inset-0 z-50 bg-[#050508] flex flex-col">
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06] bg-black/50">
            <span className="font-mono text-[10px] text-te-400/80 tracking-wider uppercase">Teleprompter — {seriesScript ? "Series Script" : script?.title}</span>
            <div className="flex items-center gap-4">
              <label className="font-mono text-[8px] text-tx-4 tracking-wider uppercase flex items-center gap-2">
                Speed
                <input
                  type="range"
                  min="60"
                  max="400"
                  value={prompterSpeed}
                  onChange={(e) => setPrompterSpeed(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-tx-3 w-8">{prompterSpeed} wpm</span>
              </label>
              <button onClick={scrollPrompter} className="btn-terminal text-[9px] text-ok">
                {"[PLAY]"}
              </button>
              <button onClick={() => setTeleprompter(false)} className="btn-terminal text-[9px]">
                {"[ESC]"}
              </button>
            </div>
          </div>
          <div
            ref={prompterRef}
            className="flex-1 overflow-y-auto px-12 py-8 max-w-3xl mx-auto w-full"
            style={{ scrollBehavior: "auto" }}
          >
            <div className="space-y-8">
              {seriesScript ? (
                <p className="font-mono text-[22px] text-tx-1 leading-[1.7] whitespace-pre-wrap">
                  {seriesScript.replace(/^\[SERIES FORMAT:[^\]]+\]\n\n/, "")}
                </p>
              ) : script ? (
                <>
                  {script.sections.map((section, i) => (
                    <div key={i} className="space-y-3">
                      <div className="font-mono text-[11px] text-te-400/60 tracking-wider">
                        [{section.timestamp}]
                      </div>
                      <p className="font-mono text-[22px] text-tx-1 leading-[1.7]">
                        {section.content}
                      </p>
                      {section.broll && (
                        <p className="font-mono text-[10px] text-tx-4 italic">
                          &gt; B-roll: {section.broll}
                        </p>
                      )}
                      {i === 0 && (
                        <div className="font-mono text-[10px] text-fu-400/50 uppercase tracking-wider">[hook]</div>
                      )}
                    </div>
                  ))}
                  <div className="border-t border-white/[0.08] pt-6 mt-8">
                    <div className="font-mono text-[11px] text-tx-4 mb-2">CTA</div>
                    <p className="font-mono text-[22px] text-tx-1 leading-[1.7]">{script.cta}</p>
                  </div>
                </>
              ) : null}
            </div>
          </div>
          <div className="border-t border-white/[0.06] px-6 py-2 bg-black/50 flex items-center justify-between">
            <span className="font-mono text-[7px] text-tx-4 tracking-wider">SPACE = PAUSE/RESUME | SPEED: {prompterSpeed} WPM</span>
            <span className="font-mono text-[7px] text-tx-4 tracking-wider">ContentOS Teleprompter v1</span>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 z-50 bg-[#050508]/90 flex items-center justify-center p-6">
          <div className="crt-monitor relative crt-brackets w-full max-w-lg max-h-[70vh]">
            <div className="crt-scanlines" />
            <div className="crt-grain" />
            <div className="crt-vignette" />
            <div className="crt-micro-tl">
              <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-te-400/60">sys</span>
              <span className="text-tx-4">|</span>
              <span className="font-mono text-[7px] tracking-[0.18em] uppercase">version_history</span>
            </div>
            <div className="crt-monitor-header">
              <span className="w-2 h-2 rounded-full bg-vi-400/60" />
              <span className="font-mono text-[10px] font-semibold text-tx-1 tracking-tight ml-2">VERSION HISTORY</span>
              <div className="flex-1" />
              <button onClick={() => setShowHistory(false)} className="btn-terminal text-[8px]">[CLOSE]</button>
            </div>
            <div className="crt-monitor-content p-4 max-h-[55vh] overflow-y-auto space-y-2">
              {history.length === 0 && (
                <div className="font-mono text-[10px] text-tx-4 text-center py-8">No saved scripts yet</div>
              )}
              {history.map((v) => (
                <button
                  key={v.outputId}
                  onClick={() => handleLoadVersion(v.outputId)}
                  className="w-full text-left boot-option"
                >
                  <span className="boot-option-arrow">{">>"}</span>
                  <span className="boot-option-label flex flex-col gap-0.5 min-w-0">
                    <span className="text-[9px] text-tx-1 truncate">{v.projectTitle}</span>
                    <span className="text-[7px] text-tx-4 tracking-wider">
                      v{v.version} — {new Date(v.createdAt).toLocaleDateString()}
                    </span>
                  </span>
                  <span className="diag-badge diag-idle">[LOAD]</span>
                </button>
              ))}
            </div>
            <div className="crt-micro-bl">
              <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">{history.length} VERSIONS</span>
            </div>
          </div>
        </div>
      )}

      <SignInModal open={showModal} onClose={closeModal} context="generate hooks" />
    </div>
  );
}
