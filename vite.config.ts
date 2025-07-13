import { wrapVinxiConfigWithSentry } from "@sentry/tanstackstart-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
    build: {
        sourcemap: import.meta.dev,
    },
    plugins: [
        wrapVinxiConfigWithSentry(
            tanstackStart({
                target: "netlify",
                customViteReactPlugin: true,
            }),
            {
                org: "mutualzz",
                project: "mutualzz-app",
                authToken: process.env.SENTRY_AUTH_TOKEN,
            },
        ),
        viteReact(),
        tsconfigPaths(),
    ],

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
        port: 1420,
        strictPort: true,
        host: host || false,
        hmr: host
            ? {
                  protocol: "ws",
                  host,
                  port: 1421,
              }
            : undefined,
        watch: {
            // 3. tell vite to ignore watching `src-tauri`
            ignored: ["**/src-tauri/**"],
        },
    },
}));
