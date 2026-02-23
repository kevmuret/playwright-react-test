/*
 * App.test.ts – example integration test
 * Uses Playwright’s test runner to mount the story and verify UI updates.
 */
// Test file for the App component using Playwright's testing library
import { JSHandle, Page } from "playwright";
import { test, expect } from "../src/test";
import { AppProps } from "./App";

// Default story mounting test
test("App example", async ({ page, mountStory, updateStory }) => {
  const app_props: AppProps = { text: "world!" };

  // Mount the story in the browser.
  await mountStory(app_props);

  // Check that CSS has been injected in the page.
  expect(
    await page.evaluateHandle(() => {
      const body_style = getComputedStyle(document.body);
      return (
        body_style.backgroundColor === "#000000" &&
        body_style.color.toLowerCase() === "#ffffff"
      );
    }),
  ).toBeTruthy();

  // Check that component has been mounted with right property
  await expect(page.getByText("Hello: world!")).toBeVisible();

  // Change property
  app_props.text = "user!";

  // Store current h1 element to compare it after update; it will assert that updateStory does not re-mount the story.
  const elBefore = await page.$("h1");

  // Update the story with new properties
  await updateStory(app_props);

  // Verify that the h1 element is still the same node after update
  const sameNode = await page.evaluate((before) => {
    const after = document.querySelector("h1");
    return before && before.isSameNode(after);
  }, elBefore);
  expect(sameNode).toBeTruthy();

  // Check that component has been updated with the right property
  await expect(page.getByText("Hello: user!")).toBeVisible();
});

// Test mounting with explicit story file override
test("App alternate story", async ({ page, mountStory }) => {
  const app_props: AppProps = { text: "ignored" };
  await mountStory(app_props, { storyFile: "./AlternateApp.story.tsx" });
  await expect(page.getByText("Hello: alternate")).toBeVisible();
});

// Test that functions are automatically exposed
test("App exposed function", async ({ page, mountStory, updateStory }) => {
  let call_count = 0;
  let callback_arg: string = "";
  const app_props: AppProps = {
    text: "world",
    onClick: (text: string) => {
      call_count++;
      callback_arg = text;
      return true;
    },
  };

  await mountStory(app_props);

  // Click to trigger the callback
  await page.getByText("Hello: world").click();
  // Check that `onClick` was called
  expect(call_count).toBe(1);
  expect(callback_arg).toBe("world");

  // Check with new callback
  app_props.onClick = (text: string) => {
    call_count++;
    callback_arg = `updated: ${text}`;
      return true;
  };

  await updateStory(app_props);

  // Click to trigger the callback
  await page.getByText("Hello: world").click();
  // Check that `onClick` was called
  expect(call_count).toBe(2);
  expect(callback_arg).toBe("updated: world");
});

// Test that functions are automatically exposed (with binding)
test("App binding function", async ({ page, mountStory, updateStory }) => {
  let call_count = 0;
  const expect_page_url = `http://localhost:${process.env.PWRIGHT_REACT_TEST_PORT}/mount.html`;
  // Because binding cannot have the same signature as "onClick" defined in AppProps we have to use "any" type
  const app_props: any = {
    text: "world",
    onClick: ({ page }: { page: Page }, arg: JSHandle) => {
      call_count++;
      expect(arg.jsonValue()).toBe('"world"');
      expect(page.url()).toBe(expect_page_url);
      return true;
    },
  };

  await mountStory(app_props, {
    exposeBinding: true,
  });

  // Click to trigger the callback
  await page.getByText("Hello: world").click();
  // Check that `onClick` was called
  expect(call_count).toBe(1);

  // Check with new callback
  app_props.text = "updated!";
  app_props.onClick = ({ page }: { page: Page }, arg: JSHandle) => {
    call_count++;
    expect(arg.jsonValue()).toBe('"updated!"');
    expect(page.url()).toBe(expect_page_url);
      return true;
  };

  await updateStory(app_props, {
    exposeBinding: true,
  });

  // Click to trigger the callback
  await page.getByText("Hello: updated!").click();
  // Check that `onClick` was called
  expect(call_count).toBe(2);
});
