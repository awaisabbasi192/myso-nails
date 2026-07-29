import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root to this project (a stray lockfile exists in the user home dir).
  turbopack: {
    root: __dirname,
  },
  // Allow the phone / other devices on the LAN to load dev resources (HMR) without a cross-origin block.
  allowedDevOrigins: ["10.28.122.88", "*.local"],
};

export default nextConfig;
