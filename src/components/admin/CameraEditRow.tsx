import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Upload, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera } from "lucide-react";
import { toast } from "sonner";

interface CameraProduct {
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

interface CameraEditRowProps {
  camera: CameraProduct;
  onRefresh: () => void;
  onUploadImage: (id: string, file: File) => void;
}

const CameraEditRow = ({ camera, onRefresh, onUploadImage }: CameraEditRowProps) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: camera.name,
    brand: camera.brand || "",
    category: camera.category || "",
    price: camera.price || "",
    description: camera.description || "",
    features: camera.features?.join(", ") || "",
    image_url: camera.image_url || "",
  });

  const handleSave = async () => {
    const { error } = await supabase.from("camera_products").update({
      name: form.name,
      brand: form.brand || null,
      category: form.category || null,
      price: form.price || null,
      description: form.description || null,
      features: form.features ? form.features.split(",").map(f => f.trim()) : null,
      image_url: form.image_url || null,
    }).eq("id", camera.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Kamera aktualizovaná");
    setEditing(false);
    onRefresh();
  };

  const handleDelete = async () => {
    await supabase.from("camera_products").delete().eq("id", camera.id);
    toast.success("Zmazané");
    onRefresh();
  };

  const handleCancel = () => {
    setForm({
      name: camera.name,
      brand: camera.brand || "",
      category: camera.category || "",
      price: camera.price || "",
      description: camera.description || "",
      features: camera.features?.join(", ") || "",
      image_url: camera.image_url || "",
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="p-4 rounded-lg border border-primary/30 bg-card space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder="Názov *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <Input placeholder="Značka" value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} />
          <Input placeholder="Kategória" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
          <Input placeholder="Cena" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
          <Input placeholder="URL obrázka" value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} className="md:col-span-2" />
          <Input placeholder="Vlastnosti (oddelené čiarkou)" value={form.features} onChange={e => setForm(p => ({ ...p, features: e.target.value }))} className="md:col-span-2" />
        </div>
        <Textarea placeholder="Popis" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave}><Check size={14} className="mr-1" /> Uložiť</Button>
          <Button size="sm" variant="outline" onClick={handleCancel}><X size={14} className="mr-1" /> Zrušiť</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card/50">
      <div className="w-16 h-16 rounded bg-muted/30 flex items-center justify-center overflow-hidden shrink-0">
        {camera.image_url ? (
          <img src={camera.image_url} alt={camera.name} className="w-full h-full object-cover" />
        ) : (
          <Camera size={20} className="text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{camera.name}</p>
        <p className="text-xs text-muted-foreground">{camera.brand} · {camera.category} · {camera.price}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
        <Pencil size={16} className="text-muted-foreground" />
      </Button>
      <label className="cursor-pointer">
        <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) onUploadImage(camera.id, e.target.files[0]); }} />
        <div className="p-2 rounded-md hover:bg-muted/50 transition-colors">
          <Upload size={16} className="text-muted-foreground" />
        </div>
      </label>
      <Button variant="ghost" size="icon" onClick={handleDelete}>
        <Trash2 size={16} className="text-destructive" />
      </Button>
    </div>
  );
};

export default CameraEditRow;
