export const APP_NAME = "ContentOS AI";
export const APP_TAGLINE = "Where ideas become viral content";
export const APP_DESC = "The all-in-one AI-powered content operating system for creators, agencies, and personal brands.";

export const LANGUAGES = ["English", "Hinglish"] as const;
export type Lang = (typeof LANGUAGES)[number];

export const PLATFORMS = ["YouTube", "Instagram Reels", "LinkedIn", "YouTube Shorts", "TikTok"] as const;
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

export const APPS = [
  {
    id: "youtube",
    name: "YouTube",
    desc: "Long-form videos & Shorts — scripts, thumbnails, editing briefs",
    modules: ["script-writer", "content-ideas", "competitor-intel", "video-brief", "thumbnail-maker", "page-setup", "growth-strategy"],
  },
  {
    id: "instagram",
    name: "Instagram",
    desc: "Reels, carousels & stories — scripts, slides, growth",
    modules: ["script-writer", "content-ideas", "carousel-maker", "competitor-intel", "page-setup", "growth-strategy"],
  },
  {
    id: "tiktok",
    name: "TikTok",
    desc: "Short-form viral content — scripts, trends, optimization",
    modules: ["script-writer", "content-ideas", "competitor-intel", "page-setup", "growth-strategy"],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    desc: "Professional content & thought leadership — posts, carousels",
    modules: ["script-writer", "content-ideas", "carousel-maker", "competitor-intel", "page-setup", "growth-strategy"],
  },
] as const;

export type AppId = (typeof APPS)[number]["id"];

export const APP_PLATFORM_MAP: Record<AppId, string[]> = {
  youtube: ["YouTube", "YouTube Shorts"],
  instagram: ["Instagram Reels"],
  tiktok: ["TikTok"],
  linkedin: ["LinkedIn"],
};

export interface AppModuleDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

export const APP_MODULES: Record<string, AppModuleDef[]> = {
  youtube: [
    { id: "script-writer",    name: "Script Lab",        icon: "⌨",  desc: "Hook → full script → export for long-form video" },
    { id: "content-ideas",    name: "Idea Vault",        icon: "◈",  desc: "30 video ideas with viral angles & content calendar" },
    { id: "competitor-intel", name: "Competitor Intel",  icon: "◎",  desc: "Deep scan of top YouTubers in your niche" },
    { id: "video-brief",      name: "Edit Blueprint",    icon: "▷",  desc: "Transcript → editing brief + full B-roll list" },
    { id: "page-setup",       name: "Channel Setup",     icon: "⌘",  desc: "Bio, keywords, SEO — fully AI-optimized for YouTube" },
    { id: "thumbnail-maker",  name: "Thumbnail Lab",     icon: "▤",  desc: "5 CTR-optimized thumbnail concepts per video" },
    { id: "growth-strategy",  name: "Growth Engine",     icon: "↗",  desc: "90-day growth plan + monetization roadmap" },
  ],
  instagram: [
    { id: "script-writer",    name: "Reel Scripts",      icon: "⌨",  desc: "Short-form hook-driven scripts optimized for Reels" },
    { id: "content-ideas",    name: "Moodboard",         icon: "◈",  desc: "Visual inspiration & aesthetic content planning" },
    { id: "carousel-maker",   name: "Carousel Studio",   icon: "▣",  desc: "AI-written slides → Canva export in 2 minutes" },
    { id: "competitor-intel", name: "Competitor Intel",  icon: "◎",  desc: "Deep scan of top creators in your niche" },
    { id: "page-setup",       name: "Bio Optimizer",     icon: "⌘",  desc: "Bio, highlights, link-in-bio — fully optimized" },
    { id: "growth-strategy",  name: "Growth Engine",     icon: "↗",  desc: "90-day growth plan + monetization roadmap" },
  ],
  tiktok: [
    { id: "script-writer",    name: "Viral Scripts",     icon: "⌨",  desc: "15-60s hook-driven scripts with sound & caption cues" },
    { id: "content-ideas",    name: "Trend Scanner",     icon: "◈",  desc: "Trend-based content ideas with viral hook angles" },
    { id: "competitor-intel", name: "Competitor Intel",  icon: "◎",  desc: "Deep scan of top creators in your niche" },
    { id: "page-setup",       name: "Profile Setup",     icon: "⌘",  desc: "Bio, keywords, highlights — TikTok-optimized" },
    { id: "growth-strategy",  name: "Growth Engine",     icon: "↗",  desc: "90-day growth plan + monetization roadmap" },
  ],
  linkedin: [
    { id: "script-writer",    name: "Post Studio",       icon: "⌨",  desc: "Thought-leadership posts from idea to publish" },
    { id: "content-ideas",    name: "Authority Ideas",   icon: "◈",  desc: "30 thought-leadership angles & content themes" },
    { id: "carousel-maker",   name: "Carousel Studio",   icon: "▣",  desc: "AI-written slides → Canva export in 2 minutes" },
    { id: "competitor-intel", name: "Competitor Intel",  icon: "◎",  desc: "Deep scan of top voices in your niche" },
    { id: "page-setup",       name: "Profile Setup",     icon: "⌘",  desc: "Headline, about, featured — AI-optimized for LinkedIn" },
    { id: "growth-strategy",  name: "Growth Engine",     icon: "↗",  desc: "90-day growth plan + authority building" },
  ],
};

export const PLANS = ["Free", "Creator", "Agency"] as const;
export type Plan = (typeof PLANS)[number];

export const PLAN_PRICES: Record<Plan, number> = {
  Free: 0,
  Creator: 1999,
  Agency: 5999,
};
