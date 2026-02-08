import { makeAutoObservable } from "mobx";

export interface Peer {
    id: string;
    name: string;
    color: string;
    cursor?: { x: number; y: number };
    selection?: unknown;
}

/**
 * Tracks presence of remote collaborators (cursor, selection, name, etc.).
 */
export class PresenceStore {
    peers = new Map<string, Peer>();

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    upsertPeer(peer: Peer): void {
        this.peers.set(peer.id, peer);
    }

    removePeer(id: string): void {
        this.peers.delete(id);
    }

    clear(): void {
        this.peers.clear();
    }
}
