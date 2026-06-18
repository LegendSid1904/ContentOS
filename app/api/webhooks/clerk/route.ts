import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!WEBHOOK_SECRET) {
    return new Response("No webhook secret", { status: 500 });
  }

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const { Webhook } = await import("svix");
  const wh = new Webhook(WEBHOOK_SECRET);

  try {
    const payload = await req.clone().json();
    const body = JSON.stringify(payload);
    const evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;

    if (evt.type === "user.created") {
      const { id, email_addresses, first_name, last_name } = evt.data;
      await db.insert(users).values({
        clerkId: id,
        email: email_addresses[0]?.email_address ?? "",
        name: [first_name, last_name].filter(Boolean).join(" "),
      }).onConflictDoNothing();
    }

    if (evt.type === "user.updated") {
      const { id, email_addresses, first_name, last_name } = evt.data;
      await db.update(users)
        .set({
          email: email_addresses[0]?.email_address ?? "",
          name: [first_name, last_name].filter(Boolean).join(" "),
        })
        .where(eq(users.clerkId, id));
    }

    if (evt.type === "user.deleted") {
      const { id } = evt.data;
      if (id) {
        await db.delete(users).where(eq(users.clerkId, id));
      }
    }
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  return new Response("OK", { status: 200 });
}
