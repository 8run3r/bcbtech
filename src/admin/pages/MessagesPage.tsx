import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Trash2, CheckCircle, ExternalLink, Search, Bot, Copy, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { callAI } from "@/lib/ai-client";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { toast } from "sonner";
import {
  W98, raised, sunken,
  Win98Button, Win98Panel, Win98Input, Win98Window, Win98Progress,
} from "../win98";

type FilterTab = "all" | "new" | "done" | "read";

/** AI Reply helper */
const AIReplyHelper = ({ item }: { item: any }) => {
  const [draft, setDraft] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const generate = async () => {
    setGenerating(true); setOpen(true); setDraft("");
    try {
      const context = [
        item.package_category && `Zaujíma sa o: ${item.package_category === "automation" ? "AI Automatizáciu" : "Web/Digital"}`,
        item.package_name && `Balíček: ${item.package_name}`,
        item.message && `Správa: "${item.message}"`,
      ].filter(Boolean).join("\n");

      const data = await callAI({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        system: `Si Bruno Cok, zakladateľ COK Tech — slovenská tech firma (web development + AI automatizácia).
Píš profesionálne, priamo, bez fráz. Odpovede v slovenčine. Stručné, max 5 viet.
Vždy začni oslovením menom. Na konci pozvi na krátky hovor alebo ďalší krok.`,
        messages: [{ role: "user", content: `Napíš stručnú email odpoveď pre potenciálneho klienta:\nMeno: ${item.name}\nEmail: ${item.email}\n${context}\n\nNapíš len telo emailu, bez predmetu.` }],
      });
      setDraft(data?.content?.[0]?.text || "");
    } catch (e: any) {
      toast.error("Chyba AI: " + e.message);
      setOpen(false);
    } finally { setGenerating(false); }
  };

  const copy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    toast.success("Skopírované!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ marginTop: 8 }}>
      <Win98Button small onClick={open ? () => setOpen(false) : generate} disabled={generating}>
        {generating ? "⏳ AI generuje..." : open ? "Skryť návrh" : "🤖 Navrhnúť odpoveď (AI)"}
      </Win98Button>

      {open && !generating && draft && (
        <div style={{ marginTop: 8 }}>
          <Win98Panel label="AI návrh odpovede">
            <div style={{ boxShadow: sunken, background: W98.fieldBg, padding: 8, fontSize: "12px", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
              {draft}
            </div>
            <div style={{ marginTop: 6, display: "flex", gap: 4, justifyContent: "flex-end" }}>
              <Win98Button small onClick={copy}>{copied ? "✅ OK" : "📋 Kopírovať"}</Win98Button>
            </div>
            <div style={{ fontSize: "10px", color: W98.grayText, marginTop: 4 }}>AI návrh — skontroluj pred odoslaním</div>
          </Win98Panel>
        </div>
      )}
    </div>
  );
};

export const MessagesPage = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [msgs, res] = await Promise.all([
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      supabase.from("reservations").select("*").order("created_at", { ascending: false }),
    ]);
    setMessages(msgs.data || []);
    setReservations(res.data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const allLeads = [
    ...messages.map((m) => ({ ...m, _type: "message" })),
    ...reservations.map((r) => ({ ...r, _type: "reservation" })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filtered = allLeads.filter((l) => {
    const matchSearch = !search ||
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "all") return true;
    if (filter === "new") return l.status === "new";
    if (filter === "done") return l.status === "done" || l.status === "completed";
    if (filter === "read") return l.status === "read" || l.status === "contacted";
    return true;
  });

  const markRead = async (item: any) => {
    if (item._type === "message") await supabase.from("contact_messages").update({ status: "read" }).eq("id", item.id);
    else await supabase.from("reservations").update({ status: "contacted" }).eq("id", item.id);
    toast.success("Označené ako prečítané");
    loadData();
    if (selected?.id === item.id) setSelected({ ...item, status: item._type === "message" ? "read" : "contacted" });
  };

  const markDone = async (item: any) => {
    if (item._type === "message") await supabase.from("contact_messages").update({ status: "done" }).eq("id", item.id);
    else await supabase.from("reservations").update({ status: "completed" }).eq("id", item.id);
    toast.success("Označené ako vybavené");
    loadData();
    if (selected?.id === item.id) setSelected({ ...item, status: "done" });
  };

  const deleteItem = async (item: any) => {
    if (!confirm("Naozaj chceš zmazať túto správu?")) return;
    if (item._type === "message") await supabase.from("contact_messages").delete().eq("id", item.id);
    else await supabase.from("reservations").delete().eq("id", item.id);
    toast.success("Správa zmazaná");
    if (selected?.id === item.id) setSelected(null);
    loadData();
  };

  const unreadCount = allLeads.filter((l) => l.status === "new").length;

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: `Všetky (${allLeads.length})` },
    { id: "new", label: `Nové (${unreadCount})` },
    { id: "read", label: "Prečítané" },
    { id: "done", label: "Vybavené" },
  ];

  return (
    <div style={{ fontFamily: W98.font, fontSize: "12px", color: W98.black, display: "flex", gap: 8, height: "calc(100vh - 12rem)" }}>
      {/* ── Message list ── */}
      <div style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", boxShadow: raised, background: W98.bg }}>
        {/* Search */}
        <div style={{ padding: "4px 6px", borderBottom: "1px solid #808080" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Search size={12} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hľadať..."
              style={{
                fontFamily: W98.font, fontSize: "11px", flex: 1,
                boxShadow: sunken, background: W98.fieldBg, border: "none",
                padding: "2px 4px", outline: "none",
              }}
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #808080" }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              style={{
                fontFamily: W98.font, fontSize: "10px", flex: 1,
                padding: "4px 2px", border: "none", cursor: "pointer",
                background: filter === t.id ? "#000080" : W98.bg,
                color: filter === t.id ? "#fff" : W98.black,
                fontWeight: filter === t.id ? 700 : 400,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflow: "auto", boxShadow: sunken, background: W98.fieldBg }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: "center" }}>
              <Win98Progress value={50} style={{ width: 150, margin: "0 auto" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: W98.grayText }}>
              <Mail size={24} style={{ margin: "0 auto 8px", display: "block" }} />
              Žiadne správy.
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={`${item._type}-${item.id}`}
                onClick={() => { setSelected(item); if (item.status === "new") markRead(item); }}
                style={{
                  fontFamily: W98.font, fontSize: "11px", width: "100%",
                  textAlign: "left", padding: "4px 8px", border: "none", cursor: "pointer",
                  borderBottom: "1px solid #f0f0f0",
                  background: selected?.id === item.id ? "#000080" : "transparent",
                  color: selected?.id === item.id ? "#fff" : W98.black,
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                  background: item.status === "new" ? "#ff0000" : "#808080",
                }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontWeight: item.status === "new" ? 700 : 400,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {item.name}
                  </div>
                  <div style={{
                    fontSize: "10px",
                    color: selected?.id === item.id ? "#c0c0ff" : W98.grayText,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {item.email}
                  </div>
                </div>
                <span style={{ fontSize: "9px", color: selected?.id === item.id ? "#c0c0c0" : W98.grayText, flexShrink: 0 }}>
                  {format(new Date(item.created_at), "d.M.", { locale: sk })}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Detail ── */}
      <div className="hidden lg:flex" style={{ flex: 1, minWidth: 0 }}>
        {selected ? (
          <Win98Window
            title={`Správa od ${selected.name}`}
            icon={<Mail size={14} />}
            onClose={() => setSelected(null)}
            style={{ flex: 1 }}
            statusBar={
              <div style={{ fontFamily: W98.font, fontSize: "11px", color: W98.black }}>
                Prijaté: {format(new Date(selected.created_at), "d. MMMM yyyy 'o' HH:mm", { locale: sk })}
              </div>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Header info */}
              <div style={{
                boxShadow: raised, background: W98.bg, padding: "8px 10px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px" }}>{selected.name}</div>
                  <div style={{ color: W98.grayText }}>{selected.email}</div>
                  {selected.phone && <div style={{ color: W98.grayText, fontSize: "11px" }}>{selected.phone}</div>}
                </div>
                <div style={{
                  padding: "2px 8px", fontSize: "10px", fontWeight: 700,
                  background: selected.status === "new" ? "#ff000020" : selected.status === "done" || selected.status === "completed" ? "#00800020" : W98.bg,
                  color: selected.status === "new" ? "#ff0000" : selected.status === "done" || selected.status === "completed" ? "#008000" : W98.grayText,
                  boxShadow: raised,
                }}>
                  {selected.status === "new" ? "NOVÁ" : selected.status === "read" || selected.status === "contacted" ? "PREČÍTANÁ" : "VYBAVENÁ"}
                </div>
              </div>

              {/* Package info */}
              {(selected.package_category || selected.package_name) && (
                <div style={{ display: "flex", gap: 4 }}>
                  {selected.package_category && (
                    <span style={{ boxShadow: raised, background: W98.bg, padding: "2px 8px", fontSize: "11px" }}>
                      {selected.package_category === "automation" ? "⚡ Automatizácia" : "🌐 Web"}
                    </span>
                  )}
                  {selected.package_name && (
                    <span style={{ boxShadow: raised, background: W98.bg, padding: "2px 8px", fontSize: "11px" }}>
                      {selected.package_name}
                    </span>
                  )}
                </div>
              )}

              {/* Message body */}
              {selected.message && (
                <Win98Panel label="Správa">
                  <div style={{ boxShadow: sunken, background: W98.fieldBg, padding: 8, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                    {selected.message}
                  </div>
                </Win98Panel>
              )}

              {/* AI Reply */}
              <AIReplyHelper item={selected} />

              {/* Actions */}
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                {selected.status !== "done" && selected.status !== "completed" && (
                  <Win98Button onClick={() => markDone(selected)}>✅ Vybavené</Win98Button>
                )}
                <Win98Button onClick={() => window.open(`mailto:${selected.email}`)}>📧 Odpovedať emailom</Win98Button>
                <Win98Button onClick={() => deleteItem(selected)} style={{ color: "#ff0000" }}>🗑️ Odstrániť</Win98Button>
              </div>
            </div>
          </Win98Window>
        ) : (
          <div style={{
            flex: 1, boxShadow: raised, background: W98.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ textAlign: "center", color: W98.grayText }}>
              <Mail size={32} style={{ margin: "0 auto 8px", display: "block" }} />
              <p>Vyber správu zo zoznamu</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
