/**
 * Dependency-injection interfaces.
 *
 * Stores and commands receive a `Deps` object so they never import concrete
 * siblings directly — this eliminates circular-import issues and makes
 * testing trivial.
 */

import type { CommandStore } from "@core/commands/CommandStore";
import type { CommandScheduler } from "@core/commands/CommandScheduler";
import type { HistoryStore } from "@core/commands/HistoryStore";
import type { OverlayService } from "@core/overlays/OverlayService";
import type { OverlayRegistry } from "@core/overlays/OverlayRegistry";
import type { DocumentStore } from "@core/state/DocumentStore";
import type { UIStore } from "@core/state/UIStore";
import type { SyncEngine } from "@core/sync/SyncEngine";

/** The full set of core services available via DI. */
export interface Deps {
  document: DocumentStore;
  ui: UIStore;
  commands: CommandStore;
  scheduler: CommandScheduler;
  history: HistoryStore;
  overlays: OverlayService;
  overlayRegistry: OverlayRegistry;
  sync: SyncEngine;
}
