import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { REGISTRY, CANONICAL_NAMES } from "@/features/terminal/commands";
import { triggerOverlay } from "@/features/terminal/events";
import type { TerminalLine } from "@/features/terminal/types";

const HIST_KEY = "ct_terminal_history";
const RECENT_KEY = "ct_recent_routes";
const HIST_MAX = 80;

const GREETING: TerminalLine[] = [
  { text: "COKTECH_OS v2.4   /help pre príkazy", kind: "accent" },
];

const LandingTerminal = () => {
  const [mode, setMode] = useState<"dot" | "mini">("dot");
  const [minimized, setMinimized] = useState(false);
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [dotHover, setDotHover] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  /* ── Hide on /admin ── */
  // (early-return placement requires hooks above to come first; we render conditionally below)

  /* ── Load persisted history + theme/font on mount ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HIST_KEY);
      if (raw) setHistory(JSON.parse(raw));

      const themeOverride = localStorage.getItem("ct_theme_override");
      if (themeOverride) {
        const presets: Record<string, string> = {
          mint: "#00ffaa", cyan: "#22e9ff", amber: "#FF8C00",
          coral: "#FF3D71", blue: "#4A9EFF", violet: "#8B5CF6",
        };
        if (presets[themeOverride]) {
          document.documentElement.style.setProperty("--neon-primary", presets[themeOverride]);
        }
      }
      const fontOverride = localStorage.getItem("ct_terminal_font");
      if (fontOverride) {
        const fonts: Record<string, string> = {
          mono: "'JetBrains Mono', monospace",
          vt: "'VT323', monospace",
          retro: "'Space Mono', monospace",
          syne: "'Syne', sans-serif",
        };
        if (fonts[fontOverride]) {
          document.documentElement.style.setProperty("--terminal-font", fonts[fontOverride]);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* ── Track recent routes in sessionStorage ── */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(RECENT_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      const next = [location.pathname, ...list.filter((r) => r !== location.pathname)].slice(0, 12);
      sessionStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch { /* noop */ }
  }, [location.pathname]);

  /* ── Auto-scroll on output ── */
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines, minimized]);

  /* ── Focus input when opening ── */
  useEffect(() => {
    if (mode === "mini" && !minimized) setTimeout(() => inputRef.current?.focus(), 80);
  }, [mode, minimized]);

  const openTerminal = useCallback(() => {
    if (mode === "dot") {
      setLines(GREETING);
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

  const print = useCallback((line: string | TerminalLine | TerminalLine[]) => {
    if (typeof line === "string") {
      setLines((prev) => [...prev, { text: line, kind: "info" }]);
    } else if (Array.isArray(line)) {
      setLines((prev) => [...prev, ...line]);
    } else {
      setLines((prev) => [...prev, line]);
    }
  }, []);

  const runCommand = useCallback(async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    setLines((prev) => [...prev, { text: `$ ${trimmed}`, kind: "cmd" }]);

    const next = [trimmed, ...history.filter((h) => h !== trimmed)].slice(0, HIST_MAX);
    setHistory(next);
    try { localStorage.setItem(HIST_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    setHistoryIdx(-1);
    setInput("");

    const stripped = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
    const tokens = stripped.split(/\s+/).filter(Boolean);
    const name = (tokens[0] || "").toLowerCase();
    const args = tokens.slice(1);

    if (name === "clear" || name === "cls") {
      setLines([]);
      return;
    }

    const cmd = REGISTRY[name];
    if (!cmd) {
      setLines((prev) => [
        ...prev,
        { text: `neznámy príkaz: ${trimmed}`, kind: "error" },
        { text: "skús /help", kind: "info" },
      ]);
      return;
    }

    try {
      await cmd.run({
        args,
        raw: stripped,
        navigate,
        closeTerminal,
        print,
        clear: () => setLines([]),
        overlay: (kind, durationMs) => triggerOverlay(kind, durationMs),
        history: next,
        pathname: location.pathname,
        registry: REGISTRY,
      });
    } catch (e) {
      setLines((prev) => [...prev, { text: `chyba: ${(e as Error).message}`, kind: "error" }]);
    }
  }, [history, navigate, closeTerminal, print, location.pathname]);

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
      const stripped = input.startsWith("/") ? input.slice(1) : input;
      const tokens = stripped.split(/\s+/);
      const partial = tokens[0]?.toLowerCase() ?? "";
      const matches = CANONICAL_NAMES.filter((k) => k.startsWith(partial));
      if (matches.length === 1) {
        setInput("/" + matches[0]);
      } else if (matches.length > 1) {
        setLines((prev) => [
          ...prev,
          { text: `$ ${input}`, kind: "cmd" },
          { text: matches.join("  "), kind: "info" },
        ]);
      }
    }
  };

  if (location.pathname.startsWith("/admin")) return null;

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
              width: minimized ? 220 : "min(440px, calc(100vw - 32px))",
              zIndex: 9998,
              background: "rgba(4, 6, 8, 0.96)",
              border: "1px solid rgba(0,255,170,0.2)",
              boxShadow: "0 0 32px rgba(0,255,170,0.06), 0 12px 40px rgba(0,0,0,0.5)",
              fontFamily: "var(--terminal-font, 'JetBrains Mono', monospace)",
              transition: "width 0.2s ease",
            }}
          >
            {/* Title bar */}
            <div
              style={{
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

            {!minimized && (
              <div
                ref={scrollRef}
                style={{
                  maxHeight: 220,
                  overflowY: "auto",
                  padding: "8px 10px 4px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {lines.map((line, i) => {
                  const color = lineColor(line.kind);
                  const isLink = line.kind === "link" && line.to;
                  const Tag = isLink ? "a" : "div";
                  const props = isLink
                    ? {
                        href: line.to,
                        onClick: (e: React.MouseEvent) => {
                          e.preventDefault();
                          if (line.to) {
                            navigate(line.to);
                            closeTerminal();
                          }
                        },
                      }
                    : {};
                  return (
                    <Tag
                      key={i}
                      style={{
                        fontSize: 10.5,
                        lineHeight: 1.55,
                        color,
                        whiteSpace: "pre-wrap",
                        cursor: isLink ? "pointer" : undefined,
                        textDecoration: isLink ? "none" : undefined,
                      }}
                      {...props}
                    >
                      {line.text}
                    </Tag>
                  );
                })}
              </div>
            )}

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
                  fontFamily: "var(--terminal-font, 'JetBrains Mono', monospace)",
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

function lineColor(kind: TerminalLine["kind"]): string {
  switch (kind) {
    case "cmd":    return "var(--neon-primary)";
    case "accent": return "var(--neon-primary)";
    case "error":  return "#ff4466";
    case "warn":   return "rgba(255,200,0,0.85)";
    case "art":    return "rgba(0,255,170,0.65)";
    case "link":   return "var(--neon-primary)";
    case "info":
    default:       return "rgba(255,255,255,0.55)";
  }
}

export default LandingTerminal;
