import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateProfileName } from "@/lib/actions";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const profile = await db.select().from(users).where(eq(users.clerkId, userId)).then((r) => r[0]);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <p className="sec-eyebrow">
          <span className="sec-eyebrow-dot" />
          System :: Settings
        </p>
        <h1 className="sec-title !text-[28px]">Account Settings</h1>
        <p className="sec-desc !text-[13px]">Manage your profile and preferences</p>
      </div>

      <form action={updateProfileName} className="terminal-frame p-6 space-y-5">
        <div className="flex items-center gap-4 pb-5 border-b border-white/[0.04]">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-vi-500 to-te-400 flex items-center justify-center text-white font-display text-[22px] font-bold shadow-[0_0_20px_rgba(139,92,246,0.2)]">
            {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <div className="font-medium text-[15px]">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-[13px] text-tx-2">
              {user?.emailAddresses[0]?.emailAddress}
            </div>
            <div className="font-mono text-[10px] text-tx-3 mt-1 tracking-wider uppercase">
              Plan: {profile?.plan || "Free"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="terminal-label block mb-2">First Name</label>
            <input
              name="firstName"
              defaultValue={user?.firstName || ""}
              className="terminal-input w-full h-[40px] px-3"
            />
          </div>
          <div>
            <label className="terminal-label block mb-2">Last Name</label>
            <input
              name="lastName"
              defaultValue={user?.lastName || ""}
              className="terminal-input w-full h-[40px] px-3"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="terminal-label block mb-2">Email</label>
            <input
              defaultValue={user?.emailAddresses[0]?.emailAddress || ""}
              disabled
              className="terminal-input w-full h-[40px] px-3 text-tx-2/60 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="pt-2">
          <button type="submit" className="btn btn-primary btn-md">Save Changes</button>
        </div>
      </form>

      <div className="terminal-frame p-6 space-y-4">
        <h2 className="font-display text-[16px] font-semibold tracking-tight">Plan &amp; Billing</h2>
        <div className="flex items-center justify-between py-3 px-4 bg-black/30 rounded-r6 border border-white/[0.04]">
          <div>
            <div className="text-[14px] font-medium">Current Plan</div>
            <div className="font-mono text-[11px] text-tx-2 mt-0.5">{profile?.plan || "Free"} — {profile?.plan === "Free" ? "5 scripts/month" : "Unlimited"}</div>
          </div>
          <span className={`badge ${profile?.plan === "Free" ? "badge-te" : "badge-vi"}`}>
            {profile?.plan || "Free"}
          </span>
        </div>
        {profile?.plan === "Free" && (
          <button className="btn btn-primary btn-md w-full bg-gradient-to-r from-vi-600 to-te-500 hover:from-vi-500 hover:to-te-400 border-0">
            Upgrade to Creator — ₹1,999/mo
          </button>
        )}
      </div>
    </div>
  );
}
