import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function ensureUser(clerkId: string) {
  const existing = await db.select().from(users).where(eq(users.clerkId, clerkId)).then((r) => r[0]);
  if (existing) return existing;

  const clerkUser = await currentUser();
  const [created] = await db.insert(users).values({
    clerkId,
    email: clerkUser?.emailAddresses[0]?.emailAddress ?? "",
    name: clerkUser ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") : null,
  }).returning();

  return created;
}
