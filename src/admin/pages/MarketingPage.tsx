import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Copy, Save, Loader2, Trash2, Check } from "lucide-react";
import { toast } from "sonner";

type ContentType = "instagram" | "linkedin" | "facebook" | "blog" | "email" | "ad" | "web";
type Division = "security" | "digital" | "both";
type Tone = "profesionálny" | "neformálny" | "dôrazný" | "príbehový";

interface Draft {
  id: string;
  type: ContentType;
  division: Division;
  content: string;
  date: string;
}

const SYSTEM_PROMPT = `You are a marketing assistant for COK Tech, a Slovak tech company run by Bruno Cok.

Company has two divisions:
1. Security Systems — camera installation, alarm systems, access control
2. Digital — web development, mobile apps, e-shops

Brand voice: confident, direct, modern Slovak startup. No corporate speak. No buzzwords.
Write in Slovak unless asked otherwise.`;

const contentTypes: { id: ContentType; label: string; icon: string }[] = [
  { id: "instagram", label: "Instagram post", icon: "📱" },
  { id: "linkedin", label: "LinkedIn post", icon: "💼" },
  { id: "facebook", label: "Facebook post", icon: "📘" },
  { id: "blog", label: "Blog článok", icon: "✍️" },
  { id: "email", label: "Email kampaň", icon: "📧" },
  { id: "ad", label: "Reklamný text", icon: "📣" },
  { id: "web", label: "Web copy sekcia", icon: "🌐" },
];

const platformGuidelines: Record<ContentType, string> = {
  instagram: "Max 2200 znakov. Použi 5-10 relevantných hashtagov na konci. Prvý riadok musí byť chytľavý.",
  linkedin: "Profesionálny tón. Max 3000 znakov. Žiadny spam hashtagov.",
  facebook: "Priateľský tón. Max 1000 znakov. Jednoduchý jazyk.",
  blog: "Min 500 slov. Použi H2 nadpisy. SEO-friendly. Slovenský jazyk.",
  email: "Najprv predmet emailu (Subject:), potom telo. Jasná výzva na akciu na konci.",
  ad: "Krátko a výrazne. Max 150 znakov. Silná výzva na akciu.",
  web: "Jasný headline, podnadpis, 3 benefity, CTA.",
};

export const MarketingPage = () => {
  const [contentType, setContentType] = useState<ContentType>("instagram");
  const [division, setDivision] = useState<Division>("both");
  const [brief, setBrief] = useState("");
  const [tone, setTone] = useState<Tone>("profesionálny");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>(() => {
    try { return JSON.parse(localStorage.getItem("coktech_marketing_drafts") || "[]"); } catch { return []; }
  });

  const divisionLabel = division === "security" ? "Security (kamery, alarmy)" :
    division === "digital" ? "Digital (web, aplikácie)" : "obe divízie";

  const generate = async () => {
    if (!brief.trim()) { toast.error("Zadaj brief/tému"); return; }
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) { toast.error("VITE_ANTHROPIC_API_KEY nie je nastavený v .env"); return; }

    setGenerating(true);
    setGenerated("");

    try {
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
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: [{
            role: "user",
            content: `Vytvor ${contentTypes.find(c => c.id === contentType)?.label} pre ${divisionLabel}.
Tón: ${tone}
Brief: ${brief}

${platformGuidelines[contentType]}`,
          }],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || `HTTP ${res.status}`);
      }
      const text = data?.content?.[0]?.text;
      if (!text) throw new Error("Prázdna odpoveď od API");
      setGenerated(text);
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

  const cardStyle = { background: "#141414" };
  const tones: Tone[] = ["profesionálny", "neformálny", "dôrazný", "príbehový"];

  return (
    <div className="max-w-6xl space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generator */}
        <div className="rounded-xl border border-white/5 p-6 space-y-5" style={cardStyle}>
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Bot size={18} className="text-[#00FF94]" /> Generátor obsahu
          </h2>

          {/* Content type */}
          <div>
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Čo chceš vytvoriť?</p>
            <div className="flex flex-wrap gap-2">
              {contentTypes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setContentType(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    contentType === c.id
                      ? "bg-[#00FF94]/10 text-[#00FF94] border-[#00FF94]/30"
                      : "bg-white/5 text-zinc-400 border-white/5 hover:border-white/10"
                  }`}
                >
                  <span>{c.icon}</span> {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Division */}
          <div>
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Pre ktorú divíziu?</p>
            <div className="flex gap-2">
              {(["security", "digital", "both"] as Division[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDivision(d)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    division === d
                      ? "bg-[#00FF94]/10 text-[#00FF94] border-[#00FF94]/30"
                      : "bg-white/5 text-zinc-400 border-white/5 hover:border-white/10"
                  }`}
                >
                  {d === "security" ? "🔒 Security" : d === "digital" ? "💻 Digital" : "🏢 Obe"}
                </button>
              ))}
            </div>
          </div>

          {/* Brief */}
          <div>
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Téma / brief</p>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={4}
              placeholder="Napr. Chcem post o výhodách kamerových systémov pre malé firmy..."
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

          <button
            onClick={generate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-black bg-[#00FF94] hover:bg-[#00FF94]/90 disabled:opacity-60 transition-all"
          >
            {generating ? (
              <><Loader2 size={16} className="animate-spin" /> Agent premýšľa...</>
            ) : (
              <><Bot size={16} /> Generovať obsah</>
            )}
          </button>
        </div>

        {/* Result */}
        <div className="rounded-xl border border-white/5 p-6 flex flex-col" style={cardStyle}>
          <h2 className="text-white font-semibold mb-4">Vygenerovaný obsah</h2>
          <AnimatePresence mode="wait">
            {generating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="w-10 h-10 border-2 border-[#00FF94]/20 border-t-[#00FF94] rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-zinc-500 text-sm">Agent premýšľa...</p>
                </div>
              </motion.div>
            ) : generated ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col flex-1"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-zinc-500">{generated.length} znakov</span>
                  <div className="flex gap-2">
                    <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5 transition-all">
                      {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Skopírované" : "Kopírovať"}
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
                  <p className="text-zinc-600 text-sm">Vyplň formulár a stlač Generovať</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Drafts */}
      {drafts.length > 0 && (
        <div>
          <h2 className="text-white font-semibold mb-4">Uložené koncepty ({drafts.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drafts.map((d) => (
              <div key={d.id} className="rounded-xl border border-white/5 p-4" style={cardStyle}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[#00FF94] bg-[#00FF94]/10 px-2 py-0.5 rounded-full">
                    {contentTypes.find(c => c.id === d.type)?.icon} {contentTypes.find(c => c.id === d.type)?.label}
                  </span>
                  <button onClick={() => deleteDraft(d.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-zinc-400 text-xs line-clamp-3 mb-3">{d.content}</p>
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
