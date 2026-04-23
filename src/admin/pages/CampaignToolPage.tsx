import { useState, useEffect, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus, Trash2, Copy, ExternalLink, BarChart2,
  Eye, Pause, Play, Image, Video, MousePointerClick,
  Smartphone, Monitor, ArrowLeft,
} from "lucide-react";
import {
  W98, raised,
  Win98Button, Win98Panel, Win98Input, Win98Textarea, Win98Select, Win98Window,
} from "../win98";

/* ═══════════════════════════════════════
   Types
   ═══════════════════════════════════════ */

interface Campaign {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  media_url: string | null;
  media_type: "image" | "video";
  cta_text: string;
  cta_url: string | null;
  bg_color: string;
  accent_color: string;
  status: "active" | "paused" | "archived";
  created_at: string;
  click_count?: number;
}

interface ClickRow {
  id: string;
  clicked_at: string;
  ip: string | null;
  user_agent: string | null;
  referrer: string | null;
  device: string | null;
}

interface ClickStats {
  total: number;
  today: number;
  devices: { mobile: number; desktop: number; other: number };
  topReferrers: { referrer: string; count: number }[];
  last7days: { date: string; count: number }[];
}

/* ═══════════════════════════════════════
   Helpers
   ═══════════════════════════════════════ */

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)
    + "-" + Math.random().toString(36).slice(2, 6);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "práve teraz";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function getCampaignUrl(slug: string): string {
  return `${window.location.origin}/c/${slug}`;
}

/* ═══════════════════════════════════════
   Stats computation
   ═══════════════════════════════════════ */

function computeStats(clicks: ClickRow[]): ClickStats {
  const todayStr = new Date().toISOString().slice(0, 10);
  const today = clicks.filter(c => c.clicked_at.slice(0, 10) === todayStr).length;

  const devices = { mobile: 0, desktop: 0, other: 0 };
  clicks.forEach(c => {
    if (c.device === "mobile") devices.mobile++;
    else if (c.device === "desktop") devices.desktop++;
    else devices.other++;
  });

  const refMap: Record<string, number> = {};
  clicks.forEach(c => {
    const r = c.referrer || "priamy";
    refMap[r] = (refMap[r] || 0) + 1;
  });
  const topReferrers = Object.entries(refMap)
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const last7days: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    last7days.push({ date: ds, count: clicks.filter(c => c.clicked_at.slice(0, 10) === ds).length });
  }

  return { total: clicks.length, today, devices, topReferrers, last7days };
}

/* ═══════════════════════════════════════
   Main Component
   ═══════════════════════════════════════ */

