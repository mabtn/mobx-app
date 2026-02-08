import type { ComponentType } from "react";
import type { Deps } from "@core/di/deps";
import type { Disposable } from "@core/utils/dispose";

// ── Kinds ─────────────────────────────────────────────────────────────

export type OverlayKind = "modal" | "modeless" | "popover";

// ── Definition (what you register) ────────────────────────────────────

export interface OverlayDef<P = any> {
    key: string;
    kind: OverlayKind;
    /** The React component rendered inside the overlay frame. */
    component: ComponentType<OverlayComponentProps<P>>;
    /** Create a per-instance session store / side-effect bag. */
    createSession?(params: P, deps: Deps): Disposable & Record<string, any>;
    options?: OverlayOptions;
}

export interface OverlayOptions {
    dismissOnEsc?: boolean; // default true for modals, false for modeless
    dismissOnOutsideClick?: boolean; // default true for modals
    singleton?: boolean; // only one instance allowed
    defaultWidth?: number;
    defaultHeight?: number;
    defaultPosition?: { x: number; y: number };
}

// ── Instance (what the service tracks at runtime) ─────────────────────

export interface OverlayInstance<P = any> {
    id: string;
    key: string;
    kind: OverlayKind;
    params: P;
    session: (Disposable & Record<string, any>) | null;
    zIndex: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
}

// ── Props injected into every overlay component ───────────────────────

export interface OverlayComponentProps<P = any> {
    instanceId: string;
    params: P;
    session: Record<string, any> | null;
    close: () => void;
}
