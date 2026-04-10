import { useEffect, useState, type ReactNode } from "react";
import { MessageSquare, FolderKanban, TrendingUp, Cpu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import type { AdminPage } from "../AdminLayout";
import { W98, raised, sunken, Win98Button, Win98Panel, Win98Progress, Win98StatusSegment } from "../win98";

interface Props {
  setActivePage: (p: AdminPage) => void;
}

export const DashboardPage = ({ setActivePage }: Props) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [projects, setProjects] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [msgs, projs] = await Promise.all([
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
        supabase.from("portfolio_items").select("id", { count: "exact" }),
      ]);
      setMessages(msgs.data || []);
      setProjects(projs.count || 0);
      setLoading(false);
    };
    load();
  }, []);

  const unread = messages.filter((m) => m.status === "new").length;
  const recentMessages = messages.slice(0, 5);
  const drafts = (() => { try { return JSON.parse(localStorage.getItem("coktech_marketing_drafts") || "[]").length; } catch { return 0; } })();

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <p style={{ fontFamily: W98.font, fontSize: "12px", color: W98.black, marginBottom: 8 }}>
          Načítavam dáta...
        </p>
        <Win98Progress value={65} style={{ width: 200, margin: "0 auto" }} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: W98.font, fontSize: "12px", color: W98.black }}>
      {/* Welcome banner */}
      <div style={{
        boxShadow: raised,
        background: W98.bg,
        padding: "8px 12px",
        marginBottom: 12,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <span style={{ fontSize: "20px" }}>💻</span>
        <div>
          <span style={{ fontWeight: 700 }}>Vitaj späť, Bruno!</span>
          <span style={{ color: W98.grayText, marginLeft: 8 }}>
            {format(new Date(), "EEEE, d. MMMM yyyy", { locale: sk })}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8, marginBottom: 12 }}>
        <StatBox
          icon={<MessageSquare size={16} />}
          label="Nové správy"
          value={unread}
          sub={`${messages.length} celkom`}
          color="#000080"
          onClick={() => setActivePage("messages")}
        />
        <StatBox
          icon={<FolderKanban size={16} />}
          label="Projekty"
          value={projects}
          sub="v portfóliu"
          color="#008000"
          onClick={() => setActivePage("projects")}
        />
        <StatBox
          icon={<TrendingUp size={16} />}
          label="AI koncepty"
          value={drafts}
          sub="uložených"
          color="#800080"
          onClick={() => setActivePage("marketing")}
        />
        <StatBox
          icon={<Cpu size={16} />}
          label="AI Agenti"
          value={7}
          sub="aktívnych"
          color="#008080"
          onClick={() => setActivePage("agents")}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 8 }}>
        {/* Recent messages */}
        <Win98Panel label="Posledné správy">
          <div style={{ boxShadow: sunken, background: W98.fieldBg }}>
            {/* Header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "8px 1fr 1fr auto",
              gap: 8,
              padding: "4px 8px",
              borderBottom: "1px solid #c0c0c0",
              background: W98.bg,
              fontWeight: 700,
              fontSize: "11px",
            }}>
              <span></span>
              <span>Meno</span>
              <span>Email</span>
              <span>Dátum</span>
            </div>
            {recentMessages.length === 0 ? (
              <p style={{ padding: 16, textAlign: "center", color: W98.grayText }}>Žiadne správy zatiaľ.</p>
            ) : (
              recentMessages.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setActivePage("messages")}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "8px 1fr 1fr auto",
                    gap: 8,
                    padding: "3px 8px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: "11px",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#000080"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = W98.black; }}
                >
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%", marginTop: 3,
                    background: m.status === "new" ? "#ff0000" : "#808080",
                    display: "inline-block",
                  }} />
                  <span style={{ fontWeight: m.status === "new" ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.name}
                  </span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.email}
                  </span>
                  <span style={{ fontSize: "10px" }}>
                    {format(new Date(m.created_at), "d.M.yy", { locale: sk })}
                  </span>
                </div>
              ))
            )}
          </div>
          <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
            <Win98Button small onClick={() => setActivePage("messages")}>
              Zobraziť všetky →
            </Win98Button>
          </div>
        </Win98Panel>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Quick actions */}
          <Win98Panel label="Rýchle akcie">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Win98Button onClick={() => setActivePage("projects")} style={{ width: "100%", textAlign: "left" }}>
                📁 Nový projekt
              </Win98Button>
              <Win98Button onClick={() => setActivePage("marketing")} style={{ width: "100%", textAlign: "left" }}>
                🤖 Generovať obsah AI
              </Win98Button>
              <Win98Button onClick={() => setActivePage("agents")} style={{ width: "100%", textAlign: "left" }}>
                🧠 AI Agenti
              </Win98Button>
              <Win98Button onClick={() => setActivePage("analytics")} style={{ width: "100%", textAlign: "left" }}>
                📊 Analytika
              </Win98Button>
              <Win98Button onClick={() => window.open("/", "_blank")} style={{ width: "100%", textAlign: "left" }}>
                🌐 Otvoriť web
              </Win98Button>
            </div>
          </Win98Panel>

          {/* System status */}
          <Win98Panel label="Stav systému">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { label: "Supabase DB", ok: true },
                { label: "Auth služba", ok: true },
                { label: "Storage", ok: true },
                { label: "AI Proxy", ok: true },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px" }}>
                  <span>{s.label}</span>
                  <span style={{ color: s.ok ? "#008000" : "#ff0000", fontWeight: 700 }}>
                    {s.ok ? "● Online" : "● Offline"}
                  </span>
                </div>
              ))}
            </div>
          </Win98Panel>

          {/* System info */}
          <Win98Panel label="Systémové informácie">
            <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: "11px" }}>
              <div><b>OS:</b> COK Tech 98 SE</div>
              <div><b>Verzia:</b> 2.0.4.2026</div>
              <div><b>Procesor:</b> CokChip AI-X1</div>
              <div><b>RAM:</b> 640 KB (stačí všetkým)</div>
              <div><b>Disk:</b> Supabase Cloud ∞</div>
            </div>
          </Win98Panel>
        </div>
      </div>
    </div>
  );
};

/* ── Stat box component ── */
const StatBox = ({
  icon, label, value, sub, color, onClick,
}: {
  icon: ReactNode; label: string; value: number; sub: string; color: string; onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    style={{
      boxShadow: raised,
      background: W98.bg,
      padding: "10px 12px",
      cursor: onClick ? "pointer" : "default",
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}
  >
    <div style={{
      width: 36, height: 36, background: color + "20",
      display: "flex", alignItems: "center", justifyContent: "center",
      border: `1px solid ${color}40`,
    }}>
      <span style={{ color }}>{icon}</span>
    </div>
    <div>
      <div style={{ fontSize: "20px", fontWeight: 700, lineHeight: 1, fontFamily: W98.font }}>{value}</div>
      <div style={{ fontSize: "11px", color: W98.grayText }}>{label}</div>
      <div style={{ fontSize: "10px", color: "#a0a0a0" }}>{sub}</div>
    </div>
  </div>
);
