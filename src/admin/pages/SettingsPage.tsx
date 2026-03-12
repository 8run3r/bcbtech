import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";

const STORAGE_KEY = "coktech_settings";

interface Settings {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  webUrl: string;
}

const defaultSettings: Settings = {
  companyName: "COK Tech",
  email: "8run3r@gmail.com",
  phone: "+421 911 640 660",
  address: "Levice, SK",
  webUrl: "https://coktech.tech",
};

export const SettingsPage = () => {
  const [settings, setSettings] = useState<Settings>(() => ({
    ...defaultSettings,
    ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"),
  }));
  const [passwords, setPasswords] = useState({ old: "", new1: "", new2: "" });
  const [showApiKey, setShowApiKey] = useState(false);
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || "";

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    toast.success("Nastavenia uložené");
  };

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new1 !== passwords.new2) { toast.error("Heslá sa nezhodujú"); return; }
    if (passwords.new1.length < 8) { toast.error("Heslo musí mať aspoň 8 znakov"); return; }
    toast.success("Heslo zmenené (implementuj cez Supabase Auth)");
    setPasswords({ old: "", new1: "", new2: "" });
  };

  const clearMessages = () => {
    if (!confirm("Naozaj chceš vymazať všetky správy? Táto akcia je nenávratná.")) return;
    localStorage.removeItem("coktech_messages");
    toast.success("Správy vymazané");
  };

  const resetData = () => {
    if (!confirm("Naozaj chceš resetovať všetky lokálne dáta? Blog, drafty a nastavenia budú vymazané.")) return;
    ["coktech_blog_posts", "coktech_marketing_drafts", STORAGE_KEY].forEach(k => localStorage.removeItem(k));
    toast.success("Dáta resetované");
  };

  const cardClass = "rounded-xl border border-white/5 p-6";
  const cardStyle = { background: "#141414" };
  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20 transition-colors";
  const labelClass = "text-xs text-zinc-500 block mb-1.5";

  return (
    <div className="max-w-2xl space-y-6">
      {/* Basic info */}
      <form onSubmit={saveSettings} className={cardClass} style={cardStyle}>
        <h2 className="text-white font-semibold mb-5">Základné info</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Názov firmy</label>
            <input value={settings.companyName} onChange={e => setSettings(p => ({ ...p, companyName: e.target.value }))} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={settings.email} onChange={e => setSettings(p => ({ ...p, email: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Telefón</label>
              <input value={settings.phone} onChange={e => setSettings(p => ({ ...p, phone: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Adresa</label>
            <input value={settings.address} onChange={e => setSettings(p => ({ ...p, address: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Web URL</label>
            <input value={settings.webUrl} onChange={e => setSettings(p => ({ ...p, webUrl: e.target.value }))} className={inputClass} />
          </div>
        </div>
        <button type="submit" className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold text-black bg-[#00FF94] hover:bg-[#00FF94]/90 transition-all">
          Uložiť
        </button>
      </form>

      {/* Change password */}
      <form onSubmit={changePassword} className={cardClass} style={cardStyle}>
        <h2 className="text-white font-semibold mb-5">Zmena hesla</h2>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Aktuálne heslo</label>
            <input type="password" value={passwords.old} onChange={e => setPasswords(p => ({ ...p, old: e.target.value }))} className={inputClass} placeholder="••••••••" />
          </div>
          <div>
            <label className={labelClass}>Nové heslo</label>
            <input type="password" value={passwords.new1} onChange={e => setPasswords(p => ({ ...p, new1: e.target.value }))} className={inputClass} placeholder="••••••••" />
          </div>
          <div>
            <label className={labelClass}>Potvrdiť nové heslo</label>
            <input type="password" value={passwords.new2} onChange={e => setPasswords(p => ({ ...p, new2: e.target.value }))} className={inputClass} placeholder="••••••••" />
          </div>
        </div>
        <button type="submit" className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/10 text-white hover:bg-white/15 transition-all">
          Zmeniť heslo
        </button>
      </form>

      {/* API keys */}
      <div className={cardClass} style={cardStyle}>
        <h2 className="text-white font-semibold mb-5">API kľúče</h2>
        <div>
          <label className={labelClass}>Anthropic API Key</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                readOnly
                type={showApiKey ? "text" : "password"}
                value={apiKey || "Nenastavený — pridaj do .env súboru"}
                className={inputClass + " pr-10 font-mono text-xs"}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <p className="text-xs text-zinc-600 mt-2">Kľúče sú uložené lokálne v .env súbore. Na Vercel nastav cez Environment Variables.</p>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-500/20 p-6" style={{ background: "#1a0a0a" }}>
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle size={16} className="text-red-400" />
          <h2 className="text-red-400 font-semibold">Nebezpečná zóna</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-red-500/10 bg-red-500/5">
            <div>
              <p className="text-sm text-white font-medium">Vymazať správy</p>
              <p className="text-xs text-zinc-500">Vymaže lokálne uložené správy (nie Supabase)</p>
            </div>
            <button onClick={clearMessages} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all">
              Vymazať
            </button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-red-500/10 bg-red-500/5">
            <div>
              <p className="text-sm text-white font-medium">Resetovať lokálne dáta</p>
              <p className="text-xs text-zinc-500">Blog, drafty, nastavenia — nenávratné</p>
            </div>
            <button onClick={resetData} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all">
              Resetovať
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
