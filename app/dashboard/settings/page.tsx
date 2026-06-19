"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { PLATFORMS, TONES } from "@/lib/constants";
import { updateProfile, getProfile, saveBBSettings, saveGeminiSettings } from "@/lib/actions";

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "BEGINNER", desc: "New to content creation" },
  { value: "intermediate", label: "INTERMEDIATE", desc: "Consistent creator" },
  { value: "pro", label: "PRO", desc: "Full-time creator" },
] as const;

const SCHEDULES = [
  { value: "daily", label: "DAILY", desc: "Every day" },
  { value: "3x_week", label: "3x / WEEK", desc: "3-4 times per week" },
  { value: "weekly", label: "WEEKLY", desc: "1-2 times per week" },
  { value: "custom", label: "CUSTOM", desc: "Flexible schedule" },
] as const;

const SOCIAL_FIELDS = [
  { key: "youtube", label: "YouTube", icon: "YT" },
  { key: "instagram", label: "Instagram", icon: "IG" },
  { key: "twitter", label: "Twitter / X", icon: "X" },
  { key: "tiktok", label: "TikTok", icon: "TK" },
  { key: "linkedin", label: "LinkedIn", icon: "LI" },
  { key: "website", label: "Website", icon: "WWW" },
] as const;

const FORMATS = ["Video", "Post", "Carousel", "Mixed"] as const;

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("intermediate");
  const [postingSchedule, setPostingSchedule] = useState("3x_week");
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [defaultPlatform, setDefaultPlatform] = useState("");
  const [defaultTone, setDefaultTone] = useState("");
  const [defaultFormat, setDefaultFormat] = useState("");
  const [bbApiKey, setBbApiKey] = useState("");
  const [bbTemplateId, setBbTemplateId] = useState("");
  const [bbSaved, setBbSaved] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [geminiSaved, setGeminiSaved] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.replace("/sign-in"); return; }

    getProfile().then((data) => {
      if (data?.profile) {
        const p = data.profile;
        setUsername(p.username || "");
        setBio(p.bio || "");
        setExperienceLevel(p.experienceLevel || "intermediate");
        setPostingSchedule(p.postingSchedule || "3x_week");
        setSocialLinks((p.socialLinks as Record<string, string>) || {});
        const cd = p.contentDefaults as Record<string, unknown> | null;
        if (cd) {
          setDefaultPlatform((cd.defaultPlatform as string) || "");
          setDefaultTone((cd.defaultTone as string) || "");
          setDefaultFormat((cd.defaultFormat as string) || "");
          setBbApiKey((cd.bbApiKey as string) || "");
          setBbTemplateId((cd.bbTemplateId as string) || "");
          setGeminiApiKey((cd.geminiApiKey as string) || "");
        }
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isLoaded, user, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const fd = new FormData();
    fd.set("username", username);
    fd.set("bio", bio);
    fd.set("experienceLevel", experienceLevel);
    fd.set("postingSchedule", postingSchedule);
    for (const { key } of SOCIAL_FIELDS) {
      const val = socialLinks[key] || "";
      if (val) fd.set(`social_${key}`, val);
    }
    fd.set("defaultPlatform", defaultPlatform);
    fd.set("defaultTone", defaultTone);
    fd.set("defaultFormat", defaultFormat);

    try {
      await updateProfile(fd);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaving(false);
    }
  }

  if (loading || !isLoaded) {
    return (
      <div className="max-w-2xl space-y-6 relative z-10">
        <div className="crt-monitor crt-brackets">
          <div className="crt-monitor-content p-8">
            <div className="boot-loader">
              <div className="boot-loader-line">
                <span className="boot-loader-arrow">{">>"}</span>
                <span className="boot-loader-text">LOADING PROFILE</span>
                <span className="flex gap-0.5 ml-auto items-center">
                  <span className="w-1 h-1 rounded-full bg-te-400 animate-pulse" style={{ animationDelay: "0s" }} />
                  <span className="w-1 h-1 rounded-full bg-te-400 animate-pulse" style={{ animationDelay: "0.15s" }} />
                  <span className="w-1 h-1 rounded-full bg-te-400 animate-pulse" style={{ animationDelay: "0.3s" }} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 relative z-10">
      <div>
        <p className="sec-eyebrow">
          <span className="sec-eyebrow-dot" />
          System :: Settings
        </p>
        <h1 className="sec-title !text-[28px]">Creator Profile</h1>
        <p className="sec-desc !text-[13px]">Manage your identity, preferences, and defaults</p>
      </div>

      {/* === PROFILE SECTION === */}
      <div className="crt-monitor relative crt-brackets">
        <div className="crt-scanlines" />
        <div className="crt-grain" />
        <div className="crt-vignette" />
        <div className="crt-sweep" />

        <div className="crt-micro-tl">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-te-400/60">sys</span>
          <span className="text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase">profile</span>
        </div>
        <div className="crt-micro-tr">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">v1.0.4</span>
          <span className="text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-te-400/60">online</span>
        </div>

        <div className="crt-monitor-header">
          <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-tx-4">SYS</span>
          <span className="font-mono text-[6px] text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-te-400/70">CREATOR PROFILE</span>
          <div className="flex-1" />
          <span className="font-mono text-[7px] tracking-[0.1em] text-tx-4">{"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
        </div>

        <form onSubmit={handleSave} autoComplete="off">
          <div className="crt-monitor-content p-6 space-y-6">
            {/* Avatar + Identity */}
            <div className="flex items-center gap-4 pb-5 border-b border-white/[0.04]">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-vi-500 to-te-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                {user?.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-display text-[22px] font-bold">
                    {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
              <div>
                <div className="font-medium text-[15px]">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="font-mono text-[11px] text-tx-2 mt-0.5 flex items-center gap-2">
                  <span>{user?.emailAddresses[0]?.emailAddress}</span>
                  <span className="diag-badge diag-info">VERIFIED</span>
                </div>
                <span className="font-mono text-[8px] text-tx-4 tracking-wider uppercase">
                  avatar via google
                </span>
              </div>
            </div>

            {/* Handle */}
            <div>
              <label className="term-label mb-2">HANDLE</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                placeholder="@creator_handle"
                autoComplete="off"
                data-form-type="other"
                className="term-field"
              />
              <p className="font-mono text-[8px] text-tx-4 mt-1 tracking-wider">
                your public handle across the platform
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="term-label mb-2">BIO</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Helping creators build their personal brand with AI-powered tools"
                rows={3}
                className="term-field resize-none"
              />
              <p className="font-mono text-[8px] text-tx-4 mt-1 tracking-wider">
                brief about section &mdash; displayed on your creator profile
              </p>
            </div>

            {/* Experience Level */}
            <div>
              <label className="term-label mb-2">EXPERIENCE LEVEL</label>
              <div className="space-y-1">
                {EXPERIENCE_LEVELS.map((el) => (
                  <button
                    key={el.value}
                    type="button"
                    onClick={() => setExperienceLevel(el.value)}
                    className={`boot-option ${experienceLevel === el.value ? "active" : ""}`}
                  >
                    <span className="boot-option-arrow">
                      {experienceLevel === el.value ? "\u25B6" : ">>"}
                    </span>
                    <span className="boot-option-label flex flex-col gap-0.5">
                      <span className="text-[9px] tracking-[0.15em] uppercase">{el.label}</span>
                      <span className="font-mono text-[8px] text-tx-4">{el.desc}</span>
                    </span>
                    <span className={`diag-badge ${experienceLevel === el.value ? "diag-ok" : "diag-idle"}`}>
                      {experienceLevel === el.value ? "[ACTIVE]" : "[IDLE]"}
                    </span>
                  </button>
                ))}
              </div>
              <p className="font-mono text-[8px] text-tx-4 mt-1 tracking-wider">
                affects AI output complexity and suggestions
              </p>
            </div>

            {/* Posting Schedule */}
            <div>
              <label className="term-label mb-2">POSTING SCHEDULE</label>
              <div className="space-y-1">
                {SCHEDULES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setPostingSchedule(s.value)}
                    className={`boot-option ${postingSchedule === s.value ? "active" : ""}`}
                  >
                    <span className="boot-option-arrow">
                      {postingSchedule === s.value ? "\u25B6" : ">>"}
                    </span>
                    <span className="boot-option-label flex flex-col gap-0.5">
                      <span className="text-[9px] tracking-[0.15em] uppercase">{s.label}</span>
                      <span className="font-mono text-[8px] text-tx-4">{s.desc}</span>
                    </span>
                    <span className={`diag-badge ${postingSchedule === s.value ? "diag-ok" : "diag-idle"}`}>
                      {postingSchedule === s.value ? "[ACTIVE]" : "[IDLE]"}
                    </span>
                  </button>
                ))}
              </div>
              <p className="font-mono text-[8px] text-tx-4 mt-1 tracking-wider">
                used by calendar generator to distribute content
              </p>
            </div>
          </div>

          {/* === SOCIAL LINKS SUBSECTION === */}
          <div className="border-t border-white/[0.04]">
            <div className="px-6 pt-5 pb-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-te-400/60" />
                <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-tx-2">Social Links</span>
              </div>
              <p className="font-mono text-[8px] text-tx-4 tracking-wider mb-4">
                connect your creator channels for AI-powered cross-platform suggestions
              </p>
            </div>
            <div className="px-6 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SOCIAL_FIELDS.map((sf) => (
                <div key={sf.key}>
                  <label className="font-mono text-[8px] text-tx-3 tracking-[0.2em] uppercase mb-1 block">
                    {sf.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[8px] text-vi-400 w-7 flex-shrink-0">[{sf.icon}]</span>
                    <input
                      value={socialLinks[sf.key] || ""}
                      onChange={(e) => setSocialLinks((prev) => ({ ...prev, [sf.key]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                      placeholder={
                        sf.key === "website" ? "https://yourwebsite.com" :
                        sf.key === "youtube" ? "https://youtube.com/@..." :
                        `https://${sf.key}.com/@...`
                      }
                      className="term-field text-[10px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* === BANNERBEAR SUBSECTION === */}
          <div className="border-t border-white/[0.04]">
            <div className="px-6 pt-5 pb-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-te-400/60" />
                <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-tx-2">Bannerbear</span>
              </div>
              <p className="font-mono text-[8px] text-tx-4 tracking-wider mb-4">
                generate actual slide images from templates &mdash; <a href="https://www.bannerbear.com" target="_blank" rel="noopener noreferrer" className="text-te-400 underline">free tier</a>
              </p>
            </div>
            <div className="px-6 pb-6 space-y-4">
              <div>
                <label className="term-label mb-2">BB_API_KEY</label>
                <input
                  value={bbApiKey}
                  onChange={(e) => setBbApiKey(e.target.value)}
                  placeholder="Paste your Bannerbear API key"
                  className="term-field"
                />
                <p className="font-mono text-[8px] text-tx-4 mt-1 tracking-wider">
                  get this from your project settings at bannerbear.com
                </p>
              </div>
              <div>
                <label className="term-label mb-2">BB_TEMPLATE_ID</label>
                <input
                  value={bbTemplateId}
                  onChange={(e) => setBbTemplateId(e.target.value)}
                  placeholder="Paste your Bannerbear template ID"
                  className="term-field"
                />
                <p className="font-mono text-[8px] text-tx-4 mt-1 tracking-wider">
                  create a template in bannerbear with text layers named: headline, copy, slide_number
                </p>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  disabled={!bbApiKey || !bbTemplateId}
                  onClick={async () => {
                    await saveBBSettings(bbApiKey, bbTemplateId);
                    setBbSaved(true);
                    setTimeout(() => setBbSaved(false), 3000);
                  }}
                  className="btn-terminal text-[10px] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {"[SAVE BB CONFIG]"}
                </button>
                {bbSaved && (
                  <span className="font-mono text-[8px] text-ok tracking-wider animate-pulse">
                    [BB CONFIG SAVED]
                  </span>
                )}
              </div>
              <a
                href="https://www.bannerbear.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[8px] text-vi-400 underline"
              >
                {">>"} Create Bannerbear account (free)
              </a>
            </div>
          </div>

          {/* === GEMINI SUBSECTION === */}
          <div className="border-t border-white/[0.04]">
            <div className="px-6 pt-5 pb-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-te-400/60" />
                <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-tx-2">Gemini Imagen</span>
              </div>
              <p className="font-mono text-[8px] text-tx-4 tracking-wider mb-4">
                generate images via Google Imagen 3 &mdash; <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-te-400 underline">free API key</a>
              </p>
            </div>
            <div className="px-6 pb-6 space-y-4">
              <div>
                <label className="term-label mb-2">GEMINI_API_KEY</label>
                <input
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="Paste your Gemini API key"
                  className="term-field"
                />
                <p className="font-mono text-[8px] text-tx-4 mt-1 tracking-wider">
                  get this from aistudio.google.com &mdash; free tier includes Imagen 3
                </p>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  disabled={!geminiApiKey}
                  onClick={async () => {
                    await saveGeminiSettings(geminiApiKey);
                    setGeminiSaved(true);
                    setTimeout(() => setGeminiSaved(false), 3000);
                  }}
                  className="btn-terminal text-[10px] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {"[SAVE GEMINI KEY]"}
                </button>
                {geminiSaved && (
                  <span className="font-mono text-[8px] text-ok tracking-wider animate-pulse">
                    [GEMINI KEY SAVED]
                  </span>
                )}
              </div>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[8px] text-vi-400 underline"
              >
                {">>"} Get Gemini API key (free)
              </a>
            </div>
          </div>

          {/* === CONTENT DEFAULTS SUBSECTION === */}
          <div className="border-t border-white/[0.04]">
            <div className="px-6 pt-5 pb-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-fu-400/60" />
                <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-tx-2">Content Defaults</span>
              </div>
              <p className="font-mono text-[8px] text-tx-4 tracking-wider mb-4">
                auto-fills input forms when you open a module
              </p>
            </div>
            <div className="px-6 pb-6 space-y-4">
              {/* Default Platform */}
              <div>
                <label className="term-label mb-2">DEFAULT_PLATFORM</label>
                <div className="flex flex-wrap gap-1.5">
                  {[...PLATFORMS, "None"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDefaultPlatform(p === "None" ? "" : p)}
                      className={`px-2.5 h-7 font-mono text-[9px] tracking-wider uppercase border rounded-sm transition-all duration-150 ${
                        defaultPlatform === p || (p === "None" && !defaultPlatform)
                          ? "bg-te-400/10 border-te-400/30 text-te-400"
                          : "bg-black/20 border-white/[0.06] text-tx-3 hover:border-white/[0.12]"
                      }`}
                    >
                      {p === "None" ? "[NONE]" : p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Tone */}
              <div>
                <label className="term-label mb-2">DEFAULT_TONE</label>
                <div className="flex flex-wrap gap-1.5">
                  {[...TONES, "None"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDefaultTone(t === "None" ? "" : t)}
                      className={`px-2.5 h-7 font-mono text-[9px] tracking-wider uppercase border rounded-sm transition-all duration-150 ${
                        defaultTone === t || (t === "None" && !defaultTone)
                          ? "bg-vi-400/10 border-vi-400/30 text-vi-400"
                          : "bg-black/20 border-white/[0.06] text-tx-3 hover:border-white/[0.12]"
                      }`}
                    >
                      {t === "None" ? "[NONE]" : t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Format */}
              <div>
                <label className="term-label mb-2">DEFAULT_FORMAT</label>
                <div className="flex flex-wrap gap-1.5">
                  {[...FORMATS, "None"].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setDefaultFormat(f === "None" ? "" : f)}
                      className={`px-2.5 h-7 font-mono text-[9px] tracking-wider uppercase border rounded-sm transition-all duration-150 ${
                        defaultFormat === f || (f === "None" && !defaultFormat)
                          ? "bg-fu-400/10 border-fu-400/30 text-fu-400"
                          : "bg-black/20 border-white/[0.06] text-tx-3 hover:border-white/[0.12]"
                      }`}
                    >
                      {f === "None" ? "[NONE]" : f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="border-t border-white/[0.04] px-6 py-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-terminal btn-terminal-primary"
            >
              {saving ? "SAVING..." : "EXECUTE :: SAVE_PROFILE"}
            </button>
            {saved && (
              <span className="font-mono text-[9px] text-ok tracking-wider animate-pulse">
                [PROFILE SAVED]
              </span>
            )}
          </div>
        </form>

        <div className="crt-micro-bl">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">profile</span>
        </div>
        <div className="crt-micro-br">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">editable</span>
        </div>

        <div className="crt-monitor-footer">
          <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-tx-4">
            {user?.firstName || "USER"}
          </span>
          <span className="font-mono text-[6px] text-center text-tx-4">[system ready]</span>
          <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-tx-4">
            EDITING
          </span>
        </div>
      </div>

      {/* === BILLING SECTION (kept from original) === */}
      <div className="crt-monitor relative crt-brackets">
        <div className="crt-scanlines" />
        <div className="crt-grain" />
        <div className="crt-vignette" />
        <div className="crt-sweep" />

        <div className="crt-micro-tl">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-te-400/60">sys</span>
          <span className="text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase">billing</span>
        </div>
        <div className="crt-micro-tr">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">plan</span>
          <span className="text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-warn">
            FREE
          </span>
        </div>

        <div className="crt-monitor-header">
          <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-tx-4">SYS</span>
          <span className="font-mono text-[6px] text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-te-400/70">PLAN STATUS</span>
          <div className="flex-1" />
          <span className="font-mono text-[7px] tracking-[0.1em] text-tx-4">{"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
        </div>

        <div className="crt-monitor-content p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="text-te-400/60">{'\u203A\u203A'}</span>
              <span className="text-tx-3 tracking-wider uppercase text-[9px]">current_plan</span>
            </div>
            <div className="flex items-center justify-between py-3 px-4 bg-black/30 border border-white/[0.04] rounded-[2px]">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-warn animate-beat-pulse" />
                <div>
                  <div className="font-mono text-[13px] text-tx-1 font-medium">Free</div>
                  <div className="font-mono text-[9px] text-tx-3 mt-0.5">
                    5 scripts/month &middot; basic access
                  </div>
                </div>
              </div>
              <span className="diag-badge diag-info">LIMITED</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="text-te-400/60">{'\u203A\u203A'}</span>
              <span className="text-tx-3 tracking-wider uppercase text-[9px]">usage</span>
            </div>
            <div className="flex items-center justify-between py-3 px-4 bg-black/30 border border-white/[0.04] rounded-[2px]">
              <div className="flex items-center gap-2 font-mono text-[11px] text-tx-2">
                <span className="text-te-400/60">{"\u25B6"}</span>
                Scripts this month
              </div>
              <span className="font-mono text-[11px] text-tx-1">0 / 5</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.04]">
            <button
              className="btn-terminal btn-terminal-primary w-full justify-center text-[10px]"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(34,211,238,0.08))",
                borderColor: "rgba(139,92,246,0.2)",
              }}
            >
              {"EXEC_UPGRADE >> CREATOR :: \u20B91,999/mo"}
            </button>
            <p className="font-mono text-[8px] text-tx-4 text-center mt-2 tracking-wider">
              unlimited scripts &middot; priority support &middot; full module access
            </p>
          </div>
        </div>

        <div className="crt-micro-bl">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">billing</span>
        </div>
        <div className="crt-micro-br">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">active</span>
        </div>

        <div className="crt-monitor-footer">
          <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-tx-4">FREE PLAN</span>
          <span className="font-mono text-[6px] text-center text-tx-4">[billing ready]</span>
          <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-tx-4">ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
