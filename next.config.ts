import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || "contentos",
  project: process.env.SENTRY_PROJECT || "contentos",
  silent: true,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  telemetry: false,
});
