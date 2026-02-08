import {
  test as base,
  defineConfig as base_defineConfig,
  PlaywrightTestConfig,
  ReporterDescription,
} from "@playwright/test";
import { readFileSync } from "fs";
import path from "path";

export const test = base.extend<{
  mountComponent: (props: any) => void;
  updateComponent: (props: any) => void;
}>({
  mountComponent: async ({ page }, use, testInfo) => {
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
  updateComponent: async ({ page }, use) => {
    await use(async (props: any) => {
      await page.evaluate((props) => {
        (globalThis as any).ReactTestPropsHandler.update(props);
      }, props);
    });
  },
});

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
