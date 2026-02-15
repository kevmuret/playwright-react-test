import { build, BuildOptions } from "esbuild";
import { promises } from "fs";

type InternalBuildOptions = Pick<
  BuildOptions,
  "entryPoints" | "bundle" | "outdir" | "outbase" | "tsconfigRaw"
>;

/**
 * Bundle files to make them importable from the browser instances
 *
 * @param tmpDirPath - Directory where bundled files will be written.
 * @param entryPoints - Array of input file paths for the build.
 * @param options - Optional esbuild configuration overrides.
 * @returns The result object returned by esbuild's `build` function.
 */
export default async (
  tmp_dir_path: string,
  entry_points: Array<string>,
  options: Omit<BuildOptions, keyof InternalBuildOptions> = {},
) => {
  // Configure esbuild options for bundling
  const build_options: BuildOptions = Object.assign(
    {
      entryPoints: entry_points,
      bundle: true,
      format: "esm",
      outdir: tmp_dir_path,
      outbase: ".",
      tsconfigRaw: {
        compilerOptions: { jsx: "react-jsx" },
      },
    } as InternalBuildOptions,
    options,
  );

  const result = await build(build_options);
  return result;
};

/**
 * Waits for a file to exist within a given timeout.
 * Polls the filesystem every 50ms until the file is accessible or the
 * timeout expires. Useful in tests where build artifacts are created
 * asynchronously.
 *
 * @param filePath - Path of the file to wait for.
 * @param timeout - Maximum time in milliseconds to wait (default to 5  seconds).
 * @throws Will throw an error if the file does not appear before the timeout.
 */
export const waitForFile = async (filePath: string, timeout = 5000) => {
  const start = Date.now();
  while (true) {
    try {
      await promises.access(filePath);
      break;
    } catch {
      if (Date.now() - start > timeout) {
        throw new Error(`Timed out waiting for ${filePath}`);
      }
      await new Promise((r) => setTimeout(r, 50));
    }
  }
};
