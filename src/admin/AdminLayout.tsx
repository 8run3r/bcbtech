import { useState, useEffect, useCallback, type ReactNode } from "react";
import {
  LayoutDashboard, MessageSquare, Bot, FolderKanban,
  BarChart2, Settings, LogOut, Menu, Search, Monitor, Cpu,
  Globe, ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { CommandPalette } from "./CommandPalette";
import { W98, Win98Button, Win98TreeItem, aeroBorder } from "./win98";

export type AdminPage =
  | "dashboard" | "messages" | "marketing" | "projects"
  | "analytics" | "settings" | "agents";

interface NavItem {
  id: AdminPage;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { id: "dashboard",  label: "Dashboard",    icon: <LayoutDashboard size={14} /> },
  { id: "messages",   label: "Správy",        icon: <MessageSquare size={14} /> },
  { id: "agents",     label: "AI Agenti",     icon: <Cpu size={14} /> },
  { id: "marketing",  label: "AI Marketing",  icon: <Bot size={14} /> },
  { id: "projects",   label: "Projekty",      icon: <FolderKanban size={14} /> },
  { id: "analytics",  label: "Analytika",     icon: <BarChart2 size={14} /> },
  { id: "settings",   label: "Nastavenia",    icon: <Settings size={14} /> },
];

const pageTitles: Record<AdminPage, string> = {
  dashboard: "Dashboard",
  messages:  "Správy od klientov",
  agents:    "AI Agenti",
  marketing: "AI Marketing",
  projects:  "Projekty",
  analytics: "Analytika",
  settings:  "Nastavenia",
};

const pageIcons: Record<AdminPage, ReactNode> = {
  dashboard: <LayoutDashboard size={13} />,
  messages:  <MessageSquare size={13} />,
  agents:    <Cpu size={13} />,
  marketing: <Bot size={13} />,
  projects:  <FolderKanban size={13} />,
  analytics: <BarChart2 size={13} />,
  settings:  <Settings size={13} />,
};

interface Props {
  activePage: AdminPage;
  setActivePage: (p: AdminPage) => void;
  unreadCount?: number;
  onLogout: () => void;
  children: ReactNode;
}

export const AdminLayout = ({
  activePage,
  setActivePage,
  unreadCount = 0,
  onLogout,
  children,
}: Props) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [startOpen, setStartOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const handleGlobalKey = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setPaletteOpen((v) => !v);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [handleGlobalKey]);

  useEffect(() => {
    if (!startOpen) return;
    const handler = () => setStartOpen(false);
    setTimeout(() => document.addEventListener("click", handler), 0);
    return () => document.removeEventListener("click", handler);
  }, [startOpen]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      // Win7 desktop — gradient background resembling default wallpaper
      background: "linear-gradient(160deg, #0d2a5e 0%, #1a4a8a 30%, #2060b0 55%, #1e4e90 75%, #162e60 100%)",
      fontFamily: W98.font,
      overflow: "hidden",
    }}>
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        setActivePage={setActivePage}
      />

      {/* ═══ Desktop area ═══ */}
      <div style={{
        flex: 1,
        display: "flex",
        padding: "6px 6px 0 6px",
        overflow: "hidden",
      }}>

        {/* Main window — Aero glass chrome */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#f0f0f0",
          borderRadius: "6px 6px 0 0",
          boxShadow: aeroBorder,
          overflow: "hidden",
          border: "1px solid rgba(80,140,220,0.5)",
          borderBottom: "none",
        }}>

          {/* ── Aero Title bar ── */}
          <div style={{
            background: W98.titleActive,
            padding: "0 4px 0 10px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            userSelect: "none",
            flexShrink: 0,
            height: 32,
            position: "relative",
          }}>
            {/* Glass shine */}
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: "55%",
              background: "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.08) 100%)",
              pointerEvents: "none",
              borderRadius: "6px 6px 0 0",
            }} />

            <span style={{ display: "flex", alignItems: "center", zIndex: 1 }}>
              <Monitor size={14} color="#1a3a7a" />
            </span>
            <span style={{
              fontFamily: W98.font,
              fontSize: "12px",
              fontWeight: 400,
              color: "#1a2a5a",
              flex: 1,
              textShadow: "0 1px 0 rgba(255,255,255,0.7)",
              zIndex: 1,
            }}>
              CokTech Admin — {pageTitles[activePage]}
            </span>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                padding: 4,
                zIndex: 1,
              }}
            >
              <Menu size={14} color="#1a2a5a" />
            </button>

            {/* Window controls */}
            <div style={{ display: "flex", gap: 1, zIndex: 1 }}>
              <WinCtrlBtn type="min" />
              <WinCtrlBtn type="max" />
              <WinCtrlBtn type="close" onClick={onLogout} />
            </div>
          </div>

          {/* ── Menu bar ── */}
          <div style={{
            borderBottom: "1px solid rgba(0,0,0,0.1)",
            padding: "1px 6px",
            display: "flex",
            alignItems: "center",
            background: "rgba(240,245,255,0.95)",
            flexShrink: 0,
          }}>
            {["Súbor", "Upraviť", "Zobraziť", "Nástroje", "Pomoc"].map((m) => (
              <MenuBarItem
                key={m}
                label={m}
                onClick={m === "Nástroje" ? () => setPaletteOpen(true) : undefined}
              />
            ))}
            <div style={{ flex: 1 }} />
            <button
              onClick={() => setPaletteOpen(true)}
              style={{
                fontFamily: W98.font,
                fontSize: "11px",
                color: W98.grayText,
                background: "transparent",
                border: "none",
                padding: "2px 8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                borderRadius: 2,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,120,215,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Search size={11} />
              Hľadať (Ctrl+K)
            </button>
          </div>

          {/* ── Toolbar ── */}
          <div style={{
            borderBottom: "1px solid rgba(0,0,0,0.1)",
            padding: "3px 6px",
            display: "flex",
            alignItems: "center",
            gap: 3,
            flexShrink: 0,
            background: "rgba(248,251,255,0.9)",
          }}>
            <Win98Button small onClick={() => setActivePage("dashboard")}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <LayoutDashboard size={11} /> Domov
              </span>
            </Win98Button>
            <Win98Button small onClick={() => setActivePage("messages")}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <MessageSquare size={11} />
                Správy{unreadCount > 0 ? ` (${unreadCount})` : ""}
              </span>
            </Win98Button>
            <Win98Button small onClick={() => setActivePage("agents")}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Cpu size={11} /> Agenti
              </span>
            </Win98Button>

            {/* Separator */}
            <div style={{ width: 1, height: 18, background: "rgba(0,0,0,0.15)", margin: "0 3px" }} />

            <Win98Button small onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? "Skryť panel" : "Zobraziť panel"}
            </Win98Button>
            <Win98Button small onClick={() => window.open("/", "_blank")}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Globe size={11} /> Web
              </span>
            </Win98Button>
          </div>

          {/* ── Breadcrumb / address bar ── */}
          <div style={{
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            padding: "3px 8px",
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexShrink: 0,
            background: "rgba(250,252,255,0.9)",
          }}>
            <span style={{ fontFamily: W98.font, fontSize: "11px", color: W98.grayText, flexShrink: 0 }}>
              Adresa:
            </span>
            <div style={{
              flex: 1,
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.18)",
              borderRadius: 2,
              padding: "2px 8px",
              display: "flex",
              alignItems: "center",
              gap: 4,
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)",
            }}>
              <span style={{ color: W98.grayText, display: "flex" }}>{pageIcons[activePage]}</span>
              <span style={{ fontFamily: W98.font, fontSize: "11px", color: W98.grayText }}>CokTech</span>
              <ChevronRight size={10} color={W98.grayText} />
              <span style={{ fontFamily: W98.font, fontSize: "11px", color: W98.black, fontWeight: 600 }}>
                {pageTitles[activePage]}
              </span>
            </div>
          </div>

          {/* ── Content area ── */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

            {/* Sidebar — Desktop */}
            {sidebarOpen && (
              <div
                className="hidden lg:flex"
                style={{
                  width: 210,
                  flexDirection: "column",
                  borderRight: "1px solid rgba(0,0,0,0.08)",
                  background: "rgba(248,250,255,0.95)",
                  flexShrink: 0,
                  overflow: "auto",
                  padding: "8px 0",
                }}
              >
                {/* Logo / title */}
                <div style={{
                  padding: "4px 12px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  borderBottom: "1px solid rgba(0,0,0,0.08)",
                  marginBottom: 4,
                }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #0078d7, #004a9e)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 6px rgba(0,120,215,0.4)",
                  }}>
                    <Monitor size={14} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontFamily: W98.font, fontSize: "12px", fontWeight: 700, color: W98.black }}>
                      CokTech
                    </div>
                    <div style={{ fontFamily: W98.font, fontSize: "10px", color: W98.grayText }}>
                      Admin Panel
                    </div>
                  </div>
                </div>

                {/* Nav items */}
                <div style={{ flex: 1, padding: "4px 0" }}>
                  {navItems.map((item) => (
                    <Win98TreeItem
                      key={item.id}
                      label={item.label}
                      icon={item.icon}
                      active={activePage === item.id}
                      onClick={() => setActivePage(item.id)}
                      badge={item.id === "messages" ? unreadCount : undefined}
                    />
                  ))}
                </div>

                {/* Logout at bottom */}
                <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 4, marginTop: 4 }}>
                  <Win98TreeItem
                    label="Odhlásiť sa"
                    icon={<LogOut size={14} />}
                    onClick={onLogout}
                  />
                </div>
              </div>
            )}

            {/* Mobile nav overlay */}
            {mobileMenuOpen && (
              <div
                className="lg:hidden"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 50,
                  width: 220,
                  height: "100%",
                  background: "rgba(248,250,255,0.98)",
                  boxShadow: "2px 0 12px rgba(0,0,0,0.15)",
                  padding: "8px 0",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {navItems.map((item) => (
                  <Win98TreeItem
                    key={item.id}
                    label={item.label}
                    icon={item.icon}
                    active={activePage === item.id}
                    onClick={() => { setActivePage(item.id); setMobileMenuOpen(false); }}
                    badge={item.id === "messages" ? unreadCount : undefined}
                  />
                ))}
                <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", marginTop: "auto", paddingTop: 4 }}>
                  <Win98TreeItem
                    label="Odhlásiť sa"
                    icon={<LogOut size={14} />}
                    onClick={onLogout}
                  />
                </div>
              </div>
            )}

            {/* Main content */}
            <div style={{
              flex: 1,
              overflow: "auto",
              background: "#f8f9fc",
              padding: 0,
            }}>
              <div style={{ padding: 14, minHeight: "100%" }}>
                {children}
              </div>
            </div>
          </div>

          {/* ── Status bar ── */}
          <div style={{
            borderTop: "1px solid rgba(0,0,0,0.1)",
            padding: "3px 10px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
            background: "rgba(240,244,250,0.95)",
            fontSize: "11px",
            fontFamily: W98.font,
            color: W98.grayText,
          }}>
            <span style={{ flex: 1 }}>
              {unreadCount > 0 ? `${unreadCount} nových správ` : "Pripravené"}
            </span>
            <span>CokTech v2.0</span>
            <div style={{ width: 1, height: 12, background: "rgba(0,0,0,0.15)" }} />
            <span>Bruno Cok — CEO</span>
          </div>
        </div>
      </div>

      {/* ═══ Win7 Taskbar ═══ */}
      <div style={{
        height: 40,
        background: "rgba(10, 20, 50, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(100,150,230,0.3)",
        display: "flex",
        alignItems: "center",
        padding: "0 4px",
        gap: 2,
        flexShrink: 0,
        position: "relative",
        zIndex: 10,
      }}>
        {/* Start orb */}
        <button
          onClick={(e) => { e.stopPropagation(); setStartOpen(!startOpen); }}
          style={{
            width: 40,
            height: 40,
            background: startOpen
              ? "radial-gradient(circle at 50% 60%, #3a90e8, #0050b0)"
              : "radial-gradient(circle at 50% 40%, #5aabf8, #0060c0)",
            border: "none",
            borderRadius: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: startOpen
              ? "inset 0 2px 4px rgba(0,0,0,0.3)"
              : "inset 0 1px 0 rgba(255,255,255,0.3), 2px 0 8px rgba(0,80,200,0.3)",
            transition: "background 0.15s",
          }}
          title="Štart"
        >
          <svg width="20" height="20" viewBox="0 0 20 20">
            {/* Windows orb logo */}
            <circle cx="10" cy="10" r="9" fill="rgba(255,255,255,0.15)" />
            <g fill="rgba(255,255,255,0.9)">
              <rect x="4" y="4" width="5" height="5" rx="1" />
              <rect x="11" y="4" width="5" height="5" rx="1" />
              <rect x="4" y="11" width="5" height="5" rx="1" />
              <rect x="11" y="11" width="5" height="5" rx="1" />
            </g>
          </svg>
        </button>

        {/* Start menu */}
        {startOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              bottom: 40,
              left: 0,
              width: 280,
              background: "rgba(20, 40, 80, 0.92)",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
              border: "1px solid rgba(100,160,240,0.4)",
              borderBottom: "none",
              borderRadius: "8px 8px 0 0",
              boxShadow: "0 -8px 30px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.05)",
              zIndex: 200,
              overflow: "hidden",
            }}
          >
            {/* User header */}
            <div style={{
              background: "linear-gradient(90deg, #1060c0, #0840a0)",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #5ab0f0, #0078d7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid rgba(255,255,255,0.3)",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: "16px" }}>🧑‍💻</span>
              </div>
              <div>
                <div style={{ fontFamily: W98.font, fontSize: "13px", fontWeight: 600, color: "#fff" }}>
                  Bruno Cok
                </div>
                <div style={{ fontFamily: W98.font, fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>
                  Administrator
                </div>
              </div>
            </div>

            {/* Nav items */}
            <div style={{ padding: "6px 0" }}>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActivePage(item.id); setStartOpen(false); }}
                  style={{
                    fontFamily: W98.font,
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.9)",
                    background: "transparent",
                    border: "none",
                    padding: "7px 16px",
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,120,215,0.4)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ color: "rgba(255,255,255,0.7)", display: "flex" }}>{item.icon}</span>
                  {item.label}
                  {item.id === "messages" && unreadCount > 0 && (
                    <span style={{
                      marginLeft: "auto",
                      background: "#0078d7",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: 10,
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Bottom actions */}
            <div style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              padding: "6px 0",
              background: "rgba(0,0,0,0.2)",
            }}>
              <button
                onClick={() => { window.open("/", "_blank"); setStartOpen(false); }}
                style={{
                  fontFamily: W98.font, fontSize: "12px", color: "rgba(255,255,255,0.9)",
                  background: "transparent", border: "none", padding: "7px 16px",
                  width: "100%", textAlign: "left", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 10,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,120,215,0.4)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Globe size={14} style={{ color: "rgba(255,255,255,0.7)" }} />
                Otvoriť web
              </button>
              <button
                onClick={() => { onLogout(); setStartOpen(false); }}
                style={{
                  fontFamily: W98.font, fontSize: "12px", color: "rgba(255,160,160,0.9)",
                  background: "transparent", border: "none", padding: "7px 16px",
                  width: "100%", textAlign: "left", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 10,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(200,0,0,0.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <LogOut size={14} />
                Odhlásiť sa
              </button>
            </div>
          </div>
        )}

        {/* Taskbar separator */}
        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)", margin: "0 3px" }} />

        {/* Pinned / active page button */}
        <button
          style={{
            fontFamily: W98.font,
            fontSize: "11px",
            color: "rgba(255,255,255,0.9)",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 3,
            padding: "4px 10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            maxWidth: 200,
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.7)", display: "flex" }}>
            {pageIcons[activePage]}
          </span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {pageTitles[activePage]}
          </span>
        </button>

        <div style={{ flex: 1 }} />

        {/* System tray */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 10px",
          height: "100%",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
        }}>
          {unreadCount > 0 && (
            <button
              onClick={() => setActivePage("messages")}
              title={`${unreadCount} nových správ`}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                position: "relative",
                padding: 2,
              }}
            >
              <MessageSquare size={14} color="rgba(255,255,255,0.7)" />
              <span style={{
                position: "absolute",
                top: -2, right: -2,
                background: "#0078d7",
                color: "#fff",
                fontSize: "9px",
                fontWeight: 700,
                borderRadius: "50%",
                width: 12,
                height: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </button>
          )}
          <div style={{
            fontFamily: W98.font,
            fontSize: "11px",
            color: "rgba(255,255,255,0.8)",
            textAlign: "center",
            lineHeight: 1.3,
          }}>
            <div>{format(now, "HH:mm")}</div>
            <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)" }}>
              {format(now, "d.M.yyyy")}
            </div>
          </div>
        </div>

        {/* Show desktop button (Aero Peek) */}
        <div style={{
          width: 6,
          height: 40,
          background: "rgba(255,255,255,0.08)",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          cursor: "pointer",
          flexShrink: 0,
        }}
          title="Zobraziť plochu"
        />
      </div>
    </div>
  );
};

