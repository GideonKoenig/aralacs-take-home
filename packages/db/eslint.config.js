import globals from "globals";
import base from "../../eslint.base.mjs";

const config = [
    { ignores: ["dist", "prettier.config.*"] },
    ...base,
    {
        languageOptions: {
            globals: { ...globals.node },
        },
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
];

export default config;
