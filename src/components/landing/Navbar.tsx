import { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { label: "PORTFOLIO", to: "/portfolio", code: "P01" },
  { label: "BALÍČKY",   to: "/balicky",   code: "P02" },
  { label: "LOGIKA",    to: "/logika",    code: "P03" },
  { label: "KONTAKT",   to: "/kontakt",   code: "P04" },
];

/* ── Accent color context — syncs navbar .digital color with active page/tab ── */
const AccentContext = createContext<{ accent: string; accentRaw: string; setAccent: (color: string, raw: string) => void }>({
  accent: "var(--neon-primary)", accentRaw: "0,255,170", setAccent: () => {},
});

export const useNavAccent = () => useContext(AccentContext);

const TICKER_MESSAGES = [
  "SIGNAL: NOMINAL",
  "NODES: 47 ACTIVE",
  "AURORA: STABLE",
  "ENCRYPTION: AES-512",
  "UPTIME: 99.97%",
  "FREQUENCY: 427.3MHz",
  "LATENCY: 0.003ms",
  "SECTOR 04: ONLINE",
];

/* ── Accent Provider — wraps Navbar + children ── */
export const AccentProvider = ({ children }: { children: React.ReactNode }) => {
  const [accent, setAccentState] = useState("var(--neon-primary)");
  const [accentRaw, setAccentRaw] = useState("0,255,170");
  const setAccent = (color: string, raw: string) => { setAccentState(color); setAccentRaw(raw); };
  return <AccentContext.Provider value={{ accent, accentRaw, setAccent }}>{children}</AccentContext.Provider>;
};

