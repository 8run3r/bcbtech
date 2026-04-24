import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface TerminalLine {
  id: number;
  type: "input" | "output" | "error" | "system";
  text: string;
}

const COMMANDS: Record<string, (navigate: ReturnType<typeof useNavigate>, scrollTo: (id: string) => void) => string | null> = {
  // ── Help ──
  help: () =>
    "NAV: digital | automation | portfolio | balicky | riesenia | logika | kontakt | admin\n" +
    "INFO: status | stack | whoami | date | email\n" +
    "SOCIAL: instagram | linkedin\n" +
    "SECRET: void | archive | nodes\n" +
    "FUN: hack | matrix | clear",

  // ── Navigation ──
  digital: (_nav, scrollTo) => { scrollTo("digital-world"); return "ENTERING WORLD_01 // DIGITAL SECTOR →"; },
  automation: (_nav, scrollTo) => { scrollTo("automation-world"); return "ENTERING WORLD_02 // AUTOMATION SECTOR →"; },
  portfolio: (nav) => { nav("/portfolio"); return "→ /portfolio — portfólio projektov"; },
  balicky: (nav) => { nav("/balicky"); return "→ /balicky — ceny a balíčky"; },
  ceny: (nav) => { nav("/balicky"); return "→ /balicky — ceny a balíčky"; },
  riesenia: (nav) => { nav("/riesenia"); return "→ /riesenia — naše riešenia"; },
  logika: (nav) => { nav("/logika"); return "→ /logika — prečo CokTech"; },
  preco: (nav) => { nav("/logika"); return "→ /logika — prečo CokTech"; },
  kontakt: (nav) => { nav("/kontakt"); return "→ /kontakt — napíš nám"; },
  contact: (nav) => { nav("/kontakt"); return "→ /kontakt — napíš nám"; },
  admin: (nav) => { nav("/admin"); return "→ /admin — admin panel [AUTH REQUIRED]"; },

  // ── Info ──
  status: () =>
    "SYSTEM: NOMINAL ✓  |  UPTIME: 99.97%  |  LATENCY: 0.003ms\nNODES: 47 ACTIVE  |  BUILD: v2.0.0  |  NODE CT-7X29",
  whoami: () =>
    "CokTech.digital — Bruno Cok\nDigital Studio + AI Automation, Levice SK\nweb / e-commerce / n8n / Claude API",
  date: () => {
    const now = new Date();
    return `DATE: ${now.toLocaleDateString("sk-SK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}\nTIME: ${now.toLocaleTimeString("en-US", { hour12: false })}`;
  },
  stack: () =>
    "DIGITAL: Next.js | React | TypeScript | Tailwind | Supabase\nAUTOMATION: n8n | Claude API | Make | Python\nINFRA: Vercel | Supabase | Cloudflare",
  email: () => {
    window.location.href = "mailto:studio@coktech.tech";
    return "OPENING MAIL CLIENT → studio@coktech.tech";
  },

  // ── Social ──
  instagram: () => {
    window.open("https://instagram.com/coktech.digital", "_blank");
    return "OPENING → instagram.com/coktech.digital";
  },
  linkedin: () => {
    window.open("https://linkedin.com/company/coktech", "_blank");
    return "OPENING → linkedin.com/company/coktech";
  },

  // ── Secret ──
  void: (nav) => { nav("/void"); return "ENTERING THE VOID..."; },
  doom: (nav) => { nav("/doom"); return "INITIALIZING SYSTEM BREACH..."; },
  archive: (nav) => { nav("/archive"); return "ACCESSING ARCHIVE..."; },
  nodes: (nav) => { nav("/node-map"); return "LOADING NODE MAP..."; },
  konfigurator: (nav) => { nav("/konfigurator"); return "→ /konfigurator"; },

  // ── Fun / Easter eggs ──
  hack: () => null, // triggers glitch animation
  matrix: () => null, // triggers data rain flash
  clear: () => "__CLEAR__",
  cls: () => "__CLEAR__",
};

interface Props {
  visible: boolean;
}

let lineCounter = 0;
const nextId = () => ++lineCounter;

