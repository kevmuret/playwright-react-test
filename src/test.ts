import {
  test as base,
  defineConfig as base_defineConfig,
  PlaywrightTestConfig,
  ReporterDescription,
} from "@playwright/test";
import { resolveStoryPath } from "./utils/storyResolver";
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
   /**
    * Mounts a React component with the given props and optional configuration.
    * @param props Initial props for the component.
    * @param options Optional configuration for mounting. Currently supports:
    *  - `storyFile` (string): Explicit path to the story file to use instead of inferring from test filename.
    *    Useful when a test needs to mount a different story than the one that matches its filename.
    */

  mountStory<T = any>(
    props: T,
    options?: { storyFile?: string },
  ): Promise<void>;

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
    await use(async (props: any, options?: { storyFile?: string }) => {
      /**
       * Optional configuration for mounting.
       * @param options.storyFile Path to a specific story file instead of inferring from test filename.
       */
      if (!process.env.PWRIGHT_REACT_TEST_TMPDIR) {
        throw "Setup has not been called, use defineConfig from 'playwright-react-test/test' in your playwright config file";
      }
      const storyPath = resolveStoryPath(testInfo, options);
      const resolvedPath = path.resolve(storyPath);
      if (!resolvedPath.startsWith(process.cwd())) {
        throw `Story file ${storyPath} is outside of the current working directory: ${resolvedPath}`;
      }
      if (!existsSync(resolvedPath)) {
        throw `Missing ${storyPath} file !`;
      }
      // Bundle story
      await build(process.env.PWRIGHT_REACT_TEST_TMPDIR, [resolvedPath], {
        loader: {
          ".css": "css",
        },
        assetNames: "[dir]/[name]",
      });
      // Relative path for the webserver
      const story_build_path = path
        .relative(path.resolve("."), storyPath)
        .replace(/\.tsx$/, ".js");
      const story_css_build_path = story_build_path.replace(/\.js$/, ".css");
      // Display mounting page
      await page.goto(
        `http://localhost:${process.env.PWRIGHT_REACT_TEST_PORT}/mount.html`,
      );
      // Mount the story
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
  return base_defineConfig({
    ...config,
    globalSetup: "playwright-react-test/setup",
    globalTeardown: "playwright-react-test/teardown",
  });
};

export { expect } from "@playwright/test";
