"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/drizzle";
import { users, projects, contentOutputs } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { ensureUser } from "@/lib/ensure-user";

export interface PipelineLink {
  moduleId: string;
  label: string;
  icon: string;
  data: Record<string, string>;
}

export interface SavedProject {
  id: string;
  module: string;
  title: string;
  status: string;
  createdAt: Date;
  outputType: string;
  outputPreview: Record<string, unknown> | null;
}

export const PIPELINE_CONNECTIONS: Record<string, PipelineLink[]> = {
  "content-ideas": [
    { moduleId: "script-writer", label: "Write Script", icon: "⌨", data: {} },
    { moduleId: "carousel-maker", label: "Make Carousel", icon: "▣", data: {} },
    { moduleId: "thumbnail-maker", label: "Make Thumbnail", icon: "▤", data: {} },
  ],
  "script-writer": [
    { moduleId: "video-brief", label: "Create Editing Brief", icon: "▷", data: {} },
    { moduleId: "thumbnail-maker", label: "Make Thumbnail", icon: "▤", data: {} },
  ],
  "competitor-intel": [
    { moduleId: "content-ideas", label: "Generate Ideas", icon: "◈", data: {} },
    { moduleId: "thumbnail-maker", label: "Research Thumbnails", icon: "▤", data: {} },
    { moduleId: "growth-strategy", label: "Build Strategy", icon: "↗", data: {} },
    { moduleId: "page-setup", label: "Optimize Profile", icon: "⌘", data: {} },
  ],
  "carousel-maker": [
    { moduleId: "thumbnail-maker", label: "Make Thumbnail", icon: "▤", data: {} },
  ],
  "video-brief": [
    { moduleId: "thumbnail-maker", label: "Make Thumbnail", icon: "▤", data: {} },
  ],
  "thumbnail-maker": [],
  "page-setup": [
    { moduleId: "growth-strategy", label: "Build Strategy", icon: "↗", data: {} },
  ],
  "growth-strategy": [
    { moduleId: "content-ideas", label: "Plan Content", icon: "◈", data: {} },
  ],
};

export async function getPipelineTargets(sourceModule: string, sourceData?: Record<string, string>): Promise<PipelineLink[]> {
  const links = PIPELINE_CONNECTIONS[sourceModule] ?? [];
  if (sourceData) {
    return links.map(link => ({
      ...link,
      data: { sourceModule, ...sourceData, ...link.data },
    }));
  }
  return links;
}

export async function savePipelineProject(sourceProjectId: string, targetModule: string, title: string, contentJson: Record<string, unknown>) {
  const sess = await auth();
  const userId = sess.userId;
  if (!userId) return { ok: false as const, error: "Sign in required" };

  const user = await ensureUser(userId);

  const [project] = await db.insert(projects).values({
    userId: user.id,
    module: targetModule,
    title,
    status: "completed",
  }).returning();

  await db.insert(contentOutputs).values({
    projectId: project.id,
    type: `${targetModule.replace(/-/g, "_")}_pipeline`,
    contentJson: { ...contentJson, sourceProjectId },
    version: 1,
  });

  return { ok: true as const, data: project };
}

export async function getSavedProjects(moduleFilter?: string): Promise<SavedProject[]> {
  const sess = await auth();
  const userId = sess.userId;
  if (!userId) return [];

  const user = await ensureUser(userId);

  const conditions = [eq(projects.userId, user.id)];
  if (moduleFilter) {
    conditions.push(eq(projects.module, moduleFilter));
  }

  const projectRows = await db
    .select()
    .from(projects)
    .where(and(...conditions))
    .orderBy(desc(projects.createdAt))
    .limit(50);

  const projectIds = projectRows.map((p) => p.id);
  const allOutputs = projectIds.length > 0
    ? await db.select().from(contentOutputs).where(sql`${contentOutputs.projectId} = ANY(${projectIds})`)
    : [];
  const latestOutput = new Map(allOutputs.map((o) => [o.projectId, o]));

  const saved: SavedProject[] = projectRows.map((p) => {
    const output = latestOutput.get(p.id);
    return {
      id: p.id,
      module: p.module,
      title: p.title,
      status: p.status,
      createdAt: p.createdAt,
      outputType: output?.type ?? "",
      outputPreview: (output?.contentJson ?? null) as Record<string, unknown> | null,
    };
  });

  return saved;
}

export async function deleteProject(projectId: string) {
  const sess = await auth();
  const userId = sess.userId;
  if (!userId) return { ok: false as const, error: "Sign in required" };

  const user = await ensureUser(userId);

  const project = await db.select().from(projects).where(eq(projects.id, projectId)).then(r => r[0]);
  if (!project || project.userId !== user.id) return { ok: false as const, error: "Project not found" };

  await db.delete(contentOutputs).where(eq(contentOutputs.projectId, projectId));
  await db.delete(projects).where(eq(projects.id, projectId));
  return { ok: true as const };
}

export async function getBrandKitData() {
  const sess = await auth();
  const userId = sess.userId;
  if (!userId) return null;

  const user = await ensureUser(userId);

  const { brandKits, profiles } = await import("@/db/schema");
  const kit = await db.select().from(brandKits).where(eq(brandKits.userId, user.id)).then(r => r[0] ?? null);
  const profile = await db.select().from(profiles).where(eq(profiles.userId, user.id)).then(r => r[0] ?? null);
  const cd = profile?.contentDefaults as Record<string, string> | null ?? {};

  return {
    niche: kit?.niche ?? cd.niche ?? "",
    tone: kit?.tone ?? cd.defaultTone ?? "",
    colors: kit?.colors ?? [],
    platforms: kit?.platforms ?? [],
    defaultPlatform: cd.defaultPlatform ?? "",
    defaultFormat: cd.defaultFormat ?? "",
  };
}
