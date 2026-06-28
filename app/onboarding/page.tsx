"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PLATFORMS, TONES } from "@/lib/constants";
import { saveBrandKit, completeOnboardingStep, finishOnboarding, getOnboardingStatus } from "@/lib/actions";

const STEPS = [
  { num: 1, label: "Your Niche" },
  { num: 3, label: "Primary Platform" },
  { num: 4, label: "Your First Script" },
];

const PRESET_COLORS = ["#7C3AED", "#06B6D4", "#D946EF", "#6366F1", "#22C55E", "#F59E0B"];

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-void flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-vi-400 animate-beat-pulse" />
            <span className="font-mono text-[13px] text-tx-3 tracking-widest uppercase">Loading</span>
            <span className="font-mono text-[13px] text-tx-3 ai-cursor" />
          </div>
        </div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep = parseInt(searchParams.get("step") || "1", 10);

  const [niche, setNiche] = useState("");
  const [selectedTone, setSelectedTone] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>(["#7C3AED"]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getOnboardingStatus().then((status) => {
      if (status?.onboardingComplete) {
        router.replace("/dashboard");
      }
    });
  }, [router]);

  function goToStep(step: number) {
    router.push(`/onboarding?step=${step}`);
  }

  async function handleStep1Next() {
    if (!niche.trim()) return;
    setSaving(true);
    const fd = new FormData();
    fd.set("niche", niche);
    fd.set("tone", selectedTone);
    fd.set("colors", JSON.stringify(selectedColors));
    fd.set("platforms", JSON.stringify(selectedPlatform ? [selectedPlatform] : []));
    await saveBrandKit(fd);
    await completeOnboardingStep(3);
    setSaving(false);
    goToStep(3);
  }

  async function handleStep3Next() {
    if (!selectedPlatform) return;
    setSaving(true);
    const fd = new FormData();
    fd.set("niche", niche);
    fd.set("tone", selectedTone);
    fd.set("colors", JSON.stringify(selectedColors));
    fd.set("platforms", JSON.stringify([selectedPlatform]));
    await saveBrandKit(fd);
    await completeOnboardingStep(4);
    setSaving(false);
    goToStep(4);
  }

  async function handleFinish() {
    setSaving(true);
    await finishOnboarding();
    setSaving(false);
    router.push("/dashboard");
  }

  function toggleColor(color: string) {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  }

  const stepIndex = STEPS.findIndex((s) => s.num === currentStep);
  const stepInfo = STEPS[stepIndex];
  const totalSteps = STEPS.length;
  const progress = ((stepIndex + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-bg-void flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="cyber-grid">
        <div className="cyber-grid-inner opacity-40" />
      </div>
      <div className="gradient-mesh" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="crt-scanlines !opacity-[0.04]" />
      <div className="crt-vignette !bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,5,10,0.5)_100%)]" />
      <div className="crt-sweep" />
      <div className="crt-grain" />

      <div className="crt-micro-tl !text-[9px]">
        <span className="text-te-400/60">sys</span>
        <span className="text-tx-4">|</span>
        <span className="text-tx-4">onboarding</span>
      </div>
      <div className="crt-micro-tr !text-[9px]">
        <span className="text-tx-4">step</span>
        <span className="text-tx-4">|</span>
        <span className="text-te-400/60">{currentStep}/4</span>
      </div>

      <div className="w-full max-w-lg space-y-8 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-[8px] bg-gradient-to-br from-vi-500 to-te-400 flex items-center justify-center font-display text-[15px] font-bold text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              C
            </div>
            <span className="font-display text-[16px] font-bold text-tx-1 tracking-tight">ContentOS</span>
          </div>
          <h1 className="font-display text-[28px] font-bold text-tx-1 mt-4 tracking-tight">Welcome to ContentOS</h1>
          <p className="font-mono text-[12px] text-tx-3 mt-2 tracking-wider">
            ❯ Let&apos;s set you up in {totalSteps} quick steps
          </p>
        </div>

        <div className="w-full h-[2px] bg-white/[0.04] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-vi-500 to-te-400 rounded-full transition-colors duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-center items-center gap-3">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 transition-all ${
                i <= stepIndex ? "opacity-100" : "opacity-30"
              }`}>
                <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[11px] font-mono font-bold transition-all ${
                  i <= stepIndex
                    ? "bg-vi-500 text-white"
                    : "bg-white/[0.04] text-tx-3"
                }`}>
                  {s.num}
                </div>
                <span className={`font-mono text-[11px] tracking-widest uppercase hidden sm:block ${
                  i <= stepIndex ? "text-tx-2" : "text-tx-3"
                }`}>
                  {s.label}
                </span>
              </div>
              {i < totalSteps - 1 && (
                <div className={`w-6 h-px ${i < stepIndex ? "bg-vi-500/50" : "bg-white/[0.04]"}`} />
              )}
            </div>
          ))}
        </div>

        {currentStep === 1 && (
          <div className="crt-monitor crt-brackets p-0">
            <div className="crt-scanlines !opacity-[0.04]" />
            <div className="crt-grain" />
            <div className="crt-vignette !bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,5,10,0.5)_100%)]" />
            <div className="crt-monitor-header">
              <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-tx-4">STEP</span>
              <span className="font-mono text-[9px] text-tx-4">|</span>
              <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-te-400/70">CONFIGURE</span>
              <div className="flex-1" />
              <span className="font-mono text-[9px] tracking-[0.1em] text-tx-4">{"\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
            </div>
            <div className="crt-monitor-content p-6 space-y-5">
            <div>
              <h2 className="font-display text-[18px] font-semibold text-tx-1 tracking-tight">What&apos;s your niche?</h2>
              <p className="font-mono text-[13px] text-tx-3 mt-2">
                ❯ Tell us what you create content about
              </p>
            </div>

            <div>
              <label className="terminal-label block mb-2">Your Niche</label>
              <input
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. Tech, Fitness, Personal Finance, Lifestyle..."
                className="terminal-input w-full h-[42px] px-3"
                autoFocus
              />
            </div>

            <div>
              <label className="terminal-label block mb-2">Your Voice &amp; Tone</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setSelectedTone(tone === selectedTone ? "" : tone)}
                    className={`px-4 min-h-[44px] rounded-full border text-[13px] transition-colors font-mono tracking-wide text-[13px] ${
                      tone === selectedTone
                        ? "border-vi-500/50 bg-vi-500/15 text-vi-300"
                        : "border-white/10 bg-black/30 text-tx-2 hover:border-vi-500/30 hover:text-tx-1"
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="terminal-label block mb-2">Brand Colors</label>
              <div className="flex gap-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => toggleColor(color)}
                    className="w-9 h-9 rounded-full transition-all cursor-pointer relative"
                    style={{ backgroundColor: color }}
                  >
                    {selectedColors.includes(color) && (
                      <span className="absolute inset-0 rounded-full border-2 border-white"
                        style={{ boxShadow: `0 0 0 2px ${color}` }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStep1Next}
              disabled={!niche.trim() || saving}
              className="btn-terminal btn-terminal-primary w-full justify-center"
            >
              {saving ? "SAVING..." : "CONTINUE >>"}
            </button>
          </div>
          <div className="crt-monitor-footer">
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-tx-4">NICHE</span>
            <span className="font-mono text-[9px] text-center text-tx-4">[step 1/3]</span>
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-tx-4">{niche ? "SET" : "PENDING"}</span>
          </div>
        </div>
        )}

        {currentStep === 3 && (
          <div className="crt-monitor crt-brackets p-0">
            <div className="crt-scanlines !opacity-[0.04]" />
            <div className="crt-grain" />
            <div className="crt-vignette !bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,5,10,0.5)_100%)]" />
            <div className="crt-monitor-header">
              <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-tx-4">STEP</span>
              <span className="font-mono text-[9px] text-tx-4">|</span>
              <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-te-400/70">PLATFORM</span>
              <div className="flex-1" />
              <span className="font-mono text-[9px] tracking-[0.1em] text-tx-4">{"\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
            </div>
            <div className="crt-monitor-content p-6 space-y-5">
            <div>
              <h2 className="font-display text-[18px] font-semibold text-tx-1 tracking-tight">Where do you create?</h2>
              <p className="font-mono text-[13px] text-tx-3 mt-2">
                ❯ Pick your primary content platform
              </p>
            </div>

            <div className="space-y-2">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`w-full flex items-center gap-3 p-4 rounded-r6 border text-left transition-all ${
                    platform === selectedPlatform
                      ? "border-te-400/30 bg-te-500/10"
                      : "border-white/[0.06] bg-black/20 hover:border-te-400/20"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    platform === selectedPlatform ? "border-te-400" : "border-white/10"
                  }`}>
                    {platform === selectedPlatform && (
                      <div className="w-2.5 h-2.5 rounded-full bg-te-400" />
                    )}
                  </div>
                  <span className="text-[14px] font-medium text-tx-1 font-mono tracking-tight">{platform}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleStep3Next}
              disabled={!selectedPlatform || saving}
              className="btn-terminal btn-terminal-primary w-full justify-center"
            >
              {saving ? "SAVING..." : "CONTINUE >>"}
            </button>
          </div>
          <div className="crt-monitor-footer">
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-tx-4">PLATFORM</span>
            <span className="font-mono text-[9px] text-center text-tx-4">[step 2/3]</span>
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-tx-4">{selectedPlatform ? "SET" : "PENDING"}</span>
          </div>
        </div>
        )}

        {currentStep === 4 && (
          <div className="crt-monitor crt-brackets p-0">
            <div className="crt-scanlines !opacity-[0.04]" />
            <div className="crt-grain" />
            <div className="crt-vignette !bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,5,10,0.5)_100%)]" />
            <div className="crt-monitor-header">
              <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-tx-4">STEP</span>
              <span className="font-mono text-[9px] text-tx-4">|</span>
              <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-te-400/70">COMPLETE</span>
              <div className="flex-1" />
              <span className="font-mono text-[9px] tracking-[0.1em] text-tx-4">{"\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
            </div>
            <div className="crt-monitor-content p-6 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-vi-500 to-te-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(139,92,246,0.25)]">
              <span className="text-2xl">✦</span>
            </div>

            <div>
              <h2 className="font-display text-[18px] font-semibold text-tx-1 tracking-tight">You&apos;re all set!</h2>
              <p className="font-mono text-[13px] text-tx-3 mt-2 leading-relaxed">
                Your brand kit is ready. Now let&apos;s write your first script — it only takes 60 seconds.
              </p>
              <p className="font-mono text-[12px] text-tx-3/60 mt-2">
                Pick a topic, choose a platform, and let AI handle the rest.
              </p>
            </div>

            <div className="bg-black/30 rounded-r6 p-4 text-left space-y-2 border border-white/[0.04]">
              <div className="flex items-center gap-2 font-mono text-[13px] text-te-300">
                <span>✓</span> Brand kit saved
              </div>
              <div className="flex items-center gap-2 font-mono text-[13px] text-te-300">
                <span>✓</span> Platform configured
              </div>
              <div className="flex items-center gap-2 font-mono text-[13px] text-tx-3">
                <span>→</span> Ready for your first script
              </div>
            </div>

            <button
              onClick={handleFinish}
              disabled={saving}
              className="btn-terminal btn-terminal-primary w-full justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(34,211,238,0.08))",
                borderColor: "rgba(139,92,246,0.25)",
              }}
            >
              {saving ? "ACTIVATING..." : "WRITE FIRST SCRIPT >>"}
            </button>
          </div>
          <div className="crt-monitor-footer">
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-tx-4">READY</span>
            <span className="font-mono text-[9px] text-center text-tx-4">[setup complete]</span>
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-ok">DONE</span>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
