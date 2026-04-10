import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error:", location.pathname);
  }, [location.pathname]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-base)",
      padding: 20,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center" }}
      >
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "11px",
          letterSpacing: "0.25em",
          color: "var(--neon-primary)",
          marginBottom: 16,
          textTransform: "uppercase",
        }}>
          // ERROR_404
        </div>
        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "clamp(5rem, 18vw, 12rem)",
          fontWeight: 800,
          lineHeight: 1,
          color: "var(--text-primary)",
          margin: "0 0 12px",
          letterSpacing: "-0.04em",
        }}>
          404
        </h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "16px",
          color: "var(--text-dim)",
          marginBottom: 32,
        }}>
          Stránka sa nenašla.
        </p>
        <a
          href="/"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            letterSpacing: "0.12em",
            color: "var(--neon-primary)",
            background: "transparent",
            border: "1px solid rgba(0,255,170,0.3)",
            padding: "10px 20px",
            textDecoration: "none",
            transition: "background 0.2s",
            display: "inline-block",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,255,170,0.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          [ SPÄŤ DOMOV ]
        </a>
      </motion.div>
    </div>
  );
};

export default NotFound;
