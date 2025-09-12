import { FlatCompat } from "@eslint/eslintrc";
import base from "../../eslint.base.mjs";

const compat = new FlatCompat({
    baseDirectory: import.meta.dirname,
});

const config = [
    { ignores: [".next", "prettier.config.*"] },
    ...compat.extends("next/core-web-vitals"),
    ...base,
    {
        rules: {
            "@typescript-eslint/array-type": "off",
            "@typescript-eslint/consistent-type-definitions": "off",
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
