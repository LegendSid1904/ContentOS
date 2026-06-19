import { auth } from "@clerk/nextjs/server";
import { getAuthUrl } from "@/lib/canva";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL));
  }

  const state = Buffer.from(JSON.stringify({ userId })).toString("base64url");
  const url = getAuthUrl(state);

  return NextResponse.redirect(url);
}