/* ── Menu bar item ── */
const MenuBarItem = ({ label, onClick }: { label: string; onClick?: () => void }) => (
  <button
    style={{
      fontFamily: W98.font,
      fontSize: "12px",
      color: W98.black,
      background: "transparent",
      border: "none",
      padding: "3px 8px",
      cursor: "pointer",
      borderRadius: 2,
      transition: "background 0.1s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,120,215,0.12)")}
    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    onClick={onClick}
  >
    {label}
  </button>
);

/* ── Window control button (title bar) ── */
const WinCtrlBtn = ({
  type,
  onClick,
}: {
  type: "close" | "min" | "max";
  onClick?: () => void;
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 28,
        height: 22,
        background: type === "close"
          ? hovered ? "rgba(200, 50, 50, 0.8)" : "rgba(180,50,50,0.15)"
          : hovered ? "rgba(100,160,240,0.4)" : "rgba(100,160,240,0.1)",
        border: "1px solid rgba(60,120,200,0.25)",
        borderRadius: type === "close" ? "0 5px 0 0" : 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: 0,
        transition: "background 0.12s",
      }}
    >
      {type === "close" && (
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path d="M1.5,1.5 L8.5,8.5 M8.5,1.5 L1.5,8.5"
            stroke={hovered ? "#fff" : "#333"} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
      {type === "min" && (
        <svg width="10" height="2" viewBox="0 0 10 2">
          <line x1="1" y1="1" x2="9" y2="1"
            stroke="#444" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
      {type === "max" && (
        <svg width="10" height="10" viewBox="0 0 10 10">
          <rect x="1.5" y="1.5" width="7" height="7" fill="none"
            stroke="#444" strokeWidth="1.5" strokeLinejoin="round" />
          <line x1="1.5" y1="3.5" x2="8.5" y2="3.5" stroke="#444" strokeWidth="1" />
        </svg>
      )}
    </button>
  );
};
