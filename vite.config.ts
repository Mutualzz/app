/* eslint-disable no-console */
import netlify from "@netlify/vite-plugin-tanstack-start";
import replace from "@rollup/plugin-replace";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react-swc";
import { readFileSync } from "fs";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

function getGitRevision() {
    try {
        const rev = readFileSync(".git/HEAD").toString().trim();
        if (rev.indexOf(":") === -1) {
            return rev;
        }

        return readFileSync(`.git/${rev.substring(5)}`)
            .toString()
            .trim();
    } catch {
        console.error("Failed to get Git revision.");
        return "?";
    }
}

function getGitBranch() {
    try {
        const rev = readFileSync(".git/HEAD").toString().trim();
        if (rev.indexOf(":") === -1) {
            return "DETACHED";
        }

        return rev.split("/").pop();
    } catch {
        console.error("Failed to get Git branch.");
        return "?";
    }
}

function getVersion() {
    return JSON.parse(readFileSync("package.json").toString()).version;
}

const forTauri = !!process.env.VITE_FOR_TAURI;

const host = process.env.TAURI_DEV_HOST;
const isDevBuild = !!process.env.VITE_ENV_DEV || !!process.env.TAURI_ENV_DEBUG;

console.log("Serving for Tauri:", forTauri);
console.log("Sourcemaps:", isDevBuild);
console.log("Minification: ", isDevBuild ? false : "esbuild");
console.log(
    `Target: ${
        process.env.TAURI_ENV_PLATFORM !== undefined
            ? process.env.TAURI_ENV_PLATFORM == "windows"
                ? "chrome105"
                : "safari13"
            : "modules"
    }`,
);

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        svgr(),
        replace({
            __GIT_REVISION__: getGitRevision(),
            __GIT_BRANCH__: getGitBranch(),
            __APP_VERSION__: getVersion(),
            preventAssignment: true,
        }),
        tsconfigPaths(),
        tanstackStart({
            router: {
                quoteStyle: "double",
                semicolons: true,
            },
            ...(forTauri && {
                spa: {
                    prerender: {
                        outputPath: "/index.html",
                    },
                    enabled: true,
                },
            }),
        }),
        ...(!forTauri && !isDevBuild ? [netlify()] : []),
        viteReact({
            jsxImportSource: "@emotion/react",
            tsDecorators: true,
        }),
    ],

    ssr: {
        noExternal: ["react-easy-crop", "tslib"],
    },

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
        port: 1420,
        strictPort: true,
        host: host || "0.0.0.0",
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

    envPrefix: ["VITE_", "TAURI_"],
});
