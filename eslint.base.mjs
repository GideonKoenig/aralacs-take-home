import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

const baseConfig = [
    { ignores: ["**/eslint.config.*"] },
    { linterOptions: { reportUnusedDisableDirectives: true } },
    ...tseslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,

    // Prettier compatibility (do not run Prettier via ESLint)
    eslintConfigPrettier,

    // Repo-wide TypeScript preferences
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
        rules: {
            "@typescript-eslint/consistent-type-imports": [
                "warn",
                { prefer: "type-imports", fixStyle: "inline-type-imports" },
            ],
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_" },
            ],
            "@typescript-eslint/require-await": "off",
            "@typescript-eslint/no-misused-promises": [
                "error",
                { checksVoidReturn: { attributes: false } },
            ],
        },
    },
];

export default baseConfig;
