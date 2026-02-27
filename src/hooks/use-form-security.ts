import { useState, useRef, useCallback } from "react";

const RATE_LIMIT_MS = 30_000;

export function useFormSecurity() {
  const [honeypot, setHoneypot] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const lastSubmitRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback(() => {
    lastSubmitRef.current = Date.now();
    setCooldown(RATE_LIMIT_MS / 1000);
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
    if (honeypot) return false; // bot detected
    if (Date.now() - lastSubmitRef.current < RATE_LIMIT_MS) return false;
    return true;
  }, [honeypot]);

  return { honeypot, setHoneypot, cooldown, startCooldown, canSubmit };
}
