import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

// ── Commands ──────────────────────────────────────────────────────────────────
const COMMANDS: Record<string, { action: (nav: ReturnType<typeof useNavigate>, close: () => void) => string[] | null }> = {
  help: {
    action: () => [
      "── príkazy ──────────────────",
      "/home  /balicky  /portfolio",
      "/kontakt  /logika  /archive",
      "/web  /auto  /marketing  /hybrid",
      "/void  /clear  /exit",
    ],
  },
  home:       { action: (nav, close) => { nav("/"); close(); return null; } },
  balicky:    { action: (nav, close) => { nav("/balicky"); close(); return null; } },
  portfolio:  { action: (nav, close) => { nav("/portfolio"); close(); return null; } },
  kontakt:    { action: (nav, close) => { nav("/kontakt"); close(); return null; } },
  logika:     { action: (nav, close) => { nav("/logika"); close(); return null; } },
  web:        { action: (nav, close) => { nav("/balicky?tab=web"); close(); return null; } },
  auto:       { action: (nav, close) => { nav("/balicky?tab=automation"); close(); return null; } },
  marketing:  { action: (nav, close) => { nav("/balicky?tab=marketing"); close(); return null; } },
  hybrid:     { action: (nav, close) => { nav("/balicky?tab=hybrid"); close(); return null; } },
  archive:    { action: (nav, close) => { nav("/archive"); close(); return null; } },
  void:       { action: (nav, close) => { nav("/void"); close(); return null; } },
  clear:      { action: () => null },
  exit:       { action: (_, close) => { close(); return null; } },
};

const GREETING = [
  "COKTECH_OS v2.4  //  /help pre príkazy",
];

