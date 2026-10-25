import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const png = readFileSync(new URL("./fixtures/lamp.png", import.meta.url));
test("desktop: register, list, find, contact, report, edit, sell and delete", async ({
  page,
  browser,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Good finds. Right next door." }),
  ).toBeVisible();
  await expect(page.locator(".product-card")).toHaveCount(8);
  await page.screenshot({
    path: "../qa-artifacts/home-desktop.png",
    fullPage: false,
  });
  await page
    .getByRole("link", { name: "Sell an item", exact: true })
    .first()
    .click();
  await page
    .getByRole("link", { name: "Create an account", exact: true })
    .click();
  await page.getByLabel("Full name").fill("Campus Tester");
  await page.getByLabel("College email").fill("browser-student@college.edu");
  await page.getByLabel("Password").fill("StudentPassword123!");
  await page.getByLabel("Hostel name").fill("Vindhya Hostel");
  await page.getByLabel("Block", { exact: true }).fill("D");
  await page.getByRole("button", { name: "Create your account" }).click();
  await expect(page).toHaveURL(/\/sell/);
  await page.getByLabel("Item name").fill("Browser test study lamp");
  await page
    .getByLabel("Description")
    .fill("A useful study lamp for late-night exam revision.");
  await page
    .getByLabel("Category", { exact: true })
    .selectOption({ label: "Room Essentials" });
  await page.getByLabel("Asking price").fill("450");
  await page.getByLabel("Original price").fill("900");
  await page
    .getByLabel("Product photo")
    .setInputFiles({ name: "lamp.png", mimeType: "image/png", buffer: png });
  await page.getByRole("button", { name: "Publish your listing" }).click();
  await expect(
    page.getByRole("heading", { name: "Browser test study lamp" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Explore marketplace", exact: true })
    .first()
    .click();
  await page
    .getByRole("textbox", { name: "Search items" })
    .fill("Browser test");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByLabel("Hostel block", { exact: true }).fill("D");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page
    .getByRole("link", { name: "Browser test study lamp", exact: true })
    .click();
  const url = page.url();
  const buyer = await browser.newContext();
  const buyerPage = await buyer.newPage();
  await buyerPage.goto("http://localhost:5174/login");
  await buyerPage.getByLabel("College email").fill("aarav@college.edu");
  await buyerPage.getByLabel("Password").fill("BrowserDemo123!");
  await buyerPage.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(buyerPage).toHaveURL(/marketplace/);
  await buyerPage.goto(url);
  await buyerPage.getByRole("button", { name: "Contact seller" }).click();
  await expect(buyerPage.locator(".contact-box")).toContainText(
    "browser-student@college.edu",
  );
  await buyerPage.getByRole("button", { name: "Report this listing" }).click();
  await buyerPage
    .getByLabel("Reason for reporting")
    .fill("Checking the classroom report workflow.");
  await buyerPage.getByRole("button", { name: "Submit report" }).click();
  await expect(buyerPage.getByRole("status")).toContainText("Report submitted");
  await page.getByRole("link", { name: "Edit your listing" }).click();
  await page.getByLabel("Asking price").fill("400");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.locator(".my-listing-info")).toContainText("₹400");
  await page.getByRole("button", { name: "Mark sold" }).click();
  await expect(page.locator(".my-listing .status-label")).toHaveText("sold");
  await buyerPage.reload();
  await expect(
    buyerPage.getByRole("button", { name: "Contact seller" }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Delete Browser test study lamp" })
    .click();
  await page
    .getByRole("button", { name: "Delete listing", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your next chapter starts here" }),
  ).toBeVisible();
  await buyer.close();
  assertNoErrors(errors);
});
test("mobile: navigation, categories, filters and responsive layout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".product-card")).toHaveCount(8);
  await expect(
    page.getByRole("heading", { name: "Good finds. Right next door." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "../qa-artifacts/home-mobile.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: /Electronics Find your next/ }).click();
  await expect(page.locator(".product-card")).toHaveCount(2);
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await expect(page.getByLabel("Condition", { exact: true })).toBeVisible();
  await page.getByLabel("Condition", { exact: true }).selectOption("Fair");
  await expect(
    page.getByRole("heading", { name: "No finds just yet" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page
    .locator(".nav-links")
    .getByRole("link", { name: "How it works" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Good swaps start here." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
function assertNoErrors(errors) {
  expect(errors).toEqual([]);
}
test("moderator: review report, hide a listing and restore it", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("College email").fill("rohan@college.edu");
  await page.getByLabel("Password").fill("BrowserDemo123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/marketplace/);
  await page.goto("/listings/1");
  await page.getByRole("button", { name: "Report this listing" }).click();
  await page
    .getByLabel("Reason for reporting")
    .fill("Please review the description of this demo item.");
  await page.getByRole("button", { name: "Submit report" }).click();
  await expect(page.getByRole("status")).toContainText("Report submitted");
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.goto("/login");
  await page.getByLabel("College email").fill("admin@college.edu");
  await page.getByLabel("Password").fill("BrowserDemo123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/marketplace/);
  await page.getByRole("link", { name: "Moderation" }).click();
  await expect(
    page.getByRole("heading", { name: "Listing reports." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Hide listing" }).click();
  await expect(page.locator(".reports .status-label")).toHaveText("hidden");
  await page.getByRole("button", { name: "Restore listing" }).click();
  await expect(page.locator(".reports .status-label")).toHaveText("available");
});
