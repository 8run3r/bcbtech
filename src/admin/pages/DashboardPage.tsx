import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, FolderKanban, FileText, TrendingUp, ArrowRight, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import type { AdminPage } from "../AdminLayout";

interface Props {
  setActivePage: (p: AdminPage) => void;
}

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

export const DashboardPage = ({ setActivePage }: Props) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [projects, setProjects] = useState<number>(0);
  const [cameras, setCameras] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [msgs, projs, cams] = await Promise.all([
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
        supabase.from("portfolio_items").select("id", { count: "exact" }),
        supabase.from("camera_products").select("id", { count: "exact" }),
      ]);
      setMessages(msgs.data || []);
      setProjects(projs.count || 0);
      setCameras(cams.count || 0);
      setLoading(false);
    };
    load();
  }, []);

  const unread = messages.filter((m) => m.status === "new").length;
  const recentMessages = messages.slice(0, 5);

  const blogPosts = (() => { try { return JSON.parse(localStorage.getItem("coktech_blog_posts") || "[]"); } catch { return []; } })();

  const stats: StatCard[] = [
    { label: "Nové správy", value: unread, icon: <MessageSquare size={20} />, color: "#00FF94", trend: `${messages.length} celkom` },
    { label: "Projekty", value: projects, icon: <FolderKanban size={20} />, color: "#60a5fa", trend: "v portfóliu" },
    { label: "Kamery", value: cameras, icon: <TrendingUp size={20} />, color: "#f59e0b", trend: "produktov" },
    { label: "Články", value: blogPosts.length, icon: <FileText size={20} />, color: "#a78bfa", trend: "na blogu" },
  ];

  const cardClass = "rounded-xl border border-white/5 p-6" ;
  const cardStyle = { background: "#141414" };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#00FF94]/30 border-t-[#00FF94] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={cardClass}
            style={cardStyle}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ background: s.color + "15" }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="text-sm text-zinc-400 mt-1">{s.label}</p>
            {s.trend && <p className="text-xs text-zinc-600 mt-0.5">{s.trend}</p>}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent messages */}
        <div className="lg:col-span-2">
          <div className={cardClass} style={cardStyle}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold">Posledné správy</h2>
              <button
                onClick={() => setActivePage("messages")}
                className="text-xs text-zinc-500 hover:text-[#00FF94] flex items-center gap-1 transition-colors"
              >
                Zobraziť všetky <ArrowRight size={12} />
              </button>
            </div>
            {recentMessages.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-8">Žiadne správy zatiaľ.</p>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((m) => (
                  <div key={m.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setActivePage("messages")}>
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${m.status === "new" ? "bg-[#00FF94]" : "bg-zinc-700"}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-medium truncate ${m.status === "new" ? "text-white" : "text-zinc-400"}`}>
                          {m.name}
                        </p>
                        <span className="text-xs text-zinc-600 flex-shrink-0">
                          {format(new Date(m.created_at), "d.M.", { locale: sk })}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 truncate">{m.email}</p>
                      {m.message && (
                        <p className="text-xs text-zinc-600 truncate mt-0.5">{m.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className={cardClass} style={cardStyle}>
            <h2 className="text-white font-semibold mb-4">Rýchle akcie</h2>
            <div className="space-y-2">
              {[
                { label: "Nový projekt", page: "projects" as AdminPage },
                { label: "Nový článok", page: "blog" as AdminPage },
                { label: "Generovať obsah AI", page: "marketing" as AdminPage },
                { label: "Pridať kameru", page: "cameras" as AdminPage },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => setActivePage(a.page)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all"
                >
                  <Plus size={14} className="text-[#00FF94]" />
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className={cardClass} style={cardStyle}>
            <h2 className="text-white font-semibold mb-3 text-sm">Stav systému</h2>
            <div className="space-y-2">
              {[
                { label: "Supabase DB", ok: true },
                { label: "Auth", ok: true },
                { label: "Storage", ok: true },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">{s.label}</span>
                  <span className={`text-xs font-medium ${s.ok ? "text-[#00FF94]" : "text-red-400"}`}>
                    {s.ok ? "● Online" : "● Offline"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