export const CampaignToolPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "create" | "stats">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [clicks, setClicks] = useState<ClickRow[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    media_url: "",
    media_type: "image" as "image" | "video",
    cta_text: "Zistiť viac",
    cta_url: "",
    bg_color: "#000000",
    accent_color: "#7B61FF",
  });

  /* ── Load campaigns ── */
  const loadCampaigns = async () => {
    setLoading(true);
    const { data: camps } = await supabase
      .from("marketing_campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (camps && camps.length > 0) {
      // Get click counts
      const { data: clickData } = await supabase
        .from("campaign_clicks")
        .select("campaign_id");

      const countMap: Record<string, number> = {};
      (clickData || []).forEach((c: { campaign_id: string }) => {
        countMap[c.campaign_id] = (countMap[c.campaign_id] || 0) + 1;
      });

      setCampaigns(
        (camps as Campaign[]).map(c => ({ ...c, click_count: countMap[c.id] || 0 }))
      );
    } else {
      setCampaigns([]);
    }
    setLoading(false);
  };

  useEffect(() => { loadCampaigns(); }, []);

  /* ── Create campaign ── */
  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Názov je povinný"); return; }

    const slug = generateSlug(form.title);
    const { error } = await supabase.from("marketing_campaigns").insert({
      slug,
      title: form.title.trim(),
      description: form.description.trim() || null,
      media_url: form.media_url.trim() || null,
      media_type: form.media_type,
      cta_text: form.cta_text.trim() || "Zistiť viac",
      cta_url: form.cta_url.trim() || null,
      bg_color: form.bg_color,
      accent_color: form.accent_color,
    });

    if (error) {
      toast.error(`Chyba: ${error.message}`);
      return;
    }

    toast.success("Kampaň vytvorená!");
    setForm({ title: "", description: "", media_url: "", media_type: "image", cta_text: "Zistiť viac", cta_url: "", bg_color: "#000000", accent_color: "#7B61FF" });
    setView("list");
    loadCampaigns();
  };

  /* ── Toggle status ── */
  const toggleStatus = async (id: string, current: string) => {
    const next = current === "active" ? "paused" : "active";
    await supabase.from("marketing_campaigns").update({ status: next }).eq("id", id);
    toast.success(next === "active" ? "Kampaň aktivovaná" : "Kampaň pozastavená");
    loadCampaigns();
  };

  /* ── Delete ── */
  const deleteCampaign = async (id: string) => {
    if (!confirm("Naozaj vymazať kampaň a všetky kliky?")) return;
    await supabase.from("marketing_campaigns").delete().eq("id", id);
    toast.success("Kampaň vymazaná");
    loadCampaigns();
  };

  /* ── Load stats ── */
  const openStats = async (id: string) => {
    setSelectedId(id);
    setView("stats");
    setStatsLoading(true);
    const { data } = await supabase
      .from("campaign_clicks")
      .select("*")
      .eq("campaign_id", id)
      .order("clicked_at", { ascending: false })
      .limit(500);
    setClicks((data || []) as ClickRow[]);
    setStatsLoading(false);
  };

  /* ── Copy link ── */
  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(getCampaignUrl(slug));
    toast.success("Link skopírovaný!");
  };

  const labelStyle = { fontFamily: W98.font, fontSize: "12px", color: W98.black, display: "block" as const, marginBottom: 2, fontWeight: 600 };

  const selectedCampaign = campaigns.find(c => c.id === selectedId);
  const stats = view === "stats" ? computeStats(clicks) : null;

  /* ═══════════════════════════════════════
     RENDER
     ═══════════════════════════════════════ */

  return (
    <div style={{ fontFamily: W98.font, fontSize: "12px", color: W98.black }}>
      {/* Header */}
      <div style={{
        boxShadow: raised,
        background: W98.bg,
        padding: "8px 12px",
        marginBottom: 12,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <span style={{ fontSize: "20px" }}>📸</span>
        <span style={{ fontWeight: 700 }}>Campaign Tool — Marketing & Click Tracking</span>
        <span style={{ marginLeft: "auto", fontSize: "11px", color: W98.grayText }}>
          {campaigns.length} kampaní
        </span>
      </div>

      {/* ═══ LIST VIEW ═══ */}
      {view === "list" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <Win98Button onClick={() => setView("create")} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Plus size={12} /> Nová kampaň
            </Win98Button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: W98.grayText }}>Načítavam...</div>
          ) : campaigns.length === 0 ? (
            <Win98Panel label="Žiadne kampane">
              <div style={{ textAlign: "center", padding: 20, color: W98.grayText }}>
                Zatiaľ nemáš žiadne kampane. Klikni "Nová kampaň" a začni.
              </div>
            </Win98Panel>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {campaigns.map(c => (
                <div
                  key={c.id}
                  style={{
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,0.12)",
                    borderRadius: 4,
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    borderLeft: `3px solid ${c.status === "active" ? "#00875a" : c.status === "paused" ? "#d4a017" : "#999"}`,
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 4, flexShrink: 0,
                    background: c.media_url ? `url(${c.media_url}) center/cover` : c.bg_color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid rgba(0,0,0,0.1)",
                  }}>
                    {!c.media_url && (c.media_type === "video" ? <Video size={16} color="#999" /> : <Image size={16} color="#999" />)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: "10px", color: W98.grayText, display: "flex", gap: 8, marginTop: 2 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <MousePointerClick size={10} /> {c.click_count || 0} klikov
                      </span>
                      <span>/{c.slug}</span>
                      <span>{timeAgo(c.created_at)}</span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span style={{
                    fontSize: "9px", fontWeight: 700,
                    padding: "2px 8px", borderRadius: 10,
                    background: c.status === "active" ? "rgba(0,135,90,0.1)" : c.status === "paused" ? "rgba(212,160,23,0.1)" : "rgba(0,0,0,0.05)",
                    color: c.status === "active" ? "#00875a" : c.status === "paused" ? "#d4a017" : "#999",
                    textTransform: "uppercase", letterSpacing: "0.05em",
                  }}>
                    {c.status === "active" ? "LIVE" : c.status === "paused" ? "PAUSED" : "ARCHÍV"}
                  </span>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                    <Win98Button small onClick={() => openStats(c.id)} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <BarChart2 size={11} /> Stats
                    </Win98Button>
                    <Win98Button small onClick={() => copyLink(c.slug)}>
                      <Copy size={11} />
                    </Win98Button>
                    <Win98Button small onClick={() => window.open(getCampaignUrl(c.slug), "_blank")}>
                      <ExternalLink size={11} />
                    </Win98Button>
                    <Win98Button small onClick={() => toggleStatus(c.id, c.status)}>
                      {c.status === "active" ? <Pause size={11} /> : <Play size={11} />}
                    </Win98Button>
                    <Win98Button small onClick={() => deleteCampaign(c.id)} style={{ color: "#ff2244" }}>
                      <Trash2 size={11} />
                    </Win98Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══ CREATE VIEW ═══ */}
      {view === "create" && (
        <>
          <Win98Button onClick={() => setView("list")} small style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
            <ArrowLeft size={11} /> Späť
          </Win98Button>

          <form onSubmit={handleCreate}>
            <Win98Panel label="Nová kampaň" style={{ marginBottom: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Názov kampane *</label>
                  <Win98Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Napr. Jarná akcia -20%" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Popis</label>
                  <Win98Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Krátky popis kampane..." rows={2} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Média URL (foto alebo video)</label>
                  <Win98Input value={form.media_url} onChange={e => setForm(f => ({ ...f, media_url: e.target.value }))} placeholder="https://... .jpg / .mp4 / YouTube embed" />
                </div>
                <div>
                  <label style={labelStyle}>Typ média</label>
                  <Win98Select
                    value={form.media_type}
                    onChange={e => setForm(f => ({ ...f, media_type: e.target.value as "image" | "video" }))}
                    options={[{ value: "image", label: "Fotka" }, { value: "video", label: "Video" }]}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>CTA text</label>
                  <Win98Input value={form.cta_text} onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))} placeholder="Napr. Objednať teraz" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>CTA link (kam presmeruje klik)</label>
                  <Win98Input value={form.cta_url} onChange={e => setForm(f => ({ ...f, cta_url: e.target.value }))} placeholder="https://... cieľová stránka" />
                </div>
                <div>
                  <label style={labelStyle}>Farba pozadia</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input type="color" value={form.bg_color} onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))} style={{ width: 28, height: 24, border: "1px solid rgba(0,0,0,0.2)", borderRadius: 2, cursor: "pointer" }} />
                    <Win98Input value={form.bg_color} onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))} style={{ width: 80 }} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Accent farba</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input type="color" value={form.accent_color} onChange={e => setForm(f => ({ ...f, accent_color: e.target.value }))} style={{ width: 28, height: 24, border: "1px solid rgba(0,0,0,0.2)", borderRadius: 2, cursor: "pointer" }} />
                    <Win98Input value={form.accent_color} onChange={e => setForm(f => ({ ...f, accent_color: e.target.value }))} style={{ width: 80 }} />
                  </div>
                </div>
              </div>
            </Win98Panel>

            {/* Preview */}
            <Win98Panel label="Náhľad" style={{ marginBottom: 12 }}>
              <div style={{
                background: form.bg_color,
                borderRadius: 6,
                padding: 20,
                textAlign: "center",
                minHeight: 180,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}>
                {form.media_url && form.media_type === "image" && (
                  <img src={form.media_url} alt="preview" style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 4, objectFit: "cover" }} />
                )}
                {form.media_url && form.media_type === "video" && (
                  <div style={{ width: 200, height: 112, background: "#111", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Video size={24} color="#666" />
                  </div>
                )}
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", fontWeight: 700, color: "#fff" }}>
                  {form.title || "Názov kampane"}
                </div>
                {form.description && (
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.6)", maxWidth: 280 }}>
                    {form.description}
                  </div>
                )}
                <div style={{
                  padding: "8px 24px",
                  background: form.accent_color,
                  color: "#fff",
                  borderRadius: 6,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                }}>
                  {form.cta_text || "Zistiť viac"}
                </div>
              </div>
            </Win98Panel>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
              <Win98Button onClick={() => setView("list")}>Zrušiť</Win98Button>
              <Win98Button type="submit" style={{ background: "linear-gradient(180deg, #d0e8ff 0%, #a0c8f0 100%)", borderColor: "#0078d7" }}>
                🚀 Vytvoriť kampaň
              </Win98Button>
            </div>
          </form>
        </>
      )}

      {/* ═══ STATS VIEW ═══ */}
      {view === "stats" && selectedCampaign && (
        <>
          <Win98Button onClick={() => setView("list")} small style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
            <ArrowLeft size={11} /> Späť
          </Win98Button>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: "18px" }}>📊</span>
            <span style={{ fontWeight: 700, fontSize: "14px" }}>{selectedCampaign.title}</span>
            <Win98Button small onClick={() => copyLink(selectedCampaign.slug)} style={{ marginLeft: "auto" }}>
              <Copy size={11} /> Link
            </Win98Button>
            <Win98Button small onClick={() => window.open(getCampaignUrl(selectedCampaign.slug), "_blank")}>
              <ExternalLink size={11} />
            </Win98Button>
          </div>

          {statsLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: W98.grayText }}>Načítavam štatistiky...</div>
          ) : stats && (
            <>
              {/* Overview cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
                {[
                  { label: "Celkom klikov", value: stats.total, icon: <MousePointerClick size={14} /> },
                  { label: "Dnes", value: stats.today, icon: <Eye size={14} /> },
                  { label: "Mobile", value: stats.devices.mobile, icon: <Smartphone size={14} /> },
                  { label: "Desktop", value: stats.devices.desktop, icon: <Monitor size={14} /> },
                ].map(card => (
                  <div key={card.label} style={{
                    background: "#fff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 4,
                    padding: 10, textAlign: "center",
                  }}>
                    <div style={{ color: W98.grayText, marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      {card.icon}
                      <span style={{ fontSize: "10px" }}>{card.label}</span>
                    </div>
                    <div style={{ fontSize: "22px", fontWeight: 700, color: W98.highlight }}>{card.value}</div>
                  </div>
                ))}
              </div>

              {/* Last 7 days chart */}
              <Win98Panel label="Posledných 7 dní" style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
                  {stats.last7days.map(day => {
                    const maxCount = Math.max(1, ...stats.last7days.map(d => d.count));
                    const height = Math.max(2, (day.count / maxCount) * 70);
                    return (
                      <div key={day.date} style={{ flex: 1, textAlign: "center" }}>
                        <div style={{
                          height,
                          background: "linear-gradient(180deg, #5ab0f0 0%, #0078d7 100%)",
                          borderRadius: "2px 2px 0 0",
                          marginBottom: 4,
                          position: "relative",
                        }}>
                          {day.count > 0 && (
                            <span style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", fontSize: "9px", fontWeight: 700, color: W98.black }}>
                              {day.count}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: "8px", color: W98.grayText }}>
                          {day.date.slice(8)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Win98Panel>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {/* Top referrers */}
                <Win98Panel label="Top referrery">
                  {stats.topReferrers.length === 0 ? (
                    <span style={{ color: W98.grayText, fontSize: "11px" }}>Žiadne dáta</span>
                  ) : stats.topReferrers.map(r => (
                    <div key={r.referrer} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid rgba(0,0,0,0.05)", fontSize: "11px" }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 150 }}>{r.referrer}</span>
                      <span style={{ fontWeight: 700 }}>{r.count}</span>
                    </div>
                  ))}
                </Win98Panel>

                {/* Recent clicks */}
                <Win98Panel label="Posledné kliky">
                  {clicks.slice(0, 8).map(c => (
                    <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid rgba(0,0,0,0.05)", fontSize: "10px", color: W98.grayText }}>
                      <span>{c.device || "?"} · {c.ip?.slice(0, 12) || "—"}</span>
                      <span>{timeAgo(c.clicked_at)}</span>
                    </div>
                  ))}
                </Win98Panel>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
