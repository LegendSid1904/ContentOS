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
    <div className="max-w-2xl space-y-6 relative z-10">
      <div>
        <p className="sec-eyebrow">
          <span className="sec-eyebrow-dot" />
          System :: Settings
        </p>
        <h1 className="sec-title !text-[28px]">Account Settings</h1>
        <p className="sec-desc !text-[13px]">Manage your profile and system preferences</p>
      </div>

      <div className="crt-monitor relative crt-brackets">
        <div className="crt-scanlines" />
        <div className="crt-grain" />
        <div className="crt-vignette" />
        <div className="crt-sweep" />

        <div className="crt-micro-tl">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-te-400/60">sys</span>
          <span className="text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase">settings</span>
        </div>
        <div className="crt-micro-tr">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">v1.0.4</span>
          <span className="text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-te-400/60">online</span>
        </div>

        <div className="crt-monitor-header">
          <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-tx-4">SYS</span>
          <span className="font-mono text-[6px] text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-te-400/70">USER PROFILE</span>
          <div className="flex-1" />
          <span className="font-mono text-[7px] tracking-[0.1em] text-tx-4">{"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
        </div>

        <div className="crt-monitor-content p-6">
          <form action={updateProfileName} className="space-y-6">
            <div className="flex items-center gap-4 pb-5 border-b border-white/[0.04]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-vi-500 to-te-400 flex items-center justify-center text-white font-display text-[22px] font-bold shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <div className="font-medium text-[15px]">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="font-mono text-[11px] text-tx-2 mt-0.5 flex items-center gap-2">
                  <span>{user?.emailAddresses[0]?.emailAddress}</span>
                  <span className="diag-badge diag-info">VERIFIED</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="diag-badge diag-ok">{profile?.plan || "FREE"}</span>
                  <span className="font-mono text-[8px] text-tx-4 tracking-wider uppercase">plan</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="term-label mb-2">FIRST_NAME</label>
                <input
                  name="firstName"
                  defaultValue={user?.firstName || ""}
                  className="term-field"
                />
              </div>
              <div>
                <label className="term-label mb-2">LAST_NAME</label>
                <input
                  name="lastName"
                  defaultValue={user?.lastName || ""}
                  className="term-field"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="term-label mb-2">EMAIL</label>
                <input
                  defaultValue={user?.emailAddresses[0]?.emailAddress || ""}
                  disabled
                  className="term-field text-tx-2/60 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-1">
              <button type="submit" className="btn-terminal btn-terminal-primary">
                EXECUTE :: SAVE_CHANGES
              </button>
            </div>
          </form>
        </div>

        <div className="crt-micro-bl">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">profile</span>
        </div>
        <div className="crt-micro-br">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">editable</span>
        </div>

        <div className="crt-monitor-footer">
          <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-tx-4">
            {user?.firstName || "USER"}
          </span>
          <span className="font-mono text-[6px] text-center text-tx-4">[system ready]</span>
          <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-tx-4">
            {profile?.plan || "FREE"}
          </span>
        </div>
      </div>

      <div className="crt-monitor relative crt-brackets">
        <div className="crt-scanlines" />
        <div className="crt-grain" />
        <div className="crt-vignette" />
        <div className="crt-sweep" />

        <div className="crt-micro-tl">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-te-400/60">sys</span>
          <span className="text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase">billing</span>
        </div>
        <div className="crt-micro-tr">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">plan</span>
          <span className="text-tx-4">|</span>
          <span className={`font-mono text-[7px] tracking-[0.18em] uppercase ${profile?.plan === "Free" ? "text-warn" : "text-ok"}`}>
            {profile?.plan || "FREE"}
          </span>
        </div>

        <div className="crt-monitor-header">
          <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-tx-4">SYS</span>
          <span className="font-mono text-[6px] text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-te-400/70">PLAN STATUS</span>
          <div className="flex-1" />
          <span className="font-mono text-[7px] tracking-[0.1em] text-tx-4">{"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
        </div>

        <div className="crt-monitor-content p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="text-te-400/60">{'\u203A\u203A'}</span>
              <span className="text-tx-3 tracking-wider uppercase text-[9px]">current_plan</span>
            </div>
            <div className="flex items-center justify-between py-3 px-4 bg-black/30 border border-white/[0.04] rounded-[2px]">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${profile?.plan === "Free" ? "bg-warn" : "bg-ok"} animate-beat-pulse`} />
                <div>
                  <div className="font-mono text-[13px] text-tx-1 font-medium">{profile?.plan || "Free"}</div>
                  <div className="font-mono text-[9px] text-tx-3 mt-0.5">
                    {profile?.plan === "Free" ? "5 scripts/month \u00B7 basic access" : "Unlimited scripts \u00B7 full access"}
                  </div>
                </div>
              </div>
              <span className={`diag-badge ${profile?.plan === "Free" ? "diag-info" : "diag-ok"}`}>
                {profile?.plan === "Free" ? "LIMITED" : "UNLIMITED"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="text-te-400/60">{'\u203A\u203A'}</span>
              <span className="text-tx-3 tracking-wider uppercase text-[9px]">usage</span>
            </div>
            <div className="flex items-center justify-between py-3 px-4 bg-black/30 border border-white/[0.04] rounded-[2px]">
              <div className="flex items-center gap-2 font-mono text-[11px] text-tx-2">
                <span className="text-te-400/60">\u25B6</span>
                Scripts this month
              </div>
              <span className="font-mono text-[11px] text-tx-1">
                {profile?.plan === "Free" ? "0 / 5" : "Unlimited"}
              </span>
            </div>
          </div>

          {profile?.plan === "Free" && (
            <div className="pt-2 border-t border-white/[0.04]">
              <form action={updateProfileName}>
                <button
                  className="btn-terminal btn-terminal-primary w-full justify-center text-[10px]"
                  style={{
                    background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(34,211,238,0.08))",
                    borderColor: "rgba(139,92,246,0.2)",
                  }}
                >
                  {"EXEC_UPGRADE >> CREATOR :: \u20B91,999/mo"}
                </button>
              </form>
              <p className="font-mono text-[8px] text-tx-4 text-center mt-2 tracking-wider">
                unlimited scripts \u00B7 priority support \u00B7 full module access
              </p>
            </div>
          )}
        </div>

        <div className="crt-micro-bl">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">billing</span>
        </div>
        <div className="crt-micro-br">
          <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">active</span>
        </div>

        <div className="crt-monitor-footer">
          <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-tx-4">
            {profile?.plan || "FREE"} PLAN
          </span>
          <span className="font-mono text-[6px] text-center text-tx-4">[billing ready]</span>
          <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-tx-4">
            ACTIVE
          </span>
        </div>
      </div>
    </div>
  );
}
