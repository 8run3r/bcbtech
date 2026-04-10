import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Scanlines from "@/components/ui/scanlines";

const ARCHIVE_ENTRIES = [
  { id: "DOC-001", title: "INITIAL SYSTEM DEPLOYMENT", date: "2024.01.15", status: "DECLASSIFIED", fragment: "First node established. Signal strength nominal. Environment seeded with prototype assets. The foundation was laid in silence." },
  { id: "DOC-007", title: "PROJECT AURORA INTEGRATION", date: "2024.03.22", status: "PARTIAL", fragment: "Aurora subsystem integrated with core architecture. Energy efficiency increased by 340%. Side effects: intermittent temporal displacement in data streams." },
  { id: "DOC-013", title: "CLIENT NODE EXPANSION", date: "2024.06.08", status: "ACTIVE", fragment: "47 new nodes connected to the network. Each node represents a digital environment we built. Each one alive. Each one watching." },
  { id: "DOC-019", title: "AUTOMATION SINGULARITY EVENT", date: "2024.09.14", status: "CLASSIFIED", fragment: "AI systems began self-optimizing beyond expected parameters. ████████████████ resulted in ████████. Monitoring continues." },
  { id: "DOC-024", title: "SECTOR 04 ESTABLISHED", date: "2024.11.30", status: "DECLASSIFIED", fragment: "Physical operations node established in Levice. Coordinates: ██.████°N, ██.████°E. The digital and physical converge." },
  { id: "DOC-031", title: "THE OBSERVER PROTOCOL", date: "2025.02.17", status: "RESTRICTED", fragment: "Those who find this page were meant to find it. The system selects its observers. You are being ████████." },
  { id: "DOC-???", title: "ENTRY CORRUPTED", date: "████.██.██", status: "ERROR", fragment: "E̸R̸R̸O̸R̸:̸ ̸D̸A̸T̸A̸ ̸S̸T̸R̸E̸A̸M̸ ̸C̸O̸R̸R̸U̸P̸T̸E̸D̸.̸ ̸R̸E̸C̸O̸V̸E̸R̸Y̸ ̸I̸M̸P̸O̸S̸S̸I̸B̸L̸E̸.̸" },
];

const Archive = () => {
  const [loaded, setLoaded] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 800);
  }, []);

  return (
    <>
      <Scanlines />
      <main className="min-h-screen" style={{ background: "#000" }}>
        {/* Grid */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.015]"
          style={{
            backgroundImage: "linear-gradient(rgba(0,255,170,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,170,0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <Link to="/" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--text-ghost)", letterSpacing: "0.15em" }}>
              {'<'} RETURN TO NODE
            </Link>

            <div className="mt-8 mb-2" style={{ borderBottom: "1px solid rgba(0,255,170,0.06)", paddingBottom: "0.5rem" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "var(--neon-primary)", opacity: 0.3, letterSpacing: "0.2em" }}>
                CLASSIFIED ARCHIVE // ACCESS LEVEL: OBSERVER
              </span>
            </div>

            <h1 style={{ fontFamily: "'VT323', monospace", fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "var(--text-primary)", letterSpacing: "-0.02em", marginTop: "1rem" }}>
              ARCHIVE
            </h1>

            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--text-dim)", letterSpacing: "0.08em", lineHeight: 1.8, marginTop: "0.5rem" }}>
              {'>'} Recovered data fragments from the system log.
              <br />{'>'} Some entries have been redacted.
            </p>
          </motion.div>

          {/* Archive entries */}
          <div className="mt-12 space-y-3">
            {ARCHIVE_ENTRIES.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={loaded ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                className="group"
                style={{
                  border: `1px solid ${selectedDoc === entry.id ? "rgba(0,255,170,0.15)" : "rgba(0,255,170,0.03)"}`,
                  background: selectedDoc === entry.id ? "rgba(0,255,170,0.02)" : "transparent",
                  padding: "1rem 1.25rem",
                  cursor: "none",
                  transition: "all 0.3s ease",
                }}
                onClick={() => setSelectedDoc(selectedDoc === entry.id ? null : entry.id)}
                onMouseEnter={(e) => { if (selectedDoc !== entry.id) (e.currentTarget.style.borderColor = "rgba(0,255,170,0.08)"); }}
                onMouseLeave={(e) => { if (selectedDoc !== entry.id) (e.currentTarget.style.borderColor = "rgba(0,255,170,0.03)"); }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "var(--neon-primary)", opacity: 0.4, letterSpacing: "0.1em" }}>
                        {entry.id}
                      </span>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "8px",
                        letterSpacing: "0.1em",
                        color: entry.status === "ERROR" ? "var(--red-warning)" :
                               entry.status === "CLASSIFIED" ? "var(--amber)" :
                               entry.status === "RESTRICTED" ? "var(--neon-secondary)" :
                               "var(--text-ghost)",
                        opacity: 0.5,
                      }}>
                        [{entry.status}]
                      </span>
                    </div>
                    <h3 style={{ fontFamily: "'VT323', monospace", fontSize: "16px", color: entry.status === "ERROR" ? "var(--red-warning)" : "var(--text-primary)", letterSpacing: "0.02em" }}>
                      {entry.title}
                    </h3>
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "var(--text-ghost)", letterSpacing: "0.1em", flexShrink: 0 }}>
                    {entry.date}
                  </span>
                </div>

                {/* Expanded content */}
                {selectedDoc === entry.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 pt-3"
                    style={{ borderTop: "1px solid rgba(0,255,170,0.04)" }}
                  >
                    <p style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "10px",
                      color: "var(--text-dim)",
                      letterSpacing: "0.03em",
                      lineHeight: 1.8,
                    }}>
                      {entry.fragment}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Footer note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={loaded ? { opacity: 0.15 } : {}}
            transition={{ delay: 1.5 }}
            className="mt-16 text-center"
          >
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "var(--text-ghost)", letterSpacing: "0.2em" }}>
              END OF ACCESSIBLE ARCHIVE // DEEPER LEVELS REQUIRE ELEVATED ACCESS
            </p>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default Archive;
