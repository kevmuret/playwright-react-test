import { FullConfig } from "playwright/test";

import { existsSync, unlinkSync } from "node:fs";

export default async (config: FullConfig) => {
  if (!existsSync(".testrunning")) {
    throw new Error(".testrunning file does not exist");
  } else {
    unlinkSync(".testrunning");
  }
  return config;
};
