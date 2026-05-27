"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/drizzle";
import { users, brandKits } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateProfileName(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  await db
    .update(users)
    .set({ name: [firstName, lastName].filter(Boolean).join(" "), updatedAt: new Date() })
    .where(eq(users.clerkId, userId));

  revalidatePath("/dashboard/settings");
}

export async function saveBrandKit(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.select().from(users).where(eq(users.clerkId, userId)).then((r) => r[0]);
  if (!user) throw new Error("User not found");

  const niche = formData.get("niche") as string;
  const tone = formData.get("tone") as string;
  const colors = JSON.parse(formData.get("colors") as string) as string[];
  const platforms = JSON.parse(formData.get("platforms") as string) as string[];

  const existing = await db.select().from(brandKits).where(eq(brandKits.userId, user.id)).then((r) => r[0]);

  if (existing) {
    await db
      .update(brandKits)
      .set({ niche, tone, colors, platforms, updatedAt: new Date() })
      .where(eq(brandKits.id, existing.id));
  } else {
    await db.insert(brandKits).values({ userId: user.id, niche, tone, colors, platforms });
  }

  revalidatePath("/dashboard/brand-kit");
}

export async function getBrandKit() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.select().from(users).where(eq(users.clerkId, userId)).then((r) => r[0]);
  if (!user) return null;

  const kit = await db.select().from(brandKits).where(eq(brandKits.userId, user.id)).then((r) => r[0]);
  return kit || null;
}

export async function completeOnboardingStep(step: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db
    .update(users)
    .set({ onboardingStep: step, updatedAt: new Date() })
    .where(eq(users.clerkId, userId));

  revalidatePath("/onboarding");
}

export async function finishOnboarding() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db
    .update(users)
    .set({ onboardingComplete: true, onboardingStep: null, updatedAt: new Date() })
    .where(eq(users.clerkId, userId));

  revalidatePath("/dashboard");
}

export async function getOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.select().from(users).where(eq(users.clerkId, userId)).then((r) => r[0]);
  if (!user) return null;

  return {
    onboardingComplete: user.onboardingComplete,
    onboardingStep: user.onboardingStep,
  };
}
