import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * FounderSection — kto je za CokTech.
 * Trust sekcia: žiadna anonymná agentúra, píšete priamo staviteľovi.
 */

const TERMINAL_LINES: [string, string][] = [
  ["whoami", "bruno@coktech"],
  ["role", "founder / builder"],
  ["stack", "React · Next.js · Claude API · n8n"],
  ["location", "Levice, SK"],
  ["response_time", "< 24h"],
];

const VALUES = [
  "Priama komunikácia — žiadny prostredník",
  "Build in public — reálne čísla, reálne projekty",
  "Lokálna firma, globálne štandardy",
];

const FounderSection = () => (
  <section className="relative z-10 py-20 sm:py-28 px-5 sm:px-6" style={{ background: "#000" }}>
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
      {/* Terminal identity card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative px-6 py-6 overflow-hidden order-2 md:order-1"
        style={{
          background: "rgba(5,5,8,0.85)",
          border: "1px solid rgba(0,255,170,0.1)",
        }}
      >
        <span className="absolute top-0 left-0 w-3 h-3 border-t border-l pointer-events-none" style={{ borderColor: "rgba(0,255,170,0.35)" }} />
        <span className="absolute top-0 right-0 w-3 h-3 border-t border-r pointer-events-none" style={{ borderColor: "rgba(0,255,170,0.35)" }} />
        <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l pointer-events-none" style={{ borderColor: "rgba(0,255,170,0.35)" }} />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r pointer-events-none" style={{ borderColor: "rgba(0,255,170,0.35)" }} />

        {/* Window header */}
        <div className="flex items-center gap-2 mb-5">
          <span style={{ width: 6, height: 6, background: "rgba(255,61,113,0.5)" }} />
          <span style={{ width: 6, height: 6, background: "rgba(255,140,0,0.5)" }} />
          <span style={{ width: 6, height: 6, background: "rgba(0,255,170,0.5)" }} />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8,
            color: "var(--text-ghost)",
            letterSpacing: "0.2em",
            marginLeft: 8,
          }}>
            identity.sh
          </span>
        </div>

        {TERMINAL_LINES.map(([cmd, out], i) => (
          <motion.div
            key={cmd}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
            className="mb-2.5"
          >
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--neon-primary)", opacity: 0.5 }}>
              $ {cmd}
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-primary)", marginLeft: 10 }}>
              {out}
            </span>
          </motion.div>
        ))}

        <span
          className="inline-block mt-1"
          style={{ width: 7, height: 13, background: "var(--neon-primary)", opacity: 0.6 }}
        />
      </motion.div>

      {/* Manifest */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="order-1 md:order-2"
      >
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          color: "var(--neon-primary)",
          letterSpacing: "0.25em",
          opacity: 0.5,
          marginBottom: 16,
        }}>
          KTO JE ZA TÝM // ŽIADNA ANONYMNÁ AGENTÚRA
        </p>

        <h2 style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)",
          color: "var(--text-primary)",
          letterSpacing: "-0.03em",
          lineHeight: 1.15,
          marginBottom: 18,
        }}>
          Píšete priamo človeku, ktorý váš systém aj postaví.
        </h2>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: "rgba(200,196,208,0.45)",
          lineHeight: 1.75,
          marginBottom: 22,
        }}>
          Som Bruno — zakladateľ CokTech. Staviam dve firmy súčasne a AI používam
          ako konkurenčnú výhodu, nie ako buzzword. Žiadny account manager,
          žiadne odovzdávanie ticketov. Každý projekt navrhujem a staviam tak,
          ako keby bol môj vlastný.
        </p>

        <ul className="mb-8 space-y-2">
          {VALUES.map((v) => (
            <li key={v} className="flex items-center gap-2.5">
              <span style={{ width: 4, height: 4, background: "var(--neon-primary)", opacity: 0.6, flexShrink: 0 }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.03em" }}>
                {v}
              </span>
            </li>
          ))}
        </ul>

        <Link
          to="/kontakt"
          className="inline-flex items-center gap-1.5 transition-all duration-300"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            padding: "9px 20px",
            border: "1px solid rgba(0,255,170,0.3)",
            color: "var(--neon-primary)",
            letterSpacing: "0.1em",
            background: "rgba(0,255,170,0.04)",
          }}
        >
          [ NAPÍŠTE MI ]
          <ArrowUpRight size={12} />
        </Link>
      </motion.div>
    </div>
  </section>
);

export default FounderSection;
