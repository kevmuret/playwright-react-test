import path from "path";
import { existsSync } from "fs";

/**
 * Resolve the story file path based on Playwright's TestInfo and optional options.
 * This function returns the absolute path to a Storybook story file corresponding to a test/spec file.
 *
 * @param testInfo Playwright TestInfo object.
 * @param options Optional overrides for story file location.
 * @returns Absolute path to the resolved Storybook story file.
 */
export const resolveStoryPath = (
  testInfo: any,
  options?: { storyFile?: string },
): string => {
  let story_path: string;
  if (options?.storyFile) {
    const testDir = path.dirname(testInfo.file);
    story_path = path.resolve(testDir, options.storyFile);
  } else {
    story_path = testInfo.file.replace(/(\.(test|spec))?\.ts$/, ".story.tsx");
  }
  const resolvedPath = path.resolve(story_path);
  if (!resolvedPath.startsWith(process.cwd())) {
    throw `Story file ${story_path} is outside of the current working directory: ${resolvedPath}`;
  }
  if (!existsSync(resolvedPath)) {
    throw `Missing ${story_path} file !`;
  }
  // Return the resolved relative path of the story file
  return story_path;
};
