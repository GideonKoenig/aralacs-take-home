import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import type { PluginOption } from "vite";

export default defineConfig({
    plugins: [tsconfigPaths() as PluginOption],
    test: {
        globals: true,
        environment: "node",
        include: ["src/**/*.spec.ts"],
    },
});
