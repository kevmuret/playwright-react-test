// Test file for the App component using Playwright's testing library
import { test, expect } from "../src/test";

test("App example", async ({ page, mountStory, updateStory }) => {
  mountStory({
    text: "world!",
  });
  await expect(page.getByText("Hello: world!")).toBeVisible();
  updateStory({
    text: "user!",
  });
  await expect(page.getByText("Hello: user!")).toBeVisible();
});
