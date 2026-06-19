"use server";

import { auth } from "@clerk/nextjs/server";
import { generateJSON } from "@/lib/ai";
import { db } from "@/lib/drizzle";
import { users, projects, contentOutputs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateThumbnailImage } from "@/lib/image";
import { searchWeb } from "@/lib/search";
import { ensureUser } from "@/lib/ensure-user";

export interface ThumbnailConcept {
  concept_name: string;
  headline_text: string;
  visual_description: string;
  color_palette: string[];
  facial_expression_hint: string;
  background_suggestion: string;
  props: string[];
}

export interface GeneratedThumbnail {
  concept_name: string;
  image: { index: number; b64_json: string; revised_prompt: string; storageUrl?: string };
}

export interface ThumbnailPattern {
  type: string;
  percentage: number;
}

export interface NicheThumbnailReport {
  patterns_found: boolean;
  dominant_colors_across_niche: string[];
  composition_breakdown: ThumbnailPattern[];
  most_common_composition: string;
  expression_breakdown: ThumbnailPattern[];
  most_common_expression: string;
  text_overlay_percentage: number;
  face_present_percentage: number;
  contrast_breakdown: ThumbnailPattern[];
  most_common_contrast: string;
  most_common_color_style: string;
  top_ctr_factors: { factor: string; frequency: number }[];
  winning_formula: Record<string, unknown>;
}

interface ThumbnailResponse {
  concepts: ThumbnailConcept[];
}

export async function researchNicheThumbnails(niche: string, platform: string = "youtube") {
  const { userId } = await auth();
  if (!userId) return { ok: false as const, error: "You need to sign in first" };
  try {
    const searchResults = await searchWeb(`${niche} thumbnail trends ${platform} 2026`, 10);

    const result = await generateJSON<{ patterns: string[]; dominantColors: string[]; compositionTypes: string[]; ctrFactors: string[] }>({
      systemPrompt: `You are a YouTube thumbnail researcher. Based on search results about ${niche} thumbnails, identify: patterns (common approaches in this niche), dominantColors (3-5 hex color codes that perform well), compositionTypes (what framing works best), ctrFactors (what drives clicks). Return as JSON.`,
      prompt: `Niche: ${niche}. Platform: ${platform}.\n\nSearch data:\n${JSON.stringify(searchResults.slice(0, 5))}`,
      temperature: 0.3,
    });

    return { ok: true as const, data: result as unknown as NicheThumbnailReport };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Research failed" };
  }
}

export async function generateThumbnails(topic: string, platform: string, audience: string, nichePatterns?: NicheThumbnailReport | null, brandColors?: string[]) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const, error: "You need to sign in first" };
  try {
    const nicheContext = nichePatterns?.patterns_found
      ? `\nNiche thumbnail research findings:\n- Common compositions: ${(nichePatterns.composition_breakdown || []).map((c) => `${c.type} (${c.percentage}%)`).join(", ")}\n- Dominant colors: ${(nichePatterns.dominant_colors_across_niche || []).join(", ")}\n- Top CTR factors: ${(nichePatterns.top_ctr_factors || []).map((f) => f.factor).join(", ")}\n- Winning expression: ${nichePatterns.most_common_expression}\n- Text overlay used in: ${nichePatterns.text_overlay_percentage}% of top thumbnails`
      : "";

    const brandContext = brandColors && brandColors.length > 0
      ? `\nBrand color palette: ${brandColors.join(", ")}. Incorporate these brand colors into the color_palette for each concept where appropriate.`
      : "";

    const result = await generateJSON<ThumbnailResponse>({
      systemPrompt: `You are a thumbnail strategist. Generate 5 unique thumbnail concepts. Each concept must have: concept_name (string), headline_text (string — 2-5 words, CTR-optimized), visual_description (string), color_palette (array of 3-4 hex colors), facial_expression_hint (string), background_suggestion (string), props (array of strings). Return as JSON with a "concepts" array. Use niche research data and brand colors to inform but not constrain the designs.`,
      prompt: `Topic: ${topic}. Platform: ${platform}. Audience: ${audience}.${nicheContext}${brandContext}`,
      temperature: 0.8,
    });
    return { ok: true as const, data: result.concepts };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Generation failed" };
  }
}

export async function generateThumbnailImages(concepts: ThumbnailConcept[]) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const, error: "You need to sign in first" };
  try {
    const images: GeneratedThumbnail[] = [];
    for (const concept of concepts) {
      const image = await generateThumbnailImage(concept);
      images.push({ concept_name: concept.concept_name, image });
    }
    return { ok: true as const, data: images };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Image generation failed" };
  }
}

export async function generateCanvaThumbnailPrompts(concepts: ThumbnailConcept[]) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const, error: "You need to sign in first" };
  try {
    const result = await generateJSON<{ prompts: { concept: string; canva_prompt: string; template_type: string }[] }>({
      systemPrompt: `For each thumbnail concept, generate a Canva design prompt ready to paste into Canva's design tool. Include template type, layout, colors, fonts, and text placement. Return as JSON with a "prompts" array, each having: concept (string), canva_prompt (string), template_type (string).`,
      prompt: `Concepts: ${JSON.stringify(concepts.map((c) => ({ name: c.concept_name, headline: c.headline_text, colors: c.color_palette, background: c.background_suggestion })))}`,
    });
    return { ok: true as const, data: result.prompts };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Prompt generation failed" };
  }
}

export async function generateABTestPlan(topic: string, concepts: ThumbnailConcept[]) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const, error: "You need to sign in first" };
  try {
    const result = await generateJSON<{ test_plan: { variant_a: string; variant_b: string; hypothesis: string; metric: string; duration_days: number }[] }>({
      systemPrompt: `Create 3 A/B thumbnail test plans pairing different concepts. Each test plan must have: variant_a (concept name), variant_b (concept name), hypothesis (string), metric (string — e.g. "CTR", "Impressions"), duration_days (number 3-7). Return as JSON with a "test_plan" array.`,
      prompt: `Topic: ${topic}. Available concepts: ${concepts.map((c) => c.concept_name).join(", ")}.`,
    });
    return { ok: true as const, data: result.test_plan };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Test plan generation failed" };
  }
}

export async function saveThumbnailBrief(title: string, concepts: ThumbnailConcept[], thumbnails?: GeneratedThumbnail[], nichePatterns?: NicheThumbnailReport | null) {
  try {
    const sess = await auth();
    const userId = sess.userId;
    if (!userId) return { ok: false as const, error: "You need to sign in first" };

    const user = await ensureUser(userId);

    const [project] = await db.insert(projects).values({
      userId: user.id,
      module: "thumbnail-maker",
      title,
      status: "completed",
    }).returning();

    await db.insert(contentOutputs).values({
      projectId: project.id,
      type: "thumbnail_brief",
      contentJson: { concepts, thumbnails, nichePatterns } as unknown as Record<string, unknown>,
      version: 1,
    });

    return { ok: true as const, data: project };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Save failed";
    console.error("Save thumbnail error:", msg);
    return { ok: false as const, error: msg.includes("ECONNREFUSED") || msg.includes("connection") ? "Database connection failed. Check SUPABASE_DATABASE_URL." : msg };
  }
}
