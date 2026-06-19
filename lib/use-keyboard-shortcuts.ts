"use client";

import { useEffect } from "react";

type Shortcut = {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  handler: () => void;
};

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      for (const s of shortcuts) {
        const metaMatch = s.meta ? (e.metaKey || e.ctrlKey) : true;
        const ctrlMatch = s.ctrl ? e.ctrlKey : true;
        const shiftMatch = s.shift ? e.shiftKey : true;
        const keyMatch = e.key.toLowerCase() === s.key.toLowerCase();

        if (metaMatch && ctrlMatch && shiftMatch && keyMatch) {
          e.preventDefault();
          s.handler();
          return;
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcuts]);
}
