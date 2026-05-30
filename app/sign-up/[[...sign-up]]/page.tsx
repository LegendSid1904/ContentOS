import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-bg-void flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="cyber-grid">
        <div className="cyber-grid-inner opacity-40" />
      </div>
      <div className="gradient-mesh" />

      <div className="crt-scanlines !opacity-[0.04]" />
      <div className="crt-vignette !bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,5,10,0.5)_100%)]" />
      <div className="crt-sweep" />
      <div className="crt-grain" />

      <div className="crt-micro-tl !text-[6px]">
        <span className="text-te-400/60">sys</span>
        <span className="text-tx-4">|</span>
        <span className="text-tx-4">registration terminal</span>
      </div>
      <div className="crt-micro-tr !text-[6px]">
        <span className="text-tx-4">field station</span>
        <span className="text-tx-4">|</span>
        <span className="text-te-400/60">01</span>
      </div>

      <div className="crt-monitor crt-brackets w-full max-w-[420px] relative z-10">
        <div className="crt-scanlines !opacity-[0.04]" />
        <div className="crt-grain" />
        <div className="crt-vignette !bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,5,10,0.5)_100%)]" />

        <div className="crt-monitor-header">
          <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-tx-4">SESSION</span>
          <span className="font-mono text-[6px] text-tx-4">|</span>
          <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-te-400/70">REGISTER</span>
          <div className="flex-1" />
          <span className="font-mono text-[7px] tracking-[0.1em] text-tx-4">{'\u2022'.repeat(6)}</span>
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
              {">"} initialize new session<span className="ai-cursor" />
            </h1>
          </div>

          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            forceRedirectUrl="/dashboard"
            appearance={{
              elements: {
                header: "hidden",
                card: "bg-transparent shadow-none",
                main: "p-0",
                socialButtonsBlockButton: "bg-black/30 border border-white/[0.06] text-tx-2 hover:bg-white/[0.04] hover:border-white/[0.1] hover:text-tx-1 font-mono text-[11px] tracking-wider h-[40px] rounded-[2px] transition-all duration-150",
                socialButtonsProviderIcon: "w-[18px] h-[18px]",
                dividerRow: "my-6",
                dividerLine: "bg-white/[0.06]",
                dividerText: "text-tx-4 text-[9px] font-mono tracking-[0.2em] uppercase bg-transparent px-3",
                formFieldRow: "mb-4",
                formFieldLabel: "text-tx-3 text-[9px] font-mono tracking-[0.2em] uppercase mb-2",
                formFieldInput: "bg-black/30 border border-white/[0.06] text-tx-1 font-mono text-[13px] caret-te-400 rounded-[2px] h-[42px] px-3 transition-all duration-150 focus:border-vi-500/30 focus:shadow-[0_0_12px_rgba(139,92,246,0.04)]",
                formFieldInputShowPasswordButton: "text-tx-3 hover:text-tx-2",
                formButtonPrimary: "bg-transparent border border-vi-500/20 text-vi-300 font-mono text-[10px] tracking-[0.12em] uppercase h-[40px] rounded-[2px] transition-all duration-150 hover:bg-vi-500/10 hover:border-vi-500/30 hover:text-vi-200 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]",
                footerAction: "hidden",
                footer: "hidden",
                identityPreviewEditButton: "text-vi-400 hover:text-vi-300 font-mono text-[9px]",
                identityPreviewText: "text-tx-2 font-mono text-[11px]",
                identityPreview: "bg-black/20 border border-white/[0.04] rounded-[2px] p-3",
              },
            }}
          />

          <div className="text-center mt-8">
            <p className="font-mono text-[9px] text-tx-3 tracking-wider">
              {">"} already have credentials?{" "}
              <Link href="/sign-in" className="text-vi-400 hover:text-vi-300 transition-colors">
                [resume session]
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

      <div className="crt-micro-bl !text-[6px]">
        <span className="text-tx-4">contentos</span>
        <span className="text-tx-4">|</span>
        <span className="text-te-400/60">v1.0.0</span>
      </div>
      <div className="crt-micro-br !text-[6px]">
        <span className="text-te-400/60">encrypted</span>
        <span className="text-tx-4">|</span>
        <span className="text-tx-4">tls 1.3</span>
      </div>
    </div>
  );
}
