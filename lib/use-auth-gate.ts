"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

const STORAGE_KEY = "preview_free_actions";
const SESSION_CACHE_KEY = "cos_session_active";

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
  const { isSignedIn, isLoaded } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [freeCount, setFreeCount] = useState(
    () => getFreeActionsUsed() || (typeof window !== "undefined" && sessionStorage.getItem(SESSION_CACHE_KEY) ? 99 : 0)
  );
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);
  const [ready, setReady] = useState(
    () => typeof window !== "undefined" && !!sessionStorage.getItem(SESSION_CACHE_KEY)
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      setFreeCount(99);
      setFreeActionsUsed(99);
      try { sessionStorage.setItem(SESSION_CACHE_KEY, "1"); } catch {}
      setReady(true);
    } else {
      try { sessionStorage.removeItem(SESSION_CACHE_KEY); } catch {}
      setReady(true);
    }
  }, [isSignedIn, isLoaded]);

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

  const triggerModal = useCallback(() => {
    setShowModal(true);
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
    triggerModal,
    isSignedIn,
    freeActionsLeft,
    context,
    savePreviewState,
    restorePreviewState,
    ready,
  };
}
