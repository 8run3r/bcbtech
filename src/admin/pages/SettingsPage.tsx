import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  W98, raised, sunken,
  Win98Button, Win98Panel, Win98Input, Win98Window,
} from "../win98";

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
  const [settings, setSettings] = useState<Settings>(() => {
    try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
    catch { return defaultSettings; }
  });
  const [passwords, setPasswords] = useState({ old: "", new1: "", new2: "" });

  const saveSettings = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    toast.success("Nastavenia uložené");
  };

  const [pwLoading, setPwLoading] = useState(false);

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (passwords.new1 !== passwords.new2) { toast.error("Heslá sa nezhodujú"); return; }
    if (passwords.new1.length < 8) { toast.error("Heslo musí mať aspoň 8 znakov"); return; }

    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.new1 });
    setPwLoading(false);

    if (error) {
      toast.error(`Chyba: ${error.message}`);
      return;
    }
    toast.success("Heslo úspešne zmenené");
    setPasswords({ old: "", new1: "", new2: "" });
  };

  const resetData = () => {
    if (!confirm("Naozaj chceš resetovať všetky lokálne dáta?")) return;
    ["coktech_blog_posts", "coktech_marketing_drafts", STORAGE_KEY].forEach(k => localStorage.removeItem(k));
    toast.success("Dáta resetované");
  };

  const labelStyle = { fontFamily: W98.font, fontSize: "12px", color: W98.black, display: "block", marginBottom: 2 };
  const rowStyle = { marginBottom: 8 };

  return (
    <div style={{ fontFamily: W98.font, fontSize: "12px", color: W98.black, maxWidth: 560 }}>
      {/* Header */}
      <div style={{
        boxShadow: raised,
        background: W98.bg,
        padding: "8px 12px",
        marginBottom: 12,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <span style={{ fontSize: "20px" }}>⚙️</span>
        <span style={{ fontWeight: 700 }}>Ovládací panel - Nastavenia</span>
      </div>

      {/* Company info */}
      <form onSubmit={saveSettings}>
        <Win98Panel label="Základné informácie o firme" style={{ marginBottom: 12 }}>
          <div style={rowStyle}>
            <label style={labelStyle}>Názov firmy:</label>
            <Win98Input value={settings.companyName} onChange={e => setSettings(p => ({ ...p, companyName: e.target.value }))} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, ...rowStyle }}>
            <div>
              <label style={labelStyle}>Email:</label>
              <Win98Input type="email" value={settings.email} onChange={e => setSettings(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Telefón:</label>
              <Win98Input value={settings.phone} onChange={e => setSettings(p => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Adresa:</label>
            <Win98Input value={settings.address} onChange={e => setSettings(p => ({ ...p, address: e.target.value }))} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Web URL:</label>
            <Win98Input value={settings.webUrl} onChange={e => setSettings(p => ({ ...p, webUrl: e.target.value }))} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
            <Win98Button type="submit">💾 Uložiť</Win98Button>
          </div>
        </Win98Panel>
      </form>

      {/* Password */}
      <form onSubmit={changePassword}>
        <Win98Panel label="Zmena hesla" style={{ marginBottom: 12 }}>
          <div style={rowStyle}>
            <label style={labelStyle}>Aktuálne heslo:</label>
            <Win98Input type="password" value={passwords.old} onChange={e => setPasswords(p => ({ ...p, old: e.target.value }))} placeholder="••••••••" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, ...rowStyle }}>
            <div>
              <label style={labelStyle}>Nové heslo:</label>
              <Win98Input type="password" value={passwords.new1} onChange={e => setPasswords(p => ({ ...p, new1: e.target.value }))} placeholder="••••••••" />
            </div>
            <div>
              <label style={labelStyle}>Potvrdiť:</label>
              <Win98Input type="password" value={passwords.new2} onChange={e => setPasswords(p => ({ ...p, new2: e.target.value }))} placeholder="••••••••" />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
            <Win98Button type="submit" disabled={pwLoading}>{pwLoading ? "Mením..." : "🔑 Zmeniť heslo"}</Win98Button>
          </div>
        </Win98Panel>
      </form>

      {/* Danger zone */}
      <Win98Panel label="⚠️ Nebezpečná zóna" style={{ borderColor: "#ff0000" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "6px 0", borderBottom: "1px solid #e0e0e0",
        }}>
          <div>
            <div style={{ fontWeight: 700 }}>Resetovať lokálne dáta</div>
            <div style={{ fontSize: "11px", color: W98.grayText }}>Drafty, nastavenia — nenávratné</div>
          </div>
          <Win98Button onClick={resetData} style={{ color: "#ff0000" }}>Resetovať</Win98Button>
        </div>
      </Win98Panel>
    </div>
  );
};
