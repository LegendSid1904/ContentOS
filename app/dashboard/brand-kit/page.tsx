"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { PLATFORMS, TONES } from "@/lib/constants";
import { saveBrandKit, getBrandKit, deleteBrandKit } from "@/lib/actions";
import { useAuthGate } from "@/lib/use-auth-gate";
import { SignInModal } from "@/components/auth/sign-in-modal";

const PRESET_COLORS = ["#7C3AED", "#06B6D4", "#D946EF", "#6366F1", "#22C55E", "#F59E0B"];

function BootLoader() {
  return (
    <div className="crt-monitor-content p-0">
      <div className="boot-loader">
        <div className="boot-loader-line" style={{ animationDelay: "0.1s" }}>
          <span className="boot-loader-arrow">{">>"}</span>
          <span className="boot-loader-text">INITIALIZING BRAND KIT MODULE</span>
          <span className="boot-loader-ok">OK</span>
        </div>
        <div className="boot-loader-line" style={{ animationDelay: "0.3s" }}>
          <span className="boot-loader-arrow">{">>"}</span>
          <span className="boot-loader-text">LOADING USER PROFILE</span>
          <span className="boot-loader-ok">OK</span>
        </div>
        <div className="boot-loader-line" style={{ animationDelay: "0.5s" }}>
          <span className="boot-loader-arrow">{">>"}</span>
          <span className="boot-loader-text">FETCHING BRAND CONFIGURATION</span>
          <span className="text-te-400 font-mono text-[7px] tracking-wider animate-pulse">LOADING</span>
        </div>
        <div className="boot-loader-line" style={{ animationDelay: "0.7s" }}>
          <span className="boot-loader-arrow">{">>"}</span>
          <span className="boot-loader-text">RENDERING TERMINAL INTERFACE</span>
          <span className="flex gap-0.5 ml-auto items-center">
            <span className="w-1 h-1 rounded-full bg-te-400 animate-pulse" style={{ animationDelay: "0s" }} />
            <span className="w-1 h-1 rounded-full bg-te-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
            <span className="w-1 h-1 rounded-full bg-te-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
          </span>
        </div>
      </div>
    </div>
  );
}

const DEMO_BRAND_KIT = {
  niche: "Creator Economy",
  tone: "Educational",
  platform: "YouTube",
  colors: ["#7C3AED", "#06B6D4", "#22C55E"],
};

