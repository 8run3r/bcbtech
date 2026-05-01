import type { OverlayKind } from "./types";

type Listener = (kind: OverlayKind, durationMs?: number) => void;

/**
 * Module-scope event emitter for terminal overlays.
 * Lets command modules trigger fullscreen effects without prop drilling.
 */
let listeners: Listener[] = [];

export function triggerOverlay(kind: OverlayKind, durationMs?: number) {
  listeners.forEach((l) => l(kind, durationMs));
}

export function subscribeOverlay(l: Listener): () => void {
  listeners.push(l);
  return () => {
    listeners = listeners.filter((x) => x !== l);
  };
}
