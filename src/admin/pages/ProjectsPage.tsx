import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, ImagePlus, ExternalLink, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  type: string;
  description: string | null;
  image_url: string | null;
  tech: string[] | null;
  year: string | null;
  link: string | null;
  sort_order: number;
}

const emptyForm = { title: "", category: "Web", type: "web", description: "", tech: "", year: new Date().getFullYear().toString(), link: "" };

export const ProjectsPage = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    const { data } = await supabase.from("portfolio_items").select("*").order("sort_order");
    setItems(data as PortfolioItem[] || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setFile(null); setPreview(null); setShowModal(true); };
  const openEdit = (item: PortfolioItem) => {
    setEditing(item);
    setForm({ title: item.title, category: item.category, type: item.type, description: item.description || "", tech: item.tech?.join(", ") || "", year: item.year || "", link: item.link || "" });
    setPreview(item.image_url);
    setFile(null);
    setShowModal(true);
  };

  const uploadImage = async (f: File): Promise<string | null> => {
    const ext = f.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("portfolio-images").upload(path, f);
    if (error) { toast.error("Upload zlyhal"); return null; }
    return supabase.storage.from("portfolio-images").getPublicUrl(path).data.publicUrl;
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Názov je povinný"); return; }
    setSaving(true);

    let imageUrl = editing?.image_url || null;
    if (file) { imageUrl = await uploadImage(file); }

    const payload = {
      title: form.title,
      category: form.category,
      type: form.type,
      description: form.description || null,
      image_url: imageUrl,
      tech: form.tech ? form.tech.split(",").map(t => t.trim()).filter(Boolean) : null,
      year: form.year || null,
      link: form.link || null,
    };

    if (editing) {
      const { error } = await supabase.from("portfolio_items").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); } else { toast.success("Projekt aktualizovaný"); }
    } else {
      const { error } = await supabase.from("portfolio_items").insert(payload);
      if (error) { toast.error(error.message); } else { toast.success("Projekt pridaný"); }
    }

    setSaving(false);
    setShowModal(false);
    loadData();
  };

  const remove = async (id: string) => {
    if (!confirm("Zmazať projekt?")) return;
    await supabase.from("portfolio_items").delete().eq("id", id);
    toast.success("Zmazané");
    loadData();
  };

  const cardStyle = { background: "#141414" };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <p className="text-zinc-500 text-sm">{items.length} projektov</p>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black bg-[#00FF94] hover:bg-[#00FF94]/90 transition-all"
        >
          <Plus size={16} /> Nový projekt
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-[#00FF94]/30 border-t-[#00FF94] rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-white/5" style={cardStyle}>
          <p className="text-zinc-500 mb-4">Zatiaľ žiadne projekty.</p>
          <button onClick={openAdd} className="text-sm text-[#00FF94] hover:underline">Pridaj prvý projekt</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <motion.div key={item.id} layout className="rounded-xl border border-white/5 overflow-hidden group" style={cardStyle}>
              <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <ImagePlus size={24} />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                    item.type === "web" ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"
                  }`}>{item.type}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{item.title}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{item.category} {item.year && `· ${item.year}`}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => remove(item.id)} className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {item.tech && item.tech.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.tech.slice(0, 4).map((t) => (
                      <span key={t} className="text-[10px] bg-white/5 text-zinc-500 px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                    {item.tech.length > 4 && <span className="text-[10px] text-zinc-600">+{item.tech.length - 4}</span>}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50" onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full max-w-lg rounded-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto" style={{ background: "#1a1a1a" }}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-white font-semibold">{editing ? "Upraviť projekt" : "Nový projekt"}</h2>
                  <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white transition-colors"><X size={18} /></button>
                </div>
                <form onSubmit={save} className="space-y-4">
                  <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Názov projektu *" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors" />
                  <div className="grid grid-cols-2 gap-3">
                    <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Kategória" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors" />
                    <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/20 transition-colors">
                      <option value="web">Web projekt</option>
                      <option value="camera">Kamerový projekt</option>
                      <option value="app">Aplikácia</option>
                      <option value="eshop">E-shop</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} placeholder="Rok" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors" />
                    <input value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} placeholder="URL (voliteľné)" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors" />
                  </div>
                  <input value={form.tech} onChange={e => setForm(p => ({ ...p, tech: e.target.value }))} placeholder="Technológie (oddelené čiarkou)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors" />
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Popis" rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20 resize-none transition-colors" />

                  {/* Image upload */}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); } }} />
                  <div onClick={() => fileRef.current?.click()} className="border border-dashed border-white/10 rounded-xl p-4 cursor-pointer hover:border-white/20 transition-colors flex items-center gap-4">
                    {preview ? <img src={preview} alt="" className="w-14 h-14 rounded-lg object-cover" /> : <div className="w-14 h-14 rounded-lg bg-white/5 flex items-center justify-center"><ImagePlus size={18} className="text-zinc-600" /></div>}
                    <div><p className="text-sm text-zinc-400">{file ? file.name : "Klikni pre nahratie obrázku"}</p><p className="text-xs text-zinc-600">JPG, PNG, WebP</p></div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm text-zinc-400 bg-white/5 hover:bg-white/10 transition-all">Zrušiť</button>
                    <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black bg-[#00FF94] hover:bg-[#00FF94]/90 disabled:opacity-60 transition-all">
                      {saving ? "Ukladám..." : editing ? "Uložiť zmeny" : "Pridať projekt"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
