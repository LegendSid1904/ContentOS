"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APPS, MODULES, APP_MODULES } from "@/lib/constants";
import { Icons } from "@/components/icons";

const modIconMap: Record<string, string> = {
  "script-writer": "script",
  "content-ideas": "ideas",
  "carousel-maker": "carousel",
  "competitor-intel": "competitor",
  "video-brief": "video",
  "thumbnail-maker": "thumbnail",
  "page-setup": "setup",
  "growth-strategy": "growth",
};

const appIcons: Record<string, string> = {
  youtube: "▶",
  instagram: "◎",
  tiktok: "◈",
  linkedin: "⌘",
};

const utilityLinks = [
  { id: "brand-kit", name: "Brand Kit", icon: "brand" as const },
  { id: "settings", name: "Settings", icon: "settings" as const },
];

function getActiveModule(pathname: string, activeAppId: string | null): string | null {
  if (activeAppId) {
    const parts = pathname.split("/");
    const last = parts[parts.length - 1];
    const appModules = MODULES.filter((m) =>
      (APPS.find((a) => a.id === activeAppId)?.modules as readonly string[]).includes(m.id),
    );
    if (appModules.some((m) => m.id === last)) return last;
  }
  for (const mod of MODULES) {
    if (pathname === `/dashboard/${mod.id}` || pathname.startsWith(`/dashboard/${mod.id}/`)) {
      return mod.id;
    }
  }
  return null;
}

export function SidebarNav({
  onNav,
  mode = "root",
  activeAppId = null,
}: {
  onNav?: () => void;
  mode?: "root" | "app" | "system";
  activeAppId?: string | null;
}) {
  const pathname = usePathname();
  const activeModule = getActiveModule(pathname, activeAppId);

  const sectionClass = "px-3 py-2 font-mono text-[10px] text-tx-3 tracking-[0.2em] uppercase border-b border-white/[0.04] mb-2";

  if (mode === "app" && activeAppId) {
    const app = APPS.find((a) => a.id === activeAppId);
    const appModules = APP_MODULES[activeAppId];

    return (
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        <Link
          href="/dashboard"
          onClick={onNav}
          className="sidebar-link text-te-400/80 hover:text-te-400 mb-2"
        >
          <span className="text-[13px] mr-1">↤</span>
          <span className="truncate">platforms</span>
        </Link>

        <div className={sectionClass}>
          [{app?.name.toLowerCase()}]
        </div>

        {appModules?.map((mod) => {
          const iconKey = modIconMap[mod.id] || "script";
          const Icon = Icons[iconKey] || Icons.script;
          const isModActive = activeModule === mod.id;

          return (
            <Link
              key={mod.id}
              href={`/dashboard/app/${activeAppId}/${mod.id}`}
              onClick={onNav}
              className={cn(
                "sidebar-link",
                isModActive && "active",
              )}
            >
              <Icon className="w-[14px] h-[14px] flex-shrink-0" />
              <span className="truncate">{mod.name}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  if (mode === "system") {
    return (
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        <Link
          href="/dashboard"
          onClick={onNav}
          className="sidebar-link text-te-400/80 hover:text-te-400 mb-2"
        >
          <span className="text-[13px] mr-1">↤</span>
          <span className="truncate">platforms</span>
        </Link>

        <div className={sectionClass}>
          [System]
        </div>

        {utilityLinks.map((link) => {
          const Icon = Icons[link.icon];
          const isActive = pathname === `/dashboard/${link.id}`;

          return (
            <Link
              key={link.id}
              href={`/dashboard/${link.id}`}
              onClick={onNav}
              className={cn(
                "sidebar-link",
                isActive && "active",
              )}
            >
              <Icon className="w-[14px] h-[14px] flex-shrink-0" />
              <span className="truncate">{link.name}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
      <div className={sectionClass}>
        [Apps]
      </div>

      {APPS.map((app) => {
        const appModuleCount = APP_MODULES[app.id]?.length ?? 0;

        return (
          <Link
            key={app.id}
            href={`/dashboard/app/${app.id}`}
            onClick={onNav}
            className={cn(
              "sidebar-link",
              pathname === `/dashboard/app/${app.id}` && "active",
            )}
          >
            <span className="font-mono text-[13px] flex-shrink-0">{appIcons[app.id] || "□"}</span>
            <span className="truncate">{app.name}</span>
            <span className="font-mono text-[9px] text-tx-4 tracking-[0.1em] ml-auto">
              {appModuleCount}
            </span>
          </Link>
        );
      })}

      <div className="h-px bg-white/[0.04] my-3" />

      <div className={sectionClass}>
        [System]
      </div>

      {utilityLinks.map((link) => {
        const Icon = Icons[link.icon];
        const isActive = pathname === `/dashboard/${link.id}`;

        return (
          <Link
            key={link.id}
            href={`/dashboard/${link.id}`}
            onClick={onNav}
            className={cn(
              "sidebar-link",
              isActive && "active",
            )}
          >
            <Icon className="w-[14px] h-[14px] flex-shrink-0" />
            <span className="truncate">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
