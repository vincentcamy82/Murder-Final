import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/files/**": [".data/storage/**/*"],
    "/api/site/background": [".data/storage/**/*"],
  },
};

export default nextConfig;
