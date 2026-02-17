// This script builds a temporary Playwright test environment
// and runs the tests for the current package.
// It performs the following steps:
// 1. Create a temp project directory under the system tmp dir.
// 2. Copy source files (App.css, App.tsx) into src/ inside the temp project.
// 3. Copy test files (App.story.tsx, App.test.ts) into tests/.
// 4. Update import paths in the copied files to point to the new location.
// 5. Change working directory to the temp project.
// 6. Install this package and Playwright as dev dependencies.
// 7. Write a minimal playwright.config.ts that tells Playwright where tests live.
// 8. Execute `npx playwright test` to run the tests.
// 9. Clean up by removing the temporary directory.

import { execSync } from "child_process";
import {
  readFileSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  writeFileSync,
  rmSync,
  readdirSync,
} from "fs";

import { tmpdir } from "os";
import path from "path";
import { chdir } from "process";

function copyTestFile(from: string, to: string): void {
  const content = readFileSync(from, "utf8");
  let updated = content;
  if (path.basename(from).endsWith(".story.tsx")) {
    // replace ./foo imports with ../src/foo
    updated = content.replace(/\.\//g, "../src/");
  } else if (path.basename(from).endsWith(".test.ts")) {
    // replace ../src/ imports with package path
    updated = content.replace(/\.\.\/src\//g, "playwright-react-test/");
  }
  writeFileSync(to, updated);
}

const this_package_path = path.resolve(".");

// Create a temporary project directory and subdirectories for src and tests
const tmp_project_path = mkdtempSync(
  path.join(tmpdir(), "pwright-react-testProject"),
);
const tmp_src_dir_path = path.join(tmp_project_path, "src");
const tmp_tests_dir_path = path.join(tmp_project_path, "tests");

// Copy source files into the temp project's src directory
mkdirSync(tmp_src_dir_path);
copyFileSync(
  path.join("tests", "App.css"),
  path.join(tmp_src_dir_path, "App.css"),
);
copyFileSync(
  path.join("tests", "App.tsx"),
  path.join(tmp_src_dir_path, "App.tsx"),
);

// Copy test files into the temp project's tests directory
mkdirSync(tmp_tests_dir_path);
// Copy all ".story.tsx" and ".test.ts" files into tmp_tests_dir_path using copyTestFile
const testFiles = readdirSync("tests").filter(
  (f) => f.endsWith(".story.tsx") || f.endsWith(".test.ts"),
);
for (const file of testFiles) {
  const fromPath = path.join("tests", file);
  const toPath = path.join(tmp_tests_dir_path, file);
  copyTestFile(fromPath, toPath);
}
copyFileSync(
  path.join(".", "globalSetup.ts"),
  path.join(tmp_project_path, "globalSetup.ts"),
);
copyFileSync(
  path.join(".", "globalTeardown.ts"),
  path.join(tmp_project_path, "globalTeardown.ts"),
);

// Switch to the temporary project directory and install dependencies
chdir(tmp_project_path);
execSync(`npm i -D ${this_package_path} playwright`);

// Write a minimal Playwright configuration file
writeFileSync(
  path.join(tmp_project_path, "playwright.config.ts"),
  `
import { defineConfig } from "playwright-react-test/test";

export default defineConfig({
  testMatch: ["tests/**/*.ts"],
  timeout: 30_000,
  retries: 0,
  use: {
    viewport: { width: 1280, height: 720 },
    headless: true,
  },
  globalSetup: "./globalSetup.ts",
  globalTeardown: "./globalTeardown.ts",
});
`,
);

// Run the Playwright tests inside the temporary project
execSync("npx playwright test");

// Clean up by removing the temporary directory
rmSync(tmp_project_path, {
  recursive: true,
  force: true,
});
