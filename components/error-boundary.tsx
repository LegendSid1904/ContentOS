"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryKey: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, retryKey: 0 };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryKey: 0 };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleRetry = () => {
    this.setState((prev) => ({ hasError: false, error: null, retryKey: prev.retryKey + 1 }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <div className="crt-monitor crt-brackets w-full max-w-[600px]">
            <div className="crt-scanlines !opacity-[0.04]" />
            <div className="crt-grain" />
            <div className="crt-vignette !bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,5,10,0.5)_100%)]" />

            <div className="crt-micro-tl">
              <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-er-400/60">sys</span>
              <span className="text-tx-4">|</span>
              <span className="font-mono text-[9px] tracking-[0.18em] uppercase">error_handler</span>
            </div>
            <div className="crt-micro-tr">
              <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-tx-4">fatal</span>
              <span className="text-tx-4">|</span>
              <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-er-400/60">crashed</span>
            </div>

            <div className="crt-monitor-header">
              <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-er-400/70">SYSTEM</span>
              <span className="font-mono text-[9px] text-tx-4">|</span>
              <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-er-400/70">ERROR</span>
            </div>

            <div className="crt-monitor-content p-8 text-center">
              <div className="mb-6">
                <p className="font-mono text-[11px] text-er-400/80 tracking-wider mb-2">
                  {">"} [FATAL] module encountered an error
                </p>
                <p className="font-mono text-[11px] text-tx-3 tracking-wider">
                  {">"} check console for stack trace
                </p>
              </div>
              {this.state.error && (
                <div className="ascii-box p-3 mb-6 max-h-[120px] overflow-y-auto text-left">
                  <p className="font-mono text-[10px] text-er-400/60 break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <button
                onClick={this.handleRetry}
                className="btn-terminal btn-terminal-primary px-6 h-[38px]"
              >
                &gt;&gt; RETRY
              </button>
            </div>

            <div className="crt-micro-bl">
              <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-er-400/60">ERR</span>
            </div>
            <div className="crt-micro-br">
              <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-tx-4">standby</span>
            </div>
          </div>
        </div>
      );
    }

    return <div key={this.state.retryKey}>{this.props.children}</div>;
  }
}
