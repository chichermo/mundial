import type { NextConfig } from "next";

import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: root,
  serverExternalPackages: ["@libsql/client", "@prisma/adapter-libsql", "libsql"],
  outputFileTracingIncludes: {
    "/api/**": ["./node_modules/@libsql/**/*.node", "./node_modules/libsql/**/*"],
  },
  async redirects() {
    return [{ source: "/favicon.ico", destination: "/icon.svg", permanent: false }];
  },
};

export default nextConfig;
