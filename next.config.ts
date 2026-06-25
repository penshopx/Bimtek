import type { NextConfig } from "next";

const devOrigins = ["*.replit.dev", "*.repl.co", "*.janeway.replit.dev"];
if (process.env.REPLIT_DEV_DOMAIN) {
  devOrigins.push(process.env.REPLIT_DEV_DOMAIN);
}

const nextConfig: NextConfig = {
  allowedDevOrigins: devOrigins,
};

export default nextConfig;
