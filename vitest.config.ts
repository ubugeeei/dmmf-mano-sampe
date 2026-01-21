import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "~": resolve(__dirname, "frontend"),
      "#shared": resolve(__dirname, "shared"),
    },
  },
  test: {
    include: ["**/*.test.ts"],
  },
});
