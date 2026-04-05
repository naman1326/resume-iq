import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Read PORT from backend/.env so the dev proxy matches `npm run dev` in /backend (no root .env needed). */
function portFromBackendDotEnv() {
  const p = resolve(__dirname, "backend", ".env");
  if (!existsSync(p)) return null;
  const text = readFileSync(p, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*PORT\s*=\s*([^#]+)/);
    if (!m) continue;
    const v = m[1].trim().replace(/^["']|["']$/g, "");
    const n = parseInt(v, 10);
    if (!Number.isNaN(n) && n > 0 && n < 65536) return n;
  }
  return null;
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const defaultPort = portFromBackendDotEnv() ?? 3001;
  /*
   * Proxy target must match the real API port. Do NOT use VITE_API_URL here — a stale
   * .env.local value (e.g. :3001) breaks the proxy when the API runs on :3002.
   * Override only with BACKEND_URL if you need something non-localhost.
   */
  const backendOrigin = (
    env.BACKEND_URL || `http://localhost:${defaultPort}`
  ).replace(/\/$/, "");

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: backendOrigin,
          changeOrigin: true,
          timeout: 300000,
          proxyTimeout: 300000,
        },
        "/health": {
          target: backendOrigin,
          changeOrigin: true,
        },
      },
    },
  };
});
