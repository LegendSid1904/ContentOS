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
import { List, CaretLeft } from "@phosphor-icons/react";

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
      breadcrumb = `${appName} / ${moduleNames[rest]}`;
    } else if (rest) {
      breadcrumb = `${appName} / ${kebabToLabel(rest)}`;
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
        <div className="cyber-grid-inner opacity-30" />
      </div>
      <div className="gradient-mesh opacity-40" />

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
            <span className="font-mono text-[14px] font-bold text-tx-1 tracking-[0.05em] group-hover:text-te-400 transition-colors duration-200">ContentOS</span>
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
                <div className="font-mono text-[12px] font-medium text-tx-1 truncate leading-tight tracking-[0.03em]">
                  {username || user?.firstName || "Creator"}
                </div>
                <div className="font-mono text-[10px] text-tx-4 truncate">
                  {user?.emailAddresses[0]?.emailAddress || ""}
                </div>
              </div>
              <Link
                href="/dashboard/settings"
                className="font-mono text-[10px] text-tx-4 hover:text-vi-400 transition-colors flex-shrink-0 uppercase tracking-[0.08em]"
              >
                Settings
              </Link>
            </>
          ) : (
            <div className="space-y-2 w-full">
              <div className="font-mono text-[11px] text-tx-4 text-center py-1.5 border border-white/[0.06] uppercase tracking-[0.08em]">
                Preview mode
              </div>
              <Link
                href="/sign-in"
                className="block font-mono text-[12px] font-medium text-vi-400 border border-vi-500/20 px-3 py-1.5 hover:bg-vi-500/10 transition-colors duration-150 w-full text-center uppercase tracking-[0.08em]"
              >
                Sign in
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
              <List className="w-[18px] h-[18px]" />
            </button>
            <span className="font-mono text-[13px] font-medium text-tx-2 truncate flex items-center gap-2">
              <CaretLeft className="w-3.5 h-3.5 text-tx-4 hidden md:block flex-shrink-0" />
              <span>{breadcrumb}</span>
            </span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/dashboard" className="hidden md:flex items-center gap-1.5 group cursor-pointer">
              <span className="font-mono text-[12px] font-medium text-tx-3 group-hover:text-te-400 transition-colors duration-200 tracking-[0.05em]">ContentOS</span>
              <span className="font-mono text-[10px] text-tx-4 uppercase tracking-[0.08em]">Home</span>
            </Link>
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-te-400 border border-te-400/15 bg-te-400/10 px-2.5 h-[22px] rounded-r3">
              <span className="w-1.5 h-1.5 rounded-full bg-te-400 animate-beat-pulse" />
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
