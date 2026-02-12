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

const tmp_project_path = mkdtempSync(
  path.join(tmpdir(), "pwright-react-testProject"),
);
const tmp_src_dir_path = path.join(tmp_project_path, "src");
const tmp_tests_dir_path = path.join(tmp_project_path, "tests");

mkdirSync(tmp_src_dir_path);
copyFileSync(
  path.join("tests", "App.css"),
  path.join(tmp_src_dir_path, "App.css"),
);
copyFileSync(
  path.join("tests", "App.tsx"),
  path.join(tmp_src_dir_path, "App.tsx"),
);

mkdirSync(tmp_tests_dir_path);
copyFileSync(
  path.join("tests", "App.story.tsx"),
  path.join(tmp_tests_dir_path, "App.story.tsx"),
);
const storyTsxPath = path.join(tmp_tests_dir_path, "App.story.tsx");
const storyTsxContent = readFileSync(storyTsxPath, "utf8");
const updatedStoryTsxContent = storyTsxContent.replace(/\.\//g, "../src/");
writeFileSync(storyTsxPath, updatedStoryTsxContent);
copyFileSync(
  path.join("tests", "App.test.ts"),
  path.join(tmp_tests_dir_path, "App.test.ts"),
);
const testTsPath = path.join(tmp_tests_dir_path, "App.test.ts");
const testTsContent = readFileSync(testTsPath, "utf8");
const updatedTestTsContent = testTsContent.replace(
  /\.\.\/src\//g,
  "playwright-react-test/",
);
writeFileSync(testTsPath, updatedTestTsContent);

chdir(tmp_project_path);
execSync(`npm i -D ${this_package_path} playwright`);

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

execSync("npx playwright test");

rmSync(tmp_project_path, {
  recursive: true,
  force: true,
});
