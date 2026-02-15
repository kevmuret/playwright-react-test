# Changelog

All notable changes to this project will be documented in this file.

## [0.2.1] - 2026-02-15
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
