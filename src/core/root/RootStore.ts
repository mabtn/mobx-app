import { DocumentStore } from "@core/state/DocumentStore";
import { UIStore } from "@core/state/UIStore";
import { PresenceStore } from "@core/state/PresenceStore";
import { CollabStore } from "@core/state/CollabStore";
import { CommandStore } from "@core/commands/CommandStore";
import { CommandScheduler } from "@core/commands/CommandScheduler";
import { HistoryStore } from "@core/commands/HistoryStore";
import { OverlayRegistry } from "@core/overlays/OverlayRegistry";
import { OverlayService } from "@core/overlays/OverlayService";
import { SyncEngine } from "@core/sync/SyncEngine";
import { LoopbackTransport } from "@core/sync/Transport";
import type { Deps } from "@core/di/deps";

/**
 * Top-level store that owns every sub-store.
 * Created once in bootstrap and provided to React via context.
 */
export class RootStore implements Deps {
    document: DocumentStore;
    ui: UIStore;
    presence: PresenceStore;
    collab: CollabStore;
    commands: CommandStore;
    scheduler: CommandScheduler;
    history: HistoryStore;
    overlayRegistry: OverlayRegistry;
    overlays: OverlayService;
    sync: SyncEngine;

    constructor() {
        // 1. Instantiate stores (no cross-refs yet)
        this.document = new DocumentStore();
        this.ui = new UIStore();
        this.presence = new PresenceStore();
        this.collab = new CollabStore();
        this.scheduler = new CommandScheduler();
        this.commands = new CommandStore(this.scheduler);
        this.history = new HistoryStore();
        this.overlayRegistry = new OverlayRegistry();
        this.overlays = new OverlayService(this.overlayRegistry);
        this.sync = new SyncEngine(
            new LoopbackTransport(),
            this.document,
            this.presence,
            this.collab,
        );

        // 2. Late-bind deps to break circular construction order
        this.commands.init(this);
        this.history.init(this.document);
        this.overlays.init(this);
    }
}
