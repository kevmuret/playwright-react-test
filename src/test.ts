import {
  test as base,
  defineConfig as base_defineConfig,
  PlaywrightTestConfig,
  ReporterDescription,
} from "@playwright/test";
import { existsSync } from "fs";
// This file extends Playwright's test object to provide utilities for mounting and updating React components during tests.
import path from "path";
import build from "./build";

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
  mountStory<T = any>(props: T): Promise<void>;
  /**
   * Updates an already mounted component with new props.
   */
  updateStory<T = any>(props: T): Promise<void>;
}>({
  /**
   * Mounts a React component into the Playwright page.
   * @param page - The Playwright Page instance.
   * @param use - Hook to provide the mounting function to tests.
   * @param testInfo - Information about the current test, used to locate the story file.
   */
  mountStory: async ({ page }, use, testInfo) => {
    await use(async (props: any) => {
      if (!process.env.PWRIGHT_REACT_TEST_TMPDIR) {
        throw "Setup has not been called, use defineConfig from 'playwright-react-test/test' in your playwright config file";
      }
      const test_path = path.relative(path.resolve("."), testInfo.file);
      const story_path = test_path.replace(
        /(\.(test|spec))?\.ts$/,
        ".story.tsx",
      );
      if (!existsSync(story_path)) {
        throw `Missing ${story_path} file !`;
      }
      await build(process.env.PWRIGHT_REACT_TEST_TMPDIR, [story_path], {
        loader: {
          ".css": "css",
        },
        assetNames: "[dir]/[name]",
      });
      const story_build_path = test_path.replace(
        /(\.(test|spec))?\.ts$/,
        ".story.js",
      );
      const story_css_build_path = story_build_path.replace(/\.js$/, ".css");
      await page.goto(
        `http://localhost:${process.env.PWRIGHT_REACT_TEST_PORT}/mount.html`,
      );
      let mount_callname = "mount.default";
      PWRIGHT_REACT_TEST_DEV: (() => {
        mount_callname = "mount";
      })();
      await page.addScriptTag({
        type: "module",
        content: `
		import mount from '/playwright-react-test/mount.js';
		import story from '/${story_build_path}';
		${mount_callname}.render(document.getElementById('root'), ${JSON.stringify(props)}, story);
		`,
      });
      if (
        existsSync(
          path.join(
            process.env.PWRIGHT_REACT_TEST_TMPDIR,
            story_css_build_path,
          ),
        )
      ) {
        await page.addStyleTag({
          url: `/${story_css_build_path}`,
        });
      }
    });
  },
  /**
   * Updates props of an already mounted React component.
   * @param page - The Playwright Page instance.
   * @param use - Hook to provide the update function to tests.
   */
  updateStory: async ({ page }, use) => {
    await use(async (props: any) => {
      let mount_callname = "mount.default";
      PWRIGHT_REACT_TEST_DEV: (() => {
        mount_callname = "mount";
      })();
      await page.addScriptTag({
        type: "module",
        content: `
		    	import mount from '/playwright-react-test/mount.js';
			${mount_callname}.update(${JSON.stringify(props)});
	    		`,
      });
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
    globalSetup: "playwright-react-test/startup",
    globalTeardown: "playwright-react-test/teardown",
  });
};

export { expect } from "@playwright/test";
