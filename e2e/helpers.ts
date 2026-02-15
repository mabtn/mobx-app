import type { Page } from "@playwright/test";

/** Navigate to the app and wait for both sample layers to be present. */
export async function gotoAndWaitForApp(page: Page): Promise<void> {
    await page.goto("/");
    await page.getByText("Aereo").waitFor();
    await page.getByText("Background").waitFor();
}

/** Platform-aware modifier key for keyboard shortcuts. */
export const MOD = process.platform === "darwin" ? "Meta" : "Control";

/**
 * Set the value of a range input (slider) in a React app.
 *
 * `fill()` does not work on `<input type="range">`, so we set the value
 * via the native HTMLInputElement setter and dispatch input + change events.
 */
export async function setRangeValue(page: Page, label: string, value: string): Promise<void> {
    const input = page.getByLabel(label);
    await input.evaluate((el, val) => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
        setter.call(el, val);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
    }, value);
}
