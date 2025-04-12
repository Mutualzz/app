import pluginJs from "@eslint/js";
import pluginQuery from "@tanstack/eslint-plugin-query";
import pluginRouter from "@tanstack/eslint-plugin-router";
import pluginImport from "eslint-plugin-import";
import pluginPrettier from "eslint-plugin-prettier/recommended";
import pluginReact from "eslint-plugin-react";
import pluginSonarjs from "eslint-plugin-sonarjs";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    ...pluginRouter.configs["flat/recommended"],
    ...pluginQuery.configs["flat/recommended"],
    pluginSonarjs.configs.recommended,
    pluginPrettier,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
                project: "./tsconfig.json",
            },
        },
        plugins: {
            import: pluginImport,
        },
        rules: {
            "react/react-in-jsx-scope": "off",
            "react/no-unknown-property": ["error", { ignore: ["css"] }],
            "no-console": "warn",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    args: "all",
                    vars: "all",
                    argsIgnorePattern: "^_",
                    caughtErrors: "all",
                    caughtErrorsIgnorePattern: "^_",
                    destructuredArrayIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    ignoreRestSiblings: true,
                },
            ],
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/consistent-type-imports": [
                "error",
                {
                    prefer: "type-imports",
                    fixStyle: "inline-type-imports",
                },
            ],
            "@typescript-eslint/no-unnecessary-type-assertion": "warn",
            "@typescript-eslint/no-unnecessary-condition": "warn",
            "@typescript-eslint/no-unnecessary-qualifier": "warn",
            "@typescript-eslint/no-unnecessary-type-arguments": "warn",
            "@typescript-eslint/no-unnecessary-type-constraint": "warn",
            "@typescript-eslint/no-unnecessary-boolean-literal-compare": "warn",
            "@typescript-eslint/no-misused-promises": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/prefer-for-of": "warn",
            "@typescript-eslint/prefer-optional-chain": "warn",
            "sonarjs/cognitive-complexity": "off",
            "sonarjs/no-nested-conditional": "off",
            "sonarjs/no-small-switch": "warn",
            "sonarjs/no-nested-template-literals": "off",
            "sonarjs/no-unused-vars": "warn",
            "sonarjs/no-dead-store": "warn",
            "sonarjs/unused-import": "warn",
            "sonarjs/todo-tag": "warn",
            "sonarjs/no-commented-code": "warn",
            "sonarjs/function-return-type": "off",
            "import/no-cycle": "error",
        },
    },
];
