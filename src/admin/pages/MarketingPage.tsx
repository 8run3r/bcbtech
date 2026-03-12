import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Copy, Save, Loader2, Trash2, Check, Globe, Zap, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type ContentType = "instagram" | "linkedin" | "facebook" | "email" | "ad" | "web";
type Division = "security" | "digital" | "both";
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
1. Security Systems — montáž kamerových systémov, alarmy, sieťová infraštruktúra
2. Digital — webové aplikácie, e-shopy, UI/UX dizajn, AI riešenia

Štýl značky: sebavedomý, priamy, moderný slovenský startup. Žiadne firemné frázy. Žiadne buzzwordy.
Píš po slovensky pokiaľ nie je povedané inak.`;

const contentTypes: { id: ContentType; label: string; char: number | null; hint: string }[] = [
  { id: "instagram", label: "Instagram",  char: 2200, hint: "5–10 hashtagov na konci, prvý riadok chytľavý" },
  { id: "linkedin",  label: "LinkedIn",   char: 3000, hint: "Profesionálny, bez spamu hashtagov" },
  { id: "facebook",  label: "Facebook",   char: 1000, hint: "Priateľský tón, jednoduchý jazyk" },
  { id: "email",     label: "Email",      char: null,  hint: "Začni Subject:, jasná CTA na konci" },
  { id: "ad",        label: "Reklama",    char: 150,   hint: "Krátko a výrazne, silná výzva" },
  { id: "web",       label: "Web copy",   char: null,  hint: "Headline, podnadpis, 3 benefity, CTA" },
];

// Quick brief templates per division
const quickTemplates: Record<Division, { label: string; brief: string }[]> = {
  security: [
    { label: "Nová inštalácia", brief: "Práve sme dokončili montáž kamerového systému u klienta. Chcem sa pochváliť a ukázať výsledok." },
    { label: "Tip: ochrana firmy", brief: "Tip pre podnikateľov — prečo je kamerový systém investícia, nie náklad." },
    { label: "Pred & po", brief: "Príspevok o transformácii zabezpečenia skladu/prevádzkarne pred a po inštalácii." },
    { label: "Nočné videnie", brief: "Ukážem schopnosti nočného videnia a AI detekcie pohybu našich IP kamier." },
  ],
  digital: [
    { label: "Web projekt live", brief: "Spustili sme nový web pre klienta. Chcem ukázať výsledok a povedať čo sme riešili." },
    { label: "Tip: rýchlosť webu", brief: "Tip pre podnikateľov — prečo rýchlosť webu priamo ovplyvňuje predaje." },
    { label: "AI automatizácia", brief: "Ako sme klientovi ušetrili hodiny práce denne pomocou AI automatizácie." },
    { label: "UI/UX proces", brief: "Zákulisie nášho dizajnového procesu — od wireframe po hotový produkt." },
  ],
  both: [
    { label: "O firme", brief: "COK Tech — čo robíme a prečo sme iní ako ostatné agentúry." },
    { label: "Príbeh zakladateľa", brief: "Príbeh ako som začal podnikať s kombináciou digitálu a bezpečnostných systémov." },
    { label: "Klient: referencie", brief: "Spokojný klient hovorí o spolupráci — chcem to pretaviť do príspevku." },
    { label: "Prečo nás vybrať", brief: "Dôvody prečo si firmy vyberajú COK Tech namiesto väčších agentúr." },
  ],
};

const RSS_FEEDS: Record<Division, { url: string; label: string }> = {
  security: { url: "https://feeds.feedburner.com/TheHackersNews", label: "Hacker News Security" },
  digital:  { url: "https://techcrunch.com/feed/", label: "TechCrunch" },
  both:     { url: "https://news.ycombinator.com/rss", label: "Hacker News" },
};

const platformGuidelines: Record<ContentType, string> = {
  instagram: "Max 2200 znakov. Použi 5–10 relevantných hashtagov na konci. Prvý riadok musí byť chytľavý hook.",
  linkedin:  "Profesionálny tón. Max 3000 znakov. Žiadny spam hashtagov. Structured storytelling.",
  facebook:  "Priateľský tón. Max 1000 znakov. Jednoduchý jazyk. Emoji je OK.",
  email:     "Prvý riadok: Subject: [text predmetu]\nPotom prázdny riadok a telo emailu. Jasná výzva na akciu na konci.",
  ad:        "Krátko a výrazne. Max 150 znakov. Silná výzva na akciu. Môže byť viac verzií.",
  web:       "Jasný headline (H1), podnadpis (max 2 vety), 3 benefity (odrážky), CTA tlačidlo text.",
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

  const fetchWorldContext = async (): Promise<string> => {
    try {
      const feed = RSS_FEEDS[division];
      const res = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&count=5`
      );
      const data = await res.json();
      if (!data?.items?.length) return "";
      const headlines = data.items
        .slice(0, 5)
        .map((item: any, i: number) => `${i + 1}. ${item.title}`)
        .join("\n");
      return `\n\nAktuálne správy zo sveta (${feed.label}) pre inšpiráciu:\n${headlines}`;
    } catch {
      return "";
    }
  };

  const generate = async () => {
    if (!brief.trim()) { toast.error("Zadaj brief alebo vyber šablónu"); return; }
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) { toast.error("VITE_ANTHROPIC_API_KEY nie je nastavený"); return; }

    setGenerating(true);
    setVariations([]);
    setActiveVar(0);

    try {
      const worldContext = useWorldContext ? await fetchWorldContext() : "";
      const divisionLabel = division === "security" ? "Security (kamery, alarmy, sieťová infraštruktúra)" :
        division === "digital" ? "Digital (web, aplikácie, AI, dizajn)" : "obe divízie COK Tech";

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          system: SYSTEM_PROMPT,
          messages: [{
            role: "user",
            content: `Vytvor 3 rôzne verzie ${currentType.label} príspevku pre ${divisionLabel}.
Tón: ${tone}
Brief: ${brief}
${worldContext}

Pokyny pre platformu: ${platformGuidelines[contentType]}

Oddeľ verzie presne takto:
--- VERZIA 1 ---
[text]
--- VERZIA 2 ---
[text]
--- VERZIA 3 ---
[text]`,
          }],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
      const text = data?.content?.[0]?.text;
      if (!text) throw new Error("Prázdna odpoveď od API");

      // Parse 3 variations
      const parts = text.split(/---\s*VERZIA\s+\d+\s*---/).map((s: string) => s.trim()).filter(Boolean);
      setVariations(parts.length >= 2 ? parts : [text]);
      setActiveVar(0);
    } catch (e: any) {
      toast.error("Chyba: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    toast.success("Skopírované!");
    setTimeout(() => setCopied(false), 2000);
  };

  const saveDraft = () => {
    const draft: Draft = {
      id: Date.now().toString(),
      type: contentType,
      division,
      content: generated,
      date: new Date().toISOString(),
    };
    const updated = [draft, ...drafts];
    setDrafts(updated);
    localStorage.setItem("coktech_marketing_drafts", JSON.stringify(updated));
    toast.success("Uložené ako koncept");
  };

  const deleteDraft = (id: string) => {
    const updated = drafts.filter((d) => d.id !== id);
    setDrafts(updated);
    localStorage.setItem("coktech_marketing_drafts", JSON.stringify(updated));
  };

  const charCount = generated.length;
  const charLimit = currentType.char;
  const overLimit = charLimit ? charCount > charLimit : false;

  const cardStyle = { background: "#141414" };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── LEFT: Generator ── */}
        <div className="rounded-xl border border-white/5 p-6 space-y-5" style={cardStyle}>
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Bot size={18} className="text-[#00FF94]" /> AI Marketing Agent
          </h2>

          {/* Platform */}
          <div>
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Platforma</p>
            <div className="flex flex-wrap gap-2">
              {contentTypes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setContentType(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    contentType === c.id
                      ? "bg-[#00FF94]/10 text-[#00FF94] border-[#00FF94]/30"
                      : "bg-white/5 text-zinc-400 border-white/5 hover:border-white/10"
                  }`}
                >
                  {c.label}
                  {c.char && <span className="ml-1 opacity-40">{c.char}</span>}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-600 mt-1.5">{currentType.hint}</p>
          </div>

          {/* Division */}
          <div>
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Divízia</p>
            <div className="flex gap-2">
              {(["security", "digital", "both"] as Division[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDivision(d)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ${
                    division === d
                      ? "bg-[#00FF94]/10 text-[#00FF94] border-[#00FF94]/30"
                      : "bg-white/5 text-zinc-400 border-white/5 hover:border-white/10"
                  }`}
                >
                  {d === "security" ? "Kamery" : d === "digital" ? "Digital" : "Obe"}
                </button>
              ))}
            </div>
          </div>

          {/* Quick templates */}
          <div>
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Rýchle šablóny</p>
            <div className="flex flex-wrap gap-1.5">
              {quickTemplates[division].map((t) => (
                <button
                  key={t.label}
                  onClick={() => setBrief(t.brief)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium border border-white/8 bg-white/4 text-zinc-400 hover:text-white hover:border-white/15 transition-all"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brief */}
          <div>
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Brief</p>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={3}
              placeholder="Čo chceš povedať? Popis situácie, cieľ príspevku..."
              className="w-full bg-white/5 border border-white/5 focus:border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-colors resize-none"
            />
          </div>

          {/* Tone */}
          <div>
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Tón</p>
            <div className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${
                    tone === t
                      ? "bg-[#00FF94]/10 text-[#00FF94] border-[#00FF94]/30"
                      : "bg-white/5 text-zinc-400 border-white/5 hover:border-white/10"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* World context toggle */}
          <button
            onClick={() => setUseWorldContext(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border w-full transition-all ${
              useWorldContext
                ? "bg-blue-500/10 text-blue-400 border-blue-500/25"
                : "bg-white/5 text-zinc-500 border-white/5 hover:border-white/10"
            }`}
          >
            <Globe size={13} />
            {useWorldContext ? "Kontext zo sveta zapnutý — agent načíta aktuálne správy" : "Pridať kontext z aktuálneho diania vo svete"}
          </button>

          <button
            onClick={generate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-black bg-[#00FF94] hover:bg-[#00FF94]/90 disabled:opacity-60 transition-all"
          >
            {generating ? (
              <><Loader2 size={16} className="animate-spin" /> Agent generuje 3 verzie...</>
            ) : (
              <><Zap size={16} /> Generovať 3 verzie</>
            )}
          </button>
        </div>

        {/* ── RIGHT: Result ── */}
        <div className="rounded-xl border border-white/5 p-6 flex flex-col min-h-[400px]" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Vygenerovaný obsah</h2>
            {variations.length > 1 && (
              <div className="flex gap-1">
                {variations.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveVar(i)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                      activeVar === i
                        ? "bg-[#00FF94] text-black"
                        : "bg-white/5 text-zinc-400 hover:bg-white/10"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {generating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="w-10 h-10 border-2 border-[#00FF94]/20 border-t-[#00FF94] rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-zinc-500 text-sm">Generujem 3 verzie{useWorldContext ? " + načítavam správy" : ""}…</p>
                </div>
              </motion.div>
            ) : generated ? (
              <motion.div
                key={`result-${activeVar}`}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col flex-1"
              >
                {/* Actions row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${overLimit ? "text-red-400" : "text-zinc-500"}`}>
                      {charCount.toLocaleString()}{charLimit ? ` / ${charLimit.toLocaleString()}` : ""} znakov
                    </span>
                    {overLimit && <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">Nad limit</span>}
                  </div>
                  <div className="flex gap-2">
                    {variations.length > 1 && (
                      <button onClick={generate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-zinc-400 hover:bg-white/10 border border-white/5 transition-all">
                        <RefreshCw size={11} /> Znova
                      </button>
                    )}
                    <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5 transition-all">
                      {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "OK" : "Kopírovať"}
                    </button>
                    <button onClick={saveDraft} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#00FF94]/10 text-[#00FF94] hover:bg-[#00FF94]/20 border border-[#00FF94]/20 transition-all">
                      <Save size={12} /> Uložiť
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-white/5 rounded-xl p-4 overflow-y-auto">
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{generated}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="text-center">
                  <Bot size={40} className="mx-auto text-zinc-700 mb-3" />
                  <p className="text-zinc-600 text-sm">Vyber platformu, zadaj brief a klikni Generovať</p>
                  <p className="text-zinc-700 text-xs mt-1">Agent vytvorí 3 verzie naraz</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Drafts ── */}
      {drafts.length > 0 && (
        <div>
          <h2 className="text-white font-semibold mb-4">Uložené koncepty ({drafts.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drafts.map((d) => (
              <div key={d.id} className="rounded-xl border border-white/5 p-4" style={cardStyle}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[#00FF94] bg-[#00FF94]/10 px-2 py-0.5 rounded-full">
                    {contentTypes.find(c => c.id === d.type)?.label}
                  </span>
                  <button onClick={() => deleteDraft(d.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-zinc-400 text-xs line-clamp-4 mb-3 leading-relaxed">{d.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-600">
                    {new Date(d.date).toLocaleDateString("sk-SK")}
                  </span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(d.content); toast.success("Skopírované!"); }}
                    className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Copy size={10} /> Kopírovať
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
