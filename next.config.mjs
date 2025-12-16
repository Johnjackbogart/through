import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Force Turbopack to treat this repo as the root to avoid lockfile confusion.
    root: path.resolve(__dirname),
  },
};

export default nextConfig
