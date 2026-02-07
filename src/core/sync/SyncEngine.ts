import { makeAutoObservable, runInAction } from "mobx";
import type { Op } from "./Op";
import type { Transport } from "./Transport";
import type { DocumentStore } from "@core/state/DocumentStore";
import type { PresenceStore } from "@core/state/PresenceStore";
import type { CollabStore } from "@core/state/CollabStore";

/**
 * Skeleton sync engine: enqueue local ops, apply optimistically,
 * send to transport, receive remote ops, apply in batch.
 */
export class SyncEngine {
  /** Ops produced locally but not yet acknowledged by the server. */
  pendingOps: Op[] = [];

  private transport: Transport;
  private document: DocumentStore;
  private presence: PresenceStore;
  private collab: CollabStore;

  constructor(
    transport: Transport,
    document: DocumentStore,
    presence: PresenceStore,
    collab: CollabStore,
  ) {
    this.transport = transport;
    this.document = document;
    this.presence = presence;
    this.collab = collab;

    makeAutoObservable(this, {}, { autoBind: true });

    // Wire incoming ops
    this.transport.onReceive(this.handleRemoteOps);
    this.transport.onPresence(this.handlePresence);
  }

  /** Enqueue local ops: apply optimistically then send. */
  enqueueLocal(ops: Op[]): void {
    this.pendingOps.push(...ops);
    // Already applied to document by the command; just send to transport.
    this.transport.send(ops);
  }

  /** Handle ops arriving from remote peers. */
  private handleRemoteOps = (ops: Op[]): void => {
    runInAction(() => {
      // In a real engine you'd transform against pending ops (OT/CRDT).
      // For this skeleton we apply directly.
      this.document.applyOps(ops);

      // Clear pending that were acknowledged
      // (in loopback mode they are the same ops)
      this.pendingOps = [];
    });
  };

  private handlePresence = (data: any): void => {
    if (data?.peer) {
      runInAction(() => this.presence.upsertPeer(data.peer));
    }
  };

  connect(): void {
    this.collab.setState("connecting");
    this.transport.connect();
    this.collab.setState("connected");
  }

  disconnect(): void {
    this.transport.disconnect();
    this.collab.setState("disconnected");
  }
}
