import { test, expect } from "@playwright/test";

async function signIn(page, email = "aarav@college.edu") {
  await page.goto("/login");
  await page.getByLabel("College email").fill(email);
  await page.getByLabel("Password").fill("BrowserDemo123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/marketplace/);
}

test("saved finds recover from malformed storage and filter chips are removable", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem("hs_saved", '{"unexpected":true}'));
  await page.goto("/");
  await expect(page.locator(".product-card")).toHaveCount(8);
  const save = page.getByRole("button", { name: "Save listing", exact: true }).first();
  await save.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("button", { name: "Unsave listing" }).first()).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("status")).toContainText("Saved on this device");
  await page.goto("/marketplace?condition=Fair&block=A");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Remove Fair filter" }).click();
  await expect(page).not.toHaveURL(/condition=/);
  await expect(page).toHaveURL(/block=A/);
  await page.getByRole("button", { name: "Clear all", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(8);
  expect(errors).toEqual([]);
});

test("report dialog contains keyboard focus and restores it on escape", async ({ page }) => {
  await signIn(page);
  await page.goto("/listings/1");
  const trigger = page.getByRole("button", { name: "Report this listing" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const first = dialog.getByRole("button", { name: "Close dialog" });
  await expect(first).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Submit report" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("mobile account navigation exposes moderation and sign-out; guideline anchors scroll", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await signIn(page, "admin@college.edu");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const toggle = page.getByRole("button", { name: "Toggle navigation" });
  await toggle.click();
  await expect(page.locator(".mobile-account").getByRole("link", { name: "Moderation" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.locator(".mobile-account").getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("link", { name: "Log in", exact: true })).toBeVisible();
  await page.goto("/help#guidelines");
  await expect.poll(() => page.locator("#guidelines").evaluate((element) => element.getBoundingClientRect().top)).toBeLessThan(40);
});

test("public pages fit phone, tablet, and desktop widths", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/marketplace", "/login", "/register", "/listings/1", "/help", "/missing-page"]) {
      await page.goto(route);
      await expect(page.locator("h1:visible, h2:visible").first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px ${route}`).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});
