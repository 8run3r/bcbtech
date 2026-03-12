import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Eye, EyeOff, Bot, Loader2, X, Check } from "lucide-react";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "coktech_blog_posts";
const CATEGORIES = ["Security", "Digital", "Novinky", "Návod"];

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const emptyPost = (): BlogPost => ({
  id: Date.now().toString(),
  title: "",
  slug: "",
  category: "Novinky",
  content: "",
  status: "draft",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>(() =>
    JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  );
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const save = (posts: BlogPost[]) => {
    setPosts(posts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  };

  const openNew = () => setEditing(emptyPost());
  const openEdit = (p: BlogPost) => setEditing({ ...p });

  const savePost = (statusOverride?: "draft" | "published") => {
    if (!editing) return;
    if (!editing.title.trim()) { toast.error("Nadpis je povinný"); return; }
    const post = { ...editing, status: statusOverride ?? editing.status, updatedAt: new Date().toISOString() };
    const existing = posts.find(p => p.id === post.id);
    if (existing) {
      save(posts.map(p => p.id === post.id ? post : p));
    } else {
      save([post, ...posts]);
    }
    toast.success(post.status === "published" ? "Článok publikovaný" : "Koncept uložený");
    setEditing(null);
  };

  const remove = (id: string) => {
    if (!confirm("Zmazať článok?")) return;
    save(posts.filter(p => p.id !== id));
    toast.success("Zmazané");
    if (editing?.id === id) setEditing(null);
  };

  const aiAssist = async () => {
    if (!editing?.title) { toast.error("Najprv zadaj nadpis"); return; }
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) { toast.error("VITE_ANTHROPIC_API_KEY nie je nastavený"); return; }

    setAiLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Napíš pokračovanie tohto blog článku pre COK Tech (slovenská tech firma).
Nadpis: "${editing.title}"
Kategória: ${editing.category}
${editing.content ? `Existujúci obsah:\n${editing.content.slice(0, 300)}...\n\nPokračuj od tohto miesta.` : "Napíš úvod a rozviň tému."}

Píš po slovensky. Min 3 odseky. Markdown formátovanie.`,
          }],
        }),
      });
      const data = await res.json();
      const text = data.content[0]?.text || "";
      setEditing(p => p ? { ...p, content: p.content ? p.content + "\n\n" + text : text } : p);
      toast.success("AI obsah pridaný");
    } catch (e: any) {
      toast.error("Chyba: " + e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const cardStyle = { background: "#141414" };

  if (editing) {
    return (
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold">{editing.createdAt === editing.updatedAt && !posts.find(p => p.id === editing.id) ? "Nový článok" : "Upraviť článok"}</h2>
          <button onClick={() => setEditing(null)} className="text-zinc-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <input
            value={editing.title}
            onChange={e => {
              const title = e.target.value;
              setEditing(p => p ? { ...p, title, slug: slugify(title) } : p);
            }}
            placeholder="Nadpis článku *"
            className="w-full bg-transparent border-b-2 border-white/10 focus:border-[#00FF94] pb-2 text-xl font-bold text-white placeholder:text-zinc-700 outline-none transition-colors"
          />

          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Slug:</span>
              <input
                value={editing.slug}
                onChange={e => setEditing(p => p ? { ...p, slug: e.target.value } : p)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-400 outline-none focus:border-white/20 transition-colors min-w-40"
              />
            </div>
            <select
              value={editing.category}
              onChange={e => setEditing(p => p ? { ...p, category: e.target.value } : p)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-400 outline-none focus:border-white/20 transition-colors"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <textarea
            value={editing.content}
            onChange={e => setEditing(p => p ? { ...p, content: e.target.value } : p)}
            placeholder="Obsah článku... (Markdown podporovaný)"
            rows={20}
            className="w-full bg-white/5 border border-white/5 focus:border-white/15 rounded-xl px-4 py-3 text-sm text-zinc-300 placeholder:text-zinc-700 outline-none resize-none transition-colors leading-relaxed"
          />

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={aiAssist}
              disabled={aiLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-all"
            >
              {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
              {aiLoading ? "Píše AI..." : "✨ Dopísať s AI"}
            </button>

            <div className="ml-auto flex gap-2">
              <button
                onClick={() => savePost("draft")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5 transition-all"
              >
                <EyeOff size={14} /> Uložiť koncept
              </button>
              <button
                onClick={() => savePost("published")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black bg-[#00FF94] hover:bg-[#00FF94]/90 transition-all"
              >
                <Check size={14} /> Publikovať
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <p className="text-zinc-500 text-sm">{posts.length} článkov</p>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black bg-[#00FF94] hover:bg-[#00FF94]/90 transition-all">
          <Plus size={16} /> Nový článok
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-white/5" style={cardStyle}>
          <p className="text-zinc-500 mb-4">Zatiaľ žiadne články.</p>
          <button onClick={openNew} className="text-sm text-[#00FF94] hover:underline">Napíš prvý článok</button>
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 overflow-hidden" style={cardStyle}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3">Nadpis</th>
                <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3 hidden sm:table-cell">Kategória</th>
                <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3">Status</th>
                <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3 hidden md:table-cell">Dátum</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <motion.tr
                  key={post.id}
                  layout
                  className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => openEdit(post)}
                >
                  <td className="px-4 py-3">
                    <p className="text-sm text-white font-medium truncate max-w-xs">{post.title}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs text-zinc-500">{post.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      post.status === "published" ? "bg-[#00FF94]/10 text-[#00FF94]" : "bg-zinc-800 text-zinc-500"
                    }`}>
                      {post.status === "published" ? "Publikovaný" : "Koncept"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-zinc-600">{new Date(post.createdAt).toLocaleDateString("sk-SK")}</span>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(post)} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"><Pencil size={13} /></button>
                      <button onClick={() => remove(post.id)} className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
