import type { Platform, Tone, Plan } from "@/lib/constants";

export interface BrandKit {
  id: string;
  userId: string;
  logoUrl?: string;
  colors: string[];
  fonts: string[];
  tone: Tone;
  niche: string;
  platforms: Platform[];
}

export interface Project {
  id: string;
  userId: string;
  module: string;
  title: string;
  status: "draft" | "completed" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface ContentOutput {
  id: string;
  projectId: string;
  type: string;
  contentJson: Record<string, unknown>;
  version: number;
  createdAt: string;
}

export interface UserSubscription {
  userId: string;
  plan: Plan;
  status: "active" | "canceled" | "past_due";
  renewalDate: string;
  apiCredits: number;
}

export interface AIGenerationRequest {
  module: string;
  prompt: string;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIGenerationResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface Idea {
  id: string;
  title: string;
  format: "video" | "post" | "carousel";
  pillar: string;
  effort: "Low" | "Medium" | "High";
  shareability: number;
  seo_value: number;
  viral_angle: string;
}

export interface IdeaWithAngles extends Idea {
  angles: string[];
}
