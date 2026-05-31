"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { PLATFORMS, TONES } from "@/lib/constants";
import { generateHooks, generateScript, saveScript } from "@/lib/actions-script";
import { getContentDefaults } from "@/lib/actions";
import { useAuthGate } from "@/lib/use-auth-gate";
import { SignInModal } from "@/components/auth/sign-in-modal";

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

function BootLoader({ type }: { type: string }) {
  const steps = type === "hooks"
    ? ["ANALYZING TOPIC", "GENERATING HOOK VARIANTS", "OPTIMIZING FOR PLATFORM"]
    : ["COMPOSING SCRIPT STRUCTURE", "WRITING SECTIONS", "FINALIZING OUTPUT"];

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

export default function ScriptWriterPage() {
  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState("");
  const [tone, setTone] = useState("");
  const [context, setContext] = useState("");
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [selectedHookId, setSelectedHookId] = useState<string | null>(null);
  const [script, setScript] = useState<FullScript | null>(null);
  const [error, setError] = useState("");
  const [loadingType, setLoadingType] = useState<"hooks" | "script">("hooks");
  const outputRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useAuth();
  const { showModal, gate, closeModal, freeActionsLeft, savePreviewState, restorePreviewState } = useAuthGate("generate hooks");

  useEffect(() => {
    const saved = restorePreviewState<{ hooks: Hook[]; script: FullScript | null; step: Step; selectedHookId: string | null }>();
    if (saved) {
      setHooks(saved.hooks ?? []);
      setScript(saved.script ?? null);
      setStep(saved.step ?? "input");
      setSelectedHookId(saved.selectedHookId ?? null);
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
    savePreviewState({ hooks, script, step, selectedHookId });
    gate(async () => {
      setLoading(true);
      setLoadingType("hooks");
      setError("");
      try {
        const result = await generateHooks(topic, audience, platform, tone);
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

  async function handleSelectHook(id: string) {
    setSelectedHookId(id);
    const hook = hooks.find((h) => h.id === id);
    if (!hook) return;

    savePreviewState({ hooks, script, step: "hooks", selectedHookId: id });
    gate(async () => {
      setLoading(true);
      setLoadingType("script");
      setError("");
      try {
        const result = await generateScript(topic, audience, platform, tone, hook.hook_text, context);
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
    savePreviewState({ hooks, script, step, selectedHookId });
    gate(async () => {
      setLoading(true);
      setLoadingType("script");
      setError("");
      try {
        const result = await generateScript(topic, audience, platform, tone, hook.hook_text, context);
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

  function handleReset() {
    setStep("input");
    setHooks([]);
    setSelectedHookId(null);
    setScript(null);
    setError("");
  }

  function copyToClipboard() {
    if (!script) return;
    const text = script.sections.map((s) => `[${s.timestamp}] ${s.content}\n[B-ROLL] ${s.broll}`).join("\n\n") + `\n\nCTA: ${script.cta}`;
    navigator.clipboard.writeText(text);
  }

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
                <label className="term-label mb-2">ADDITIONAL_CONTEXT <span className="text-tx-4">(optional)</span></label>
                <input
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g. Focus on budget-friendly tools"
                  className="term-field"
                />
              </div>

              <div className="reveal d6 flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button
                  onClick={handleGenerateHooks}
                  disabled={!valid}
                  className="btn-terminal btn-terminal-primary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {">>"} GENERATE HOOKS
                </button>
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

              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <button onClick={handleGenerateHooks} className="btn-terminal">
                  {">>"} REGENERATE
                </button>
                <button onClick={handleReset} className="btn-terminal" style={{ color: "rgba(239,68,68,0.5)", borderColor: "rgba(239,68,68,0.1)" }}>
                  {"^C"} BACK
                </button>
              </div>
            </>
          )}

          {isScriptStep && script && (
            <div ref={outputRef} className="space-y-6 reveal d1">
              <div className="flex items-center justify-between">
                <label className="term-label">GENERATED_SCRIPT</label>
                <div className="flex items-center gap-2">
                  <button onClick={copyToClipboard} className="btn-terminal text-[9px]">
                    {"[COPY]"}
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

      <SignInModal open={showModal} onClose={closeModal} context="generate hooks" />
    </div>
  );
}
