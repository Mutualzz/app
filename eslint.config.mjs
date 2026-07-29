import { tanstack } from "@mutualzz/eslint-config";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import eslintPluginReactRefresh from "eslint-plugin-react-refresh";

export default [
    {
        ignores: [
            "**/node_modules/**",
            "**/dist/**",
            "**/out/**",
            "afterPack.js",
            "afterSign.js",
        ],
    },
    ...tanstack,
    {
        files: ["src/**/*.{ts,tsx}"],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            "react-hooks": eslintPluginReactHooks,
            "react-refresh": eslintPluginReactRefresh,
        },
        rules: {
            ...eslintPluginReactHooks.configs.recommended.rules,
            ...eslintPluginReactRefresh.configs.vite.rules,
            "react-refresh/only-export-components": "off",
            "react-hooks/set-state-in-effect": "off",
            "@tanstack/query/exhaustive-deps": "warn",
            "@tanstack/query/no-void-query-fn": "warn",
            "react/no-children-prop": "off",
            "@typescript-eslint/no-require-imports": "off",
        },
    },
];
