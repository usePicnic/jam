import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 20000,
    setupFiles: ["./dotenv.config.ts"],
  },
});
