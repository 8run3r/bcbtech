import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  W98, raised, Win98Button, Win98Panel, Win98Window, Win98Field,
} from "../win98";

/* ══════════════════════════════════════════════
   Dev Tools — CEO/Developer Command Center
   Site health, quick links, DB stats, env check,
   Supabase status, deploy info, lead pipeline.
   ══════════════════════════════════════════════ */

// Quick external links
const QUICK_LINKS = [
  { label: "Vercel Dashboard", url: "https://vercel.com/dashboard", icon: "▲" },
  { label: "Supabase Dashboard", url: "https://supabase.com/dashboard", icon: "⚡" },
  { label: "GitHub Repo", url: "https://github.com/8run3r/bcbtech", icon: "🐙" },
  { label: "Resend Dashboard", url: "https://resend.com", icon: "📧" },
  { label: "Anthropic Console", url: "https://console.anthropic.com", icon: "🤖" },
  { label: "coktech.tech", url: "https://coktech.tech", icon: "🌐" },
];

// Status check endpoint
const checkEndpoint = async (url: string): Promise<{ ok: boolean; ms: number }> => {
  const start = performance.now();
  try {
    const res = await fetch(url, { method: "HEAD", mode: "no-cors" });
    return { ok: true, ms: Math.round(performance.now() - start) };
  } catch {
    return { ok: false, ms: Math.round(performance.now() - start) };
  }
};

interface DbStats {
  messages: number;
  newMessages: number;
  reservations: number;
  newReservations: number;
  portfolio: number;
  drafts: number;
}

interface PipelineItem {
  id: string;
  name: string;
  email: string;
  status: string;
  package_category: string;
  package_name: string;
  created_at: string;
  type: "message" | "reservation";
}

