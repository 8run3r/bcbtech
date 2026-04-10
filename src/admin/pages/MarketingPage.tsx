import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Copy, Save, Loader2, Trash2, Check, Globe, Zap, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { callAI } from "@/lib/ai-client";
import {
  W98, raised, sunken,
  Win98Button, Win98Panel, Win98Textarea, Win98Window, Win98Progress, Win98Select,
} from "../win98";

type ContentType = "instagram" | "linkedin" | "facebook" | "email" | "ad" | "web";
type Division = "automation" | "digital" | "both";
type Tone = "profesionálny" | "neformálny" | "dôrazný" | "príbehový";

interface Draft {
  id: string;
  type: ContentType;
  division: Division;
  content: string;
  date: string;
}

const SYSTEM_PROMPT = `Si marketingový asistent pre COK Tech — slovenská tech firma vedená Brunom Cokom.

Firma má dve divízie:
1. Digital — webové aplikácie, e-shopy, UI/UX dizajn
2. Automation — AI automatizácia, n8n/Make workflow-y, custom AI agenti

Štýl značky: sebavedomý, priamy, moderný slovenský startup. Žiadne firemné frázy. Žiadne buzzwordy.
Píš po slovensky pokiaľ nie je povedané inak.`;

const contentTypes: { id: ContentType; label: string; char: number | null; hint: string }[] = [
  { id: "instagram", label: "Instagram", char: 2200, hint: "5–10 hashtagov, chytľavý hook" },
  { id: "linkedin", label: "LinkedIn", char: 3000, hint: "Profesionálny, bez spam hashtagov" },
  { id: "facebook", label: "Facebook", char: 1000, hint: "Priateľský tón" },
  { id: "email", label: "Email", char: null, hint: "Subject: + telo + CTA" },
  { id: "ad", label: "Reklama", char: 150, hint: "Krátko a výrazne" },
  { id: "web", label: "Web copy", char: null, hint: "Headline, benefity, CTA" },
];

const quickTemplates: Record<Division, { label: string; brief: string }[]> = {
  automation: [
    { label: "Nový workflow", brief: "Práve sme nasadili automatizáciu pre klienta — ušetrili sme mu hodiny denne." },
    { label: "Tip: AI agent", brief: "Tip pre podnikateľov — ako AI agent dokáže nahradiť 3 manuálne procesy vo firme." },
    { label: "Pred & po", brief: "Príspevok o transformácii procesov klienta pred a po nasadení automatizácie." },
  ],
  digital: [
    { label: "Web projekt live", brief: "Spustili sme nový web pre klienta. Chcem ukázať výsledok." },
    { label: "Tip: rýchlosť webu", brief: "Tip pre podnikateľov — prečo rýchlosť webu priamo ovplyvňuje predaje." },
    { label: "UI/UX proces", brief: "Zákulisie nášho dizajnového procesu — od wireframe po hotový produkt." },
  ],
  both: [
    { label: "O firme", brief: "COK Tech — čo robíme a prečo sme iní ako ostatné agentúry." },
    { label: "Príbeh zakladateľa", brief: "Príbeh ako som začal podnikať s kombináciou web developmentu a AI." },
    { label: "Prečo nás vybrať", brief: "Dôvody prečo si firmy vyberajú COK Tech." },
  ],
};

const platformGuidelines: Record<ContentType, string> = {
  instagram: "Max 2200 znakov. 5–10 hashtagov na konci. Prvý riadok hook.",
  linkedin: "Max 3000 znakov. Profesionálny. Žiadny spam hashtagov.",
  facebook: "Max 1000 znakov. Priateľský. Emoji OK.",
  email: "Subject: [predmet]\\nTelo emailu. CTA na konci.",
  ad: "Max 150 znakov. Silná výzva. Viac verzií.",
  web: "Headline (H1), podnadpis, 3 benefity, CTA text.",
};

