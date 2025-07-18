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
    },
];
