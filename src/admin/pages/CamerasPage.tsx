import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, ImagePlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Camera {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  brand: string | null;
  price: string | null;
  features: string[] | null;
  sort_order: number;
}

const emptyForm = { name: "", description: "", category: "IP Camera", brand: "", price: "", features: "" };

export const CamerasPage = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Camera | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    const { data } = await supabase.from("camera_products").select("*").order("sort_order");
    setCameras(data as Camera[] || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setFile(null); setPreview(null); setShowModal(true); };
  const openEdit = (c: Camera) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || "", category: c.category || "IP Camera", brand: c.brand || "", price: c.price || "", features: c.features?.join(", ") || "" });
    setPreview(c.image_url);
    setFile(null);
    setShowModal(true);
  };

  const uploadImage = async (f: File): Promise<string | null> => {
    const ext = f.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("camera-images").upload(path, f);
    if (error) { toast.error("Upload zlyhal"); return null; }
    return supabase.storage.from("camera-images").getPublicUrl(path).data.publicUrl;
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Názov je povinný"); return; }
    setSaving(true);

    let imageUrl = editing?.image_url || null;
    if (file) { imageUrl = await uploadImage(file); }

    const payload = {
      name: form.name,
      description: form.description || null,
      image_url: imageUrl,
      category: form.category || null,
      brand: form.brand || null,
      price: form.price || null,
      features: form.features ? form.features.split(",").map(f => f.trim()).filter(Boolean) : null,
    };

    if (editing) {
      const { error } = await supabase.from("camera_products").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); } else { toast.success("Kamera aktualizovaná"); }
    } else {
      const { error } = await supabase.from("camera_products").insert(payload);
      if (error) { toast.error(error.message); } else { toast.success("Kamera pridaná"); }
    }

    setSaving(false);
    setShowModal(false);
    loadData();
  };

  const remove = async (id: string) => {
    if (!confirm("Zmazať kameru?")) return;
    await supabase.from("camera_products").delete().eq("id", id);
    toast.success("Zmazané");
    loadData();
  };

  const cardStyle = { background: "#141414" };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <p className="text-zinc-500 text-sm">{cameras.length} produktov</p>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black bg-[#00FF94] hover:bg-[#00FF94]/90 transition-all">
          <Plus size={16} /> Pridať kameru
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-[#00FF94]/30 border-t-[#00FF94] rounded-full animate-spin" />
        </div>
      ) : cameras.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-white/5" style={cardStyle}>
          <p className="text-zinc-500 mb-4">Zatiaľ žiadne kamery.</p>
          <button onClick={openAdd} className="text-sm text-[#00FF94] hover:underline">Pridaj prvú kameru</button>
        </div>
      ) : (
        <div className="space-y-3">
          {cameras.map((c) => (
            <motion.div key={c.id} layout className="flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors" style={cardStyle}>
              <div className="w-14 h-14 rounded-lg bg-zinc-800 flex-shrink-0 overflow-hidden">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600"><ImagePlus size={16} /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-medium text-sm">{c.name}</p>
                  {c.category && <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">{c.category}</span>}
                  {c.brand && <span className="text-[10px] bg-white/5 text-zinc-500 px-2 py-0.5 rounded-full">{c.brand}</span>}
                </div>
                {c.description && <p className="text-zinc-500 text-xs mt-0.5 truncate">{c.description}</p>}
                {c.features && c.features.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {c.features.slice(0, 3).map(f => <span key={f} className="text-[10px] bg-white/5 text-zinc-600 px-1.5 py-0.5 rounded">{f}</span>)}
                    {c.features.length > 3 && <span className="text-[10px] text-zinc-600">+{c.features.length - 3}</span>}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {c.price && <span className="text-sm font-semibold text-[#00FF94]">{c.price}</span>}
                <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"><Pencil size={14} /></button>
                <button onClick={() => remove(c.id)} className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-colors"><Trash2 size={14} /></button>
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
                  <h2 className="text-white font-semibold">{editing ? "Upraviť kameru" : "Nová kamera"}</h2>
                  <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white"><X size={18} /></button>
                </div>
                <form onSubmit={save} className="space-y-4">
                  <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Názov *" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors" />
                  <div className="grid grid-cols-2 gap-3">
                    <input value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} placeholder="Značka" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors" />
                    <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Kategória" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors" />
                  </div>
                  <input value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="Cena (napr. 149 €)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors" />
                  <input value={form.features} onChange={e => setForm(p => ({ ...p, features: e.target.value }))} placeholder="Vlastnosti (oddelené čiarkou)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors" />
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Popis" rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20 resize-none transition-colors" />

                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); } }} />
                  <div onClick={() => fileRef.current?.click()} className="border border-dashed border-white/10 rounded-xl p-4 cursor-pointer hover:border-white/20 transition-colors flex items-center gap-4">
                    {preview ? <img src={preview} alt="" className="w-14 h-14 rounded-lg object-cover" /> : <div className="w-14 h-14 rounded-lg bg-white/5 flex items-center justify-center"><ImagePlus size={18} className="text-zinc-600" /></div>}
                    <div><p className="text-sm text-zinc-400">{file ? file.name : "Klikni pre nahratie obrázku"}</p><p className="text-xs text-zinc-600">JPG, PNG, WebP</p></div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm text-zinc-400 bg-white/5 hover:bg-white/10 transition-all">Zrušiť</button>
                    <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black bg-[#00FF94] hover:bg-[#00FF94]/90 disabled:opacity-60 transition-all">
                      {saving ? "Ukladám..." : editing ? "Uložiť zmeny" : "Pridať kameru"}
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
