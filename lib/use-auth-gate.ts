"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";

export function useAuthGate() {
  const { isSignedIn } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const gate = useCallback(
    (action: () => void) => {
      if (isSignedIn) {
        action();
      } else {
        setShowModal(true);
      }
    },
    [isSignedIn],
  );

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  return { showModal, gate, closeModal, isSignedIn };
}