/* ── Main Navbar ── */
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [statusBlink, setStatusBlink] = useState(true);
  const location = useLocation();
  const { accent, accentRaw } = useNavAccent();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  useEffect(() => {
    const i = setInterval(() => setTickerIdx((prev) => (prev + 1) % TICKER_MESSAGES.length), 4000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const i = setInterval(() => setStatusBlink((b) => !b), 2000);
    return () => clearInterval(i);
  }, []);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.4)",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: `1px solid ${scrolled ? `rgba(${accentRaw},0.06)` : "transparent"}`,
        }}
      >
        {/* Top ticker */}
        <div className="w-full overflow-hidden" style={{ height: 20, borderBottom: `1px solid rgba(${accentRaw},0.04)`, background: "rgba(0,0,0,0.5)" }}>
          <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-full">
            <div className="flex items-center gap-2">
              <div style={{ width: 4, height: 4, background: statusBlink ? accent : "transparent", boxShadow: statusBlink ? `0 0 6px ${accent}` : "none", transition: "all 0.5s" }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "var(--text-ghost)", letterSpacing: "0.15em" }}>
                CT-7X29 ONLINE
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.span
                key={tickerIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.25, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: accent, letterSpacing: "0.15em", transition: "color 0.5s" }}
              >
                {TICKER_MESSAGES[tickerIdx]}
              </motion.span>
            </AnimatePresence>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "var(--text-ghost)", letterSpacing: "0.1em" }} className="hidden sm:inline">
              SEC.04
            </span>
          </div>
        </div>

        {/* Main nav */}
        <nav className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="/" className="flex items-baseline gap-0.5 select-none group no-underline">
            <span style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 900,
              fontSize: "18px",
              color: "var(--text-primary)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              transition: "color 0.4s, text-shadow 0.4s",
              textShadow: "none",
            }}
            className="group-hover:text-[var(--neon-primary)]"
            onMouseEnter={(e) => { (e.target as HTMLElement).style.textShadow = `0 0 12px rgba(${accentRaw},0.3)`; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.textShadow = "none"; }}
            >
              COK<span style={{ color: accent, transition: "color 0.5s" }}>TECH</span>
            </span>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              fontSize: "11px",
              color: accent,
              opacity: 0.7,
              letterSpacing: "0.02em",
              transition: "color 0.5s",
            }}>
              .digital
            </span>
          </a>

          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className="relative group transition-all duration-300"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: active ? accent : "var(--text-dim)", letterSpacing: "0.12em", padding: "4px 8px", transition: "color 0.5s" }}
                  onMouseEnter={(e) => !active && ((e.currentTarget as HTMLElement).style.color = "var(--text-primary)")}
                  onMouseLeave={(e) => !active && ((e.currentTarget as HTMLElement).style.color = "var(--text-dim)")}
                >
                  <span style={{ opacity: 0.3, marginRight: 6 }}>{link.code}</span>
                  {link.label}
                  {active && (
                    <motion.span layoutId="nav-active" className="absolute bottom-0 left-0 right-0 h-px" style={{ background: accent, opacity: 0.5, transition: "background 0.5s" }} />
                  )}
                </Link>
              );
            })}

          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="block h-px w-5"
                style={{ background: accent, transition: "background 0.5s" }}
                animate={menuOpen ? i === 1 ? { opacity: 0 } : i === 0 ? { rotate: 45, y: 6 } : { rotate: -45, y: -6 } : { rotate: 0, y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </button>
        </nav>
      </header>

      {/* Mobile overlay — fullscreen terminal-style menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed inset-0 z-[60]"
            style={{ background: "rgba(0,0,0,0.97)", backdropFilter: "blur(24px)" }}
            onClick={() => setMenuOpen(false)}
          >
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(${accentRaw},0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(${accentRaw},0.5) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />

            {/* Scanlines */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "repeating-linear-gradient(transparent,transparent 1px,rgba(0,0,0,0.04) 1px,rgba(0,0,0,0.04) 2px)" }} />

            {/* Close button */}
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-5 right-5 z-10 p-2"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: accent, letterSpacing: "0.1em", background: "transparent", border: `1px solid rgba(${accentRaw},0.2)`, transition: "color 0.5s, border-color 0.5s" }}
            >
              [ ESC ]
            </button>

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-center h-full px-8" onClick={(e) => e.stopPropagation()}>
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-10"
              >
                <Link to="/" onClick={() => setMenuOpen(false)} style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 20, color: "var(--text-primary)", letterSpacing: "0.08em", textDecoration: "none" }}>
                  COK<span style={{ color: accent, transition: "color 0.5s" }}>TECH</span>
                </Link>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: accent, opacity: 0.3, display: "block", marginTop: 4, letterSpacing: "0.2em", transition: "color 0.5s" }}>
                  NAVIGATION // MAIN MENU
                </span>
              </motion.div>

              {/* Nav links — stacked with code prefix */}
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => {
                  const active = location.pathname === link.to;
                  return (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.06 }}
                    >
                      <Link
                        to={link.to}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-4 py-4 group"
                        style={{ textDecoration: "none", borderBottom: `1px solid rgba(${accentRaw},0.06)` }}
                      >
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 9,
                          color: accent,
                          opacity: active ? 0.8 : 0.25,
                          letterSpacing: "0.1em",
                          width: 28,
                          transition: "color 0.5s",
                        }}>
                          {link.code}
                        </span>
                        {active && (
                          <motion.div
                            layoutId="mobile-nav-dot"
                            style={{ width: 4, height: 4, background: accent, boxShadow: `0 0 8px ${accent}`, flexShrink: 0, transition: "background 0.5s, box-shadow 0.5s" }}
                          />
                        )}
                        <span style={{
                          fontFamily: "'VT323', monospace",
                          fontSize: 26,
                          color: active ? accent : "var(--text-primary)",
                          letterSpacing: "0.04em",
                          transition: "color 0.5s",
                        }}>
                          {link.label}
                        </span>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 8,
                          color: accent,
                          opacity: 0,
                          marginLeft: "auto",
                          letterSpacing: "0.1em",
                          transition: "opacity 0.3s, color 0.5s",
                        }}
                        className="group-hover:!opacity-40"
                        >
                          ENTER →
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-auto pb-8 pt-10"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div style={{ width: 4, height: 4, background: accent, boxShadow: `0 0 6px ${accent}`, transition: "background 0.5s, box-shadow 0.5s" }} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: accent, opacity: 0.4, letterSpacing: "0.15em", transition: "color 0.5s" }}>
                    SYSTEM READY
                  </span>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "var(--text-ghost)", letterSpacing: "0.1em" }}>
                  studio@coktech.tech
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
};

export default Navbar;
