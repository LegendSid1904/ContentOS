"use server";

import { auth } from "@clerk/nextjs/server";
import { generateJSON } from "@/lib/ai";
import { db } from "@/lib/drizzle";
import { users, projects, contentOutputs } from "@/db/schema";
import { eq } from "drizzle-orm";

interface EditPoint {
  timestamp: string;
  type: "hook" | "key_point" | "transition" | "cta";
  description: string;
}

interface BrollKeyword {
  timestamp: string;
  keywords: string[];
}

interface VideoAnalysis {
  hook_moment: string;
  edit_points: EditPoint[];
  retention_markers: string[];
  section_breaks: { timestamp: string; label: string }[];
  pacing_suggestion: string;
}

interface EditingBrief {
  analysis: VideoAnalysis;
  broll_keywords: BrollKeyword[];
  caption_style: string;
  caption_examples: string[];
}

export async function analyzeTranscript(transcript: string, videoLength: "short" | "long", style: string) {
  try {
    const result = await generateJSON<EditingBrief>({
      systemPrompt: `You are a video editor. Analyze the transcript and identify: hook_moment (string), edit_points (array of {timestamp, type: "hook"|"key_point"|"transition"|"cta", description}), retention_markers (array of strings), section_breaks (array of {timestamp, label}), pacing_suggestion (string). Also generate broll_keywords (array of {timestamp, keywords[]}) for stock footage searches, caption_style (string), and 3 caption_examples. Return as JSON.`,
      prompt: `Transcript: "${transcript}". Video length: ${videoLength === "short" ? "Short-form (<90s)" : "Long-form (>8min)"}. Style: ${style || "Standard"}.`,
    });
    return { ok: true as const, data: result };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Analysis failed" };
  }
}

export async function saveEditingBrief(title: string, brief: EditingBrief) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.select().from(users).where(eq(users.clerkId, userId)).then((r) => r[0]);
    if (!user) throw new Error("User not found");

    const [project] = await db.insert(projects).values({
      userId: user.id,
      module: "video-brief",
      title,
      status: "completed",
    }).returning();

    await db.insert(contentOutputs).values({
      projectId: project.id,
      type: "editing_brief",
      contentJson: brief as unknown as Record<string, unknown>,
      version: 1,
    });

    return { ok: true as const, data: project };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Save failed" };
  }
}
