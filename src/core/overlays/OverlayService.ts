import { makeAutoObservable, runInAction } from "mobx";
import type { OverlayInstance, OverlayKind, OverlayDef } from "./OverlayTypes";
import type { OverlayRegistry } from "./OverlayRegistry";
import type { Deps } from "@core/di/deps";
import { generateId } from "@core/utils/id";

const BASE_Z_MODELESS = 100;
const BASE_Z_MODAL = 500;
const BASE_Z_POPOVER = 800;

/**
 * Runtime manager for all overlay instances (modals, modeless windows, popovers).
 */
export class OverlayService {
    /** Modal stack — last item is the topmost modal. */
    modalStack: OverlayInstance[] = [];
    /** Active modeless windows. */
    modelessWindows: OverlayInstance[] = [];
    /** Active popovers. */
    popovers: OverlayInstance[] = [];

    private nextZ = { modeless: BASE_Z_MODELESS, modal: BASE_Z_MODAL, popover: BASE_Z_POPOVER };
    private registry: OverlayRegistry;
    private deps!: Deps;

    constructor(registry: OverlayRegistry) {
        this.registry = registry;
        makeAutoObservable(this, {}, { autoBind: true });
    }

    init(deps: Deps): void {
        this.deps = deps;
    }

    // ── Open ────────────────────────────────────────────────────────────

    open<P>(key: string, params: P, _options?: Record<string, unknown>): string {
        const def = this.registry.get(key);
        if (!def) {
            console.warn(`[OverlayService] Unknown overlay: ${key}`);
            return "";
        }

        // Singleton: if already open, bring to front
        if (def.options?.singleton) {
            const existing = this.findByKey(key);
            if (existing) {
                this.bringToFront(existing.id);
                return existing.id;
            }
        }

        const id = generateId("overlay");
        const session = def.createSession ? def.createSession(params, this.deps) : null;

        const instance: OverlayInstance<P> = {
            id,
            key,
            kind: def.kind,
            params,
            session,
            zIndex: this.allocateZ(def.kind),
            position: def.options?.defaultPosition ?? {
                x: 100 + this.modelessWindows.length * 30,
                y: 100 + this.modelessWindows.length * 30,
            },
            size: {
                width: def.options?.defaultWidth ?? 400,
                height: def.options?.defaultHeight ?? 300,
            },
        };

        runInAction(() => {
            switch (def.kind) {
                case "modal":
                    this.modalStack.push(instance);
                    break;
                case "modeless":
                    this.modelessWindows.push(instance);
                    break;
                case "popover":
                    this.popovers.push(instance);
                    break;
            }
        });

        return id;
    }

    // ── Close ───────────────────────────────────────────────────────────

    close(instanceId: string): void {
        this.removeInstance(instanceId);
    }

    closeTopModal(): void {
        const top = this.modalStack.at(-1);
        if (top) this.removeInstance(top.id);
    }

    closeAll(kind?: OverlayKind): void {
        const lists: OverlayInstance[][] = kind
            ? [this.getList(kind)]
            : [this.modalStack, this.modelessWindows, this.popovers];
        for (const list of lists) {
            for (const inst of [...list]) {
                inst.session?.dispose();
            }
            list.length = 0;
        }
    }

    // ── Focus / z-order ─────────────────────────────────────────────────

    bringToFront(instanceId: string): void {
        const inst = this.findById(instanceId);
        if (!inst || inst.kind !== "modeless") return;
        inst.zIndex = this.allocateZ("modeless");
    }

    /** Update the position of a modeless window (for dragging). */
    setPosition(instanceId: string, x: number, y: number): void {
        const inst = this.findById(instanceId);
        if (inst) inst.position = { x, y };
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    getDefinition(key: string): OverlayDef | undefined {
        return this.registry.get(key);
    }

    private findByKey(key: string): OverlayInstance | undefined {
        return (
            this.modalStack.find((i) => i.key === key) ??
            this.modelessWindows.find((i) => i.key === key) ??
            this.popovers.find((i) => i.key === key)
        );
    }

    private findById(id: string): OverlayInstance | undefined {
        return (
            this.modalStack.find((i) => i.id === id) ??
            this.modelessWindows.find((i) => i.id === id) ??
            this.popovers.find((i) => i.id === id)
        );
    }

    private removeInstance(id: string): void {
        for (const list of [this.modalStack, this.modelessWindows, this.popovers]) {
            const idx = list.findIndex((i) => i.id === id);
            if (idx !== -1) {
                list[idx].session?.dispose();
                list.splice(idx, 1);
                return;
            }
        }
    }

    private getList(kind: OverlayKind): OverlayInstance[] {
        switch (kind) {
            case "modal":
                return this.modalStack;
            case "modeless":
                return this.modelessWindows;
            case "popover":
                return this.popovers;
        }
    }

    private allocateZ(kind: OverlayKind): number {
        return this.nextZ[kind]++;
    }
}
