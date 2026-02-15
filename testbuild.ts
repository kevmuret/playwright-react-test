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
} from "fs";
import { tmpdir } from "os";
import path from "path";
import { chdir } from "process";

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
copyFileSync(
  path.join("tests", "App.story.tsx"),
  path.join(tmp_tests_dir_path, "App.story.tsx"),
);
const storyTsxPath = path.join(tmp_tests_dir_path, "App.story.tsx");
const storyTsxContent = readFileSync(storyTsxPath, "utf8");
// Update relative imports in the story file
const updatedStoryTsxContent = storyTsxContent.replace(/\.\//g, "../src/");
writeFileSync(storyTsxPath, updatedStoryTsxContent);
copyFileSync(
  path.join("tests", "App.test.ts"),
  path.join(tmp_tests_dir_path, "App.test.ts"),
);
const testTsPath = path.join(tmp_tests_dir_path, "App.test.ts");
const testTsContent = readFileSync(testTsPath, "utf8");
// Update import paths in the test file to reference the package
const updatedTestTsContent = testTsContent.replace(
  /\..\/src\//g,
  "playwright-react-test/",
);
writeFileSync(testTsPath, updatedTestTsContent);

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
