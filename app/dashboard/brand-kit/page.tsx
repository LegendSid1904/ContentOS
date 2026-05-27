"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PLATFORMS, TONES } from "@/lib/constants";
import { saveBrandKit, getBrandKit } from "@/lib/actions";

const PRESET_COLORS = ["#7C3AED", "#06B6D4", "#D946EF", "#6366F1", "#22C55E", "#F59E0B"];

export default function BrandKitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [niche, setNiche] = useState("");
  const [selectedTone, setSelectedTone] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>(["#7C3AED"]);

  useEffect(() => {
    getBrandKit().then((kit) => {
      if (kit) {
        setNiche(kit.niche ?? "");
        setSelectedTone(kit.tone ?? "");
        setSelectedPlatform(kit.platforms?.[0] ?? "");
        setSelectedColors(kit.colors ?? ["#7C3AED"]);
      }
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    const fd = new FormData();
    fd.set("niche", niche);
    fd.set("tone", selectedTone);
    fd.set("colors", JSON.stringify(selectedColors));
    fd.set("platforms", JSON.stringify(selectedPlatform ? [selectedPlatform] : []));
    await saveBrandKit(fd);
    setSaving(false);
    router.refresh();
  }

  function toggleColor(color: string) {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl space-y-8">
        <div className="h-8 w-48 skeleton rounded-r4" />
        <div className="h-72 glass-card animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <p className="sec-eyebrow">
          <span className="sec-eyebrow-dot" />
          System :: Brand
        </p>
        <h1 className="sec-title !text-[28px]">Brand Kit</h1>
        <p className="sec-desc !text-[13px]">
          Define your brand identity — colors, fonts, tone, and platforms
        </p>
      </div>

      <div className="terminal-frame p-6 space-y-6">
        <div>
          <label className="terminal-label block mb-2">Your Niche</label>
          <input
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g. Tech, Fitness, Finance, Lifestyle..."
            className="terminal-input w-full h-[42px] px-3"
          />
        </div>

        <div>
          <label className="terminal-label block mb-2">Brand Colors</label>
          <div className="flex gap-3">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => toggleColor(color)}
                className="w-10 h-10 rounded-full transition-all cursor-pointer relative"
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

        <div>
          <label className="terminal-label block mb-2">Brand Voice &amp; Tone</label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((tone) => (
              <button
                key={tone}
                onClick={() => setSelectedTone(tone === selectedTone ? "" : tone)}
                className={`px-4 h-[34px] rounded-full border text-[13px] transition-all font-mono tracking-wide text-[11px] ${
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
          <label className="terminal-label block mb-2">Primary Platform</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform === selectedPlatform ? "" : platform)}
                className={`px-4 h-[34px] rounded-full border text-[13px] transition-all font-mono tracking-wide text-[11px] ${
                  platform === selectedPlatform
                    ? "border-te-400/40 bg-te-500/10 text-te-300"
                    : "border-white/10 bg-black/30 text-tx-2 hover:border-te-400/30 hover:text-tx-1"
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-white/[0.04]">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary btn-md"
          >
            {saving ? "Saving..." : "Save Brand Kit"}
          </button>
        </div>
      </div>
    </div>
  );
}
