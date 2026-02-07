import type { Op } from "./Op";

/**
 * Abstract transport interface for sending/receiving ops.
 * Implement over WebSocket, HTTP, WebRTC, etc.
 */
export interface Transport {
  send(ops: Op[]): void;
  onReceive(callback: (ops: Op[]) => void): void;
  onPresence(callback: (data: any) => void): void;
  sendPresence(data: any): void;
  connect(): void;
  disconnect(): void;
}

/**
 * Loopback transport for local testing — ops sent are immediately "received".
 */
export class LoopbackTransport implements Transport {
  private receiveCallback: ((ops: Op[]) => void) | null = null;
  private presenceCallback: ((data: any) => void) | null = null;

  send(ops: Op[]): void {
    // Echo back asynchronously to simulate network
    setTimeout(() => {
      this.receiveCallback?.(ops);
    }, 10);
  }

  onReceive(callback: (ops: Op[]) => void): void {
    this.receiveCallback = callback;
  }

  onPresence(callback: (data: any) => void): void {
    this.presenceCallback = callback;
  }

  sendPresence(data: any): void {
    setTimeout(() => {
      this.presenceCallback?.(data);
    }, 10);
  }

  connect(): void {
    /* no-op */
  }

  disconnect(): void {
    this.receiveCallback = null;
    this.presenceCallback = null;
  }
}