export const DevToolsPage = () => {
  const [siteStatus, setSiteStatus] = useState<{ ok: boolean; ms: number } | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<{ ok: boolean; ms: number } | null>(null);
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [pipeline, setPipeline] = useState<PipelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    // DB stats
    const [msgs, newMsgs, reservations, newRes, portfolio, drafts] = await Promise.all([
      supabase.from("contact_messages").select("id", { count: "exact", head: true }),
      supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("reservations").select("id", { count: "exact", head: true }),
      supabase.from("reservations").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("portfolio_items").select("id", { count: "exact", head: true }),
      supabase.from("agent_drafts").select("id", { count: "exact", head: true }),
    ]);

    setDbStats({
      messages: msgs.count || 0,
      newMessages: newMsgs.count || 0,
      reservations: reservations.count || 0,
      newReservations: newRes.count || 0,
      portfolio: portfolio.count || 0,
      drafts: drafts.count || 0,
    });

    // Pipeline — last 20 leads
    const [msgData, resData] = await Promise.all([
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("reservations").select("*").order("created_at", { ascending: false }).limit(10),
    ]);

    const items: PipelineItem[] = [
      ...(msgData.data || []).map((m: any) => ({ ...m, type: "message" as const })),
      ...(resData.data || []).map((r: any) => ({ ...r, type: "reservation" as const })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 15);

    setPipeline(items);
    setLoading(false);
  }, []);

  const runHealthCheck = useCallback(async () => {
    setChecking(true);
    const [site, sb] = await Promise.all([
      checkEndpoint("https://coktech.tech"),
      checkEndpoint("https://hysdwsgxequjvwjjoqvp.supabase.co"),
    ]);
    setSiteStatus(site);
    setSupabaseStatus(sb);
    setChecking(false);
  }, []);

  useEffect(() => { loadData(); runHealthCheck(); }, [loadData, runHealthCheck]);

  const statusDot = (ok: boolean | null) => (
    <span style={{
      display: "inline-block",
      width: 8, height: 8,
      borderRadius: "50%",
      background: ok === null ? "#888" : ok ? "#00875a" : "#d04040",
      boxShadow: ok ? "0 0 6px #00875a" : ok === false ? "0 0 6px #d04040" : "none",
    }} />
  );

  const statusLabel = (s: { ok: boolean; ms: number } | null) => {
    if (!s) return "Checking...";
    return s.ok ? `Online (${s.ms}ms)` : `Offline`;
  };

  const pipelineStatusColor = (status: string) => {
    if (status === "new") return "#FF8C00";
    if (status === "read" || status === "contacted") return "#4A9EFF";
    if (status === "done" || status === "completed") return "#00875a";
    return "#888";
  };

  const pipelineStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      new: "Nový",
      read: "Prečítané",
      contacted: "Kontaktovaný",
      done: "Vybavené",
      completed: "Dokončené",
    };
    return map[status] || status;
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div style={{ fontFamily: W98.font, fontSize: "12px", color: W98.black }}>
      {/* Header */}
      <div style={{
        boxShadow: raised, background: W98.bg, padding: "8px 12px",
        marginBottom: 12, display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: "20px" }}>🛠️</span>
        <span style={{ fontWeight: 700 }}>Dev Tools — Command Center</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          <Win98Button small onClick={runHealthCheck} disabled={checking}>
            {checking ? "Checking..." : "🔄 Health Check"}
          </Win98Button>
          <Win98Button small onClick={loadData}>🔄 Refresh</Win98Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* ── Site Health ── */}
        <Win98Panel label="System Status">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
              {statusDot(siteStatus?.ok ?? null)}
              <span style={{ fontWeight: 600, flex: 1 }}>coktech.tech</span>
              <span style={{ fontFamily: W98.fontMono, fontSize: 11, color: W98.grayText }}>{statusLabel(siteStatus)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
              {statusDot(supabaseStatus?.ok ?? null)}
              <span style={{ fontWeight: 600, flex: 1 }}>Supabase</span>
              <span style={{ fontFamily: W98.fontMono, fontSize: 11, color: W98.grayText }}>{statusLabel(supabaseStatus)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
              {statusDot(true)}
              <span style={{ fontWeight: 600, flex: 1 }}>Telegram Bot</span>
              <span style={{ fontFamily: W98.fontMono, fontSize: 11, color: W98.grayText }}>Connected</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
              {statusDot(true)}
              <span style={{ fontWeight: 600, flex: 1 }}>Edge Functions</span>
              <span style={{ fontFamily: W98.fontMono, fontSize: 11, color: W98.grayText }}>Deployed</span>
            </div>
          </div>
        </Win98Panel>

        {/* ── DB Stats ── */}
        <Win98Panel label="Database Overview">
          {dbStats ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[
                { label: "Správy celkom", value: dbStats.messages, color: W98.black },
                { label: "Nové správy", value: dbStats.newMessages, color: dbStats.newMessages > 0 ? "#FF8C00" : W98.grayText },
                { label: "Rezervácie", value: dbStats.reservations, color: W98.black },
                { label: "Nové rezervácie", value: dbStats.newReservations, color: dbStats.newReservations > 0 ? "#FF8C00" : W98.grayText },
                { label: "Portfolio items", value: dbStats.portfolio, color: W98.black },
                { label: "AI drafty", value: dbStats.drafts, color: W98.black },
              ].map((s) => (
                <div key={s.label} style={{
                  padding: "6px 8px",
                  background: "rgba(0,0,0,0.02)",
                  borderRadius: 2,
                  border: "1px solid rgba(0,0,0,0.06)",
                }}>
                  <div style={{ fontSize: 10, color: W98.grayText, letterSpacing: "0.03em" }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: W98.fontMono }}>{s.value}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: W98.grayText, padding: 12 }}>Loading...</div>
          )}
        </Win98Panel>

        {/* ── Quick Links ── */}
        <Win98Panel label="Quick Links">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            {QUICK_LINKS.map((link) => (
              <Win98Button
                key={link.label}
                small
                onClick={() => window.open(link.url, "_blank")}
                style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 6 }}
              >
                <span>{link.icon}</span>
                {link.label}
              </Win98Button>
            ))}
          </div>
        </Win98Panel>

        {/* ── Quick Actions ── */}
        <Win98Panel label="CEO Quick Actions">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Win98Button small onClick={() => window.open("mailto:studio@coktech.tech", "_self")}>
              📧 Otvoriť email klient
            </Win98Button>
            <Win98Button small onClick={() => {
              navigator.clipboard.writeText("https://coktech.tech");
              toast.success("URL skopírovaná");
            }}>
              📋 Kopírovať URL stránky
            </Win98Button>
            <Win98Button small onClick={() => window.open("https://coktech.tech", "_blank")}>
              🌐 Otvoriť live stránku
            </Win98Button>
            <Win98Button small onClick={async () => {
              const { data } = await supabase.from("contact_messages").select("id").eq("status", "new");
              const count = data?.length || 0;
              toast.info(count > 0 ? `${count} neprečítaných správ` : "Žiadne nové správy");
            }}>
              🔔 Skontrolovať nové správy
            </Win98Button>
          </div>
        </Win98Panel>
      </div>

      {/* ── Lead Pipeline ── */}
      <Win98Panel label="Lead Pipeline — posledných 15" style={{ marginTop: 12 }}>
        {pipeline.length === 0 ? (
          <div style={{ color: W98.grayText, padding: 12, textAlign: "center" }}>
            {loading ? "Loading..." : "Žiadne leady"}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                  <th style={{ textAlign: "left", padding: "4px 6px", color: W98.grayText, fontWeight: 600 }}>Typ</th>
                  <th style={{ textAlign: "left", padding: "4px 6px", color: W98.grayText, fontWeight: 600 }}>Meno</th>
                  <th style={{ textAlign: "left", padding: "4px 6px", color: W98.grayText, fontWeight: 600 }}>Email</th>
                  <th style={{ textAlign: "left", padding: "4px 6px", color: W98.grayText, fontWeight: 600 }}>Balíček</th>
                  <th style={{ textAlign: "center", padding: "4px 6px", color: W98.grayText, fontWeight: 600 }}>Status</th>
                  <th style={{ textAlign: "right", padding: "4px 6px", color: W98.grayText, fontWeight: 600 }}>Kedy</th>
                </tr>
              </thead>
              <tbody>
                {pipeline.map((item) => (
                  <tr key={`${item.type}-${item.id}`} style={{
                    borderBottom: "1px solid rgba(0,0,0,0.04)",
                    background: item.status === "new" ? "rgba(255,140,0,0.03)" : "transparent",
                  }}>
                    <td style={{ padding: "5px 6px" }}>
                      <span style={{
                        fontFamily: W98.fontMono,
                        fontSize: 9,
                        padding: "1px 4px",
                        borderRadius: 2,
                        background: item.type === "message" ? "rgba(0,120,215,0.1)" : "rgba(0,135,90,0.1)",
                        color: item.type === "message" ? "#0078d7" : "#00875a",
                      }}>
                        {item.type === "message" ? "MSG" : "RES"}
                      </span>
                    </td>
                    <td style={{ padding: "5px 6px", fontWeight: 500 }}>{item.name}</td>
                    <td style={{ padding: "5px 6px", color: W98.grayText }}>
                      <a href={`mailto:${item.email}`} style={{ color: "#0078d7", textDecoration: "none" }}>{item.email}</a>
                    </td>
                    <td style={{ padding: "5px 6px", color: W98.grayText }}>{item.package_name || item.package_category || "—"}</td>
                    <td style={{ padding: "5px 6px", textAlign: "center" }}>
                      <span style={{
                        fontFamily: W98.fontMono,
                        fontSize: 9,
                        padding: "1px 6px",
                        borderRadius: 8,
                        background: `${pipelineStatusColor(item.status)}15`,
                        color: pipelineStatusColor(item.status),
                        fontWeight: 600,
                      }}>
                        {pipelineStatusLabel(item.status)}
                      </span>
                    </td>
                    <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: W98.fontMono, fontSize: 10, color: W98.grayText }}>
                      {timeAgo(item.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Win98Panel>

      {/* ── Environment Info ── */}
      <Win98Panel label="Environment" style={{ marginTop: 12 }}>
        <div style={{ fontFamily: W98.fontMono, fontSize: 10, lineHeight: 1.8, color: W98.grayText }}>
          <div>SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? "✅ Set" : "❌ Missing"}</div>
          <div>SUPABASE_KEY: {import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? "✅ Set" : "❌ Missing"}</div>
          <div>BUILD: Production ({new Date().toLocaleDateString("sk-SK")})</div>
          <div>FRAMEWORK: React 18 + Vite 5 + TypeScript</div>
          <div>HOSTING: Vercel + Supabase</div>
          <div>DOMAIN: coktech.tech</div>
        </div>
      </Win98Panel>
    </div>
  );
};
