import type { OverlayDef } from "./OverlayTypes";

/**
 * Static registry of overlay definitions.
 * Feature modules register their overlays here at bootstrap time.
 */
export class OverlayRegistry {
    private defs = new Map<string, OverlayDef>();

    register<P>(def: OverlayDef<P>): void {
        if (this.defs.has(def.key)) {
            console.warn(`[OverlayRegistry] Duplicate key: ${def.key}`);
        }
        this.defs.set(def.key, def);
    }

    get(key: string): OverlayDef | undefined {
        return this.defs.get(key);
    }

    unregister(key: string): void {
        this.defs.delete(key);
    }

    get all(): OverlayDef[] {
        return [...this.defs.values()];
    }
}
