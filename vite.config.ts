import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const onVercel = process.env.VERCEL === "1";
/** Nginx serves the app under /kidd-nest/. Vercel serves it at the domain root. */
const PRODUCTION_BASE = onVercel ? "/" : "/kidd-nest/";

export default defineConfig({
  nitro: onVercel ? { preset: "vercel" } : false,
  vite: {
    // Subpath must match Nginx and preview.html; use this for dev/preview/build so PM2 `vite preview` matches assets.
    base: PRODUCTION_BASE,
    // Allow the domain to access the preview server (if needed for SSR testing)
    server: {
        allowedHosts: [
            "demo.sourapps.com",
            "localhost",
            "127.0.0.1",
        ],
    },
    preview: {
        allowedHosts: [
            "demo.sourapps.com",
            "localhost",
            "127.0.0.1",
        ],
    },
  },
});