export const MarketingPage = () => {
  const [contentType, setContentType] = useState<ContentType>("instagram");
  const [division, setDivision] = useState<Division>("both");
  const [brief, setBrief] = useState("");
  const [tone, setTone] = useState<Tone>("profesionálny");
  const [useWorldContext, setUseWorldContext] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);
  const [activeVar, setActiveVar] = useState(0);
  const [copied, setCopied] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>(() => {
    try { return JSON.parse(localStorage.getItem("coktech_marketing_drafts") || "[]"); } catch { return []; }
  });

  const tones: Tone[] = ["profesionálny", "neformálny", "dôrazný", "príbehový"];
  const currentType = contentTypes.find(c => c.id === contentType)!;
  const generated = variations[activeVar] ?? "";

  const generate = async () => {
    if (!brief.trim()) { toast.error("Zadaj brief"); return; }
    setGenerating(true); setVariations([]); setActiveVar(0);

    try {
      const divisionLabel = division === "automation" ? "Automation" : division === "digital" ? "Digital" : "obe divízie";
      const data = await callAI({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{
          role: "user",
          content: `Vytvor 3 rôzne verzie ${currentType.label} príspevku pre ${divisionLabel}.
Tón: ${tone}
Brief: ${brief}

Pokyny: ${platformGuidelines[contentType]}

Oddeľ verzie:
--- VERZIA 1 ---
[text]
--- VERZIA 2 ---
[text]
--- VERZIA 3 ---
[text]`,
        }],
      });

      const text = data?.content?.[0]?.text;
      if (!text) throw new Error("Prázdna odpoveď");
      const parts = text.split(/---\s*VERZIA\s+\d+\s*---/).map((s: string) => s.trim()).filter(Boolean);
      setVariations(parts.length >= 2 ? parts : [text]);
    } catch (e: any) {
      toast.error("Chyba: " + e.message);
    } finally { setGenerating(false); }
  };

  const copy = () => { navigator.clipboard.writeText(generated); setCopied(true); toast.success("Skopírované!"); setTimeout(() => setCopied(false), 2000); };

  const saveDraft = () => {
    const draft: Draft = { id: Date.now().toString(), type: contentType, division, content: generated, date: new Date().toISOString() };
    const updated = [draft, ...drafts];
    setDrafts(updated);
    localStorage.setItem("coktech_marketing_drafts", JSON.stringify(updated));
    toast.success("Uložené");
  };

  const deleteDraft = (id: string) => {
    const updated = drafts.filter((d) => d.id !== id);
    setDrafts(updated);
    localStorage.setItem("coktech_marketing_drafts", JSON.stringify(updated));
  };

  return (
    <div style={{ fontFamily: W98.font, fontSize: "12px", color: W98.black }}>
      {/* Header */}
      <div style={{ boxShadow: raised, background: W98.bg, padding: "8px 12px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "20px" }}>🤖</span>
        <span style={{ fontWeight: 700 }}>AI Marketing Agent — Generátor obsahu</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {/* Left: Generator */}
        <Win98Panel label="Generátor">
          {/* Platform */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Platforma:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {contentTypes.map((c) => (
                <Win98Button
                  key={c.id}
                  small
                  active={contentType === c.id}
                  onClick={() => setContentType(c.id)}
                >
                  {c.label}
                </Win98Button>
              ))}
            </div>
            <div style={{ fontSize: "10px", color: W98.grayText, marginTop: 2 }}>{currentType.hint}</div>
          </div>

          {/* Division */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Divízia:</div>
            <div style={{ display: "flex", gap: 2 }}>
              {(["automation", "digital", "both"] as Division[]).map((d) => (
                <Win98Button key={d} small active={division === d} onClick={() => setDivision(d)}>
                  {d === "automation" ? "Automatizácia" : d === "digital" ? "Digital" : "Obe"}
                </Win98Button>
              ))}
            </div>
          </div>

          {/* Quick templates */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Šablóny:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {quickTemplates[division].map((t) => (
                <Win98Button key={t.label} small onClick={() => setBrief(t.brief)}>
                  {t.label}
                </Win98Button>
              ))}
            </div>
          </div>

          {/* Brief */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Brief:</div>
            <Win98Textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={3} placeholder="Čo chceš povedať?" />
          </div>

          {/* Tone */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Tón:</div>
            <div style={{ display: "flex", gap: 2 }}>
              {tones.map((t) => (
                <Win98Button key={t} small active={tone === t} onClick={() => setTone(t)}>
                  {t}
                </Win98Button>
              ))}
            </div>
          </div>

          <Win98Button onClick={generate} disabled={generating} style={{ width: "100%" }}>
            {generating ? "⏳ Agent generuje 3 verzie..." : "▶ Generovať 3 verzie"}
          </Win98Button>
        </Win98Panel>

        {/* Right: Output */}
        <Win98Panel label="Vygenerovaný obsah">
          {/* Version tabs */}
          {variations.length > 1 && (
            <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
              {variations.map((_, i) => (
                <Win98Button key={i} small active={activeVar === i} onClick={() => setActiveVar(i)}>
                  Verzia {i + 1}
                </Win98Button>
              ))}
            </div>
          )}

          {generating ? (
            <div style={{ textAlign: "center", padding: 30 }}>
              <Win98Progress value={55} style={{ width: 200, margin: "0 auto 8px" }} />
              <p style={{ color: W98.grayText }}>Generujem 3 verzie...</p>
            </div>
          ) : generated ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: "10px", color: currentType.char && generated.length > currentType.char ? "#ff0000" : W98.grayText }}>
                  {generated.length}{currentType.char ? ` / ${currentType.char}` : ""} znakov
                </span>
                <div style={{ display: "flex", gap: 2 }}>
                  <Win98Button small onClick={generate}>🔄</Win98Button>
                  <Win98Button small onClick={copy}>{copied ? "✅" : "📋"}</Win98Button>
                  <Win98Button small onClick={saveDraft}>💾</Win98Button>
                </div>
              </div>
              <div style={{ boxShadow: sunken, background: W98.fieldBg, padding: 8, whiteSpace: "pre-wrap", lineHeight: 1.5, maxHeight: 300, overflow: "auto" }}>
                {generated}
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: 40, color: W98.grayText }}>
              <Bot size={32} style={{ margin: "0 auto 8px", display: "block" }} />
              <p>Vyber platformu, zadaj brief</p>
              <p>a klikni Generovať</p>
            </div>
          )}
        </Win98Panel>
      </div>

      {/* Drafts */}
      {drafts.length > 0 && (
        <Win98Panel label={`Uložené koncepty (${drafts.length})`} style={{ marginTop: 12 }}>
          <div style={{ boxShadow: sunken, background: W98.fieldBg }}>
            {/* Header */}
            <div style={{
              display: "grid", gridTemplateColumns: "80px 1fr 80px 60px",
              gap: 8, padding: "4px 8px", borderBottom: "1px solid #c0c0c0",
              background: W98.bg, fontWeight: 700, fontSize: "11px",
            }}>
              <span>Platforma</span>
              <span>Obsah</span>
              <span>Dátum</span>
              <span></span>
            </div>
            {drafts.map((d) => (
              <div key={d.id} style={{
                display: "grid", gridTemplateColumns: "80px 1fr 80px 60px",
                gap: 8, padding: "3px 8px", fontSize: "11px",
                borderBottom: "1px solid #f0f0f0",
              }}>
                <span style={{ fontWeight: 700 }}>{contentTypes.find(c => c.id === d.type)?.label}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.content.slice(0, 60)}...</span>
                <span style={{ color: W98.grayText }}>{new Date(d.date).toLocaleDateString("sk-SK")}</span>
                <div style={{ display: "flex", gap: 2 }}>
                  <Win98Button small onClick={() => { navigator.clipboard.writeText(d.content); toast.success("Skopírované!"); }}>📋</Win98Button>
                  <Win98Button small onClick={() => deleteDraft(d.id)}>🗑️</Win98Button>
                </div>
              </div>
            ))}
          </div>
        </Win98Panel>
      )}
    </div>
  );
};
