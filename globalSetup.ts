import { existsSync, writeFileSync } from "node:fs";
import { FullConfig } from "playwright/test";

export default async (config: FullConfig) => {
  if (existsSync(".testrunning")) {
    throw new Error(".testrunning file already exists");
  } else {
    writeFileSync(".testrunning", "");
  }
  return config;
};
