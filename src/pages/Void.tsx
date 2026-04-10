import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Scanlines from "@/components/ui/scanlines";

const VOID_TEXT = [
  "You weren't supposed to find this.",
  "",
  "But the system doesn't make mistakes.",
  "",
  "Every click, every keystroke, every hesitation —",
  "the network observed. And it led you here.",
  "",
  "This is the void between nodes.",
  "The space where data goes to rest.",
  "The silence between transmissions.",
  "",
  "There's nothing here for you.",
  "",
  "Or maybe everything.",
  "",
  "...",
  "",
  "Press any key to return.",
  "Or stay. The void doesn't mind.",
];

const Void = () => {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const i = setInterval(() => {
      setVisibleLines(prev => {
        if (prev >= VOID_TEXT.length) { clearInterval(i); return prev; }
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const handler = () => { window.location.href = "/"; };
    const timeout = setTimeout(() => window.addEventListener("keydown", handler), 3000);
    return () => { clearTimeout(timeout); window.removeEventListener("keydown", handler); };
  }, []);

  return (
    <>
      <Scanlines />
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#000" }}>
        <div className="max-w-lg px-8">
          {VOID_TEXT.slice(0, visibleLines).map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: line ? 0.5 : 0 }}
              transition={{ duration: 1 }}
              style={{
                fontFamily: i === VOID_TEXT.length - 1 ? "'JetBrains Mono', monospace" : "'VT323', monospace",
                fontSize: i === 0 ? "18px" : "14px",
                color: i === 0 ? "var(--red-warning)" : "var(--text-dim)",
                letterSpacing: "0.03em",
                lineHeight: line ? 2.2 : 1.2,
                textAlign: "center",
              }}
            >
              {line || "\u00A0"}
            </motion.p>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ delay: 15 }}
            className="mt-12 text-center"
          >
            <Link to="/" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "var(--text-ghost)", letterSpacing: "0.2em" }}>
              [ ESCAPE ]
            </Link>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default Void;
