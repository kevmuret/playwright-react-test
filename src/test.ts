import { test as base } from "@playwright/test";
import { readFileSync } from "fs";
import path from "path";

export const test = base.extend<{
  mountComponent: (props: any) => void;
  updateComponent: (props: any) => void;
}>({
  mountComponent: async ({ page }, use, testInfo) => {
    await use((props: any) => {
      if (!process.env.PWRIGHT_REACT_TEST_TMPDIR) {
        throw "Setup has not been called, include globalSetup: require(...) in yout config file";
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
  updateComponent: async ({ page }, use, testInfo) => {
    await use(async (props: any) => {
      await page.evaluate((props) => {
        globalThis.ReactTestPropsHandler.update(props);
      }, props);
    });
  },
});

export { expect } from "@playwright/test";
