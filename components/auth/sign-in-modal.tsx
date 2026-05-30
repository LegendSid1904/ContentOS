"use client";

import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useRef } from "react";

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
}

export function SignInModal({ open, onClose }: SignInModalProps) {
  const { isSignedIn } = useAuth();
  const hasSignedIn = useRef(false);

  const handleClose = useCallback(() => {
    if (isSignedIn && !hasSignedIn.current) {
      hasSignedIn.current = true;
    }
    if (isSignedIn) {
      onClose();
    }
  }, [isSignedIn, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />
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
                {">"} authentication required to generate AI content
              </h1>
              <h2 className="font-mono text-[10px] text-tx-3 tracking-wider">
                sign in to continue<span className="ai-cursor" />
              </h2>
            </div>

            <style>{`
              .cl-card { background: transparent !important; box-shadow: none !important; }
              .cl-headerTitle { display: none !important; }
              .cl-headerSubtitle { display: none !important; }
              .cl-formHeader { display: none !important; }
              .cl-formHeaderTitle { display: none !important; }
              .cl-formHeaderSubtitle { display: none !important; }
              .cl-footerAction { display: none !important; }
              .cl-footer { display: none !important; }
              .cl-developmentBadge { display: none !important; }
              .cl-socialButtonsBlockButton { background: rgba(0,0,0,0.3) !important; border: 1px solid rgba(255,255,255,0.06) !important; color: rgba(240,238,255,0.7) !important; font-family: 'JetBrains Mono', monospace !important; font-size: 11px !important; letter-spacing: 0.05em !important; height: 40px !important; border-radius: 2px !important; }
              .cl-socialButtonsBlockButton:hover { background: rgba(255,255,255,0.04) !important; border-color: rgba(255,255,255,0.1) !important; color: rgb(240,238,255) !important; }
              .cl-dividerLine { background: rgba(255,255,255,0.06) !important; }
              .cl-dividerText { color: rgba(46,46,80,1) !important; font-size: 9px !important; font-family: 'JetBrains Mono', monospace !important; letter-spacing: 0.2em !important; text-transform: uppercase !important; background: transparent !important; }
              .cl-formFieldLabel { color: rgba(86,86,128,1) !important; font-size: 9px !important; font-family: 'JetBrains Mono', monospace !important; letter-spacing: 0.2em !important; text-transform: uppercase !important; }
              .cl-formFieldInput { background: rgba(0,0,0,0.35) !important; border: 1px solid rgba(255,255,255,0.04) !important; color: rgb(240,238,255) !important; font-family: 'JetBrains Mono', monospace !important; font-size: 13px !important; caret-color: #22d3ee !important; border-radius: 2px !important; height: 42px !important; }
              .cl-formFieldInput:focus { border-color: rgba(139,92,246,0.3) !important; box-shadow: 0 0 12px rgba(139,92,246,0.04) !important; }
              .cl-formButtonPrimary { background: transparent !important; border: 1px solid rgba(139,92,246,0.2) !important; color: rgb(167,139,250) !important; font-family: 'JetBrains Mono', monospace !important; font-size: 10px !important; letter-spacing: 0.12em !important; text-transform: uppercase !important; height: 40px !important; border-radius: 2px !important; }
              .cl-formButtonPrimary:hover { background: rgba(139,92,246,0.1) !important; border-color: rgba(139,92,246,0.3) !important; color: rgb(196,181,253) !important; box-shadow: 0 0 30px rgba(139,92,246,0.1) !important; }
              .cl-alert { background: rgba(0,0,0,0.3) !important; border: 1px solid rgba(239,68,68,0.2) !important; color: rgb(239,68,68) !important; font-size: 10px !important; font-family: 'JetBrains Mono', monospace !important; border-radius: 2px !important; padding: 12px !important; }
              .cl-alertText { color: rgb(239,68,68) !important; font-size: 10px !important; font-family: 'JetBrains Mono', monospace !important; }
              .cl-internal-17tflcl { display: none !important; }
              .cl-internal-1hp5nqm { display: none !important; }
              .cl-internal-1ou6n2n { display: none !important; }
              .cl-internal-1rbjifd { display: none !important; }
              .cl-internal-df7v37 { display: none !important; }
              .cl-internal-13qjisj { display: none !important; }
              .cl-internal-1v2kiki { display: none !important; }
            `}</style>

            <SignIn
              path="/sign-in"
              routing="path"
              signUpUrl="/sign-up"
              forceRedirectUrl={typeof window !== "undefined" ? window.location.pathname : "/dashboard"}
              appearance={{
                elements: {
                  header: "hidden",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  card: "bg-transparent shadow-none",
                  main: "p-0",
                  rootBox: "w-full",
                  formHeader: "hidden",
                  formHeaderTitle: "hidden",
                  formHeaderSubtitle: "hidden",
                  footerAction: "hidden",
                  footerActionText: "hidden",
                  footerActionLink: "hidden",
                  footer: "hidden",
                  developmentBadge: "hidden",
                  identityPreview: "hidden",
                  identityPreviewText: "hidden",
                  identityPreviewEditButton: "hidden",
                  skipAction: "hidden",
                  alternativeMethods: "hidden",
                  backLink: "hidden",
                  alert: "bg-black/30 border border-err/20 text-err text-[10px] font-mono rounded-[2px] p-3",
                  alertText: "text-err text-[10px] font-mono",
                  alertIcon: "hidden",
                  profileSection: "hidden",
                  profileSectionTitle: "hidden",
                  profileSectionPrimaryButton: "hidden",
                  userButton: "hidden",
                  userPreview: "hidden",
                  userPreviewMainIdentifier: "hidden",
                  userPreviewSecondaryIdentifier: "hidden",
                  navbar: "hidden",
                  scrollBox: "shadow-none",
                  pageScrollBox: "shadow-none",
                },
              }}
            />

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
