import { useState, useRef, useCallback } from "react";

const RATE_LIMIT_MS = 30_000;
const MAX_SUBMITS_PER_SESSION = 10;
const SESSION_KEY = "ct_form_submits";

export function useFormSecurity() {
  const [honeypot, setHoneypot] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const lastSubmitRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getSessionSubmits = (): number => {
    try { return Number(sessionStorage.getItem(SESSION_KEY) || 0); } catch { return 0; }
  };

  const incrementSessionSubmits = () => {
    try { sessionStorage.setItem(SESSION_KEY, String(getSessionSubmits() + 1)); } catch { /* noop */ }
  };

  const startCooldown = useCallback(() => {
    lastSubmitRef.current = Date.now();
    incrementSessionSubmits();
    setCooldown(RATE_LIMIT_MS / 1000);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const remaining = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastSubmitRef.current)) / 1000);
      if (remaining <= 0) {
        setCooldown(0);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setCooldown(remaining);
      }
    }, 1000);
  }, []);

  const canSubmit = useCallback(() => {
    // Bot detection — honeypot filled
    if (honeypot) return false;
    // Rate limit — 30s between submits
    if (Date.now() - lastSubmitRef.current < RATE_LIMIT_MS) return false;
    // Session flood protection — max 10 per session
    if (getSessionSubmits() >= MAX_SUBMITS_PER_SESSION) return false;
    return true;
  }, [honeypot]);

  return { honeypot, setHoneypot, cooldown, startCooldown, canSubmit };
}
