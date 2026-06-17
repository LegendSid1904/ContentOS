"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

const STORAGE_KEY = "preview_free_actions";

function getFreeActionsUsed(): number {
  if (typeof window === "undefined") return 0;
  try {
    const val = sessionStorage.getItem(STORAGE_KEY);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

function setFreeActionsUsed(count: number) {
  try {
    sessionStorage.setItem(STORAGE_KEY, String(count));
  } catch {}
}

interface PreviewState {
  [key: string]: unknown;
}

export function useAuthGate(context?: string) {
  const { isSignedIn } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [freeCount, setFreeCount] = useState(getFreeActionsUsed());
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      setFreeCount(99);
      setFreeActionsUsed(99);
    }
  }, [isSignedIn]);

  const gate = useCallback(
    (action: () => void) => {
      if (isSignedIn) {
        action();
        return;
      }

      if (freeCount < 1) {
        const next = freeCount + 1;
        setFreeCount(next);
        setFreeActionsUsed(next);
        action();
      } else {
        setShowModal(true);
      }
    },
    [isSignedIn, freeCount],
  );

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const savePreviewState = useCallback((state: PreviewState) => {
    setPreviewState(state);
    try {
      sessionStorage.setItem("preview_restore", JSON.stringify(state));
    } catch {}
  }, []);

  const restorePreviewState = useCallback(<T extends PreviewState>(): T | null => {
    try {
      const saved = sessionStorage.getItem("preview_restore");
      if (saved) {
        const parsed = JSON.parse(saved) as T;
        sessionStorage.removeItem("preview_restore");
        return parsed;
      }
    } catch {}
    return null;
  }, []);

  const freeActionsLeft = Math.max(0, 1 - freeCount);

  return {
    showModal,
    gate,
    closeModal,
    isSignedIn,
    freeActionsLeft,
    context,
    savePreviewState,
    restorePreviewState,
  };
}
