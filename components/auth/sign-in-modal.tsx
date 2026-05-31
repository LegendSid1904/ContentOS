"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useRef, useEffect } from "react";

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
  context?: string;
}

export function SignInModal({ open, onClose, context }: SignInModalProps) {
  const { isSignedIn } = useAuth();
  const hasAutoClosed = useRef(false);

  useEffect(() => {
    if (isSignedIn && open && !hasAutoClosed.current) {
      hasAutoClosed.current = true;
      onClose();
    }
    if (!open) hasAutoClosed.current = false;
  }, [isSignedIn, open, onClose]);

  if (!open) return null;

  const returnUrl = typeof window !== "undefined" ? window.location.pathname : "/dashboard";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="cyber-grid !fixed">
        <div className="cyber-grid-inner opacity-30" />
      </div>

      <div className="crt-scanlines !fixed !opacity-[0.03]" />
      <div className="crt-grain !fixed" />

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="crt-monitor crt-brackets w-full">
          <div className="crt-scanlines !opacity-[0.04]" />
          <div className="crt-grain" />
          <div className="crt-vignette !bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,5,10,0.5)_100%)]" />

          <div className="crt-micro-tl">
            <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-te-400/60">sys</span>
            <span className="text-tx-4">|</span>
            <span className="font-mono text-[7px] tracking-[0.18em] uppercase">auth_gate</span>
          </div>
          <div className="crt-micro-tr">
            <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">v1.0.0</span>
            <span className="text-tx-4">|</span>
            <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-tx-4">id: required</span>
          </div>

          <div className="crt-monitor-header">
            <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-tx-4">SESSION</span>
            <span className="font-mono text-[6px] text-tx-4">|</span>
            <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-te-400/70">REQUIRED</span>
            <div className="flex-1" />
            <span className="font-mono text-[7px] tracking-[0.1em] text-tx-4">{'\u2022'.repeat(6)}</span>
          </div>

          <div className="crt-monitor-content p-8">
            <div className="text-center mb-8">
              <h1 className="font-mono text-[12px] text-tx-2 tracking-wider mb-3 leading-relaxed">
                {">"} authentication required to {context || "generate AI content"}
              </h1>
              <h2 className="font-mono text-[10px] text-tx-3 tracking-wider">
                sign in to continue<span className="ai-cursor" />
              </h2>
            </div>

            <Link
              href={`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`}
              className="btn-terminal btn-terminal-primary w-full flex items-center justify-center gap-2 h-[42px]"
            >
              {">>"} SIGN IN
            </Link>

            <div className="text-center mt-6">
              <p className="font-mono text-[9px] text-tx-3 tracking-wider">
                {">"} no account?{" "}
                <Link href="/sign-up" className="text-vi-400 hover:text-vi-300 transition-colors">
                  [initialize new session]
                </Link>
              </p>
            </div>
          </div>

          <div className="crt-monitor-footer">
            <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-tx-4">STATUS</span>
            <span className="font-mono text-[6px] text-center text-tx-4">[secure connection]</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-te-400/60 animate-beat-pulse" />
              <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-te-400/60">ready</span>
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 font-mono text-[9px] text-tx-4 hover:text-tx-2 transition-colors"
        >
          [ESC]
        </button>
      </div>
    </div>
  );
}
