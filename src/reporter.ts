// Import Playwright reporter interfaces
import { FullConfig, Reporter, Suite } from "@playwright/test/reporter";
import {
  existsSync,
  mkdtempSync,
  promises as fsPromises,
  readFileSync,
  rmSync,
} from "fs";
// esbuild is used to bundle React components and test stories
import { build, BuildOptions } from "esbuild";
import path from "path";
import { tmpdir } from "os";

// Reporter that bundles test stories and a mount file for Playwright tests
class ReactTestReporter implements Reporter {
  tsConfig: any;
  tmpDir?: string;
  // Store paths of all discovered story files
  testStories = new Set<string>();

  // Initializes reporter with optional TypeScript config
  constructor(options: { tsConfig?: any } = {}) {
    this.tsConfig = options.tsConfig ?? {};
    // Create a temporary directory for bundled output and expose it via env var
    this.tmpDir = process.env.PWRIGHT_REACT_TEST_TMPDIR = mkdtempSync(
      path.join(tmpdir(), "pwright-react-"),
    );
  }

  // Recursively gather all test story files from the suite hierarchy
  private collectFiles(suite: Suite): void {
    for (const child of suite.suites) this.collectFiles(child);
    for (const test of suite.tests) {
      const story_path = /(\.(test|spec))?\.ts$/.test(test.location.file)
        ? test.location.file.replace(/(\.(test|spec))?\.ts$/, ".story.tsx")
        : null;
      if (story_path && existsSync(story_path)) {
        this.testStories.add(story_path);
      }
    }
  }

  // Called when a test run begins; sets up build options and compiles the stories
  async onBegin(_config: FullConfig, suite: Suite): Promise<void> {
    this.collectFiles(suite);

    this.tmpDir = process.env.PWRIGHT_REACT_TEST_TMPDIR;
    // Configure esbuild options for bundling
    const build_options: BuildOptions = {
      entryPoints: [
        "react",
        "react-dom/client",
        ...Array.from(this.testStories),
      ],
      bundle: true,
      outdir: this.tmpDir,
      tsconfigRaw: {
        compilerOptions: Object.assign(this.tsConfig, { jsx: "react-jsx" }),
      },
    };

    if (process.env.NODE_ENV === "development") {
      build_options.stdin = {
        contents: readFileSync("./src/mount.ts", "utf8"),
        resolveDir: "./src",
        sourcefile: "src/react-test/mount.ts",
        loader: "ts",
      };
    } else {
      // @ts-ignore passing a string as argument is causing an error while it's not.
      build_options.entryPoints!.push("playwright-react-test/mount");
    }

    await build(build_options);

    if (process.env.NODE_ENV === "development") {
      const prt_dir = path.join(this.tmpDir!, "playwright-react-test");
      await fsPromises.mkdir(prt_dir, { recursive: true });
      const src = path.join(this.tmpDir!, "stdin.js");
      const dst = path.join(prt_dir, "mount.js");

      // Helper that polls for a file until it exists or times out
      const waitForFile = async (filePath: string, timeout = 5000) => {
        const start = Date.now();
        while (true) {
          try {
            await fsPromises.access(filePath);
            break;
          } catch {
            if (Date.now() - start > timeout) {
              throw new Error(`Timed out waiting for ${filePath}`);
            }
            await new Promise((r) => setTimeout(r, 50));
          }
        }
      };

      // Wait until stdin.js is actually written to disk
      await waitForFile(src);
      await fsPromises.rename(src, dst);
    }
  }

  async onExit(): Promise<void> {
    // Cleanup build files
    if (this.tmpDir) {
      rmSync(this.tmpDir, { recursive: true, force: true });
    }
  }

  printsToStdio(): boolean {
    // This reporter output nothing
    return false;
  }
}

export default ReactTestReporter;
