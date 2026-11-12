import { defineConfig } from "electron-vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import svgr from "vite-plugin-svgr";
import tanstackRouter from "@tanstack/router-plugin/vite";
import { resolve } from "node:path";

interface EmojiSkinVariation {
  unified: string;
  sheet_x: number;
  sheet_y: number;
}

interface EmojiDatasourceEntry {
  unified: string;
  name: string;
  short_name: string;
  category: string;
  sort_order: number;
  sheet_x: number;
  sheet_y: number;
  has_img_twitter: boolean;
  skin_variations?: Record<string, EmojiSkinVariation>;
}

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

function slimEmojiDatasource(): Plugin {
  return {
    name: "mutualzz:slim-emoji-datasource",
    enforce: "pre",
    transform(code, id) {
      const filePath = id.split("?")[0].replaceAll("\\", "/");
      if (!filePath.endsWith("emoji-datasource-twitter/emoji.json"))
        return null;

      const entries = JSON.parse(code) as EmojiDatasourceEntry[];
      const slimEntries = entries.map((entry) => ({
        unified: entry.unified,
        name: entry.name,
        short_name: entry.short_name,
        category: entry.category,
        sort_order: entry.sort_order,
        sheet_x: entry.sheet_x,
        sheet_y: entry.sheet_y,
        has_img_twitter: entry.has_img_twitter,
        ...(entry.skin_variations && {
          skin_variations: Object.fromEntries(
            Object.entries(entry.skin_variations).map(([tone, variation]) => [
              tone,
              {
                unified: variation.unified,
                sheet_x: variation.sheet_x,
                sheet_y: variation.sheet_y
              }
            ])
          )
        })
      }));

      return { code: JSON.stringify(slimEntries), map: null };
    }
  };
}

const rendererSource = resolve(__dirname, "src/renderer/src");

const rendererAliases = [
  { find: /^@renderer\//, replacement: `${rendererSource}/` },
  { find: /^@assets$/, replacement: `${rendererSource}/assets` },
  { find: /^@assets\//, replacement: `${rendererSource}/assets/` },
  { find: /^@app-types$/, replacement: `${rendererSource}/types/index.d.ts` },
  { find: /^@app-types\//, replacement: `${rendererSource}/types/` },
  { find: /^@components\//, replacement: `${rendererSource}/components/` },
  { find: /^@contexts\//, replacement: `${rendererSource}/contexts/` },
  { find: /^@hooks\//, replacement: `${rendererSource}/hooks/` },
  { find: /^@logger$/, replacement: `${rendererSource}/Logger.ts` },
  { find: /^@seo$/, replacement: `${rendererSource}/seo.ts` },
  { find: /^@stores\//, replacement: `${rendererSource}/stores/` },
  { find: /^@utils\//, replacement: `${rendererSource}/utils/` },
  { find: /^@storages\//, replacement: `${rendererSource}/storages/` }
];

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    build: {
      minify: true
    },
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
      slimEmojiDatasource(),
      svgr(),
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
        quoteStyle: "double"
      }),
      react({
        jsxImportSource: "@emotion/react"
      })
    ],
    resolve: {
      alias: rendererAliases,
      tsconfigPaths: true
    }
  }
});
