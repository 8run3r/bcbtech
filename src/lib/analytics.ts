/**
 * Lightweight event tracking via Vercel Web Analytics.
 * The script is injected in index.html; until Analytics is enabled in the
 * Vercel dashboard, window.va is undefined and calls are silent no-ops.
 */
declare global {
  interface Window {
    va?: (event: "event" | "beforeSend" | "pageview", properties?: unknown) => void;
  }
}

export function track(name: string, data?: Record<string, string | number | boolean>) {
  try {
    window.va?.("event", { name, data });
  } catch {
    /* analytics must never break the app */
  }
}
