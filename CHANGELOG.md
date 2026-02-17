# Changelog

All notable changes to this project will be documented in this file.

## [0.2.2] - 2026-02-15
### Added
- New server‑based setup (`startup.ts`, `teardown.ts`) that bundles and serves React stories.
- Dedicated `build.ts` util for esbuild bundling with CSS support.
- Exposed additional exports: `mount.html`, `startup`, `teardown`.
- Updated build script to minify HTML via `html-minifier-terser`.
- Added linting, test‑build scripts and peer‑dependency updates.

### Changed
- Replaced reporter‑based bundling with explicit startup phase.
- Updated story mounting API to use `mount.render` / `mount.update` helpers.
- Made mounting logic async and CSS aware.
- Simplified test utilities: `mountStory` & `updateStory` are now async.
- Updated package version to 0.2.1.

### Removed
- Legacy reporter (`src/reporter.ts`).
- Old mounting global helpers.

## [0.2.3] - 2026-02-16
### Added
- New option to override story file when mounting a component (`mountStory` now accepts an optional `storyFile` path).
- Updated documentation and examples in README to showcase the new `storyFile` configuration.
- Refactored `mountStory` signature and internal logic to support explicit story paths.

### Changed
- Updated type definitions for `mountStory` to include optional options object.
- Improved error handling when a specified story file is missing or outside the working directory.
- Adjusted build path resolution to use resolved absolute paths.
- Minor code style and comment updates for clarity.

## [0.2.4] - 2026-02-17
### Added
- New globalSetup.ts and globalTeardown.ts scripts to manage test state.
- Utility functions resolveStoryPath (src/utils/storyResolver.ts) and normalizeArray (src/utils/arrayHelper.ts).
- Updated build script to bundle utils during esbuild.
- Exported storyResolver and arrayHelpers in package.json.

### Changed
- README now notes that playwright options are still available and supports custom setup/teardown arrays.
- src/test.ts refactored to use resolveStoryPath and normalizeArray; removed inline logic.
- package.json exports adjusted to include new utils.

### Removed
- None.

