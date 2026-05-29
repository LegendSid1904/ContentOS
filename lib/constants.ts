export const APP_NAME = "ContentOS AI";
export const APP_TAGLINE = "Where ideas become viral content";
export const APP_DESC = "The all-in-one AI-powered content operating system for creators, agencies, and personal brands.";

export const PLATFORMS = ["YouTube", "Instagram Reels", "LinkedIn", "YouTube Shorts"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const TONES = ["Educational", "Entertaining", "Motivational", "Controversial", "Storytelling"] as const;
export type Tone = (typeof TONES)[number];

export const MODULES = [
  { id: "script-writer",    name: "Script Writer",      icon: "⌨",  desc: "Hook → full script → export in 60 seconds" },
  { id: "content-ideas",    name: "Content Ideas",      icon: "◈",  desc: "30 niche ideas with viral angles and full calendar" },
  { id: "carousel-maker",   name: "Carousel Maker",     icon: "▣",  desc: "AI-written slides → Canva export in 2 minutes" },
  { id: "competitor-intel", name: "Competitor Intel",   icon: "◎",  desc: "Deep scan of top performers in your niche" },
  { id: "video-brief",      name: "Video Brief",        icon: "▷",  desc: "Transcript → editing brief + full B-roll list" },
  { id: "thumbnail-maker",  name: "Thumbnail Maker",    icon: "▤",  desc: "5 CTR-optimized thumbnail concepts per video" },
  { id: "page-setup",       name: "Page Setup",         icon: "⌘",  desc: "Bio, keywords, highlights — fully AI-optimized" },
  { id: "growth-strategy",  name: "Growth Strategy",    icon: "↗",  desc: "90-day plan + monetization roadmap" },
] as const;

export const PLANS = ["Free", "Creator", "Agency"] as const;
export type Plan = (typeof PLANS)[number];

export const PLAN_PRICES: Record<Plan, number> = {
  Free: 0,
  Creator: 1999,
  Agency: 5999,
};
