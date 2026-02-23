import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, LogOut, Camera, Code2, Upload, ImagePlus, Mail, CalendarCheck, Eye, CheckCircle, Clock, XCircle } from "lucide-react";
import CameraEditRow from "@/components/admin/CameraEditRow";
import PortfolioEditRow from "@/components/admin/PortfolioEditRow";
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
  const [tab, setTab] = useState<"cameras" | "portfolio" | "leads">("cameras");
  

  // Camera state
  const [cameras, setCameras] = useState<CameraProduct[]>([]);
  const [camForm, setCamForm] = useState({ name: "", description: "", image_url: "", category: "IP Camera", brand: "", price: "", features: "" });

  // Portfolio state
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [portForm, setPortForm] = useState({ title: "", category: "Web", type: "web", description: "", image_url: "", tech: "", year: "", link: "" });

  useEffect(() => {
    let isMounted = true;

    const checkRole = async (userId: string) => {
      try {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
        if (isMounted) setIsAdmin(!!data);
      } catch {
        if (isMounted) setIsAdmin(false);
      }
    };

    // Listener for ongoing auth changes — use setTimeout to avoid deadlock
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        if (!isMounted) return;
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          setTimeout(() => checkRole(u.id), 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // Initial load
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          await checkRole(u.id);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Messages & Reservations state
  const [messages, setMessages] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin) { fetchCameras(); fetchPortfolio(); fetchMessages(); fetchReservations(); }
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

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("camera-images").upload(path, file);
    if (error) { toast.error("Upload failed: " + error.message); return null; }
    const { data } = supabase.storage.from("camera-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const [camFile, setCamFile] = useState<File | null>(null);
  const [camPreview, setCamPreview] = useState<string | null>(null);
  const camFileRef = useRef<HTMLInputElement>(null);

  const [portFile, setPortFile] = useState<File | null>(null);
  const [portPreview, setPortPreview] = useState<string | null>(null);
  const portFileRef = useRef<HTMLInputElement>(null);

  const uploadPortfolioImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("portfolio-images").upload(path, file);
    if (error) { toast.error("Upload zlyhal: " + error.message); return null; }
    const { data } = supabase.storage.from("portfolio-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const addCamera = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl: string | null = null;

    if (camFile) {
      const url = await uploadImage(camFile);
      if (url) imageUrl = url;
    }

    const { error } = await supabase.from("camera_products").insert({
      name: camForm.name,
      description: camForm.description || null,
      image_url: imageUrl,
      category: camForm.category,
      brand: camForm.brand || null,
      price: camForm.price || null,
      features: camForm.features ? camForm.features.split(",").map(f => f.trim()) : null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Kamera pridaná");
    setCamForm({ name: "", description: "", image_url: "", category: "IP Camera", brand: "", price: "", features: "" });
    setCamFile(null);
    setCamPreview(null);
    fetchCameras();
  };

  const updateCameraImage = async (id: string, file: File) => {
    const url = await uploadImage(file);
    if (!url) return;
    const { error } = await supabase.from("camera_products").update({ image_url: url }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Obrázok aktualizovaný");
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
    let imageUrl: string | null = null;

    if (portFile) {
      const url = await uploadPortfolioImage(portFile);
      if (url) imageUrl = url;
    }

    const { error } = await supabase.from("portfolio_items").insert({
      title: portForm.title,
      category: portForm.category,
      type: portForm.type,
      description: portForm.description || null,
      image_url: imageUrl,
      tech: portForm.tech ? portForm.tech.split(",").map(t => t.trim()) : null,
      year: portForm.year || null,
      link: portForm.link || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Projekt pridaný");
    setPortForm({ title: "", category: "Web", type: "web", description: "", image_url: "", tech: "", year: "", link: "" });
    setPortFile(null);
    setPortPreview(null);
    fetchPortfolio();
  };

  const deletePortfolio = async (id: string) => {
    await supabase.from("portfolio_items").delete().eq("id", id);
    toast.success("Zmazané");
    fetchPortfolio();
  };

  // Messages CRUD
  const fetchMessages = async () => {
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    if (data) setMessages(data);
  };

  const updateMessageStatus = async (id: string, status: string) => {
    await supabase.from("contact_messages").update({ status }).eq("id", id);
    toast.success("Status aktualizovaný");
    fetchMessages();
  };

  const deleteMessage = async (id: string) => {
    await supabase.from("contact_messages").delete().eq("id", id);
    toast.success("Správa zmazaná");
    fetchMessages();
  };

  // Reservations CRUD
  const fetchReservations = async () => {
    const { data } = await supabase.from("reservations").select("*").order("created_at", { ascending: false });
    if (data) setReservations(data);
  };

  const updateReservationStatus = async (id: string, status: string) => {
    await supabase.from("reservations").update({ status }).eq("id", id);
    toast.success("Status aktualizovaný");
    fetchReservations();
  };

  const deleteReservation = async (id: string) => {
    await supabase.from("reservations").delete().eq("id", id);
    toast.success("Rezervácia zmazaná");
    fetchReservations();
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
        <div className="flex flex-wrap gap-2 mb-8">
          <Button variant={tab === "cameras" ? "default" : "outline"} onClick={() => setTab("cameras")}>
            <Camera size={16} className="mr-2" /> Kamery
          </Button>
          <Button variant={tab === "portfolio" ? "default" : "outline"} onClick={() => setTab("portfolio")}>
            <Code2 size={16} className="mr-2" /> Portfólio
          </Button>
          <Button variant={tab === "leads" ? "default" : "outline"} onClick={() => setTab("leads")}>
            <Mail size={16} className="mr-2" /> Dopyty {(messages.filter(m => m.status === 'new').length + reservations.filter(r => r.status === 'new').length) > 0 && <span className="ml-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">{messages.filter(m => m.status === 'new').length + reservations.filter(r => r.status === 'new').length}</span>}
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
                {/* Image upload */}
                <div className="md:col-span-2">
                  <input ref={camFileRef} type="file" accept="image/*" className="hidden" onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) { setCamFile(f); setCamPreview(URL.createObjectURL(f)); }
                  }} />
                  <div
                    onClick={() => camFileRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors flex items-center gap-4"
                  >
                    {camPreview ? (
                      <img src={camPreview} alt="Preview" className="w-16 h-16 rounded object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded bg-muted/30 flex items-center justify-center">
                        <ImagePlus size={20} className="text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{camFile ? camFile.name : "Klikni pre nahratie obrázku"}</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG, WebP · max 5 MB</p>
                    </div>
                  </div>
                </div>
                <Input placeholder="Vlastnosti (oddelené čiarkou)" value={camForm.features} onChange={e => setCamForm(p => ({ ...p, features: e.target.value }))} className="md:col-span-2" />
              </div>
              <Textarea placeholder="Popis" value={camForm.description} onChange={e => setCamForm(p => ({ ...p, description: e.target.value }))} />
              <Button type="submit"><Plus size={16} className="mr-2" /> Pridať</Button>
            </form>

            <div className="space-y-3">
              {cameras.map(c => (
                <CameraEditRow key={c.id} camera={c} onRefresh={fetchCameras} onUploadImage={updateCameraImage} />
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
                {/* Image upload */}
                <div className="md:col-span-2">
                  <input ref={portFileRef} type="file" accept="image/*" className="hidden" onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) { setPortFile(f); setPortPreview(URL.createObjectURL(f)); }
                  }} />
                  <div
                    onClick={() => portFileRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors flex items-center gap-4"
                  >
                    {portPreview ? (
                      <img src={portPreview} alt="Preview" className="w-16 h-16 rounded object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded bg-muted/30 flex items-center justify-center">
                        <ImagePlus size={20} className="text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{portFile ? portFile.name : "Klikni pre nahratie obrázku"}</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG, WebP · max 5 MB</p>
                    </div>
                  </div>
                </div>
                <Input placeholder="Technológie (oddelené čiarkou)" value={portForm.tech} onChange={e => setPortForm(p => ({ ...p, tech: e.target.value }))} className="md:col-span-2" />
                <Input placeholder="Odkaz" value={portForm.link} onChange={e => setPortForm(p => ({ ...p, link: e.target.value }))} className="md:col-span-2" />
              </div>
              <Textarea placeholder="Popis" value={portForm.description} onChange={e => setPortForm(p => ({ ...p, description: e.target.value }))} />
              <Button type="submit"><Plus size={16} className="mr-2" /> Pridať</Button>
            </form>

            <div className="space-y-3">
              {portfolio.map(p => (
                <PortfolioEditRow key={p.id} item={p} onRefresh={fetchPortfolio} />
              ))}
              {portfolio.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">Žiadne projekty. Pridajte prvý.</p>}
            </div>
          </div>
        )}

        {tab === "leads" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Mail size={18} /> Všetky dopyty</h2>
            
            {/* Combined list sorted by date */}
            {(() => {
              const allLeads = [
                ...messages.map(m => ({ ...m, _source: 'kontakt' as const, _table: 'contact_messages' as const })),
                ...reservations.map(r => ({ ...r, _source: 'balíčky' as const, _table: 'reservations' as const })),
              ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

              if (allLeads.length === 0) return <p className="text-muted-foreground text-sm text-center py-8">Žiadne dopyty.</p>;

              return allLeads.map((lead) => (
                <div key={`${lead._table}-${lead.id}`} className={`p-5 rounded-xl border bg-card space-y-3 ${lead.status === 'new' ? 'border-primary/40' : 'border-border'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                          lead._source === 'balíčky' 
                            ? lead.package_name?.startsWith('Konfigurátor')
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-primary/20 text-primary'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {lead._source === 'balíčky' 
                            ? lead.package_name?.startsWith('Konfigurátor') ? '🔧 Konfigurátor' : '📦 Balíčky'
                            : '✉️ Kontakt'}
                        </span>
                        <span className="font-semibold text-sm">{lead.name}</span>
                        <span className="text-xs text-muted-foreground">{lead.email}</span>
                        {lead.phone && <span className="text-xs text-muted-foreground">· {lead.phone}</span>}
                      </div>
                      {(lead.package_category || lead.package_name) && (
                        <div className="flex items-center gap-2 mt-2">
                          {lead.package_category && (
                            <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                              {lead.package_category === 'cameras' ? '📷 Kamery' : '🌐 Web'}
                            </span>
                          )}
                          {lead.package_name && <span className="text-sm font-medium text-foreground">{lead.package_name}</span>}
                        </div>
                      )}
                      {lead.message && <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{lead.message}</p>}
                      <p className="text-xs text-muted-foreground mt-2">{new Date(lead.created_at).toLocaleString('sk-SK')}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {lead._table === 'reservations' ? (
                        <select
                          value={lead.status}
                          onChange={(e) => updateReservationStatus(lead.id, e.target.value)}
                          className="text-xs bg-background border border-border rounded-md px-2 py-1.5"
                        >
                          <option value="new">Nová</option>
                          <option value="contacted">Kontaktovaný</option>
                          <option value="confirmed">Potvrdená</option>
                          <option value="completed">Dokončená</option>
                          <option value="cancelled">Zrušená</option>
                        </select>
                      ) : (
                        <>
                          {lead.status === 'new' && (
                            <Button size="sm" variant="outline" onClick={() => updateMessageStatus(lead.id, 'read')}>
                              <Eye size={14} className="mr-1" /> Prečítané
                            </Button>
                          )}
                          {lead.status !== 'done' && (
                            <Button size="sm" variant="outline" onClick={() => updateMessageStatus(lead.id, 'done')}>
                              <CheckCircle size={14} className="mr-1" /> Vybavené
                            </Button>
                          )}
                        </>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => {
                        if (lead._table === 'reservations') deleteReservation(lead.id);
                        else deleteMessage(lead.id);
                      }}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      lead.status === 'new' ? 'bg-primary/20 text-primary' :
                      lead.status === 'read' ? 'bg-muted text-muted-foreground' :
                      lead.status === 'contacted' ? 'bg-yellow-500/20 text-yellow-400' :
                      lead.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                      lead.status === 'completed' || lead.status === 'done' ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {lead.status === 'new' ? 'Nová' :
                       lead.status === 'read' ? 'Prečítaná' :
                       lead.status === 'contacted' ? 'Kontaktovaný' :
                       lead.status === 'confirmed' ? 'Potvrdená' :
                       lead.status === 'completed' ? 'Dokončená' :
                       lead.status === 'done' ? 'Vybavená' : 'Zrušená'}
                    </span>
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
