import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, LogOut, Camera, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const Admin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"cameras" | "portfolio">("cameras");

  // Camera state
  const [cameras, setCameras] = useState<CameraProduct[]>([]);
  const [camForm, setCamForm] = useState({ name: "", description: "", image_url: "", category: "IP Camera", brand: "", price: "", features: "" });

  // Portfolio state
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [portForm, setPortForm] = useState({ title: "", category: "Web", type: "web", description: "", image_url: "", tech: "", year: "", link: "" });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.id).single();
        setIsAdmin(data?.role === "admin");
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    supabase.auth.getSession();
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAdmin) { fetchCameras(); fetchPortfolio(); }
  }, [isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  // Camera CRUD
  const fetchCameras = async () => {
    const { data } = await supabase.from("camera_products").select("*").order("sort_order");
    if (data) setCameras(data as CameraProduct[]);
  };

  const addCamera = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("camera_products").insert({
      name: camForm.name,
      description: camForm.description || null,
      image_url: camForm.image_url || null,
      category: camForm.category,
      brand: camForm.brand || null,
      price: camForm.price || null,
      features: camForm.features ? camForm.features.split(",").map(f => f.trim()) : null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Kamera pridaná");
    setCamForm({ name: "", description: "", image_url: "", category: "IP Camera", brand: "", price: "", features: "" });
    fetchCameras();
  };

  const deleteCamera = async (id: string) => {
    await supabase.from("camera_products").delete().eq("id", id);
    toast.success("Zmazané");
    fetchCameras();
  };

  // Portfolio CRUD
  const fetchPortfolio = async () => {
    const { data } = await supabase.from("portfolio_items").select("*").order("sort_order");
    if (data) setPortfolio(data as PortfolioItem[]);
  };

  const addPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("portfolio_items").insert({
      title: portForm.title,
      category: portForm.category,
      type: portForm.type,
      description: portForm.description || null,
      image_url: portForm.image_url || null,
      tech: portForm.tech ? portForm.tech.split(",").map(t => t.trim()) : null,
      year: portForm.year || null,
      link: portForm.link || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Projekt pridaný");
    setPortForm({ title: "", category: "Web", type: "web", description: "", image_url: "", tech: "", year: "", link: "" });
    fetchPortfolio();
  };

  const deletePortfolio = async (id: string) => {
    await supabase.from("portfolio_items").delete().eq("id", id);
    toast.success("Zmazané");
    fetchPortfolio();
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Načítavanie...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-foreground text-center mb-8">Admin Panel</h1>
          <Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input placeholder="Heslo" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full">Prihlásiť sa</Button>
        </form>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <div className="text-center">
          <p className="text-lg mb-4">Nemáte admin prístup.</p>
          <Button variant="outline" onClick={handleLogout}>Odhlásiť sa</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={16} className="mr-2" /> Odhlásiť
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={tab === "cameras" ? "default" : "outline"}
            onClick={() => setTab("cameras")}
          >
            <Camera size={16} className="mr-2" /> Kamery
          </Button>
          <Button
            variant={tab === "portfolio" ? "default" : "outline"}
            onClick={() => setTab("portfolio")}
          >
            <Code2 size={16} className="mr-2" /> Portfólio
          </Button>
        </div>

        {tab === "cameras" && (
          <div className="space-y-8">
            <form onSubmit={addCamera} className="p-6 rounded-xl border border-border bg-card space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Plus size={18} /> Pridať kameru</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Názov *" value={camForm.name} onChange={e => setCamForm(p => ({ ...p, name: e.target.value }))} required />
                <Input placeholder="Značka" value={camForm.brand} onChange={e => setCamForm(p => ({ ...p, brand: e.target.value }))} />
                <Input placeholder="Kategória" value={camForm.category} onChange={e => setCamForm(p => ({ ...p, category: e.target.value }))} />
                <Input placeholder="Cena" value={camForm.price} onChange={e => setCamForm(p => ({ ...p, price: e.target.value }))} />
                <Input placeholder="URL obrázka" value={camForm.image_url} onChange={e => setCamForm(p => ({ ...p, image_url: e.target.value }))} className="md:col-span-2" />
                <Input placeholder="Vlastnosti (oddelené čiarkou)" value={camForm.features} onChange={e => setCamForm(p => ({ ...p, features: e.target.value }))} className="md:col-span-2" />
              </div>
              <Textarea placeholder="Popis" value={camForm.description} onChange={e => setCamForm(p => ({ ...p, description: e.target.value }))} />
              <Button type="submit"><Plus size={16} className="mr-2" /> Pridať</Button>
            </form>

            <div className="space-y-3">
              {cameras.map(c => (
                <div key={c.id} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card/50">
                  {c.image_url && <img src={c.image_url} alt={c.name} className="w-16 h-16 rounded object-cover" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.brand} · {c.category} · {c.price}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteCamera(c.id)}>
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                </div>
              ))}
              {cameras.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">Žiadne kamery. Pridajte prvú.</p>}
            </div>
          </div>
        )}

        {tab === "portfolio" && (
          <div className="space-y-8">
            <form onSubmit={addPortfolio} className="p-6 rounded-xl border border-border bg-card space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Plus size={18} /> Pridať projekt</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Názov *" value={portForm.title} onChange={e => setPortForm(p => ({ ...p, title: e.target.value }))} required />
                <Input placeholder="Kategória" value={portForm.category} onChange={e => setPortForm(p => ({ ...p, category: e.target.value }))} />
                <select
                  value={portForm.type}
                  onChange={e => setPortForm(p => ({ ...p, type: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="web">Web projekt</option>
                  <option value="camera">Kamerový projekt</option>
                </select>
                <Input placeholder="Rok" value={portForm.year} onChange={e => setPortForm(p => ({ ...p, year: e.target.value }))} />
                <Input placeholder="URL obrázka" value={portForm.image_url} onChange={e => setPortForm(p => ({ ...p, image_url: e.target.value }))} className="md:col-span-2" />
                <Input placeholder="Technológie (oddelené čiarkou)" value={portForm.tech} onChange={e => setPortForm(p => ({ ...p, tech: e.target.value }))} className="md:col-span-2" />
                <Input placeholder="Odkaz" value={portForm.link} onChange={e => setPortForm(p => ({ ...p, link: e.target.value }))} className="md:col-span-2" />
              </div>
              <Textarea placeholder="Popis" value={portForm.description} onChange={e => setPortForm(p => ({ ...p, description: e.target.value }))} />
              <Button type="submit"><Plus size={16} className="mr-2" /> Pridať</Button>
            </form>

            <div className="space-y-3">
              {portfolio.map(p => (
                <div key={p.id} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card/50">
                  {p.image_url && <img src={p.image_url} alt={p.title} className="w-16 h-16 rounded object-cover" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.type === "web" ? "🌐 Web" : "📹 Kamery"} · {p.category} · {p.year}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deletePortfolio(p.id)}>
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                </div>
              ))}
              {portfolio.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">Žiadne projekty. Pridajte prvý.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
