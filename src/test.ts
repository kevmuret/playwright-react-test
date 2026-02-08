import {
  test as base,
  defineConfig as base_defineConfig,
  PlaywrightTestConfig,
  ReporterDescription,
} from "@playwright/test";
import { readFileSync } from "fs";
// This file extends Playwright's test object to provide utilities for mounting and updating React components during tests.
import path from "path";

// Extend Playwright's test with custom utilities for React component testing
/**
 * Custom utilities added to Playwright's test object.
 * @property {Function} mountStory - Function that mounts a React story with initial props.
 * @property {Function} updateStory - Function that updates the mounted component’s props.
 */
export const test = base.extend<{
  /**
   * Mounts a React component with the given props.
   */
  mountStory: (props: any) => void;
  /**
   * Updates an already mounted component with new props.
   */
  updateStory: (props: any) => void;
}>({
  /**
   * Mounts a React component into the Playwright page.
   * @param page - The Playwright Page instance.
   * @param use - Hook to provide the mounting function to tests.
   * @param testInfo - Information about the current test, used to locate the story file.
   */
  mountStory: async ({ page }, use, testInfo) => {
    await use((props: any) => {
      if (!process.env.PWRIGHT_REACT_TEST_TMPDIR) {
        throw "Setup has not been called, use defineConfig from 'playwright-react-test/test' in your playwright config file";
      }
      const tmp_dir = process.env.PWRIGHT_REACT_TEST_TMPDIR;
      const story_path = path
        .resolve(
          path.join(tmp_dir, path.relative(path.resolve("."), testInfo.file)),
        )
        .replace(/\.test\.ts$/, ".story.js");
      page.setContent(`
	<html>
		<head>
			<script>${readFileSync(path.resolve(path.join(tmp_dir, "react.js")))}</script>
			<script>${readFileSync(path.resolve(path.join(tmp_dir, "react-dom/client.js")))}</script>
		</head>
		<body>
			<div id="root"></div>
			<script>${readFileSync(path.join(tmp_dir, "playwright-react-test/mount.js"))}</script>
			<script>${readFileSync(story_path)}</script>
			<script>ReactTestMount(document.getElementById('root'), ${JSON.stringify(props)}, story);</script>
		</body>
	</html>`);
    });
  },
  /**
   * Updates props of an already mounted React component.
   * @param page - The Playwright Page instance.
   * @param use - Hook to provide the update function to tests.
   */
  updateStory: async ({ page }, use) => {
    await use(async (props: any) => {
      await page.evaluate((props) => {
        (globalThis as any).ReactTestPropsHandler.update(props);
      }, props);
    });
  },
});

/**
 * Extends Playwright's configuration with the custom reporter and utilities.
 * This helper ensures that the `playwright-react-test/reporter` is added to
 * the test runner while preserving any user‑supplied reporter settings.
 * It should be used in place of `defineConfig` from @playwright/test.
 */
export const defineConfig = (
  config: PlaywrightTestConfig,
): PlaywrightTestConfig => {
  const reporter: ReporterDescription[] = [
    ["playwright-react-test/reporter", {}],
  ];
  switch (typeof config.reporter) {
    case "string":
      reporter.push([config.reporter]);
      break;
    case "undefined":
      break;
    default:
      reporter.concat(config.reporter);
      break;
  }
  return base_defineConfig({
    ...config,
    reporter: reporter,
  });
};

export { expect } from "@playwright/test";
