import { useState, useEffect, useRef, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Pencil, Trash2, ImagePlus, ExternalLink, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  W98, raised, sunken,
  Win98Button, Win98Panel, Win98Input, Win98Textarea, Win98Select, Win98Window, Win98Progress,
} from "../win98";

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

const TYPE_OPTIONS = [
  { value: "web", label: "Web" },
  { value: "appky", label: "Appka" },
  { value: "vizualy", label: "Vizuál" },
  { value: "produkty", label: "Produkt" },
  { value: "automation", label: "Automatizácia" },
];

const emptyForm = { title: "", category: "", type: "web", description: "", tech: "", year: new Date().getFullYear().toString(), link: "" };

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

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Názov je povinný"); return; }
    setSaving(true);

    let imageUrl = editing?.image_url || null;
    if (file) { imageUrl = await uploadImage(file); }

    const payload = {
      title: form.title, category: form.category, type: form.type,
      description: form.description || null, image_url: imageUrl,
      tech: form.tech ? form.tech.split(",").map(t => t.trim()).filter(Boolean) : null,
      year: form.year || null, link: form.link || null,
    };

    if (editing) {
      const { error } = await supabase.from("portfolio_items").update(payload).eq("id", editing.id);
      if (error) toast.error(error.message); else toast.success("Aktualizované");
    } else {
      const { error } = await supabase.from("portfolio_items").insert(payload);
      if (error) toast.error(error.message); else toast.success("Pridané");
    }

    setSaving(false); setShowModal(false); loadData();
  };

  const remove = async (id: string) => {
    if (!confirm("Zmazať projekt?")) return;
    await supabase.from("portfolio_items").delete().eq("id", id);
    toast.success("Zmazané"); loadData();
  };

  return (
    <div style={{ fontFamily: W98.font, fontSize: "12px", color: W98.black }}>
      {/* Header */}
      <div style={{ boxShadow: raised, background: W98.bg, padding: "8px 12px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "20px" }}>📁</span>
          <span style={{ fontWeight: 700 }}>Projekty — Portfólio</span>
          <span style={{ color: W98.grayText }}>({items.length} projektov)</span>
        </div>
        <Win98Button onClick={openAdd}>📄 Nový projekt</Win98Button>
      </div>

      {loading ? (
        <div style={{ padding: 30, textAlign: "center" }}>
          <Win98Progress value={50} style={{ width: 200, margin: "0 auto" }} />
        </div>
      ) : items.length === 0 ? (
        <div style={{ boxShadow: raised, background: W98.bg, padding: 30, textAlign: "center" }}>
          <p style={{ color: W98.grayText, marginBottom: 8 }}>Zatiaľ žiadne projekty.</p>
          <Win98Button onClick={openAdd}>Pridaj prvý projekt</Win98Button>
        </div>
      ) : (
        /* Table view */
        <Win98Panel label="Zoznam projektov">
          <div style={{ boxShadow: sunken, background: W98.fieldBg, overflow: "auto" }}>
            {/* Header */}
            <div style={{
              display: "grid", gridTemplateColumns: "60px 1fr 100px 80px 60px 80px",
              gap: 4, padding: "4px 8px", borderBottom: "2px solid #808080",
              background: W98.bg, fontWeight: 700, fontSize: "11px",
            }}>
              <span>Obr.</span>
              <span>Názov</span>
              <span>Kategória</span>
              <span>Typ</span>
              <span>Rok</span>
              <span>Akcie</span>
            </div>
            {items.map((item) => (
              <div key={item.id} style={{
                display: "grid", gridTemplateColumns: "60px 1fr 100px 80px 60px 80px",
                gap: 4, padding: "3px 8px", fontSize: "11px", alignItems: "center",
                borderBottom: "1px solid #f0f0f0",
              }}>
                <div style={{ width: 48, height: 32, background: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <ImagePlus size={14} color="#808080" />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.title}</div>
                  {item.tech && item.tech.length > 0 && (
                    <div style={{ fontSize: "9px", color: W98.grayText }}>{item.tech.slice(0, 3).join(", ")}</div>
                  )}
                </div>
                <span>{item.category}</span>
                <span style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "10px" }}>{item.type}</span>
                <span>{item.year}</span>
                <div style={{ display: "flex", gap: 2 }}>
                  {item.link && (
                    <Win98Button small onClick={() => window.open(item.link!, "_blank")} style={{ minWidth: 0, padding: "2px 4px" }}>🔗</Win98Button>
                  )}
                  <Win98Button small onClick={() => openEdit(item)} style={{ minWidth: 0, padding: "2px 4px" }}>✏️</Win98Button>
                  <Win98Button small onClick={() => remove(item.id)} style={{ minWidth: 0, padding: "2px 4px" }}>🗑️</Win98Button>
                </div>
              </div>
            ))}
          </div>
        </Win98Panel>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 50 }}
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: "fixed", inset: 0, zIndex: 50,
                display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Win98Window
                title={editing ? "Upraviť projekt" : "Nový projekt"}
                onClose={() => setShowModal(false)}
                style={{ width: 460, maxHeight: "80vh" }}
              >
                <form onSubmit={save}>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: "block", marginBottom: 2 }}>Názov projektu *</label>
                    <Win98Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                    <div>
                      <label style={{ display: "block", marginBottom: 2 }}>Kategória</label>
                      <Win98Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: 2 }}>Typ</label>
                      <Win98Select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} options={TYPE_OPTIONS} style={{ width: "100%" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                    <div>
                      <label style={{ display: "block", marginBottom: 2 }}>Rok</label>
                      <Win98Input value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: 2 }}>URL</label>
                      <Win98Input value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: "block", marginBottom: 2 }}>Technológie (čiarkou)</label>
                    <Win98Input value={form.tech} onChange={e => setForm(p => ({ ...p, tech: e.target.value }))} />
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: "block", marginBottom: 2 }}>Popis</label>
                    <Win98Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
                  </div>

                  {/* Image */}
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); } }}
                  />
                  <div onClick={() => fileRef.current?.click()} style={{
                    boxShadow: sunken, background: W98.fieldBg, padding: 8, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
                  }}>
                    {preview ? (
                      <img src={preview} alt="" style={{ width: 48, height: 48, objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: 48, height: 48, background: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ImagePlus size={16} color="#808080" />
                      </div>
                    )}
                    <div>
                      <div>{file ? file.name : "Klikni pre nahratie obrázku"}</div>
                      <div style={{ fontSize: "10px", color: W98.grayText }}>JPG, PNG, WebP</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
                    <Win98Button type="button" onClick={() => setShowModal(false)}>Zrušiť</Win98Button>
                    <Win98Button type="submit" disabled={saving}>
                      {saving ? "Ukladám..." : editing ? "💾 Uložiť zmeny" : "📄 Pridať"}
                    </Win98Button>
                  </div>
                </form>
              </Win98Window>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
