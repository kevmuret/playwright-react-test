// Test file for the App component using Playwright's testing library
import { test, expect } from "../src/test";
import { AppProps } from "./App";

test("App example", async ({ page, mountStory, updateStory }) => {
  const app_props: AppProps = {
    text: "world!",
  };
  await mountStory(app_props);
  await expect(page.getByText("Hello: world!")).toBeVisible();
  app_props.text = "user!";
  updateStory(app_props);
  await expect(page.getByText("Hello: user!")).toBeVisible();
});
