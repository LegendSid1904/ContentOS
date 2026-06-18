export const APP_NAME = "ContentOS AI";
export const APP_TAGLINE = "Where ideas become viral content";
export const APP_DESC = "The all-in-one AI-powered content operating system for creators, agencies, and personal brands.";

export const LANGUAGES = ["English", "Hinglish"] as const;
export type Lang = (typeof LANGUAGES)[number];

export const PLATFORMS = ["YouTube", "Instagram Reels", "LinkedIn", "YouTube Shorts"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const ALL_SOCIAL_PLATFORMS = [
  "YouTube",
  "Instagram",
  "TikTok",
  "LinkedIn",
  "Twitter / X",
  "Facebook",
  "Snapchat",
  "Pinterest",
  "Threads",
] as const;

export const TONES = ["Educational", "Entertaining", "Motivational", "Controversial", "Storytelling"] as const;
export type Tone = (typeof TONES)[number];

export const CAREER_GOALS = [
  "Build a personal brand",
  "Full-time content creator",
  "Grow my business through content",
  "Side income / monetize my audience",
  "Establish thought leadership",
  "Just exploring / not sure yet",
] as const;

export const CONTENT_GOALS = [
  "Grow followers / subscribers",
  "Increase engagement",
  "Generate leads / clients",
  "Drive website traffic",
  "Build community",
  "Monetize existing audience",
  "Collaborate with brands",
  "Sell products / services",
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner — Just starting out" },
  { value: "intermediate", label: "Intermediate — Been posting for a while" },
  { value: "advanced", label: "Advanced — Consistent creator with audience" },
] as const;

export const POSTING_FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "3x_week", label: "3-4 times per week" },
  { value: "1x_week", label: "Once a week" },
  { value: "2x_month", label: "Twice a month" },
  { value: "1x_month", label: "Once a month" },
] as const;

export const CONTENT_FORMATS = [
  "Short-form video (Reels/Shorts/TikTok)",
  "Long-form video (YouTube)",
  "Carousel / Slides",
  "Text posts / Threads",
  "Infographics",
  "Podcast / Audio",
  "Newsletter",
  "Live streams",
] as const;

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
