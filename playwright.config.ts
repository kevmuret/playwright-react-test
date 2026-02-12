import { defineConfig } from "playwright/test";

(globalThis as any).PWRIGHT_REACT_TEST_DEV = true;

export default defineConfig({
  testMatch: ["tests/**/*.ts"],
  timeout: 30_000,
  retries: 0,
  use: {
    viewport: { width: 1280, height: 720 },
    headless: true,
  },
  globalSetup: "./src/startup.ts",
  globalTeardown: "./src/teardown.ts",
});
