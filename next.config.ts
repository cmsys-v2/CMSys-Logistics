import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/*": ["./db/**/*"],
    "/api/**/*": ["./db/**/*"],
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  /**
   * Dev-server origin allow-list.
   * The sandbox preview is served from https://{port}-{sandboxId}.e2b.app, which
   * is a different origin than localhost. Next.js blocks unknown dev origins,
   * which surfaces to the browser as a 5xx / "Bad gateway". Allow the preview
   * host patterns explicitly so `next dev` behaves the same as production.
   */
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "*.e2b.app",
    "*.e2b.dev",
    "*.arena.ai",
  ],
};

export default nextConfig;
