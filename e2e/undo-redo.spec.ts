import { test, expect } from "@playwright/test";
import { gotoAndWaitForApp, MOD } from "./helpers";

test.describe("Undo / Redo", () => {
    test.beforeEach(async ({ page }) => {
        await gotoAndWaitForApp(page);
    });

    test("Undo button is disabled when there is no history", async ({ page }) => {
        await expect(page.getByRole("button", { name: "Undo" })).toBeDisabled();
    });

    test("Change blend mode → undo with keyboard → redo with keyboard", async ({ page }) => {
        // Select "Aereo" layer to open properties panel
        await page.getByText("Aereo").click();

        const blend = page.getByLabel("Blend");
        await expect(blend).toHaveValue("source-over");

        // Change blend mode to "multiply"
        await blend.selectOption("multiply");
        await expect(blend).toHaveValue("multiply");

        // Undo: Cmd/Ctrl+Z
        await page.keyboard.press(`${MOD}+z`);
        await expect(blend).toHaveValue("source-over");
        await expect(page.getByRole("button", { name: "Undo" })).toBeDisabled();

        // Redo: Cmd/Ctrl+Shift+Z
        await page.keyboard.press(`${MOD}+Shift+z`);
        await expect(blend).toHaveValue("multiply");
        await expect(page.getByRole("button", { name: "Redo" })).toBeDisabled();
    });

    test("Undo via toolbar button", async ({ page }) => {
        await page.getByText("Aereo").click();

        const blend = page.getByLabel("Blend");
        await blend.selectOption("screen");
        await expect(blend).toHaveValue("screen");

        await page.getByRole("button", { name: "Undo" }).click();
        await expect(blend).toHaveValue("source-over");
    });
});
