"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { UserButton, useAuth, useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarNav } from "@/components/sidebar-nav";
import { Icons } from "@/components/icons";
import { APPS, MODULES, APP_MODULES } from "@/lib/constants";
import { getProfile } from "@/lib/actions";
import { useKeyboardShortcuts } from "@/lib/use-keyboard-shortcuts";

function kebabToLabel(id: string): string {
  return id
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getSidebarMode(pathname: string): "root" | "app" | "system" {
  if (pathname === "/dashboard") return "root";
  if (pathname.startsWith("/dashboard/app/")) return "app";
  if (pathname === "/dashboard/settings" || pathname === "/dashboard/brand-kit") return "system";
  const moduleIds = MODULES.map((m) => m.id);
  const topLevelModule = moduleIds.find((id) => pathname === `/dashboard/${id}` || pathname.startsWith(`/dashboard/${id}/`));
  if (topLevelModule) return "app";
  return "root";
}

function getActiveAppId(pathname: string): string | null {
  const match = pathname.match(/^\/dashboard\/app\/([^/]+)/);
  if (match) return match[1];
  for (const app of APPS) {
    for (const modId of app.modules) {
      if (pathname === `/dashboard/${modId}` || pathname.startsWith(`/dashboard/${modId}/`)) {
        return app.id;
      }
    }
  }
  return null;
}

const moduleNames: Record<string, string> = {};
const allAppModules = Object.values(APP_MODULES).flat();
for (const m of allAppModules) {
  if (!moduleNames[m.id]) moduleNames[m.id] = m.name;
}

const appNames: Record<string, string> = {};
for (const a of APPS) {
  appNames[a.id] = a.name;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const sidebarMode = getSidebarMode(pathname);
  const activeAppId = getActiveAppId(pathname);

  const goHome = useCallback(() => router.push("/dashboard"), [router]);
  useKeyboardShortcuts([
    { key: "k", meta: true, handler: goHome },
    { key: "Escape", handler: () => setSidebarOpen(false) },
  ]);

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

  const appMatch = pathname.match(/^\/dashboard\/app\/([^/]+)/);
  let breadcrumb = "Dashboard";
  if (sidebarMode === "root") {
    breadcrumb = "Dashboard";
  } else if (appMatch) {
    const appId = appMatch[1];
    const rest = pathname.replace(`/dashboard/app/${appId}`, "").replace(/^\//, "");
    const appName = appNames[appId] || kebabToLabel(appId);
    if (rest && moduleNames[rest]) {
      breadcrumb = `${appName} :: ${moduleNames[rest]}`;
    } else if (rest) {
      breadcrumb = `${appName} :: ${kebabToLabel(rest)}`;
    } else {
      breadcrumb = appName;
    }
  } else {
    const activeModule = Object.keys(moduleNames).find(
      (id) => pathname === `/dashboard/${id}` || pathname.startsWith(`/dashboard/${id}/`),
    );
    if (activeModule) breadcrumb = moduleNames[activeModule];
    else if (pathname.startsWith("/dashboard/")) {
      const fallback = pathname.replace("/dashboard/", "").split("/")[0];
      if (fallback) breadcrumb = kebabToLabel(fallback);
    }
  }

  return (
    <div className="flex min-h-dvh overflow-hidden bg-bg-void">
      {/* Animated backgrounds */}
      <div className="cyber-grid">
        <div className="cyber-grid-inner opacity-50" />
      </div>
      <div className="gradient-mesh opacity-60" />

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/70 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

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

        <SidebarNav onNav={() => setSidebarOpen(false)} mode={sidebarMode} activeAppId={activeAppId} />

        <div className="p-3 border-t border-white/[0.04] flex items-center gap-3 flex-shrink-0">
          {isSignedIn ? (
            <>
              <div className="[&_.cl-userButtonBox]:w-7 [&_.cl-userButtonBox]:h-7 [&_.cl-avatarBox]:w-7 [&_.cl-avatarBox]:h-7 flex-shrink-0">
                <UserButton />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[12px] text-tx-1 truncate leading-tight">
                  {username || user?.firstName || "Creator"}
                </div>
                <div className="font-mono text-[9px] text-tx-4 tracking-[0.12em] uppercase truncate">
                  {user?.emailAddresses[0]?.emailAddress || "creator"}
                </div>
              </div>
              <Link
                href="/dashboard/settings"
                className="font-mono text-[9px] text-vi-400/60 hover:text-vi-400 tracking-[0.1em] uppercase flex-shrink-0 transition-colors"
              >
                [settings]
              </Link>
            </>
          ) : (
            <div className="space-y-2 w-full">
              <div className="font-mono text-[10px] text-tx-3 tracking-[0.12em] uppercase text-center py-1 border border-white/[0.06] rounded-[2px]">
                STATUS: PREVIEW — <Link href="/sign-in" className="text-vi-400/80 hover:text-vi-300 underline">[sign in]</Link>
              </div>
              <Link
                href="/sign-in"
                className="block font-mono text-[11px] text-vi-400 tracking-[0.12em] uppercase border border-vi-500/20 px-3 py-1.5 rounded-[2px] hover:bg-vi-500/10 transition-colors duration-150 w-full text-center"
              >
                {">>"} sign in
              </Link>
            </div>
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
            <span className="font-mono text-[11px] text-tx-3 uppercase tracking-[0.15em] truncate flex items-center gap-2">
              <span className="text-te-400">[</span>
              <span>{breadcrumb}</span>
              <span className="text-te-400">]</span>
            </span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/dashboard" className="hidden md:flex items-center gap-1.5 group cursor-pointer">
              <span className="font-display text-[13px] font-bold text-tx-3 tracking-tight group-hover:text-te-400 transition-colors duration-200">ContentOS</span>
              <span className="font-mono text-[9px] text-tx-4 tracking-[0.15em] uppercase">[home]</span>
            </Link>
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-vi-400 tracking-[0.15em] uppercase border border-vi-500/15 bg-vi-500/10 px-2.5 h-[22px] rounded-full">
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
