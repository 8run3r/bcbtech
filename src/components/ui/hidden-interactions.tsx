import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const KONAMI = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA

const KEY_ROUTES: Record<string, string> = {
  "t": "/tsuki",
  "a": "/archive",
  "n": "/node-map",
  "m": "/memory",
};

const SECRET_MESSAGES = [
  "You found something that wasn't meant to be found.",
  "The system acknowledges your presence.",
  "Data fragment unlocked. Check the archive.",
  "Signal detected. Origin: unknown.",
  "Welcome back. We've been waiting.",
  "Not all paths are visible. Some require patience.",
];

const HiddenInteractions = () => {
  const navigate = useNavigate();
  const [konamiProgress, setKonamiProgress] = useState(0);
  const [secretMessage, setSecretMessage] = useState<string | null>(null);
  const [doubleClickCount, setDoubleClickCount] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Konami code tracking
    if (e.keyCode === KONAMI[konamiProgress]) {
      const next = konamiProgress + 1;
      setKonamiProgress(next);
      if (next === KONAMI.length) {
        setKonamiProgress(0);
        navigate("/void");
      }
    } else {
      setKonamiProgress(0);
    }

    // Single key shortcuts (only when not typing)
    const active = document.activeElement;
    const isTyping = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA");
    if (isTyping) return;

    const route = KEY_ROUTES[e.key.toLowerCase()];
    if (route) {
      navigate(route);
    }
  }, [konamiProgress, navigate]);

  // Double-click empty areas
  const handleDoubleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest("a, button, input, textarea");
    if (isInteractive) return;

    const newCount = doubleClickCount + 1;
    setDoubleClickCount(newCount);

    if (newCount >= 3) {
      setSecretMessage(SECRET_MESSAGES[Math.floor(Math.random() * SECRET_MESSAGES.length)]);
      setDoubleClickCount(0);
      setTimeout(() => setSecretMessage(null), 5000);
    }
  }, [doubleClickCount]);

  // Inactivity detection — show hint after 30s of no movement
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timer);
      setShowHint(false);
      timer = setTimeout(() => setShowHint(true), 30000);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("scroll", resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("dblclick", handleDoubleClick);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("dblclick", handleDoubleClick);
    };
  }, [handleKeyDown, handleDoubleClick]);

  return (
    <>
      {/* Secret message popup */}
      <AnimatePresence>
        {secretMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.6 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9000] px-6 py-3"
            style={{
              background: "rgba(0,0,0,0.9)",
              border: "1px solid rgba(0,255,170,0.2)",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              color: "var(--neon-primary)",
              letterSpacing: "0.05em",
              maxWidth: "90vw",
              textAlign: "center",
              boxShadow: "0 0 30px rgba(0,255,170,0.1)",
            }}
          >
            <span style={{ opacity: 0.4, marginRight: 8 }}>{'>'}</span>
            {secretMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inactivity hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "9px",
              color: "var(--neon-primary)",
              letterSpacing: "0.15em",
              whiteSpace: "nowrap",
            }}
          >
            SOME KEYS OPEN DOORS. TRY PRESSING ONE.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Konami progress indicator */}
      {konamiProgress > 2 && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9000]"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "9px",
            color: "var(--amber)",
            opacity: 0.4,
          }}
        >
          {"█".repeat(konamiProgress)}{"░".repeat(KONAMI.length - konamiProgress)}
        </div>
      )}
    </>
  );
};

export default HiddenInteractions;
