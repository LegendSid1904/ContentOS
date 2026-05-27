import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { PostHogProvider } from "@/components/posthog-provider";
import "@/styles/globals.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ContentOS",
  description: "The AI-powered content operating system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        elements: {
          rootBox: "w-full",
          card: "bg-bg-raised border border-bd-1 shadow-none",
          headerTitle: "font-display text-tx-1",
          headerSubtitle: "text-tx-2",
          socialButtonsBlockButton:
            "bg-bg-float border border-bd-2 text-tx-1 hover:bg-bg-hover",
          formFieldLabel: "text-tx-2",
          formFieldInput:
            "bg-bg-float border border-bd-2 text-tx-1 rounded-r4",
          footerActionLink: "text-vi-400 hover:text-vi-300",
          primaryButton: "bg-vi-500 hover:bg-vi-400",
        },
      }}
    >
      <html lang="en" className={`${hanken.variable} ${jetbrainsMono.variable}`}>
        <head>
          <style>{`
            #instant-loader {
              position: fixed; inset: 0; z-index: 99999;
              background: #05050a;
              display: flex; flex-direction: column;
              align-items: center; justify-content: center;
              font-family: ${jetbrainsMono.style.fontFamily};
              pointer-events: none;
            }
            #instant-loader.hidden { opacity: 0; transition: opacity 0.3s; }
            #instant-loader .il-frame {
              display: flex; flex-direction: column;
              align-items: center; gap: 6px;
              padding: 32px 48px;
              border: 1px solid rgba(0,219,231,0.1);
              background: rgba(5,5,10,0.85);
            }
            #instant-loader .il-text { font-size: 32px; letter-spacing: 0.04em; font-weight: 600; }
            #instant-loader .il-c { color: rgba(240,240,245,0.92); }
            #instant-loader .il-s { color: rgba(0,219,231,0.5); margin: 0 4px; font-weight: 300; }
            #instant-loader .il-a { color: rgba(0,219,231,0.9); }
            #instant-loader .il-sub { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(148,163,184,0.5); margin-top: 4px; }
            #instant-loader .il-cur { display: inline-block; width: 6px; height: 14px; background: rgba(0,219,231,0.7); margin-left: 3px; animation: ilBlink 0.7s step-end infinite; vertical-align: middle; }
            @keyframes ilBlink { 50% { opacity: 0; } }
          `}</style>
        </head>
        <body className="antialiased">
          <div id="instant-loader">
            <div className="il-frame">
              <div className="il-text">
                <span className="il-c">CONTENT</span>
                <span className="il-s">{'//'}</span>
                <span className="il-a">OS</span>
              </div>
              <div className="il-sub">booting field station <span className="il-cur" /></div>
            </div>
          </div>
          <PostHogProvider>{children}</PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
