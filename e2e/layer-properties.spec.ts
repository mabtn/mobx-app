import { test, expect } from "@playwright/test";
import { gotoAndWaitForApp, setRangeValue } from "./helpers";

test.describe("Layer properties", () => {
    test.beforeEach(async ({ page }) => {
        await gotoAndWaitForApp(page);
    });

    test("Initial state shows layer list with 2 layers", async ({ page }) => {
        await expect(page.getByText("Layers")).toBeVisible();
        await expect(page.getByText("Aereo")).toBeVisible();
        await expect(page.getByText("Background")).toBeVisible();
    });

    test("Clicking a layer shows properties panel", async ({ page }) => {
        await page.getByText("Aereo").click();

        await expect(page.getByTitle("Back to layer list")).toBeVisible();
        await expect(page.getByText("Opacity")).toBeVisible();
        await expect(page.getByText("Blend")).toBeVisible();
    });

    test("Back button returns to layer list", async ({ page }) => {
        await page.getByText("Aereo").click();
        await expect(page.getByTitle("Back to layer list")).toBeVisible();

        await page.getByTitle("Back to layer list").click();
        await expect(page.getByText("Layers")).toBeVisible();
    });

    test("Changing opacity via slider", async ({ page }) => {
        await page.getByText("Aereo").click();

        const panel = page.locator("aside");

        // Verify initial display value (scoped to sidebar to avoid zoom button "100%")
        await expect(panel.getByText("100%")).toBeVisible();

        // Change opacity to 0.5
        await setRangeValue(page, "Opacity", "0.5");

        // Verify the display updates
        await expect(panel.getByText("50%")).toBeVisible();
    });

    test("Changing blend mode via select", async ({ page }) => {
        await page.getByText("Aereo").click();

        const blend = page.getByLabel("Blend");
        await expect(blend).toHaveValue("source-over");

        await blend.selectOption("overlay");
        await expect(blend).toHaveValue("overlay");
    });

    test("Visibility toggle", async ({ page }) => {
        // "Aereo" is first in the sorted list (highest order)
        const hideButton = page.getByTitle("Hide").first();
        await expect(hideButton).toBeVisible();

        await hideButton.click();

        const showButton = page.getByTitle("Show").first();
        await expect(showButton).toBeVisible();
        await expect(showButton).toHaveText("\u2014"); // em dash "—"
    });
});