export default function BrandKitPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { showModal, gate, closeModal } = useAuthGate("save your brand kit");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasKit, setHasKit] = useState(false);
  const [niche, setNiche] = useState("");
  const [selectedTone, setSelectedTone] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>(["#7C3AED"]);

  useEffect(() => {
    if (!isSignedIn) {
      setNiche(DEMO_BRAND_KIT.niche);
      setSelectedTone(DEMO_BRAND_KIT.tone);
      setSelectedPlatform(DEMO_BRAND_KIT.platform);
      setSelectedColors(DEMO_BRAND_KIT.colors);
      setLoading(false);
      return;
    }
    getBrandKit().then((kit) => {
      if (kit) {
        setHasKit(true);
        setNiche(kit.niche ?? "");
        setSelectedTone(kit.tone ?? "");
        setSelectedPlatform(kit.platforms?.[0] ?? "");
        setSelectedColors(kit.colors ?? ["#7C3AED"]);
      }
      setLoading(false);
    });
  }, [isSignedIn]);

  async function handleSave() {
    setSaving(true);
    const fd = new FormData();
    fd.set("niche", niche);
    fd.set("tone", selectedTone);
    fd.set("colors", JSON.stringify(selectedColors));
    fd.set("platforms", JSON.stringify(selectedPlatform ? [selectedPlatform] : []));
    await saveBrandKit(fd);
    setHasKit(true);
    setSaving(false);
    router.refresh();
  }

  function toggleColor(color: string) {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  }

  return (
    <div className="max-w-2xl space-y-6 relative z-10">
      <div>
        <p className="sec-eyebrow">
          <span className="sec-eyebrow-dot" />
          System :: Brand
        </p>
        <h1 className="sec-title !text-[28px]">Brand Kit</h1>
        <p className="sec-desc !text-[13px]">
          Configure your brand identity profile
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
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase">brand_kit</span>
        </div>
        <div className="crt-micro-tr">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">v1.0.4</span>
          <span className="text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">id: {isSignedIn ? "active" : "preview"}</span>
        </div>

        <div className="crt-monitor-header">
          <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-tx-4">MODULE</span>
          <span className="font-mono text-[6px] text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-te-400/70">BRAND KIT</span>
          <div className="flex-1" />
          <span className="font-mono text-[7px] tracking-[0.1em] text-tx-4">{"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
        </div>

        {loading ? (
          <BootLoader />
        ) : (
          <div className="crt-monitor-content p-6 space-y-6">
            <div className="reveal d1">
              <label className="term-label mb-2">NICHE</label>
              <input
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. Tech, Fitness, Finance, Lifestyle..."
                className="term-field"
                autoFocus
              />
            </div>

            <div className="reveal d2">
              <label className="term-label mb-2">COLOR_PROFILE</label>
              <div className="spectrum-grid">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => toggleColor(color)}
                    className="spectrum-swatch"
                    style={{ background: color }}
                  >
                    {selectedColors.includes(color) && (
                      <span className="absolute inset-0 border border-vi-500/30" style={{ boxShadow: "inset 0 0 12px rgba(139,92,246,0.15)" }} />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-1.5">
                {PRESET_COLORS.map((color) => (
                  <span key={color} className="font-mono text-[8px] text-tx-4 tracking-wider text-center" style={{ width: 40 }}>
                    {selectedColors.includes(color) ? (
                      <span className="text-te-400/80">ACTIVE</span>
                    ) : (
                      <span className="text-tx-4">IDLE</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            <div className="reveal d3">
              <label className="term-label mb-2">VOICE_TONE</label>
              <div className="space-y-1">
                {TONES.map((tone, i) => (
                  <button
                    key={tone}
                    onClick={() => setSelectedTone(tone === selectedTone ? "" : tone)}
                    className={`boot-option ${tone === selectedTone ? "active" : ""}`}
                    style={{ animationDelay: `${0.3 + i * 0.08}s` }}
                  >
                    <span className="boot-option-arrow">
                      {tone === selectedTone ? "\u25B6" : ">>"}
                    </span>
                    <span className="boot-option-label">{tone}</span>
                    <span className={`diag-badge ${tone === selectedTone ? "diag-ok" : "diag-idle"}`}>
                      {tone === selectedTone ? "[SELECTED]" : "[IDLE]"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="reveal d4">
              <label className="term-label mb-2">TARGET_PLATFORM</label>
              <div className="space-y-1">
                {PLATFORMS.map((platform, i) => (
                  <button
                    key={platform}
                    onClick={() => setSelectedPlatform(platform === selectedPlatform ? "" : platform)}
                    className={`boot-option ${platform === selectedPlatform ? "active" : ""}`}
                    style={{ animationDelay: `${0.5 + i * 0.08}s` }}
                  >
                    <span className="boot-option-arrow">
                      {platform === selectedPlatform ? "\u25B6" : ">>"}
                    </span>
                    <span className="boot-option-label">{platform}</span>
                    <span className={`diag-badge ${platform === selectedPlatform ? "diag-ok" : "diag-idle"}`}>
                      {platform === selectedPlatform ? "[ACTIVE]" : "[IDLE]"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {!isSignedIn && (
              <div className="reveal d5 font-mono text-[9px] text-vi-400/70 border border-vi-500/15 bg-vi-500/5 rounded-r3 p-2.5 text-center tracking-wider">
                * PREVIEW — sign in to save your brand kit
              </div>
            )}

            <div className="reveal d5 flex items-center gap-3 pt-2 border-t border-white/[0.04]">
              <button
                onClick={() => gate(handleSave)}
                disabled={saving}
                className="btn-terminal btn-terminal-primary"
              >
                {saving ? "EXECUTING..." : `EXECUTE :: SAVE`}
              </button>
              {hasKit && isSignedIn && (
                <button
                  onClick={async () => {
                    if (confirm("Reset brand kit to defaults?")) {
                      gate(async () => {
                        await deleteBrandKit();
                        setNiche("");
                        setSelectedTone("");
                        setSelectedPlatform("");
                        setSelectedColors(["#7C3AED"]);
                        setHasKit(false);
                      });
                    }
                  }}
                  className="btn-terminal"
                  style={{ color: "rgba(239,68,68,0.5)", borderColor: "rgba(239,68,68,0.1)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(239,68,68,0.8)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(239,68,68,0.5)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.1)"; }}
                >
                  {"^C :: RESET"}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="crt-micro-bl">
          <span className={`font-mono text-[7px] tracking-[0.18em] uppercase ${hasKit ? "text-ok" : "text-tx-4"}`}>
            {hasKit ? "KIT ACTIVE" : "NO KIT"}
          </span>
        </div>
        <div className="crt-micro-br">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">
            {saving ? "WRITING..." : "STANDBY"}
          </span>
        </div>

        <div className="crt-monitor-footer">
          <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-tx-4">
            {hasKit ? "KIT ACTIVE" : "NO KIT"}
          </span>
          <span className="font-mono text-[6px] text-center text-tx-4">[system ready]</span>
          <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-tx-4">
            {saving ? "WRITING" : "STANDBY"}
          </span>
        </div>
      </div>

      <SignInModal open={showModal} onClose={closeModal} context="save your brand kit" />
    </div>
  );
}
