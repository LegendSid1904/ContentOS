import { exchangeCode } from "@/lib/canva";
import { db } from "@/lib/drizzle";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const errorParam = req.nextUrl.searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      new URL("/dashboard?canva=error&reason=" + errorParam, process.env.NEXT_PUBLIC_APP_URL)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/dashboard?canva=error&reason=missing_params", process.env.NEXT_PUBLIC_APP_URL)
    );
  }

  try {
    const stateData = JSON.parse(Buffer.from(state, "base64url").toString());
    const tokenUserId = stateData.userId as string;

    const token = await exchangeCode(code);

    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, tokenUserId))
      .then((r) => r[0]);

    await db
      .update(profiles)
      .set({
        contentDefaults: {
          ...(profile?.contentDefaults ?? {}),
          canvaToken: {
            accessToken: token.accessToken,
            refreshToken: token.refreshToken,
            expiresAt: token.expiresAt,
          },
        },
      })
      .where(eq(profiles.userId, tokenUserId));

    return NextResponse.redirect(
      new URL("/dashboard?canva=connected", process.env.NEXT_PUBLIC_APP_URL)
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Callback failed";
    return NextResponse.redirect(
      new URL(`/dashboard?canva=error&reason=${encodeURIComponent(msg)}`, process.env.NEXT_PUBLIC_APP_URL)
    );
  }
}
