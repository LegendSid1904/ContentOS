"use client";

import { useState, useCallback, useEffect, useRef } from "react";

const BOOT_STEPS = [
  "initializing kernel",
  "mounting filesystem",
  "loading ai modules",
  "establishing session",
  "deploying field station",
  "system ready",
];

const BAR_DURATION = 3.0;

export default function LoadingGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"loading" | "glitch" | "done">("loading");
  const [glitchFrame, setGlitchFrame] = useState(0);
  const [pct, setPct] = useState(0);
  const [stepIndex, setStepIndex] = useState(-1);
  const bootRef = useRef<HTMLDivElement>(null);
  const activateRef = useRef<() => void>(() => {});
  const pctRef = useRef(0);
  pctRef.current = pct;

  const handleActivate = useCallback(() => {
    if (phase !== "loading" || pctRef.current < 100) return;
    setPhase("glitch");
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      setGlitchFrame(frame);
      if (frame >= 8) {
        clearInterval(interval);
        setPhase("done");
      }
    }, 70);
  }, [phase]);

  activateRef.current = handleActivate;

  useEffect(() => {
    const il = document.getElementById("instant-loader");
    if (il) il.classList.add("hidden");

    const totalMs = BAR_DURATION * 1000;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const raw = Math.min(elapsed / totalMs, 1);
      const eased = raw < 0.5
        ? 2 * raw * raw
        : 1 - Math.pow(-2 * raw + 2, 2) / 2;
      const p = Math.round(eased * 100);
      setPct(p);
      setStepIndex(Math.min(Math.floor((p / 100) * BOOT_STEPS.length), BOOT_STEPS.length - 1));
      if (elapsed < totalMs) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") activateRef.current();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (phase === "done") return <>{children}</>;

  return (
    <div
      className={`loading-gate ${phase === "glitch" ? "glitch-active" : ""}`}
      tabIndex={0}
      onClick={() => handleActivate()}
      style={{ cursor: pct >= 100 ? "pointer" : "default" }}
    >
      <div className="lg-vignette" />
      <div className="lg-scanlines" />
      <div className="lg-crt-line" />

      <div className="lg-micro tl">
        <span className="lg-micro-accent">AUTH_STATUS</span>
        <span className="lg-micro-sep">:</span>
        <span className="lg-micro-val">REDACTED</span>
      </div>
      <div className="lg-micro tr">
        <span className="lg-micro-accent">NODE_ID</span>
        <span className="lg-micro-sep">:</span>
        <span className="lg-micro-val">CONTENT_OS_V1.0</span>
      </div>
      <div className="lg-micro bl">
        <span className="lg-micro-accent">PACKET_LOSS</span>
        <span className="lg-micro-sep">:</span>
        <span className="lg-micro-val">0.00%</span>
      </div>
      <div className="lg-micro br">
        <span className="lg-micro-accent">MODE</span>
        <span className="lg-micro-sep">:</span>
        <span className="lg-micro-val">SECURE_LINK</span>
      </div>

      <svg className="logo-svg-defs">
        <defs>
          <filter id="logo-crt" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.06 0" in="noise" result="tintedNoise" />
            <feBlend mode="screen" in="SourceGraphic" in2="tintedNoise" result="noisyText" />
            <feGaussianBlur in="noisyText" stdDeviation="0.3" result="blurred" />
            <feMerge>
              <feMergeNode in="noisyText" />
              <feMergeNode in="blurred" />
            </feMerge>
          </filter>
          <filter id="frame-glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.54  0 0 0 0 0.36  0 0 0 0 0.96  0 0 0 0.6 0" in="blur" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div className="lg-console">
        <div className="lg-frame">
          <div className="lg-bracket tl" />
          <div className="lg-bracket tr" />
          <div className="lg-bracket bl" />
          <div className="lg-bracket br" />

          <div className="lg-header">
            <span className="lg-head-label">contentos</span>
            <span className="lg-head-divider">✦</span>
            <span className="lg-head-label">v1.0.0</span>
            <span className="lg-head-fill" />
            <span className="lg-head-pixel">[#]</span>
          </div>

          <div className="lg-body">
            <div className="logo-crt-wrap">
              <div className="logo-text-main">
                <span className="logo-c">CONTENT</span>
                <span className="logo-slash">{'//'}</span>
                <span className="logo-c logo-c-accent">OS</span>
              </div>
              <div className="logo-divider">
                <span className="logo-divider-line" />
                <span className="logo-divider-dot">◆</span>
                <span className="logo-divider-line" />
              </div>
              <div className="logo-sub">field station 01</div>
              <div className="logo-build">build 2026.05.26</div>
              <div className="logo-grain-overlay" />
              <div className="logo-scan-overlay" />
            </div>
          </div>

          <div className="lg-footer">
            <span className="lg-foot-label">session.active</span>
            <span className="lg-foot-center">✦ secure.link ✦</span>
            <span className="lg-foot-label">pid.01337</span>
          </div>
        </div>

        <div className="boot-area" ref={bootRef} style={{ animation: `bootFadeOut 0.6s ease forwards`, animationDelay: `${BAR_DURATION - 0.3}s` }}>
          {BOOT_STEPS.map((label, i) => (
            <div key={i} className={`boot-line ${i <= stepIndex ? "visible" : ""}`}>
              <span className="boot-arrow">{i <= stepIndex ? '\u2713' : '>'}</span>
              <span className="boot-label">{label}</span>
              {i < stepIndex && <span className="boot-ok">{'[OK]'}</span>}
            </div>
          ))}
        </div>

        {pct >= 60 && (() => {
          const cpu = Math.round(18 + (pct / 100) * 74);
          const temp = Math.round(33 + (pct / 100) * 10);
          const mem = Math.round((0.4 + (pct / 100) * 2.6) * 10) / 10;
          const net = pct < 35 ? "PENDING" : pct < 70 ? "HANDSHAKE" : "SECURE";
          const lat = pct < 35 ? "--" : `${Math.max(1, Math.round(9 - (pct / 100) * 7))}ms`;
          const upt = ((pct / 100) * BAR_DURATION).toFixed(1);
          return (
            <div className="sys-config">
              <div className="sys-cfg-row">
                <span className="sys-cfg-label">CPU</span>
                <span className="sys-cfg-val">{cpu}%</span>
                <span className="sys-cfg-sep">|</span>
                <span className="sys-cfg-label">TEMP</span>
                <span className="sys-cfg-val">{temp}°C</span>
                <span className="sys-cfg-sep">|</span>
                <span className="sys-cfg-label">MEM</span>
                <span className="sys-cfg-val">{mem}G/4G</span>
              </div>
              <div className="sys-cfg-row">
                <span className="sys-cfg-label">NET</span>
                <span className={`sys-cfg-val ${net === "SECURE" ? "sys-cfg-ok" : ""}`}>{net}</span>
                <span className="sys-cfg-sep">|</span>
                <span className="sys-cfg-label">LAT</span>
                <span className="sys-cfg-val">{lat}</span>
                <span className="sys-cfg-sep">|</span>
                <span className="sys-cfg-label">UPTIME</span>
                <span className="sys-cfg-val">{upt}s</span>
              </div>
            </div>
          );
        })()}

        <div className={`progress-row ${pct >= 100 ? "completed" : ""}`}>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="progress-pct">{String(pct).padStart(2, "0")}%</span>
        </div>

        <div className="prompt-section" onClick={handleActivate}>
          <div className="prompt-line">
            <span className="prompt-msg">all systems nominal. standing by.</span>
          </div>
          <div className="prompt-activate">
            <span className="prompt-br">[</span>
            <span className="prompt-text">press enter to activate</span>
            <span className="prompt-br">]</span>
            <span className="prompt-cur" />
          </div>
        </div>
      </div>

      {phase === "glitch" && (
        <>
          <div className="glitch-noise" style={{ opacity: 0.6 - glitchFrame * 0.07 }} />
          {glitchFrame % 2 === 0 && <div className="glitch-flash" />}
          <div className="glitch-shift" style={{ transform: `translateX(${(glitchFrame % 3 - 1) * 6}px)` }}>
            <div className="glitch-slice" style={{ top: "8%", height: "12%" }} />
            <div className="glitch-slice" style={{ top: "32%", height: "8%", background: "rgba(34,211,238,0.08)" }} />
            <div className="glitch-slice" style={{ top: "52%", height: "6%" }} />
            <div className="glitch-slice" style={{ top: "72%", height: "14%", background: "rgba(139,92,246,0.06)" }} />
          </div>
        </>
      )}
    </div>
  );
}
