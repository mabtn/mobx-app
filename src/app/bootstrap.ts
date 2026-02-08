import { RootStore } from "@core/root/RootStore";
import { registerSampleDocument } from "@features/sample/sampleDocument";
import { registerSampleCommands } from "@features/sample/SampleCommands";
import { registerSampleOverlays } from "@features/sample/SampleOverlays";
import { registerEditorDocument, initEditorSampleLayers } from "@features/editor/editorDocument";
import { registerEditorCommands } from "@features/editor/EditorCommands";
import { registerEditorOverlays } from "@features/editor/EditorOverlays";

/**
 * Create the root store and register all feature modules.
 *
 * To add a new feature module:
 * 1. Create a registrar function in your feature folder.
 * 2. Call it here with the relevant sub-stores.
 */
export function createRootStore(): RootStore {
    const root = new RootStore();

    // ── Sample feature ────────────────────────────────────────────────
    registerSampleDocument(root.document);
    registerSampleCommands(root.commands);
    registerSampleOverlays(root.overlayRegistry);

    // ── Editor feature ────────────────────────────────────────────────
    registerEditorDocument(root.document);
    registerEditorCommands(root.commands);
    registerEditorOverlays(root.overlayRegistry);
    initEditorSampleLayers(root.document);

    return root;
}
