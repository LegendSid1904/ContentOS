"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MODULES } from "@/lib/constants";
import { Icons } from "@/components/icons";

const iconMap: Record<string, string> = {
  "script-writer": "script",
  "content-ideas": "ideas",
  "carousel-maker": "carousel",
  "competitor-intel": "competitor",
  "video-brief": "video",
  "thumbnail-maker": "thumbnail",
  "page-setup": "setup",
  "growth-strategy": "growth",
};

const utilityLinks = [
  { id: "brand-kit", name: "Brand Kit", icon: "brand" as const },
  { id: "settings", name: "Settings", icon: "settings" as const },
];

export function SidebarNav({ onNav }: { onNav?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
      {/* Section header — like shakanksh game panels */}
      <div className="px-3 py-2 font-mono text-[8px] text-tx-3 tracking-[0.2em] uppercase border-b border-white/[0.04] mb-2">
        [Modules]
      </div>

      {MODULES.map((mod) => {
        const iconKey = iconMap[mod.id] || "script";
        const Icon = Icons[iconKey] || Icons.script;
        const isActive = pathname === `/dashboard/${mod.id}` ||
          pathname.startsWith(`/dashboard/${mod.id}/`);

        return (
          <Link
            key={mod.id}
            href={`/dashboard/${mod.id}`}
            onClick={onNav}
            className={cn(
              "sidebar-link",
              isActive && "active",
            )}
          >
            <Icon className="w-[14px] h-[14px] flex-shrink-0" />
            <span className="truncate">{mod.name}</span>
          </Link>
        );
      })}

      <div className="h-px bg-white/[0.04] my-3" />

      {/* Section header */}
      <div className="px-3 py-2 font-mono text-[8px] text-tx-3 tracking-[0.2em] uppercase border-b border-white/[0.04] mb-2">
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
