"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useAuthGate } from "@/lib/use-auth-gate";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { ErrorBoundary } from "@/components/error-boundary";

type Step = "upload" | "format" | "pipeline" | "export";

interface PipelineStep {
  step: string;
  label: string;
  desc: string;
  status: "pending" | "active" | "done" | "error";
}

const FORMAT_OPTIONS = [
  {
    id: "explainer",
    name: "Explainer",
    icon: "◎",
    desc: "Talking-head with graphics, lower thirds, and on-screen callouts. Ideal for educational content.",
    output: "16:9 landscape, 3-8 min",
  },
  {
    id: "tiktok-raw",
    name: "TikTok Raw",
    icon: "◈",
    desc: "Fast cuts, trending sound sync, bold captions. Optimized for vertical short-form.",
    output: "9:16 vertical, 15-60s",
  },
  {
    id: "youtube-long",
    name: "Long-form YouTube",
    icon: "▶",
    desc: "Full edit with chapters, B-roll, thumbnails, and end screens. Built for retention.",
    output: "16:9 landscape, 8-20 min",
  },
] as const;

const PIPELINE_STEPS: Omit<PipelineStep, "status">[] = [
  { step: "01", label: "Intake", desc: "Upload & validate" },
  { step: "02", label: "Rough Cut", desc: "Transcription & trim" },
  { step: "03", label: "Graphics", desc: "Format-specific overlays" },
  { step: "04", label: "QA Pass", desc: "Sync, loudness, frames" },
  { step: "05", label: "Captions", desc: "On-beat burn-in" },
  { step: "06", label: "Music", desc: "Sidechain ducking" },
  { step: "07", label: "Export", desc: "Final render & delivery" },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function VideoEditorPage() {
  return (
    <ErrorBoundary>
      <VideoEditorContent />
    </ErrorBoundary>
  );
}

function VideoEditorContent() {
  const [step, setStep] = useState<Step>("upload");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(
    PIPELINE_STEPS.map((s) => ({ ...s, status: "pending" }))
  );
  const [currentPipelineIndex, setCurrentPipelineIndex] = useState(-1);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isSignedIn } = useAuth();
  const { showModal, gate, closeModal, triggerModal, freeActionsLeft } = useAuthGate("run video editor");

  const isUploadStep = step === "upload" && !loading;
  const isFormatStep = step === "format" && !loading;
  const isPipelineStep = step === "pipeline";
  const isExportStep = step === "export" && !loading;

  const handleFileSelect = useCallback((file: File) => {
    setError("");
    const validTypes = ["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo", "video/x-matroska"];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|mov|webm|avi|mkv)$/i)) {
      setError("Unsupported format. Accepted: MP4, MOV, WebM, AVI, MKV");
      return;
    }
    if (file.size > 4 * 1024 * 1024 * 1024) {
      setError("File too large. Maximum size is 4 GB.");
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setFilePreview(url);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  function handleProceedToFormat() {
    if (!selectedFile) return;
    setStep("format");
  }

  function handleStartPipeline() {
    if (!selectedFormat) return;
    gate(async () => {
      setLoading(true);
      setError("");
      setStep("pipeline");
      setPipelineSteps(PIPELINE_STEPS.map((s) => ({ ...s, status: "pending" })));
      setCurrentPipelineIndex(-1);

      for (let i = 0; i < PIPELINE_STEPS.length; i++) {
        setCurrentPipelineIndex(i);
        setPipelineSteps((prev) =>
          prev.map((s, idx) => ({
            ...s,
            status: idx === i ? "active" : idx < i ? "done" : "pending",
          }))
        );
        await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
      }

      setPipelineSteps((prev) => prev.map((s) => ({ ...s, status: "done" })));
      setLoading(false);
      setStep("export");
    });
  }

  function handleReset() {
    setStep("upload");
    setLoading(false);
    setSelectedFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    setSelectedFormat("");
    setPipelineSteps(PIPELINE_STEPS.map((s) => ({ ...s, status: "pending" })));
    setCurrentPipelineIndex(-1);
    setError("");
  }

  function handleSimulateDownload() {
    const blob = new Blob(["ContentOS Video Export — simulated output"], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contentos-export-${selectedFormat}-${Date.now()}.mp4`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const completedSteps = pipelineSteps.filter((s) => s.status === "done").length;
  const pipelineProgress = Math.round((completedSteps / pipelineSteps.length) * 100);

  return (
    <>
      <div className="max-w-3xl space-y-6 relative z-10">
        <div>
          <p className="sec-eyebrow">
            <span className="sec-eyebrow-dot bg-te-400" />
            Module :: Video Editor
          </p>
          <h1 className="sec-title !text-[28px]">Auto-Edit Pipeline</h1>
          <p className="sec-desc !text-[13px]">
            Raw footage in, finished video out — 7-step AI pipeline
          </p>
        </div>

        <div className="crt-monitor relative crt-brackets">
          <div className="crt-scanlines" />
          <div className="crt-grain" />
          <div className="crt-vignette" />
          <div className="crt-sweep" />

          <div className="crt-micro-tl">
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-te-400/60">sys</span>
            <span className="text-tx-4">|</span>
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase">video_editor</span>
          </div>
          <div className="crt-micro-tr">
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-tx-4">v1.0.0</span>
            <span className="text-tx-4">|</span>
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-tx-4">id: {isSignedIn ? "active" : "preview"}</span>
          </div>

          <div className="crt-monitor-header">
            <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-tx-4">MODULE</span>
            <span className="font-mono text-[9px] text-tx-4">|</span>
            <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-te-400/70">Video Editor</span>
            <div className="flex-1" />
            <span className="font-mono text-[9px] tracking-[0.1em] text-tx-4">{"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
          </div>

          <div className="crt-monitor-content p-6 space-y-6">

            {error && (
              <div className="font-mono text-[13px] text-err bg-err/10 border border-err/20 rounded-r3 p-3">
                <span className="text-err">[ERROR]</span> {error}
                <button onClick={() => setError("")} className="ml-2 text-err/60 hover:text-err underline">dismiss</button>
              </div>
            )}

            {/* ── UPLOAD STEP ── */}
            {isUploadStep && (
              <>
                <div className="font-mono text-[11px] text-te-400/70 border border-te-500/15 bg-te-500/5 rounded-r3 p-3 text-center tracking-wider leading-relaxed">
                  <span className="text-te-400/90">[READY]</span> Upload your raw footage. The pipeline handles rough cut, graphics, captions, music, and export.
                </div>

                <div className="reveal d1">
                  <label className="term-label mb-2">SOURCE_VIDEO</label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`ve-upload-zone ${dragOver ? "ve-upload-zone--active" : ""} ${selectedFile ? "ve-upload-zone--has-file" : ""}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/x-matroska,.mp4,.mov,.webm,.avi,.mkv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                      className="hidden"
                    />
                    {selectedFile ? (
                      <div className="flex items-center gap-4">
                        <div className="ve-upload-icon ve-upload-icon--done">
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-[13px] text-tx-1 truncate">{selectedFile.name}</div>
                          <div className="font-mono text-[11px] text-tx-4">{formatFileSize(selectedFile.size)}</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            if (filePreview) URL.revokeObjectURL(filePreview);
                            setFilePreview(null);
                          }}
                          className="btn-terminal text-[10px]"
                        >
                          {"[CHANGE]"}
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="ve-upload-icon mb-3">
                          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <div className="font-mono text-[13px] text-tx-2 mb-1">
                          Drop video here or <span className="text-te-400/80 underline">browse files</span>
                        </div>
                        <div className="font-mono text-[10px] text-tx-4 tracking-wider">
                          MP4, MOV, WebM, AVI, MKV — max 4 GB
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {filePreview && (
                  <div className="reveal d2">
                    <label className="term-label mb-2">PREVIEW</label>
                    <div className="relative rounded-r3 overflow-hidden border border-white/[0.06] bg-black">
                      <video
                        src={filePreview}
                        controls
                        className="w-full max-h-[300px] object-contain"
                      />
                    </div>
                  </div>
                )}

                <div className="reveal d3 flex items-center gap-3 pt-2 border-t border-white/[0.04] flex-wrap">
                  <button
                    onClick={handleProceedToFormat}
                    disabled={!selectedFile}
                    className="btn-terminal btn-terminal-primary disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {">>"} CONTINUE
                  </button>
                  {!selectedFile && (
                    <span className="font-mono text-[10px] text-tx-4 tracking-wider">AWAITING UPLOAD</span>
                  )}
                </div>
              </>
            )}

            {/* ── FORMAT STEP ── */}
            {isFormatStep && (
              <>
                <div className="font-mono text-[11px] text-te-400/70 border border-te-500/15 bg-te-500/5 rounded-r3 p-3 text-center tracking-wider leading-relaxed">
                  <span className="text-te-400/90">[SELECT]</span> Choose your output format. Each format applies different editing rules, overlays, and pacing.
                </div>

                <div className="reveal d1">
                  <label className="term-label mb-2">OUTPUT_FORMAT</label>
                  <div className="space-y-1.5">
                    {FORMAT_OPTIONS.map((fmt, i) => (
                      <button
                        key={fmt.id}
                        onClick={() => setSelectedFormat(fmt.id === selectedFormat ? "" : fmt.id)}
                        className={`boot-option ${fmt.id === selectedFormat ? "active" : ""}`}
                        style={{ animationDelay: `${0.5 + i * 0.08}s` }}
                      >
                        <span className="boot-option-arrow">
                          {fmt.id === selectedFormat ? "\u25B6" : fmt.icon}
                        </span>
                        <div className="min-w-0 flex-1 text-left">
                          <span className="boot-option-label block">{fmt.name}</span>
                          <span className="font-mono text-[10px] text-tx-4 tracking-wider block leading-tight mt-0.5">{fmt.desc}</span>
                          <span className="font-mono text-[9px] text-tx-3/50 tracking-wider block leading-tight mt-0.5">{fmt.output}</span>
                        </div>
                        <span className={`diag-badge ${fmt.id === selectedFormat ? "diag-ok" : "diag-idle"}`}>
                          {fmt.id === selectedFormat ? "[SELECTED]" : "[IDLE]"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="reveal d2 border-t border-white/[0.04] pt-4">
                  <label className="term-label mb-2">SELECTED_SOURCE</label>
                  <div className="flex items-center gap-3 p-3 rounded-r3 border border-white/[0.04] bg-white/[0.02]">
                    <div className="ve-upload-icon ve-upload-icon--sm">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-[12px] text-tx-1 truncate">{selectedFile?.name}</div>
                      <div className="font-mono text-[10px] text-tx-4">{selectedFile ? formatFileSize(selectedFile.size) : ""}</div>
                    </div>
                    <button onClick={() => setStep("upload")} className="btn-terminal text-[10px]">
                      {"[CHANGE]"}
                    </button>
                  </div>
                </div>

                <div className="reveal d3 flex items-center gap-3 pt-2 border-t border-white/[0.04] flex-wrap">
                  <button
                    onClick={handleStartPipeline}
                    disabled={!selectedFormat}
                    className="btn-terminal btn-terminal-primary disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {">>"} START PIPELINE
                  </button>
                  <button onClick={() => setStep("upload")} className="btn-terminal">
                    {"^C"} BACK
                  </button>
                  {!selectedFormat && (
                    <span className="font-mono text-[10px] text-tx-4 tracking-wider">SELECT A FORMAT</span>
                  )}
                </div>
              </>
            )}

            {/* ── PIPELINE STEP ── */}
            {isPipelineStep && (
              <>
                <div className="font-mono text-[11px] text-te-400/70 border border-te-500/15 bg-te-500/5 rounded-r3 p-3 text-center tracking-wider leading-relaxed">
                  <span className="text-te-400/90">[PROCESSING]</span> Pipeline running — {completedSteps}/{pipelineSteps.length} steps complete
                </div>

                <div className="reveal d1">
                  <div className="flex items-center justify-between mb-2">
                    <label className="term-label">PIPELINE_PROGRESS</label>
                    <span className="font-mono text-[11px] text-te-400/80 tracking-wider">{pipelineProgress}%</span>
                  </div>
                  <div className="ve-progress-bar">
                    <div
                      className="ve-progress-fill"
                      style={{ width: `${pipelineProgress}%` }}
                    />
                  </div>
                </div>

                <div className="reveal d2">
                  <label className="term-label mb-3">PIPELINE_STEPS</label>
                  <div className="space-y-0">
                    {pipelineSteps.map((item) => (
                      <div key={item.step} className="ve-pipeline-step">
                        <div className={`ve-pipeline-num ${item.status === "done" ? "ve-pipeline-num--done" : item.status === "active" ? "ve-pipeline-num--active" : ""}`}>
                          {item.status === "done" ? "✓" : item.step}
                        </div>
                        <div className="ve-pipeline-line" />
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-[12px] font-bold text-tx-1 tracking-[0.06em] uppercase">{item.label}</div>
                          <div className="font-mono text-[10px] text-tx-4">{item.desc}</div>
                        </div>
                        <div className="flex-shrink-0">
                          {item.status === "done" && (
                            <span className="font-mono text-[9px] text-ok tracking-wider">DONE</span>
                          )}
                          {item.status === "active" && (
                            <span className="flex gap-0.5 items-center">
                              <span className="w-1 h-1 rounded-full bg-te-400 animate-pulse" />
                              <span className="w-1 h-1 rounded-full bg-te-400 animate-pulse" style={{ animationDelay: "0.15s" }} />
                              <span className="w-1 h-1 rounded-full bg-te-400 animate-pulse" style={{ animationDelay: "0.3s" }} />
                            </span>
                          )}
                          {item.status === "pending" && (
                            <span className="font-mono text-[9px] text-tx-4 tracking-wider">WAIT</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                  <span className="font-mono text-[10px] text-tx-4 tracking-wider animate-pulse">
                    {loading ? "Pipeline running..." : "Initializing..."}
                  </span>
                </div>
              </>
            )}

            {/* ── EXPORT STEP ── */}
            {isExportStep && (
              <>
                <div className="font-mono text-[11px] text-ok/70 border border-ok/15 bg-ok/5 rounded-r3 p-3 text-center tracking-wider leading-relaxed">
                  <span className="text-ok/90">[COMPLETE]</span> All 7 pipeline steps finished. Your video is ready for export.
                </div>

                <div className="reveal d1">
                  <label className="term-label mb-3">PIPELINE_COMPLETE</label>
                  <div className="space-y-0">
                    {pipelineSteps.map((item) => (
                      <div key={item.step} className="ve-pipeline-step">
                        <div className="ve-pipeline-num ve-pipeline-num--done">✓</div>
                        <div className="ve-pipeline-line" />
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-[12px] font-bold text-tx-1 tracking-[0.06em] uppercase">{item.label}</div>
                          <div className="font-mono text-[10px] text-tx-4">{item.desc}</div>
                        </div>
                        <span className="font-mono text-[9px] text-ok tracking-wider">DONE</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="reveal d2 border-t border-white/[0.04] pt-4">
                  <label className="term-label mb-2">EXPORT_SUMMARY</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-r3 border border-white/[0.04] bg-white/[0.02]">
                      <div className="font-mono text-[10px] text-tx-4 tracking-wider uppercase mb-1">Source</div>
                      <div className="font-mono text-[12px] text-tx-1 truncate">{selectedFile?.name}</div>
                    </div>
                    <div className="p-3 rounded-r3 border border-white/[0.04] bg-white/[0.02]">
                      <div className="font-mono text-[10px] text-tx-4 tracking-wider uppercase mb-1">Format</div>
                      <div className="font-mono text-[12px] text-tx-1">{FORMAT_OPTIONS.find((f) => f.id === selectedFormat)?.name ?? selectedFormat}</div>
                    </div>
                    <div className="p-3 rounded-r3 border border-white/[0.04] bg-white/[0.02]">
                      <div className="font-mono text-[10px] text-tx-4 tracking-wider uppercase mb-1">Steps</div>
                      <div className="font-mono text-[12px] text-ok">7/7 complete</div>
                    </div>
                    <div className="p-3 rounded-r3 border border-white/[0.04] bg-white/[0.02]">
                      <div className="font-mono text-[10px] text-tx-4 tracking-wider uppercase mb-1">Status</div>
                      <div className="font-mono text-[12px] text-ok">Ready</div>
                    </div>
                  </div>
                </div>

                <div className="reveal d3 flex items-center gap-3 pt-2 border-t border-white/[0.04] flex-wrap">
                  <button
                    onClick={handleSimulateDownload}
                    className="btn-terminal btn-terminal-primary"
                  >
                    {">>"} DOWNLOAD EXPORT
                  </button>
                  <button onClick={handleReset} className="btn-terminal">
                    {"^C"} NEW PROJECT
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="crt-micro-bl">
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase"
              style={{ color: step === "export" ? "rgba(34,197,94,0.6)" : step === "pipeline" ? "rgba(34,211,238,0.6)" : "rgba(86,86,128,0.6)" }}
            >
              {step === "upload" ? "AWAITING UPLOAD" : step === "format" ? "SELECT FORMAT" : step === "pipeline" ? "PIPELINE ACTIVE" : "EXPORT READY"}
            </span>
          </div>
          <div className="crt-micro-br">
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-tx-4">
              {loading ? "PROCESSING..." : "STANDBY"}
            </span>
          </div>

          <div className="crt-monitor-footer">
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-tx-4">
              {step === "upload" ? "UPLOAD" : step === "format" ? "FORMAT" : step === "pipeline" ? "PIPELINE" : "EXPORT"}
            </span>
            <span className="font-mono text-[9px] text-center">
              {!isSignedIn ? (
                <span className="text-vi-400/60">
                  {freeActionsLeft > 0 ? `FREE: ${freeActionsLeft} gen` : "FREE: 0 "}
                  {!isSignedIn && freeActionsLeft <= 0 && (
                    <Link href="/sign-in?redirect_url=%2Fdashboard%2Fvideo-editor" className="text-vi-400/80 hover:text-vi-300 underline">
                      [sign in]
                    </Link>
                  )}
                </span>
              ) : (
                <span className="text-tx-4">[system ready]</span>
              )}
            </span>
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-tx-4">
              {loading ? "BUSY" : "STANDBY"}
            </span>
          </div>
        </div>
      </div>

      <SignInModal open={showModal} onClose={closeModal} context="run video editor" />
    </>
  );
}
