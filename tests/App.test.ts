import { test, expect } from "../src/test";

test("App example", async ({ page, mountComponent, updateComponent }) => {
  mountComponent({
    text: "world!",
  });
  await expect(page.getByText("Hello: world!")).toBeVisible();
  updateComponent({
    text: "user!",
  });
  await expect(page.getByText("Hello: user!")).toBeVisible();
});
