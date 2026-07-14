import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import svgr from "vite-plugin-svgr";
import tanstackRouter from "@tanstack/router-plugin/vite";

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

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    server: {
      host: true,
      port: 5173,
      strictPort: true
    },
    assetsInclude: ["**/*.ogg", "**/*.mp3"],
    define: {
      __GIT_REVISION__: JSON.stringify(getGitRevision()),
      __GIT_BRANCH__: JSON.stringify(getGitBranch()),
      __APP_VERSION__: JSON.stringify(getVersion())
    },
    plugins: [
      svgr(),
      tanstackRouter({
        target: "react",
        autoCodeSplitting: false,
        quoteStyle: "double"
      }),
      react({
        jsxImportSource: "@emotion/react"
      })
    ],
    resolve: {
      tsconfigPaths: true
    }
  }
});
