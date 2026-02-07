import { defineConfig } from "playwright/test";

export default defineConfig({
  reporter: [["./src/reporter.ts", {}]],
  testMatch: ["tests/**/*.ts"],
  timeout: 30_000,
  retries: 0,
  use: {
    viewport: { width: 1280, height: 720 },
    headless: true,
  },
  globalSetup: "./src/setup.ts",
});
