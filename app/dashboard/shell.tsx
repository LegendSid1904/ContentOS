"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserButton, useAuth, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarNav } from "@/components/sidebar-nav";
import { Icons } from "@/components/icons";
import { MODULES } from "@/lib/constants";
import { getProfile } from "@/lib/actions";

const moduleNames: Record<string, string> = {};
for (const m of MODULES) {
  moduleNames[m.id] = m.name;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("");
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const il = document.getElementById("instant-loader");
    if (il) il.classList.add("hidden");
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    getProfile().then((data) => {
      if (data?.profile?.username) setUsername(data.profile.username);
    });
  }, [isSignedIn]);

  const activeModule = Object.keys(moduleNames).find(
    (id) => pathname === `/dashboard/${id}` || pathname.startsWith(`/dashboard/${id}/`),
  );
  const breadcrumb = activeModule ? moduleNames[activeModule] : "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-bg-void">
      {/* Animated backgrounds */}
      <div className="cyber-grid">
        <div className="cyber-grid-inner opacity-50" />
      </div>
      <div className="gradient-mesh opacity-60" />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "sidebar-glass w-[240px] flex-shrink-0 flex flex-col transition-transform duration-300 z-40",
          "md:static md:translate-x-0",
          "fixed inset-y-0 left-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="px-4 h-[56px] flex items-center flex-shrink-0 border-b border-white/[0.04]">
          <Link href="/dashboard" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-7 h-7 rounded-[7px] bg-gradient-to-br from-vi-500 to-te-400 flex items-center justify-center font-display text-[13px] font-bold text-white shadow-[0_0_16px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_24px_rgba(139,92,246,0.5)] transition-shadow duration-200">
              C
            </div>
            <span className="font-display text-[15px] font-bold text-tx-1 tracking-tight group-hover:text-te-400 transition-colors duration-200">ContentOS</span>
          </Link>
        </div>

        <SidebarNav onNav={() => setSidebarOpen(false)} />

        <div className="p-3 border-t border-white/[0.04] flex items-center gap-3 flex-shrink-0">
          {isSignedIn ? (
            <>
              <div className="[&_.cl-userButtonBox]:w-7 [&_.cl-userButtonBox]:h-7 [&_.cl-avatarBox]:w-7 [&_.cl-avatarBox]:h-7 flex-shrink-0">
                <UserButton />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[10px] text-tx-1 truncate leading-tight">
                  {username || user?.firstName || "Creator"}
                </div>
                <div className="font-mono text-[7px] text-tx-4 tracking-[0.12em] uppercase truncate">
                  {user?.emailAddresses[0]?.emailAddress || "creator"}
                </div>
              </div>
              <Link
                href="/dashboard/settings"
                className="font-mono text-[7px] text-vi-400/60 hover:text-vi-400 tracking-[0.1em] uppercase flex-shrink-0 transition-colors"
              >
                [settings]
              </Link>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="font-mono text-[9px] text-vi-400 tracking-[0.12em] uppercase border border-vi-500/20 px-3 py-1.5 rounded-[2px] hover:bg-vi-500/10 transition-all duration-150 w-full text-center"
            >
              {">>"} sign in
            </Link>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top bar */}
        <header className="h-[56px] flex-shrink-0 border-b border-white/[0.04] bg-black/30 backdrop-blur-xl flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-r3 text-tx-2 hover:bg-white/[0.04] hover:text-tx-1 transition-all md:hidden flex-shrink-0"
              onClick={() => setSidebarOpen(true)}
            >
              <Icons.menu className="w-[18px] h-[18px]" />
            </button>
            <span className="font-mono text-[9px] text-tx-3 uppercase tracking-[0.15em] truncate flex items-center gap-2">
              <span className="text-te-400">[</span>
              <span>{breadcrumb}</span>
              <span className="text-te-400">]</span>
            </span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="flex items-center gap-1.5 font-mono text-[9px] text-vi-400 tracking-[0.15em] uppercase border border-vi-500/15 bg-vi-500/10 px-2.5 h-[22px] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-vi-400 animate-beat-pulse" />
              AI Ready
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="wrapper">{children}</div>
        </main>
      </div>
    </div>
  );
}
