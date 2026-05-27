import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DashboardShell } from "./shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.select().from(users).where(eq(users.clerkId, userId)).then((r) => r[0]);

  if (user && !user.onboardingComplete) {
    redirect("/onboarding?step=1");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
