import { build, BuildOptions } from "esbuild";
import { promises } from "fs";

type InternalBuildOptions = Pick<
  BuildOptions,
  "entryPoints" | "bundle" | "outdir" | "outbase" | "tsconfigRaw"
>;

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

// Helper that polls for a file until it exists or times out
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
