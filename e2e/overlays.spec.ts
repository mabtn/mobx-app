import { test, expect, type Page } from "@playwright/test";
import { gotoAndWaitForApp } from "./helpers";

/** Select "Aereo" layer, click Delete, and wait for the modal to appear. */
async function openDeleteModal(page: Page): Promise<void> {
    await page.getByText("Aereo").click();
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page.locator("dialog")).toBeVisible();
}

test.describe("Overlays", () => {
    test.beforeEach(async ({ page }) => {
        await gotoAndWaitForApp(page);
    });

    test("Delete modal — open and close via × button", async ({ page }) => {
        await openDeleteModal(page);
        await expect(page.getByText(/Delete layer.*Aereo/)).toBeVisible();

        // The × button is the first button inside the dialog header
        await page.locator("dialog").getByRole("button").first().click();
        await expect(page.locator("dialog")).not.toBeVisible();
    });

    test("Delete modal — close via Escape", async ({ page }) => {
        await openDeleteModal(page);
        await page.keyboard.press("Escape");
        await expect(page.locator("dialog")).not.toBeVisible();
    });

    test("Delete modal — does NOT close on backdrop click", async ({ page }) => {
        await openDeleteModal(page);

        // Click the backdrop in the top-left corner (outside the centered dialog)
        await page.locator(".fixed.inset-0").click({ position: { x: 10, y: 10 } });

        // Brief pause then verify the modal is still open
        await page.waitForTimeout(300);
        await expect(page.locator("dialog")).toBeVisible();
    });

    test("Delete modal — close via Cancel button", async ({ page }) => {
        await openDeleteModal(page);
        await page.getByRole("button", { name: "Cancel" }).click();
        await expect(page.locator("dialog")).not.toBeVisible();
    });

    test("DevTools modeless window — open and close", async ({ page }) => {
        await page.getByRole("button", { name: "DevTools" }).click();

        const devtools = page.getByRole("dialog", { name: "devtools:inspector" });
        await expect(devtools).toBeVisible();

        await page.getByRole("button", { name: "Close window" }).click();
        await expect(devtools).not.toBeVisible();
    });
});
