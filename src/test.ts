import {
  test as base,
  defineConfig as base_defineConfig,
  Page,
  PlaywrightTestConfig,
} from "@playwright/test";
import { resolveStoryPath } from "./utils/storyResolver";
import { existsSync } from "fs";
// This file extends Playwright's test object to provide utilities for mounting and updating React components during tests.
import path from "path";
import build from "./build";
import { normalizeArray } from "./utils/arrayHelper";

let exposeFunctionCounter = 0;
const exposeFunctionInProps = async (
  page: Page,
  props: any,
  binding: boolean = false,
  prefix = "",
) => {
  if (props === null || typeof props !== "object") return;

  for (const [key, value] of Object.entries(props)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "function") {
      const name = `pwreact_fn${exposeFunctionCounter}_${fullKey}`;
      if (binding) {
        await page.exposeBinding(name, value as any);
      } else {
        await page.exposeFunction(name, value);
      }
    } else if (typeof value === "object" && value !== null) {
      await exposeFunctionInProps(page, value, binding, fullKey);
    }
  }
};

export type StoryOptions = {
  exposeBinding?: boolean;
};

export type MountStoryOptions = {
  storyFile?: string;
} & StoryOptions;
export type UpdateStoryOptions = StoryOptions;

// Extend Playwright's test with custom utilities for React component testing
/**
 * Custom utilities added to Playwright's test object.
 * @property {Function} mountStory - Function that mounts a React story with initial props.
 * @property {Function} updateStory - Function that updates the mounted component’s props.
 */
export const test = base.extend<{
  /**
   * Mounts a React component with the given props and optional configuration.
   * @param props Initial props for the component.
   * @param options Optional configuration for mounting. Currently supports:
   *  - `storyFile` (string): Explicit path to the story file to use instead of inferring from test filename.
   *    Useful when a test needs to mount a different story than the one that matches its filename.
   *  - `exposeBinding` (boolean): Use exposeBinding instead of exposeFunction when exposing a function in the props.
   *    Useful when a test need to run Playwright API calls from callbacks (all callback in props must have the correct signature).
   */

  mountStory<T = any>(props: T, options?: MountStoryOptions): Promise<void>;

  /**
   * Updates an already mounted component with new props.
   */
  updateStory<T = any>(props: T, options?: UpdateStoryOptions): Promise<void>;
}>({
  /**
   * Mounts a React component into the Playwright page.
   * @param page - The Playwright Page instance.
   * @param use - Hook to provide the mounting function to tests.
   * @param testInfo - Information about the current test, used to locate the story file.
   */
  mountStory: async ({ page }, use, testInfo) => {
    await use(async (props: any, options?: MountStoryOptions) => {
      // Check that environment was initialized
      if (!process.env.PWRIGHT_REACT_TEST_TMPDIR) {
        throw "Setup has not been called, use defineConfig from 'playwright-react-test/test' in your playwright config file";
      }

      // Resolve story path on disk to build it
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

      // Traverse all props recursively and expose every functions passed inside props to the page
      exposeFunctionCounter = 0;
      await exposeFunctionInProps(page, props, options?.exposeBinding);

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
 		${mount_callname}.render(document.getElementById('root'), {
 		  ...${JSON.stringify(props)},
 		  ...${mount_callname}.exposedFunctionsAsObject('pwreact_fn${exposeFunctionCounter}_'),
 		}, story);
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
    await use(async (props: any, options?: UpdateStoryOptions) => {
      let mount_callname = "mount.default";
      PWRIGHT_REACT_TEST_DEV: (() => {
        mount_callname = "mount";
      })();

      // Traverse all props recursively and expose every functions passed inside props to the page
      exposeFunctionCounter++;
      await exposeFunctionInProps(page, props, options?.exposeBinding);

      await page.addScriptTag({
        type: "module",
        content: `
		import mount from '/playwright-react-test/mount.js';
		${mount_callname}.update({
			...${JSON.stringify(props)},
			...${mount_callname}.exposedFunctionsAsObject('pwreact_fn${exposeFunctionCounter}_'),
		});
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
  const globalSetup = normalizeArray(config.globalSetup ?? []);
  const globalTeardown = normalizeArray(config.globalTeardown ?? []);
  globalSetup.push("playwright-react-test/setup");
  globalTeardown.push("playwright-react-test/teardown");
  return base_defineConfig({
    ...config,
    globalSetup: globalSetup,
    globalTeardown: globalTeardown,
  });
};

export { expect } from "@playwright/test";