const HeroTerminal = ({ visible }: Props) => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: nextId(), type: "system", text: "> TERMINAL READY — type 'help' for commands" },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [glitching, setGlitching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const addLines = useCallback((newLines: TerminalLine[]) => {
    setLines((prev) => [...prev.slice(-20), ...newLines]);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const cmd = input.trim().toLowerCase();
      if (!cmd) return;

      const inputLine: TerminalLine = { id: nextId(), type: "input", text: `> ${cmd}` };

      setHistory((h) => [cmd, ...h.slice(0, 19)]);
      setHistoryIdx(-1);
      setInput("");

      if (cmd === "hack") {
        addLines([inputLine, { id: nextId(), type: "output", text: "INITIATING INTRUSION SEQUENCE..." }]);
        setGlitching(true);
        setTimeout(() => {
          setGlitching(false);
          addLines([{ id: nextId(), type: "error", text: "ACCESS DENIED — you tried though 👀" }]);
        }, 1200);
        return;
      }

      if (cmd === "matrix") {
        addLines([inputLine, { id: nextId(), type: "system", text: "ACTIVATING MATRIX PROTOCOL..." }]);
        // Briefly boost DataRain by toggling a global custom event
        window.dispatchEvent(new CustomEvent("coktech:matrix-flash"));
        setTimeout(() => addLines([{ id: nextId(), type: "output", text: "REALITY FILTER: DISABLED (temporarily)" }]), 600);
        return;
      }

      const handler = COMMANDS[cmd];
      if (!handler) {
        addLines([
          inputLine,
          { id: nextId(), type: "error", text: `UNKNOWN COMMAND: '${cmd}' — type 'help'` },
        ]);
        return;
      }

      const result = handler(navigate, scrollTo);
      if (result === "__CLEAR__") {
        setLines([{ id: nextId(), type: "system", text: "> TERMINAL CLEARED" }]);
        return;
      }
      if (result === null) return;
      addLines([inputLine, { id: nextId(), type: "output", text: result }]);
    },
    [input, navigate, scrollTo, addLines]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(next);
      setInput(history[next] ?? "");
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(historyIdx - 1, -1);
      setHistoryIdx(next);
      setInput(next === -1 ? "" : history[next] ?? "");
    }
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          animation: glitching ? "glitchText 0.2s ease infinite" : undefined,
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Terminal header */}
        <div
          className="flex items-center justify-between px-3 py-1.5"
          style={{
            background: "rgba(0,255,170,0.04)",
            border: "1px solid rgba(0,255,170,0.1)",
            borderBottom: "1px solid rgba(0,255,170,0.06)",
          }}
        >
          <span style={{ fontSize: 7, color: "rgba(0,255,170,0.4)", letterSpacing: "0.2em" }}>
            CT-7X29 // TERMINAL
          </span>
          <div className="flex gap-1">
            {[0.5, 0.3, 0.2].map((o, i) => (
              <div key={i} style={{ width: 4, height: 4, background: `rgba(0,255,170,${o})` }} />
            ))}
          </div>
        </div>

        {/* Output */}
        <div
          ref={scrollRef}
          style={{
            background: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(0,255,170,0.08)",
            borderTop: "none",
            borderBottom: "none",
            maxHeight: 72,
            overflowY: "auto",
            padding: "6px 10px",
          }}
        >
          {lines.map((line) => (
            <div
              key={line.id}
              style={{
                fontSize: 8,
                lineHeight: 1.8,
                color:
                  line.type === "input" ? "rgba(200,196,208,0.5)" :
                  line.type === "error" ? "rgba(255,61,113,0.7)" :
                  line.type === "system" ? "rgba(0,255,170,0.3)" :
                  "rgba(0,255,170,0.6)",
                letterSpacing: "0.05em",
              }}
            >
              {line.text}
            </div>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: "rgba(0,0,0,0.7)",
            border: "1px solid rgba(0,255,170,0.1)",
            borderTop: "1px solid rgba(0,255,170,0.05)",
            display: "flex",
            alignItems: "center",
            padding: "6px 10px",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 8, color: "rgba(0,255,170,0.5)" }}>{">"}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 8,
              color: "rgba(200,196,208,0.8)",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.05em",
              cursor: "none",
            }}
            placeholder="type a command..."
          />
          <span
            style={{
              width: 6,
              height: 11,
              background: "rgba(0,255,170,0.6)",
              animation: "cursorBlink 1s steps(2) infinite",
              flexShrink: 0,
            }}
          />
        </form>
      </motion.div>
    </AnimatePresence>
  );
};

export default HeroTerminal;
