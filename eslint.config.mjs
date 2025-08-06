import tanstack from "@mutualzz/eslint-config/tanstack";

export default [
    ...tanstack,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@typescript-eslint/no-unnecessary-condition": "off",
            "@typescript-eslint/no-this-alias": "off",
            "react/no-children-prop": "off"
        },
    },
];
