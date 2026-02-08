# Playwright React Test Utility

A lightweight library that brings **Playwright** and **React** together, making it simple to mount components in a test context.

Note: Currently, it supports only tests written in TypeScript.

## Features
- **Mount React components** directly inside Playwright tests using the `mountStory` function provided as a fixture.
- **Update React components** directly inside Playwright tests using the `updateStory` function provided as a fixture.
- **An automatic bundle** using `ESBuild` inside a custom reporter which collect stories individually while keep the link with the react librairies (it does not prevent youfrom using other custom reporters).
- Zero‑configuration setup – just install, use the `defineConfig` from 'playwright-react-test/test' module and start writing tests.
- Built with **TypeScript**, providing type safety out of the box.

## Prerequisites
- Node.js 20.x+ (LTS)
- npm

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

or if you prefer you can use the original defineConfig and pass the `ReactTestReporter` available at `playwright-react-test/reporter`:
```typescript
export default defineConfig({
  reporter: [['playwright-react-test/reporter', {}]],
});
```

### Writing tests

First create story file (e.g., `tests/example.story.tsx`) and write:
```typescript
import { React } from 'react';
import MyComponent, { MyComponentProps } from '../src/MyComponent';

// Important: to expose the story inside the browser assign it into globalThis with the exact name "story".
(globalThis as any).story = (props: MyComponentProps) => {
  return <MyComponent {...props}>Hello {props.text} !</MyComponent>;
}
```

Note: The story file is only available within the browser; it is not accessible directly from your test file.

Create a test file with the same name as the story file (e.g., `tests/example.test.ts`) and write:
```typescript
import { test, expect } from 'playwright-react-test/test';
import MyComponent from '../src/MyComponent';

test('MyComponent renders and update correctly', async ({ page, mountStory, updateStory }) => {
  mountStory({
    text: 'world'
  });
  await expect(page.getByText('Hello world !')).toBeVisible();
  // Write any other expectations for MyComponent...

  // Update story props cause re-render of the story component
  updateStory({
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