// ── Component ─────────────────────────────────────────────────────────────────
const LandingTerminal = () => {
  const [mode, setMode] = useState<"dot" | "mini">("dot");
  const [minimized, setMinimized] = useState(false);
  const [lines, setLines] = useState<{ text: string; isCmd: boolean }[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [dotHover, setDotHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) return null;

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines, minimized]);

  // Focus input when opening
  useEffect(() => {
    if (mode === "mini" && !minimized) setTimeout(() => inputRef.current?.focus(), 80);
  }, [mode, minimized]);

  const openTerminal = useCallback(() => {
    if (mode === "dot") {
      setLines([...GREETING.map((t) => ({ text: t, isCmd: false }))]);
      setMode("mini");
      setMinimized(false);
    } else {
      setMinimized((m) => !m);
    }
  }, [mode]);

  const closeTerminal = useCallback(() => {
    setMode("dot");
    setMinimized(false);
    setLines([]);
    setInput("");
  }, []);

  const closeNav = useCallback(() => {
    // Used for navigation commands — don't close terminal, just navigate
  }, []);

  const runCommand = useCallback((raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const cmd = (trimmed.startsWith("/") ? trimmed.slice(1) : trimmed).toLowerCase();

    setLines((prev) => [...prev, { text: `$ ${trimmed}`, isCmd: true }]);
    setHistory((prev) => [trimmed, ...prev].slice(0, 40));
    setHistoryIdx(-1);
    setInput("");

    if (cmd === "clear") {
      setLines([]);
      return;
    }

    const handler = COMMANDS[cmd];
    if (!handler) {
      setLines((prev) => [...prev, { text: `neznámy príkaz: ${trimmed}`, isCmd: false }]);
      return;
    }

    const output = handler.action(navigate, closeTerminal);
    if (output) {
      setLines((prev) => [...prev, ...output.map((t) => ({ text: t, isCmd: false }))]);
    }
  }, [navigate, closeTerminal]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      runCommand(input);
    } else if (e.key === "Escape") {
      setMinimized(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(idx);
      setInput(history[idx] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = Math.max(historyIdx - 1, -1);
      setHistoryIdx(idx);
      setInput(idx === -1 ? "" : history[idx] ?? "");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const partial = (input.startsWith("/") ? input.slice(1) : input).toLowerCase();
      const matches = Object.keys(COMMANDS).filter((k) => k.startsWith(partial));
      if (matches.length === 1) setInput("/" + matches[0]);
    }
  };

  return (
    <>
      {/* ── Trigger dot ── */}
      <div
        onClick={openTerminal}
        onMouseEnter={() => setDotHover(true)}
        onMouseLeave={() => setDotHover(false)}
        style={{
          position: "fixed",
          bottom: 28,
          left: 28,
          zIndex: 9999,
          cursor: "pointer",
          width: dotHover || mode === "mini" ? 12 : 7,
          height: dotHover || mode === "mini" ? 12 : 7,
          transition: "all 0.25s ease",
        }}
        title=""
      >
        <div style={{
          position: "absolute",
          inset: -8,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,255,170,0.12) 0%, transparent 70%)",
          animation: mode === "dot" ? "termPulse 2.6s ease-in-out infinite" : "none",
          pointerEvents: "none",
        }} />
        <div style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: mode === "mini" ? "var(--neon-primary)" : dotHover ? "rgba(0,255,170,0.9)" : "rgba(0,255,170,0.28)",
          boxShadow: mode === "mini"
            ? "0 0 10px var(--neon-primary), 0 0 22px rgba(0,255,170,0.35)"
            : dotHover ? "0 0 8px rgba(0,255,170,0.6)" : "0 0 4px rgba(0,255,170,0.2)",
          transition: "all 0.25s ease",
        }} />
      </div>

      {/* ── Sticky mini terminal ── */}
      <AnimatePresence>
        {mode === "mini" && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
              position: "fixed",
              bottom: 52,
              left: 20,
              width: minimized ? 220 : "min(400px, calc(100vw - 32px))",
              zIndex: 9998,
              background: "rgba(4, 6, 8, 0.96)",
              border: "1px solid rgba(0,255,170,0.2)",
              boxShadow: "0 0 32px rgba(0,255,170,0.06), 0 12px 40px rgba(0,0,0,0.5)",
              fontFamily: "'JetBrains Mono', monospace",
              transition: "width 0.2s ease",
            }}
          >
            {/* Title bar */}
            <div style={{
              padding: "4px 8px",
              background: "rgba(0,255,170,0.05)",
              borderBottom: "1px solid rgba(0,255,170,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              userSelect: "none",
            }}
              onClick={() => setMinimized((m) => !m)}
            >
              <span style={{ color: "rgba(0,255,170,0.45)", fontSize: 9, letterSpacing: "0.2em" }}>
                {minimized ? "▸ TERMINAL" : "▾ TERMINAL"}
              </span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {!minimized && (
                  <span
                    onClick={(e) => { e.stopPropagation(); setMinimized(true); }}
                    style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, cursor: "pointer", lineHeight: 1, padding: "0 2px" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,200,0,0.7)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.2)")}
                  >─</span>
                )}
                <span
                  onClick={(e) => { e.stopPropagation(); closeTerminal(); }}
                  style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, cursor: "pointer", lineHeight: 1, padding: "0 2px" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ff4466")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.2)")}
                >×</span>
              </div>
            </div>

            {/* Output — hidden when minimized */}
            {!minimized && (
              <div
                ref={scrollRef}
                style={{
                  maxHeight: 160,
                  overflowY: "auto",
                  padding: "8px 10px 4px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {lines.map((line, i) => (
                  <div key={i} style={{
                    fontSize: 10,
                    lineHeight: 1.55,
                    color: line.isCmd ? "var(--neon-primary)" : "rgba(255,255,255,0.5)",
                    whiteSpace: "pre-wrap",
                  }}>
                    {line.text}
                  </div>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{
              borderTop: minimized ? "none" : "1px solid rgba(0,255,170,0.08)",
              padding: "5px 10px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <span style={{ color: "rgba(0,255,170,0.45)", fontSize: 10, flexShrink: 0 }}>$</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => minimized && setMinimized(false)}
                placeholder={minimized ? "terminál" : "/help"}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "var(--neon-primary)",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  caretColor: "var(--neon-primary)",
                  minWidth: 0,
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes termPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
      `}</style>
    </>
  );
};

export default LandingTerminal;
