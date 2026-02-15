/*
 * App.test.ts – example integration test
 * Uses Playwright’s test runner to mount the story and verify UI updates.
 */
// Test file for the App component using Playwright's testing library
import { test, expect } from "../src/test";
import { AppProps } from "./App";

test("App example", async ({ page, mountStory, updateStory }) => {
	// The story properties which are just passed to the App component.
  const app_props: AppProps = {
    text: "world!",
  };

  // Mount the story in the browser.
  await mountStory(app_props);

  // Check that CSS as been injected in the page.
  expect(await page.evaluateHandle(() => {
        const body_style = getComputedStyle(document.body);
        return body_style.backgroundColor === '#000000' && body_style.color.toLowerCase() === '#ffffff';
    })).toBeTruthy();

    // Check that component has been mounted with right property
  await expect(page.getByText("Hello: world!")).toBeVisible();

// Change property
  app_props.text = "user!";

  // Store current h1 element to compare it after update it will assert that updateStory does not re-mount the story.
  const elBefore = await page.$('h1');
 
  // Update the story with new properties
  updateStory(app_props);
 
  // Verify that the h1 element is still the same node after update
  const sameNode = await page.evaluate((before)=>{const after=document.querySelector('h1'); return before && before.isSameNode(after);}, elBefore);
  expect(sameNode).toBeTruthy();
 
  // Check that component has been updated with the right property
  await expect(page.getByText("Hello: user!")).toBeVisible();
});
