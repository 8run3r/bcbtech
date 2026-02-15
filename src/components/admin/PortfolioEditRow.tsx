import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Pencil, X, Check, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface PortfolioEditRowProps {
  item: PortfolioItem;
  onRefresh: () => void;
}

const PortfolioEditRow = ({ item, onRefresh }: PortfolioEditRowProps) => {
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: item.title,
    category: item.category,
    type: item.type,
    description: item.description || "",
    image_url: item.image_url || "",
    tech: item.tech?.join(", ") || "",
    year: item.year || "",
    link: item.link || "",
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("portfolio-images").upload(path, file);
    if (error) { toast.error("Upload zlyhal: " + error.message); return null; }
    const { data } = supabase.storage.from("portfolio-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    setUploading(true);
    let imageUrl = form.image_url || null;

    if (selectedFile) {
      const url = await uploadImage(selectedFile);
      if (url) imageUrl = url;
      else { setUploading(false); return; }
    }

    const { error } = await supabase.from("portfolio_items").update({
      title: form.title,
      category: form.category,
      type: form.type,
      description: form.description || null,
      image_url: imageUrl,
      tech: form.tech ? form.tech.split(",").map(t => t.trim()) : null,
      year: form.year || null,
      link: form.link || null,
    }).eq("id", item.id);
    setUploading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Projekt aktualizovaný");
    setEditing(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    onRefresh();
  };

  const handleDelete = async () => {
    await supabase.from("portfolio_items").delete().eq("id", item.id);
    toast.success("Zmazané");
    onRefresh();
  };

  const handleCancel = () => {
    setForm({
      title: item.title,
      category: item.category,
      type: item.type,
      description: item.description || "",
      image_url: item.image_url || "",
      tech: item.tech?.join(", ") || "",
      year: item.year || "",
      link: item.link || "",
    });
    setEditing(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  if (editing) {
    const displayImage = previewUrl || form.image_url;
    return (
      <div className="p-4 rounded-lg border border-primary/30 bg-card space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder="Názov *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <Input placeholder="Kategória" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
          <select
            value={form.type}
            onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="web">Web projekt</option>
            <option value="camera">Kamerový projekt</option>
          </select>
          <Input placeholder="Rok" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} />
          {/* Image upload */}
          <div className="md:col-span-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors flex items-center gap-4"
            >
              {displayImage ? (
                <img src={displayImage} alt="Preview" className="w-20 h-20 rounded object-cover" />
              ) : (
                <div className="w-20 h-20 rounded bg-muted/30 flex items-center justify-center">
                  <ImagePlus size={24} className="text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium">{selectedFile ? selectedFile.name : "Klikni pre nahratie obrázku"}</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, WebP · max 5 MB</p>
              </div>
            </div>
          </div>
          <Input placeholder="Technológie (oddelené čiarkou)" value={form.tech} onChange={e => setForm(p => ({ ...p, tech: e.target.value }))} className="md:col-span-2" />
          <Input placeholder="Odkaz" value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} className="md:col-span-2" />
        </div>
        <Textarea placeholder="Popis" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={uploading}>
            {uploading ? "Nahrávam..." : <><Check size={14} className="mr-1" /> Uložiť</>}
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel}><X size={14} className="mr-1" /> Zrušiť</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card/50">
      {item.image_url && <img src={item.image_url} alt={item.title} className="w-16 h-16 rounded object-cover" />}
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{item.title}</p>
        <p className="text-xs text-muted-foreground">{item.type === "web" ? "🌐 Web" : "📹 Kamery"} · {item.category} · {item.year}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
        <Pencil size={16} className="text-muted-foreground" />
      </Button>
      <Button variant="ghost" size="icon" onClick={handleDelete}>
        <Trash2 size={16} className="text-destructive" />
      </Button>
    </div>
  );
};

export default PortfolioEditRow;
