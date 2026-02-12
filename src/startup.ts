import {
  mkdtempSync,
  readFileSync,
  promises as fsPromises,
  copyFileSync,
  mkdirSync,
} from "fs";
import { tmpdir } from "os";
import path from "path";
import startServer, { ServerInfos } from "./server";
import { FullConfig } from "playwright/test";
import build, { waitForFile } from "./build";
import { BuildOptions } from "esbuild";

let server_infos: ServerInfos;
export const serverClose = async () => {
  if (!server_infos) return false;
  await server_infos.close();
};

export default async (config: FullConfig) => {
  const tmp_dir_path = (process.env.PWRIGHT_REACT_TEST_TMPDIR = mkdtempSync(
    path.join(tmpdir(), "pwright-react-"),
  ));
  const prt_dir = path.join(tmp_dir_path!, "playwright-react-test");
  // Configure esbuild options for bundling
  const entry_points = [
    "react",
    "react-dom/client",
    "playwright-react-test/mount",
    "playwright-react-test/mount.html",
  ];
  const build_options: BuildOptions = {
    loader: {
      ".html": "copy",
    },
  };

  PWRIGHT_REACT_TEST_DEV: (() => {
    entry_points.pop();
    entry_points.pop();
    entry_points.push("./src/mount.ts");
    entry_points.push("./src/mount.html");
  })();

  await build(
    process.env.PWRIGHT_REACT_TEST_TMPDIR,
    entry_points,
    build_options,
  );
  PWRIGHT_REACT_TEST_DEV: (() => {
    fsPromises.rename(path.join(tmp_dir_path, "src"), prt_dir);
  })();

  await fsPromises.rename(
    path.join(prt_dir, "mount.html"),
    path.join(tmp_dir_path, "mount.html"),
  );

  server_infos = await startServer(process.env.PWRIGHT_REACT_TEST_TMPDIR);
  process.env.PWRIGHT_REACT_TEST_PORT = server_infos.port.toString();

  return config;
};
