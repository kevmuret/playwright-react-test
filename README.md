# Playwright React Test Utility

A lightweight, zero‑configuration library that lets you **mount and update React components inside Playwright tests**.

## Features
- 🏃 Zero‑configuration setup – just install, use the `defineConfig` from 'playwright-react-test/test' module and start writing tests.
- 🎉 **Mount & update** – expose `mountStory` and `updateStory` fixtures in your test files.
- ⚡️ Automatic bundling of stories (and their CSS) via *esbuild* at runtime.
- 🚀 HTTP server that serves bundled assets from a temporary directory, exposing the port through `process.env.PWRIGHT_REACT_TEST_PORT`.
- 🔧 Global setup/teardown hooks (`startup.ts`, `teardown.ts`) replace the old reporter‑based approach.
- 📦 New exports: `mount.html`, `startup`, and `teardown` in addition to the previous ones.
- 🧪 TypeScript‑first – all components are typed, tests use Playwright’s built‑in test runner.

Note: Currently, it supports only tests written in TypeScript.

## Prerequisites
- Node 18.x+
- npm
- Playwright (peer dependency of this package)

## Installation
```bash
# Using npm
npm i -D playwright-react-test
```

The package pulls in `@playwright/test` as a peer dependency, so make sure you have it installed:
```bash
npm i -D @playwright/test
```

A minimal `package.json` file would be:
```json
{
  "devDependencies": {
    "@types/react": "^19.2.13",
    "playwright": "^1.58.2"
  },
  "dependencies": {
    "playwright-react-test": "file:../playwright-react-test"
  }
}
```

## Usage

### Writing playwright config

Use the `defineConfig` from the `playwright-react-test/test` module instead of the original Playwright `defineConfig` for easy setup.

Create a file with the name `playwright.config.ts` and write:
```typescript
import { defineConfig } from 'playwright-react-test/test';

export default defineConfig({
  // Write you usual playwright configuration
  testMatch: ["tests/**/*.ts"],
  timeout: 30_000,
  retries: 0,
  use: {
    viewport: { width: 1280, height: 720 },
    headless: true,
  },
});
```

or if you prefer you can use the original defineConfig and pass the `globalSetup` and `globalTeardown` available at `playwright-react-test/setup` and `playwright-react-test/teardown` respectively:
```typescript
export default defineConfig({
  globalSetup: 'playwright-react-test/setup',
  globalTeardown: 'playwright-react-test/teardown',
});
```

### Writing tests

First create story file (e.g., `tests/example.story.tsx`) and write:
```typescript
import { React } from 'react';
import MyComponent, { MyComponentProps } from '../src/MyComponent';

// The default export is the React component that will be mounted
// you can encapsulate the component you want to test here passing the same props.
export default (props: MyComponentProps) => {
  return <MyComponent {...props}>Hello {props.text} !</MyComponent>;
}
```

Note: The story file is only available within the browser; it is not accessible directly from your test file.

Create a test file with the same name as the story file (e.g., `tests/example.test.ts`) and write:
```typescript
import { test, expect } from 'playwright-react-test/test';
import { MyComponentProps } from '../src/MyComponent';

test('MyComponent renders and update correctly', async ({ page, mountStory, updateStory }) => {
  mountStory<MyComponentProps>({
    text: 'world'
  });
  await expect(page.getByText('Hello world !')).toBeVisible();
  // Write any other expectations for MyComponent...

  // Update story props cause re-render of the story component
  // The props will replace all props, pass a variable if you don't want to change all props.
  updateStory<MyComponentProps>({
    text: 'you',
  });
  await expect(page.getByText('Hello you !')).toBeVisible();
});
```

### Running tests

Run the tests using:
```bash
npx playwright test
```

## License
MIT © 2026 Kevin Muret <kevmuret@gmail.com>
