import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, MessageSquare, Bot, FolderKanban,
  BarChart2, Settings, Search, ExternalLink, Cpu,
} from "lucide-react";
import type { AdminPage } from "./AdminLayout";
import { W98, raised, sunken, Win98Button, Win98Input } from "./win98";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  group: string;
  keywords?: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  setActivePage: (p: AdminPage) => void;
}

export const CommandPalette = ({ open, onClose, setActivePage }: Props) => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const navigate = useCallback(
    (page: AdminPage) => { setActivePage(page); onClose(); },
    [setActivePage, onClose]
  );

  const commands: Command[] = [
    { id: "dashboard", label: "Dashboard", description: "Prehľad správ a projektov", icon: <LayoutDashboard size={14} />, action: () => navigate("dashboard"), group: "Navigácia", keywords: ["home", "prehľad"] },
    { id: "messages", label: "Správy", description: "Správy od klientov", icon: <MessageSquare size={14} />, action: () => navigate("messages"), group: "Navigácia", keywords: ["kontakt", "leads", "email"] },
    { id: "agents", label: "AI Agenti", description: "CokTech AI agent centrum", icon: <Cpu size={14} />, action: () => navigate("agents"), group: "Navigácia", keywords: ["agenti", "ai", "bot"] },
    { id: "marketing", label: "AI Marketing", description: "Generovanie obsahu", icon: <Bot size={14} />, action: () => navigate("marketing"), group: "Navigácia", keywords: ["obsah", "instagram"] },
    { id: "projects", label: "Projekty", description: "Správa portfólia", icon: <FolderKanban size={14} />, action: () => navigate("projects"), group: "Navigácia", keywords: ["portfolio"] },
    { id: "analytics", label: "Analytika", description: "Štatistiky", icon: <BarChart2 size={14} />, action: () => navigate("analytics"), group: "Navigácia", keywords: ["stats"] },
    { id: "settings", label: "Nastavenia", description: "Konfigurácia", icon: <Settings size={14} />, action: () => navigate("settings"), group: "Navigácia", keywords: ["config"] },
    { id: "open-site", label: "Otvoriť stránku", description: "coktech.tech", icon: <ExternalLink size={14} />, action: () => { window.open("/", "_blank"); onClose(); }, group: "Akcie", keywords: ["site", "web"] },
  ];

  const filtered = query
    ? commands.filter((c) => {
        const q = query.toLowerCase();
        return c.label.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || c.keywords?.some((k) => k.includes(q));
      })
    : commands;

  useEffect(() => {
    if (open) { setQuery(""); setSelected(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => { setSelected(0); }, [query]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
      if (e.key === "Enter") { e.preventDefault(); filtered[selected]?.action(); }
    },
    [open, filtered, selected, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selected}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 100 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            style={{
              position: "fixed",
              left: "50%",
              top: "20%",
              transform: "translateX(-50%)",
              width: 460,
              maxWidth: "calc(100vw - 32px)",
              zIndex: 101,
              background: "rgba(240,244,252,0.97)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: "6px 6px 4px 4px",
              border: "1px solid rgba(80,140,220,0.5)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.4) inset, 0 12px 40px rgba(0,0,60,0.3), 0 4px 12px rgba(0,80,200,0.15)",
              fontFamily: W98.font,
              overflow: "hidden",
            }}
          >
            {/* Aero title bar */}
            <div style={{
              background: W98.titleActive,
              padding: "0 8px",
              height: 30,
              display: "flex",
              alignItems: "center",
              gap: 6,
              position: "relative",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "55%",
                background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.05) 100%)",
                pointerEvents: "none",
              }} />
              <Search size={12} color="#1a3a7a" style={{ zIndex: 1 }} />
              <span style={{ fontSize: "12px", fontWeight: 400, color: "#1a2a5a", flex: 1, textShadow: "0 1px 0 rgba(255,255,255,0.7)", zIndex: 1 }}>
                Vyhľadávanie
              </span>
              <button
                onClick={onClose}
                style={{
                  width: 28, height: 22, background: "rgba(180,50,50,0.15)",
                  border: "1px solid rgba(60,120,200,0.25)", borderRadius: "0 5px 0 0",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(200,50,50,0.7)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(180,50,50,0.15)")}
              >
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path d="M1.5,1.5 L8.5,8.5 M8.5,1.5 L1.5,8.5" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Search bar */}
            <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                flex: 1, display: "flex", alignItems: "center", gap: 6,
                background: "#fff", border: "1px solid rgba(0,0,0,0.2)",
                borderRadius: 3, padding: "5px 10px",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06), 0 0 0 2px rgba(0,120,215,0.15)",
              }}>
                <Search size={13} color={W98.grayText} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Hľadaj príkaz alebo stránku..."
                  style={{
                    fontFamily: W98.font, fontSize: "13px",
                    background: "transparent", color: W98.black,
                    border: "none", outline: "none", flex: 1,
                  }}
                />
                {query && (
                  <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12">
                      <path d="M2,2 L10,10 M10,2 L2,10" stroke={W98.grayText} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Results */}
            <div ref={listRef} style={{ maxHeight: 300, overflow: "auto" }}>
              {filtered.length === 0 ? (
                <p style={{ padding: 20, textAlign: "center", color: W98.grayText, fontSize: "12px" }}>
                  Žiadny výsledok pre „{query}"
                </p>
              ) : (
                <>
                  {/* Group header */}
                  <div style={{ padding: "6px 12px 2px", fontSize: "10px", fontWeight: 700, color: W98.grayText, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Navigácia
                  </div>
                  {filtered.map((cmd, idx) => (
                    <button
                      key={cmd.id}
                      data-idx={idx}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelected(idx)}
                      style={{
                        fontFamily: W98.font, fontSize: "12px",
                        display: "flex", alignItems: "center", gap: 8,
                        width: "100%", padding: "7px 12px",
                        background: idx === selected ? "rgba(0,120,215,0.1)" : "transparent",
                        color: W98.black,
                        border: "none",
                        borderLeft: idx === selected ? "2px solid #0078d7" : "2px solid transparent",
                        cursor: "pointer", textAlign: "left",
                        transition: "background 0.08s",
                      }}
                    >
                      <span style={{
                        display: "flex", width: 28, height: 28, alignItems: "center", justifyContent: "center",
                        background: idx === selected ? "rgba(0,120,215,0.12)" : "rgba(0,0,0,0.05)",
                        borderRadius: 4, color: idx === selected ? "#0078d7" : W98.grayText, flexShrink: 0,
                      }}>
                        {cmd.icon}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{cmd.label}</div>
                        {cmd.description && (
                          <div style={{ fontSize: "11px", color: W98.grayText }}>{cmd.description}</div>
                        )}
                      </div>
                      {idx === selected && (
                        <span style={{ fontSize: "10px", color: W98.grayText }}>↵</span>
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: "6px 12px", borderTop: "1px solid rgba(0,0,0,0.08)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(240,244,252,0.8)", fontSize: "10px", color: W98.grayText,
            }}>
              <span>↑↓ naviguj · ↵ otvor · Esc zatvoriť</span>
              <Win98Button small onClick={() => filtered[selected]?.action()}>Otvoriť</Win98Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
