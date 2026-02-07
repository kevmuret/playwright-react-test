import { FullConfig, Reporter, Suite } from "@playwright/test/reporter";
import { existsSync, mkdir, readFileSync, rename, rmSync } from "fs";
import { build } from "esbuild";
import path from "path";

export const testStories = new Set<string>();

class ReactTestReporter implements Reporter {
  tsConfig: Object;
  tmpDir: string;
  constructor(options: { tsConfig?: Object } = {}) {
    this.tsConfig = options.tsConfig || {};
  }
  async onBegin(config: FullConfig, suite: Suite): Promise<void> {
    if (!process.env.PWRIGHT_REACT_TEST_TMPDIR) {
      throw "Setup has not been called, include globalSetup: require(...) in yout config file";
    }

    // Recursively collect test file paths
    function collectFiles(suite: Suite) {
      for (const child of suite.suites) {
        collectFiles(child);
      }
      for (const test of suite.tests) {
        const story_path = /(\.(test|spec))?\.ts$/.test(test.location.file)
          ? test.location.file.replace(/(\.(test|spec)?)\.ts$/, ".story.tsx")
          : null;
        if (story_path && existsSync(story_path)) {
          testStories.add(story_path);
        }
      }
    }

    collectFiles(suite);

    this.tmpDir = process.env.PWRIGHT_REACT_TEST_TMPDIR;
    const build_options = {
      entryPoints: ["react", "react-dom/client"].concat(
        Array.from(testStories),
      ),
      bundle: true,
      outdir: this.tmpDir,
      tsconfigRaw: {
        compilerOptions: Object.assign(this.tsConfig, {
          jsx: "react-jsx",
        }),
      },
    };
    if (process.env.NODE_ENV === 'development') {
	    build_options.stdin = {
        contents: readFileSync("./src/mount.ts"),
        resolveDir: "./src",
        sourcefile: "src/react-test/mount.ts",
        loader: "ts",
      };
    } else {
	    build_options.entryPoints.push("playwright-react-test/mount");
    }
    await build(build_options);
    if (process.env.NODE_ENV === 'development') {
	    const prt_dir = path.join(this.tmpDir, "playwright-react-test");
	    mkdir(prt_dir, { recursive: true }, (err) => {
	      if (err) throw err;
	    });
	    rename(
	      path.join(this.tmpDir, "stdin.js"),
	      path.join(prt_dir, "mount.js"),
	      (err) => {
		if (err) throw err;
	      },
	    );
    }
  }
  onExit(): Promise<void> {
    rmSync(this.tmpDir, {
      recursive: true,
      force: true,
    });
  }
  printsToStdio(): boolean {
    return false;
  }
}

export default ReactTestReporter;
