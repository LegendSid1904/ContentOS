import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <>
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
        .cl-internal-17tflcl { display: none !important; }
        .cl-internal-1hp5nqm { display: none !important; }
        .cl-internal-1ou6n2n { display: none !important; }
        .cl-internal-1rbjifd { display: none !important; }
        .cl-internal-df7v37 { display: none !important; }
        .cl-internal-13qjisj { display: none !important; }
        .cl-internal-1v2kiki { display: none !important; }
        .cl-socialButtonsBlockButton { background: rgba(0,0,0,0.3) !important; border: 1px solid rgba(255,255,255,0.06) !important; color: rgba(240,238,255,0.7) !important; font-family: 'JetBrains Mono', monospace !important; font-size: 11px !important; letter-spacing: 0.05em !important; height: 40px !important; border-radius: 2px !important; }
        .cl-socialButtonsBlockButton:hover { background: rgba(255,255,255,0.04) !important; border-color: rgba(255,255,255,0.1) !important; color: rgb(240,238,255) !important; }
        .cl-dividerLine { background: rgba(255,255,255,0.06) !important; }
        .cl-dividerText { color: rgba(46,46,80,1) !important; font-size: 9px !important; font-family: 'JetBrains Mono', monospace !important; letter-spacing: 0.2em !important; text-transform: uppercase !important; background: transparent !important; }
        .cl-formFieldLabel { color: rgba(86,86,128,1) !important; font-size: 9px !important; font-family: 'JetBrains Mono', monospace !important; letter-spacing: 0.2em !important; text-transform: uppercase !important; }
        .cl-formFieldInput { background: rgba(0,0,0,0.35) !important; border: 1px solid rgba(255,255,255,0.04) !important; color: rgb(240,238,255) !important; font-family: 'JetBrains Mono', monospace !important; font-size: 13px !important; caret-color: #22d3ee !important; border-radius: 2px !important; height: 42px !important; }
        .cl-formFieldInput:focus { border-color: rgba(139,92,246,0.3) !important; box-shadow: 0 0 12px rgba(139,92,246,0.04) !important; }
        .cl-formButtonPrimary { background: transparent !important; border: 1px solid rgba(139,92,246,0.2) !important; color: rgb(167,139,250) !important; font-family: 'JetBrains Mono', monospace !important; font-size: 10px !important; letter-spacing: 0.12em !important; text-transform: uppercase !important; height: 40px !important; border-radius: 2px !important; }
        .cl-formButtonPrimary:hover { background: rgba(139,92,246,0.1) !important; border-color: rgba(139,92,246,0.3) !important; color: rgb(196,181,253) !important; box-shadow: 0 0 30px rgba(139,92,246,0.1) !important; }
        .cl-identityPreview { display: none !important; }
        .cl-alert { background: rgba(0,0,0,0.3) !important; border: 1px solid rgba(239,68,68,0.2) !important; color: rgb(239,68,68) !important; font-size: 10px !important; font-family: 'JetBrains Mono', monospace !important; border-radius: 2px !important; padding: 12px !important; }
        .cl-alertText { color: rgb(239,68,68) !important; font-size: 10px !important; font-family: 'JetBrains Mono', monospace !important; }
        .cl-socialButtonsProviderIcon { width: 18px !important; height: 18px !important; }
        .cl-socialButtonsProviderText { color: rgba(240,238,255,0.7) !important; font-family: 'JetBrains Mono', monospace !important; font-size: 11px !important; }
      `}</style>
    <div className="min-h-screen bg-bg-void flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="cyber-grid">
        <div className="cyber-grid-inner opacity-40" />
      </div>
      <div className="gradient-mesh" />

      <div className="crt-scanlines !opacity-[0.04]" />
      <div className="crt-vignette !bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,5,10,0.5)_100%)]" />
      <div className="crt-sweep" />
      <div className="crt-grain" />

      <div className="crt-micro-tl !text-[9px]">
        <span className="text-te-400/60">sys</span>
        <span className="text-tx-4">|</span>
        <span className="text-tx-4">access terminal</span>
      </div>
      <div className="crt-micro-tr !text-[9px]">
        <span className="text-tx-4">field station</span>
        <span className="text-tx-4">|</span>
        <span className="text-te-400/60">01</span>
      </div>

      <div className="crt-monitor crt-brackets w-full max-w-[420px] relative z-10">
        <div className="crt-scanlines !opacity-[0.04]" />
        <div className="crt-grain" />
        <div className="crt-vignette !bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,5,10,0.5)_100%)]" />

        <div className="crt-monitor-header">
          <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-tx-4">SESSION</span>
          <span className="font-mono text-[9px] text-tx-4">|</span>
          <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-te-400/70">AUTH</span>
          <div className="flex-1" />
          <span className="font-mono text-[9px] tracking-[0.1em] text-tx-4">{'\u2022'.repeat(6)}</span>
        </div>

        <div className="crt-monitor-content p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-[8px] bg-gradient-to-br from-vi-500 to-te-400 flex items-center justify-center font-display text-[20px] font-bold text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                C
              </div>
              <span className="font-display text-[20px] font-bold text-tx-1 tracking-tight">ContentOS</span>
            </div>
            <h1 className="font-mono text-[12px] text-tx-3 tracking-wider">
              {">"} resume session<span className="ai-cursor" />
            </h1>
          </div>

          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            forceRedirectUrl="/dashboard"
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
                socialButtons: "flex flex-col gap-2",
                socialButtonsBlockButton: "bg-black/30 border border-white/[0.06] text-tx-2 hover:bg-white/[0.04] hover:border-white/[0.1] hover:text-tx-1 font-mono text-[13px] tracking-wider h-[40px] rounded-[2px] transition-colors duration-150",
                socialButtonsProviderIcon: "w-[18px] h-[18px]",
                socialButtonsProviderText: "text-tx-2 font-mono text-[13px] tracking-wider",
                dividerRow: "my-6",
                dividerLine: "bg-white/[0.06]",
                dividerText: "text-tx-4 text-[11px] font-mono tracking-[0.2em] uppercase bg-transparent px-3",
                formFieldRow: "mb-4",
                formFieldLabel: "text-tx-3 text-[11px] font-mono tracking-[0.2em] uppercase mb-2",
                formFieldInput: "bg-black/30 border border-white/[0.06] text-tx-1 font-mono text-[13px] caret-te-400 rounded-[2px] h-[42px] px-3 transition-colors duration-150 focus:border-vi-500/30 focus:shadow-[0_0_12px_rgba(139,92,246,0.04)]",
                formFieldInputShowPasswordButton: "text-tx-3 hover:text-tx-2",
                formFieldError: "text-err text-[11px] font-mono mt-1",
                formButtonPrimary: "bg-transparent border border-vi-500/20 text-vi-300 font-mono text-[12px] tracking-[0.12em] uppercase h-[40px] rounded-[2px] transition-colors duration-150 hover:bg-vi-500/10 hover:border-vi-500/30 hover:text-vi-200 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]",
                footerAction: "hidden",
                footerActionText: "hidden",
                footerActionLink: "hidden",
                footer: "hidden",
                identityPreview: "hidden",
                identityPreviewText: "hidden",
                identityPreviewEditButton: "hidden",
                skipAction: "hidden",
                alternativeMethods: "hidden",
                backLink: "hidden",
                developmentBadge: "hidden",
                alert: "bg-black/30 border border-err/20 text-err text-[12px] font-mono rounded-[2px] p-3",
                alertText: "text-err text-[12px] font-mono",
                alertIcon: "hidden",
                formFieldSuccess: "hidden",
                formFieldWarning: "hidden",
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

          <div className="text-center mt-8">
            <p className="font-mono text-[11px] text-tx-3 tracking-wider">
              {">"} no account?{" "}
              <Link href="/sign-up" className="text-vi-400 hover:text-vi-300 transition-colors">
                [initialize new session]
              </Link>
            </p>
          </div>
        </div>

        <div className="crt-monitor-footer">
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-tx-4">STATUS</span>
          <span className="font-mono text-[9px] text-center text-tx-4">[secure connection]</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-te-400/60 animate-beat-pulse" />
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-te-400/60">ready</span>
          </span>
        </div>
      </div>

      <div className="crt-micro-bl !text-[9px]">
        <span className="text-tx-4">contentos</span>
        <span className="text-tx-4">|</span>
        <span className="text-te-400/60">v1.0.0</span>
      </div>
      <div className="crt-micro-br !text-[9px]">
        <span className="text-te-400/60">encrypted</span>
        <span className="text-tx-4">|</span>
        <span className="text-tx-4">tls 1.3</span>
      </div>
    </div>
    </>
  );
}
