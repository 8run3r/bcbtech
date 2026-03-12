import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Trash2, CheckCircle, ExternalLink, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { toast } from "sonner";

type FilterTab = "all" | "new" | "done" | "read";

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
    if (item._type === "message") {
      await supabase.from("contact_messages").update({ status: "read" }).eq("id", item.id);
    } else {
      await supabase.from("reservations").update({ status: "contacted" }).eq("id", item.id);
    }
    toast.success("Označené ako prečítané");
    loadData();
    if (selected?.id === item.id) setSelected({ ...item, status: item._type === "message" ? "read" : "contacted" });
  };

  const markDone = async (item: any) => {
    if (item._type === "message") {
      await supabase.from("contact_messages").update({ status: "done" }).eq("id", item.id);
    } else {
      await supabase.from("reservations").update({ status: "completed" }).eq("id", item.id);
    }
    toast.success("Označené ako vybavené");
    loadData();
    if (selected?.id === item.id) setSelected({ ...item, status: "done" });
  };

  const deleteItem = async (item: any) => {
    if (!confirm("Naozaj chceš zmazať túto správu?")) return;
    if (item._type === "message") {
      await supabase.from("contact_messages").delete().eq("id", item.id);
    } else {
      await supabase.from("reservations").delete().eq("id", item.id);
    }
    toast.success("Správa zmazaná");
    if (selected?.id === item.id) setSelected(null);
    loadData();
  };

  const cardStyle = { background: "#141414" };
  const unreadCount = allLeads.filter((l) => l.status === "new").length;

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: `Všetky (${allLeads.length})` },
    { id: "new", label: `Nové (${unreadCount})` },
    { id: "read", label: "Prečítané" },
    { id: "done", label: "Vybavené" },
  ];

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)] max-w-6xl">
      {/* List */}
      <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 flex flex-col" style={{ ...cardStyle, borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
        {/* Search */}
        <div className="p-3 border-b border-white/5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hľadať..."
              className="w-full bg-white/5 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none border border-white/5 focus:border-white/10 transition-colors"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-3 border-b border-white/5 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filter === t.id ? "bg-[#00FF94]/10 text-[#00FF94]" : "text-zinc-500 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-5 h-5 border-2 border-[#00FF94]/30 border-t-[#00FF94] rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Mail size={32} className="mx-auto text-zinc-700 mb-3" />
              <p className="text-zinc-500 text-sm">Žiadne správy zatiaľ.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={`${item._type}-${item.id}`}
                onClick={() => { setSelected(item); if (item.status === "new") markRead(item); }}
                className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                  selected?.id === item.id ? "bg-white/5" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${item.status === "new" ? "bg-[#00FF94]" : "bg-transparent border border-zinc-700"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-sm truncate font-medium ${item.status === "new" ? "text-white" : "text-zinc-400"}`}>
                        {item.name}
                      </p>
                      <span className="text-[10px] text-zinc-600 flex-shrink-0">
                        {format(new Date(item.created_at), "d.M.", { locale: sk })}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate">{item.email}</p>
                    {item.message && (
                      <p className="text-xs text-zinc-600 truncate mt-0.5">{item.message}</p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 min-w-0 hidden lg:block">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="h-full rounded-xl border border-white/5 p-6 flex flex-col"
              style={cardStyle}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-white text-lg font-semibold">{selected.name}</h2>
                  <p className="text-zinc-400 text-sm">{selected.email}</p>
                  {selected.phone && <p className="text-zinc-500 text-xs mt-1">{selected.phone}</p>}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  selected.status === "new" ? "bg-[#00FF94]/10 text-[#00FF94]" :
                  selected.status === "read" || selected.status === "contacted" ? "bg-zinc-800 text-zinc-400" :
                  "bg-blue-500/10 text-blue-400"
                }`}>
                  {selected.status === "new" ? "Nová" :
                   selected.status === "read" || selected.status === "contacted" ? "Prečítaná" : "Vybavená"}
                </span>
              </div>

              {(selected.package_category || selected.package_name) && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {selected.package_category && (
                    <span className="text-xs bg-white/5 text-zinc-400 px-2.5 py-1 rounded-full border border-white/10">
                      {selected.package_category === "cameras" ? "📷 Kamerový systém" : "🌐 Web"}
                    </span>
                  )}
                  {selected.package_name && (
                    <span className="text-xs bg-white/5 text-zinc-400 px-2.5 py-1 rounded-full border border-white/10">
                      {selected.package_name}
                    </span>
                  )}
                </div>
              )}

              {selected.message && (
                <div className="flex-1 bg-white/5 rounded-xl p-4 mb-6 overflow-y-auto">
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>
              )}

              <p className="text-xs text-zinc-600 mb-4">
                Prijaté: {format(new Date(selected.created_at), "d. MMMM yyyy 'o' HH:mm", { locale: sk })}
              </p>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                {selected.status !== "done" && selected.status !== "completed" && (
                  <button
                    onClick={() => markDone(selected)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#00FF94]/10 text-[#00FF94] hover:bg-[#00FF94]/20 transition-colors"
                  >
                    <CheckCircle size={14} /> Označiť ako vybavené
                  </button>
                )}
                <a
                  href={`mailto:${selected.email}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5 transition-colors"
                >
                  <ExternalLink size={14} /> Odpovedať emailom
                </a>
                <button
                  onClick={() => deleteItem(selected)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-500/5 text-red-400 hover:bg-red-500/15 transition-colors ml-auto"
                >
                  <Trash2 size={14} /> Odstrániť
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="h-full rounded-xl border border-white/5 flex items-center justify-center"
              style={cardStyle}
            >
              <div className="text-center">
                <Mail size={40} className="mx-auto text-zinc-700 mb-3" />
                <p className="text-zinc-500 text-sm">Vyber správu zo zoznamu</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
