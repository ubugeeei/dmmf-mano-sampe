import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["server/**/*.test.ts"],
    globals: true,
  },
  esbuild: {
    target: "esnext",
  },
});
