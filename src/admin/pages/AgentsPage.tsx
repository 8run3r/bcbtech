import { useState, useEffect } from "react";
import { Bot, Zap, Globe, Mail, PenTool, Code, BarChart2, Headphones, Database, Clock, Search, TrendingUp, Layers, Monitor, ShoppingCart, Utensils, Home, Heart, Cpu, Store, Wrench } from "lucide-react";
import { toast } from "sonner";
import { callAI } from "@/lib/ai-client";
import {
  saveDraft, loadDrafts, deleteDraft, sendEmail, postSocial, notify, triggerN8n,
  type AgentDraft, type SocialPlatform, type NotifyChannel,
} from "@/lib/integrations";
import {
  W98, raised, sunken,
  Win98Button, Win98Panel, Win98Textarea, Win98Window, Win98Progress, Win98Input,
} from "../win98";

interface Agent {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  systemPrompt: string;
  placeholder: string;
  category: "marketing" | "development" | "operations" | "sales";
  defaultActions: ActionType[];
  packages?: string[];
}

type ActionType = "save" | "email" | "instagram" | "linkedin" | "facebook" | "slack" | "discord" | "n8n";

// ── Client types ──────────────────────────────────────────────────────────────
interface ClientType {
  id: string;
  label: string;
  icon: React.ReactNode;
  context: string;
}

const CLIENT_TYPES: ClientType[] = [
  { id: "general",       label: "Všeobecný",        icon: <Bot size={12} />,          context: "" },
  { id: "ecommerce",     label: "E-commerce",        icon: <ShoppingCart size={12} />, context: "Klient prevádzkuje online obchod (e-shop). Zameriavaj sa na konverzie, product descriptions, cart abandonment, up-sell/cross-sell, sezónne kampane." },
  { id: "gastro",        label: "Gastro / Reštaurácia", icon: <Utensils size={12} />, context: "Klient prevádzkuje reštauráciu, kaviareň alebo catering. Zameriavaj sa na miestne SEO, Instagram food content, rezervácie, menu aktualizácie, akcie." },
  { id: "realEstate",    label: "Nehnuteľnosti",      icon: <Home size={12} />,        context: "Klient je realitný maklér alebo developer. Zameriavaj sa na property listings, lead generation pre kupujúcich/predávajúcich, virtuálne prehliadky, Facebook/Instagram Ads." },
  { id: "health",        label: "Zdravotníctvo",      icon: <Heart size={12} />,       context: "Klient pôsobí v zdravotníctve, wellness alebo beauty (klinika, fyzioterapeut, kozmetika). Zameriavaj sa na dôveru, odbornosť, GDPR, online rezervácie, recenzie." },
  { id: "saas",          label: "IT / SaaS / Startup", icon: <Cpu size={12} />,        context: "Klient je tech startup alebo SaaS firma. Zameriavaj sa na product-led growth, developer marketing, LinkedIn thought leadership, onboarding flows, technical copywriting." },
  { id: "retail",        label: "Retail / Maloobchod", icon: <Store size={12} />,      context: "Klient má kamenný obchod alebo lokálny retail. Zameriavaj sa na Google Business, lokálne kampane, vernostné programy, sezónne akcie, kombináciu online-offline." },
  { id: "service",       label: "Servisná firma",      icon: <Wrench size={12} />,     context: "Klient ponúka servisné služby (remeselníci, inštalatéri, elektrikári, upratovanie, logistika). Zameriavaj sa na lokálne SEO, Booking.com/Google Ads, referencie, rýchle CTA." },
];

// ── Package → Agent mapping ───────────────────────────────────────────────────
const PACKAGE_AGENT_MAP: Record<string, { agents: string[]; description: string; color: string }> = {
  web: {
    agents: ["copywriter", "seo-agent", "code-reviewer", "support-agent"],
    description: "Web projekty: copywriting, SEO, code review, klientska podpora",
    color: "#00ffaa",
  },
  automation: {
    agents: ["automation-consultant", "code-reviewer", "support-agent"],
    description: "Automatizácia: návrh workflow-ov, code review, technická podpora",
    color: "#FF8C00",
  },
  marketing: {
    agents: ["social-media", "email-writer", "copywriter", "seo-agent", "lead-generator"],
    description: "Marketing: social media, email kampane, copy, SEO, lead gen",
    color: "#ff3d71",
  },
  hybrid: {
    agents: ["social-media", "copywriter", "seo-agent", "automation-consultant", "code-reviewer", "lead-generator", "competitor-analyst"],
    description: "Hybrid: všetci agenti pre komplexné projekty",
    color: "#4a9eff",
  },
};

const AGENTS: Agent[] = [
  {
    id: "social-media",
    name: "Social Media Agent",
    icon: <Globe size={16} />,
    description: "Instagram, LinkedIn, Facebook príspevky. Hashtagy, CTA, rôzne tóny.",
    color: "#000080",
    category: "marketing",
    defaultActions: ["save", "instagram", "linkedin", "facebook", "slack"],
    packages: ["marketing", "hybrid"],
    systemPrompt: `Si social media agent pre COK Tech — slovenský tech startup (web + AI automatizácia).
Píš príspevky v slovenčine. Buď sebavedomý, priamy, moderný. Žiadne firemné frázy.
Vždy pridaj relevantné hashtagy. Prvý riadok musí byť chytľavý hook.`,
    placeholder: "O čom má byť príspevok? Napr. 'Spustili sme nový web pre klienta...'",
  },
  {
    id: "email-writer",
    name: "Email Agent",
    icon: <Mail size={16} />,
    description: "Odpovede klientom, follow-upy, cold outreach, newsletter.",
    color: "#800000",
    category: "marketing",
    defaultActions: ["save", "email", "slack"],
    packages: ["marketing", "hybrid"],
    systemPrompt: `Si email agent pre COK Tech. Píšeš profesionálne emaily v slovenčine.
Začni Subject: riadkom. Buď stručný, priamy, max 5-7 viet. Vždy zakonči jasnou CTA.
Podpisuj sa ako Bruno Cok, COK Tech.`,
    placeholder: "Komu a o čom? Napr. 'Odpoveď pre klienta Jána o cene webu...'",
  },
  {
    id: "copywriter",
    name: "Copywriter Agent",
    icon: <PenTool size={16} />,
    description: "Web copy, landing pages, popisy služieb, headlines, reklamy.",
    color: "#800080",
    category: "marketing",
    defaultActions: ["save", "slack", "n8n"],
    packages: ["web", "marketing", "hybrid"],
    systemPrompt: `Si copywriter agent pre COK Tech. Píšeš marketingové texty v slovenčine.
Štýl: moderný, priamy, sebavedomý. Žiadne klišé. Krátke vety.
Formát podľa zadania — headlines, benefity, CTA, celé sekcie.`,
    placeholder: "Aký text potrebuješ? Napr. 'Headline a 3 benefity pre AI automatizáciu...'",
  },
  {
    id: "seo-agent",
    name: "SEO Agent",
    icon: <BarChart2 size={16} />,
    description: "Meta tagy, keywords, SEO analýza, content optimization.",
    color: "#008000",
    category: "marketing",
    defaultActions: ["save", "n8n"],
    packages: ["web", "marketing", "hybrid"],
    systemPrompt: `Si SEO expert agent pre COK Tech. Pomáhaš s optimalizáciou obsahu pre vyhľadávače.
Navrhuj meta title (max 60 znakov), meta description (max 155 znakov), keywords.
Analyzuj obsah a navrhni zlepšenia. Odpovede v slovenčine.`,
    placeholder: "Čo optimalizovať? Napr. 'Meta tagy pre stránku AI automatizácia...'",
  },
  {
    id: "code-reviewer",
    name: "Code Review Agent",
    icon: <Code size={16} />,
    description: "Kontrola kódu, best practices, security audit, optimalizácie.",
    color: "#008080",
    category: "development",
    defaultActions: ["save", "slack", "discord"],
    packages: ["web", "automation", "hybrid"],
    systemPrompt: `Si code review agent pre COK Tech projekty (React + TypeScript + Supabase + Tailwind).
Kontroluj: bezpečnosť, výkon, čitateľnosť, best practices.
Navrhuj konkrétne zlepšenia s ukážkami kódu. Odpovede v slovenčine.`,
    placeholder: "Prilep kód alebo opíš čo chceš skontrolovať...",
  },
  {
    id: "automation-consultant",
    name: "Automation Agent",
    icon: <Zap size={16} />,
    description: "Návrhy workflow-ov, n8n/Make scenáre, AI integrácie.",
    color: "#FF8C00",
    category: "development",
    defaultActions: ["save", "n8n", "slack"],
    packages: ["automation", "hybrid"],
    systemPrompt: `Si automation consultant agent pre COK Tech. Navrhuješ AI automatizácie a workflow-y.
Technológie: n8n, Make, custom AI agenti, Supabase, webhooky.
Navrhuj konkrétne kroky workflow-u, triggers, actions. Odpovede v slovenčine.`,
    placeholder: "Aký proces chceš automatizovať? Napr. 'Automatické odpovede na emaily...'",
  },
  {
    id: "support-agent",
    name: "Support Agent",
    icon: <Headphones size={16} />,
    description: "Odpovede na otázky klientov, troubleshooting, FAQ.",
    color: "#4A9EFF",
    category: "operations",
    defaultActions: ["save", "email", "slack"],
    packages: ["web", "automation", "marketing", "hybrid"],
    systemPrompt: `Si customer support agent pre COK Tech. Odpovedáš na otázky klientov v slovenčine.
Buď nápomocný, trpezlivý ale stručný. Ak nevieš odpoveď, odkáž na Bruno Coka.
Služby COK Tech: webové aplikácie, AI automatizácia, marketing.`,
    placeholder: "Otázka klienta? Napr. 'Koľko trvá vytvorenie webovej aplikácie?'",
  },
  {
    id: "lead-generator",
    name: "Lead Generator Agent",
    icon: <TrendingUp size={16} />,
    description: "Cold outreach sekvencie, prospecting správy, LinkedIn InMail.",
    color: "#a855f7",
    category: "sales",
    defaultActions: ["save", "email", "linkedin", "slack"],
    packages: ["marketing", "hybrid"],
    systemPrompt: `Si lead generation agent pre COK Tech. Tvoríš personalizované outreach správy v slovenčine.
Cieľom je zaujať, nie otravovať. Správa musí byť max 5-6 viet, jasná hodnota, silná CTA.
Prispôsob tón cieľovej firme — enterprise = formálnejší, startup = priamočiarejší.
Formáty: LinkedIn InMail, cold email, follow-up sekvencia.`,
    placeholder: "Komu pisať? Napr. 'LinkedIn InMail pre CEO e-shopu s módou, zaujímam ich o AI marketing'",
  },
  {
    id: "competitor-analyst",
    name: "Competitor Analyst Agent",
    icon: <Search size={16} />,
    description: "Analýza konkurencie, positioning, SWOT, diferenciácia.",
    color: "#ec4899",
    category: "sales",
    defaultActions: ["save", "slack", "n8n"],
    packages: ["hybrid"],
    systemPrompt: `Si competitor analysis agent pre COK Tech. Analyzuješ konkurenciu a navrhuješ positioning.
Na základe zadaných údajov vypracuj: SWOT analýzu, kľúčové diferenciátory, príležitosti.
Buď konkrétny, actionable. Formát: prehľadné sekcie s bullet pointmi. Odpovede v slovenčine.`,
    placeholder: "Kto sú konkurenti? Napr. 'Analyzuj 3 lokálne web agentúry voči COK Tech...'",
  },
];

const CATEGORIES = [
  { id: "all",         label: "Všetci" },
  { id: "marketing",   label: "Marketing" },
  { id: "development", label: "Vývoj" },
  { id: "operations",  label: "Operácie" },
  { id: "sales",       label: "Sales" },
];

// Email dialog state
interface EmailDialog {
  open: boolean;
  to: string;
  subject: string;
}

export const AgentsPage = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [category, setCategory] = useState("all");
  const [packageFilter, setPackageFilter] = useState<string | null>(null);
  const [clientType, setClientType] = useState<string>("general");
  const [activeTab, setActiveTab] = useState<"workspace" | "history">("workspace");
  const [historyDrafts, setHistoryDrafts] = useState<AgentDraft[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [leftPanel, setLeftPanel] = useState<"agents" | "packages" | "clientType">("agents");

  // Action loading states
  const [actionLoading, setActionLoading] = useState<ActionType | null>(null);

  // Email dialog
  const [emailDialog, setEmailDialog] = useState<EmailDialog>({ open: false, to: "", subject: "" });

  const filteredAgents = AGENTS.filter((a) => {
    if (packageFilter) return a.packages?.includes(packageFilter);
    if (category !== "all") return a.category === category;
    return true;
  });

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const drafts = await loadDrafts(selectedAgent?.id);
      setHistoryDrafts(drafts);
    } catch (e: any) {
      toast.error("Chyba pri načítaní histórie: " + e.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") loadHistory();
  }, [activeTab, selectedAgent]);

  const runAgent = async () => {
    if (!selectedAgent || !input.trim()) { toast.error("Zadaj inštrukciu pre agenta"); return; }
    setGenerating(true); setOutput(""); setCurrentDraftId(null);

    const clientCtx = CLIENT_TYPES.find((c) => c.id === clientType);
    const systemWithCtx = clientCtx?.context
      ? `${selectedAgent.systemPrompt}\n\n--- KONTEXT KLIENTA ---\n${clientCtx.context}`
      : selectedAgent.systemPrompt;

    try {
      const data = await callAI({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system: systemWithCtx,
        messages: [{ role: "user", content: input }],
      });
      setOutput(data?.content?.[0]?.text || "");
    } catch (e: any) {
      toast.error("Chyba: " + e.message);
    } finally { setGenerating(false); }
  };

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!selectedAgent || !output) return;
    setActionLoading("save");
    try {
      const draft = await saveDraft({
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        input,
        output,
      });
      setCurrentDraftId(draft.id);
      toast.success("Uložené do databázy!");
      if (activeTab === "history") loadHistory();
    } catch (e: any) {
      toast.error("Chyba: " + e.message);
    } finally { setActionLoading(null); }
  };

  const handleEmail = async () => {
    if (!emailDialog.to || !emailDialog.subject) { toast.error("Vyplň email a predmet"); return; }
    setActionLoading("email");
    try {
      // Parse Subject line from output if Email Agent
      let body = output;
      let subject = emailDialog.subject;
      const subjectMatch = output.match(/^Subject:\s*(.+)/m);
      if (subjectMatch) { subject = subjectMatch[1]; body = output.replace(/^Subject:.+\n?/m, "").trim(); }

      await sendEmail({ to: emailDialog.to, subject, body, draftId: currentDraftId || undefined });
      toast.success(`Email odoslaný na ${emailDialog.to}`);
      setEmailDialog({ open: false, to: "", subject: "" });
    } catch (e: any) {
      toast.error("Chyba: " + e.message);
    } finally { setActionLoading(null); }
  };

  const handleSocial = async (platform: SocialPlatform) => {
    if (!output) return;
    setActionLoading(platform as ActionType);
    try {
      await postSocial({ platform, text: output, draftId: currentDraftId || undefined });
      toast.success(`Príspevok zverejnený na ${platform}!`);
    } catch (e: any) {
      toast.error("Chyba: " + e.message);
    } finally { setActionLoading(null); }
  };

  const handleNotify = async (channel: NotifyChannel) => {
    if (!selectedAgent || !output) return;
    setActionLoading(channel === "both" ? "slack" : channel as ActionType);
    try {
      await notify({
        channel,
        title: `🤖 ${selectedAgent.name} — nový výstup`,
        message: output.slice(0, 400) + (output.length > 400 ? "..." : ""),
        color: selectedAgent.color,
        fields: [{ name: "Zadanie", value: input.slice(0, 100) }],
        draftId: currentDraftId || undefined,
      });
      toast.success(`Notifikácia odoslaná na ${channel}!`);
    } catch (e: any) {
      toast.error("Chyba: " + e.message);
    } finally { setActionLoading(null); }
  };

  const handleN8n = async () => {
    if (!selectedAgent || !output) return;
    setActionLoading("n8n");
    try {
      await triggerN8n({
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        input,
        output,
        draftId: currentDraftId || undefined,
      });
      toast.success("Workflow spustený v n8n!");
    } catch (e: any) {
      toast.error("Chyba: " + e.message);
    } finally { setActionLoading(null); }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      draft: "📄", sent_email: "📧", posted_instagram: "📷",
      posted_linkedin: "💼", posted_facebook: "👥",
      sent_slack: "💬", sent_discord: "🎮", sent_n8n: "⚡",
    };
    return map[status] || "📄";
  };

  return (
    <div style={{ fontFamily: W98.font, fontSize: "12px", color: W98.black }}>
      {/* Header */}
      <div style={{ boxShadow: raised, background: W98.bg, padding: "8px 12px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "20px" }}>🤖</span>
        <div>
          <span style={{ fontWeight: 700 }}>AI Agent Center</span>
          <span style={{ color: W98.grayText, marginLeft: 8 }}>{AGENTS.length} agentov • Všetky integrácie aktívne</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 8 }}>
        {/* ── Left: Agent list ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Left panel tabs */}
          <div style={{ display: "flex", gap: 2 }}>
            {(["agents", "packages", "clientType"] as const).map((p) => (
              <button key={p} onClick={() => setLeftPanel(p)} style={{
                flex: 1, fontFamily: W98.font, fontSize: "9px", padding: "3px 4px",
                background: leftPanel === p ? "#000080" : W98.bg, color: leftPanel === p ? "#fff" : W98.black,
                border: "1px solid #808080", cursor: "pointer",
              }}>
                {p === "agents" ? "Agenti" : p === "packages" ? "Balíčky" : "Klient"}
              </button>
            ))}
          </div>

          {leftPanel === "agents" && (
            <>
              <Win98Panel label="Kategória">
                {CATEGORIES.map((c) => (
                  <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 0", cursor: "pointer" }}>
                    <input type="radio" name="category" checked={category === c.id && !packageFilter} onChange={() => { setCategory(c.id); setPackageFilter(null); }} style={{ margin: 0 }} />
                    <span style={{ fontSize: "11px" }}>{c.label}</span>
                  </label>
                ))}
              </Win98Panel>

              <Win98Panel label="Agenti">
                <div style={{ boxShadow: sunken, background: W98.fieldBg, maxHeight: 340, overflow: "auto" }}>
                  {filteredAgents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => { setSelectedAgent(agent); setOutput(""); setCurrentDraftId(null); setActiveTab("workspace"); }}
                      style={{
                        fontFamily: W98.font, fontSize: "11px",
                        display: "flex", alignItems: "center", gap: 6,
                        width: "100%", padding: "5px 8px",
                        background: selectedAgent?.id === agent.id ? "#000080" : "transparent",
                        color: selectedAgent?.id === agent.id ? "#fff" : W98.black,
                        border: "none", cursor: "pointer", textAlign: "left",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <span style={{ width: 18, height: 18, background: selectedAgent?.id === agent.id ? "rgba(255,255,255,0.2)" : agent.color + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: selectedAgent?.id === agent.id ? "#fff" : agent.color }}>{agent.icon}</span>
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "10px" }}>{agent.name}</div>
                        <div style={{ fontSize: "9px", color: selectedAgent?.id === agent.id ? "#c0c0ff" : W98.grayText, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {agent.category}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Win98Panel>
            </>
          )}

          {leftPanel === "packages" && (
            <Win98Panel label="Balíčky → Agenti">
              {Object.entries(PACKAGE_AGENT_MAP).map(([pkg, cfg]) => (
                <div key={pkg} style={{ marginBottom: 8 }}>
                  <button
                    onClick={() => { setPackageFilter(packageFilter === pkg ? null : pkg); setCategory("all"); }}
                    style={{
                      width: "100%", textAlign: "left", padding: "4px 6px",
                      fontFamily: W98.font, fontSize: "10px", fontWeight: 700,
                      background: packageFilter === pkg ? cfg.color + "30" : W98.bg,
                      border: `1px solid ${packageFilter === pkg ? cfg.color : "#c0c0c0"}`,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                    }}
                  >
                    <span style={{ width: 8, height: 8, background: cfg.color, display: "inline-block", flexShrink: 0 }} />
                    {pkg.toUpperCase()}
                  </button>
                  {packageFilter === pkg && (
                    <div style={{ paddingLeft: 8, paddingTop: 2 }}>
                      <div style={{ fontSize: "9px", color: W98.grayText, marginBottom: 3 }}>{cfg.description}</div>
                      {cfg.agents.map((aId) => {
                        const agent = AGENTS.find((a) => a.id === aId);
                        if (!agent) return null;
                        return (
                          <button key={aId}
                            onClick={() => { setSelectedAgent(agent); setOutput(""); setCurrentDraftId(null); setLeftPanel("agents"); setActiveTab("workspace"); }}
                            style={{
                              display: "flex", alignItems: "center", gap: 4, width: "100%",
                              padding: "2px 4px", background: "transparent", border: "none",
                              cursor: "pointer", textAlign: "left", fontFamily: W98.font,
                              fontSize: "9px", color: W98.black,
                            }}
                          >
                            <span style={{ color: agent.color }}>{agent.icon}</span>
                            {agent.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </Win98Panel>
          )}

          {leftPanel === "clientType" && (
            <Win98Panel label="Typ firmy klienta">
              <div style={{ fontSize: "9px", color: W98.grayText, marginBottom: 6 }}>
                Agenti prispôsobia obsah danému odvetviu
              </div>
              {CLIENT_TYPES.map((ct) => (
                <label key={ct.id} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 0", cursor: "pointer", borderBottom: "1px solid #f0f0f0" }}>
                  <input type="radio" name="clientType" checked={clientType === ct.id} onChange={() => setClientType(ct.id)} style={{ margin: 0 }} />
                  <span style={{ color: W98.grayText }}>{ct.icon}</span>
                  <span style={{ fontSize: "10px" }}>{ct.label}</span>
                </label>
              ))}
              {clientType !== "general" && (
                <div style={{ marginTop: 6, padding: 4, background: "#fffbe6", border: "1px solid #e0c040", fontSize: "9px", color: "#806000" }}>
                  ✓ Kontext aktívny: {CLIENT_TYPES.find((c) => c.id === clientType)?.label}
                </div>
              )}
            </Win98Panel>
          )}
        </div>

        {/* ── Right: Workspace ── */}
        <div>
          {selectedAgent ? (
            <Win98Window
              title={`${selectedAgent.name}`}
              icon={<span style={{ color: selectedAgent.color }}>{selectedAgent.icon}</span>}
              onClose={() => { setSelectedAgent(null); setOutput(""); }}
              style={{ minHeight: 500 }}
            >
              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: "2px solid #808080", marginBottom: 8 }}>
                {(["workspace", "history"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      fontFamily: W98.font, fontSize: "11px", padding: "3px 10px",
                      background: activeTab === tab ? W98.bg : "#b4b4b4",
                      color: W98.black, border: "none", cursor: "pointer",
                      boxShadow: activeTab === tab ? "inset 1px 1px #fff, inset -1px 0 #808080" : undefined,
                      marginBottom: activeTab === tab ? -2 : 0,
                      paddingBottom: activeTab === tab ? 5 : 3,
                    }}
                  >
                    {tab === "workspace" ? "⌨️ Workspace" : "📂 História"}
                  </button>
                ))}
              </div>

              {activeTab === "workspace" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* Agent info bar */}
                  <div style={{ boxShadow: raised, background: W98.bg, padding: "6px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, background: selectedAgent.color + "20", border: `2px solid ${selectedAgent.color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: selectedAgent.color }}>{selectedAgent.icon}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{selectedAgent.name}</div>
                      <div style={{ fontSize: "10px", color: W98.grayText }}>{selectedAgent.description}</div>
                    </div>
                    {clientType !== "general" && (
                      <div style={{ fontSize: "9px", background: "#fffbe6", border: "1px solid #e0c040", padding: "2px 6px", color: "#806000", display: "flex", alignItems: "center", gap: 3 }}>
                        {CLIENT_TYPES.find((c) => c.id === clientType)?.icon}
                        {CLIENT_TYPES.find((c) => c.id === clientType)?.label}
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <Win98Panel label="Zadanie">
                    <Win98Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={selectedAgent.placeholder} rows={4} />
                    <div style={{ marginTop: 6, display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      <Win98Button small onClick={() => { setInput(""); setOutput(""); setCurrentDraftId(null); }}>Vymazať</Win98Button>
                      <Win98Button onClick={runAgent} disabled={generating || !input.trim()}>
                        {generating ? "⏳ Generujem..." : "▶ Spustiť agenta"}
                      </Win98Button>
                    </div>
                  </Win98Panel>

                  {/* Output */}
                  {(generating || output) && (
                    <Win98Panel label={`Výstup${currentDraftId ? " ✅ Uložené v DB" : ""}`}>
                      {generating ? (
                        <div style={{ textAlign: "center", padding: 16 }}>
                          <Win98Progress value={50} style={{ width: 200, margin: "0 auto 6px" }} />
                          <p style={{ color: W98.grayText }}>Agent generuje...</p>
                        </div>
                      ) : (
                        <>
                          <div style={{ boxShadow: sunken, background: W98.fieldBg, padding: 8, whiteSpace: "pre-wrap", lineHeight: 1.5, maxHeight: 200, overflow: "auto", fontSize: "11px" }}>
                            {output}
                          </div>

                          {/* ── ACTION PANEL ── */}
                          <div style={{ marginTop: 8 }}>
                            <div style={{ fontSize: "10px", fontWeight: 700, color: W98.grayText, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                              Akcie:
                            </div>

                            {/* Row 1: Save + Copy */}
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
                              <Win98Button
                                small
                                onClick={handleSave}
                                disabled={actionLoading === "save"}
                                style={{ background: currentDraftId ? "#e0ffe0" : W98.btnFace }}
                              >
                                {actionLoading === "save" ? "⏳" : currentDraftId ? "✅ Uložené" : "💾 Uložiť do DB"}
                              </Win98Button>
                              <Win98Button small onClick={() => { navigator.clipboard.writeText(output); toast.success("Skopírované!"); }}>
                                📋 Kopírovať
                              </Win98Button>
                              <Win98Button small onClick={runAgent}>🔄 Znova</Win98Button>
                            </div>

                            {/* Row 2: Email */}
                            {selectedAgent.defaultActions.includes("email") && (
                              <div style={{ marginBottom: 4, display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "10px", fontWeight: 700, minWidth: 60 }}>📧 Email:</span>
                                <Win98Button small onClick={() => setEmailDialog({ open: true, to: "", subject: "Správa od COK Tech" })}>
                                  Odoslať emailom...
                                </Win98Button>
                              </div>
                            )}

                            {/* Row 3: Social */}
                            {(selectedAgent.defaultActions.includes("instagram") || selectedAgent.defaultActions.includes("linkedin") || selectedAgent.defaultActions.includes("facebook")) && (
                              <div style={{ marginBottom: 4, display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "10px", fontWeight: 700, minWidth: 60 }}>📱 Social:</span>
                                {selectedAgent.defaultActions.includes("instagram") && (
                                  <Win98Button small onClick={() => handleSocial("instagram")} disabled={actionLoading === "instagram"}>
                                    {actionLoading === "instagram" ? "⏳" : "📷 Instagram"}
                                  </Win98Button>
                                )}
                                {selectedAgent.defaultActions.includes("linkedin") && (
                                  <Win98Button small onClick={() => handleSocial("linkedin")} disabled={actionLoading === "linkedin"}>
                                    {actionLoading === "linkedin" ? "⏳" : "💼 LinkedIn"}
                                  </Win98Button>
                                )}
                                {selectedAgent.defaultActions.includes("facebook") && (
                                  <Win98Button small onClick={() => handleSocial("facebook")} disabled={actionLoading === "facebook"}>
                                    {actionLoading === "facebook" ? "⏳" : "👥 Facebook"}
                                  </Win98Button>
                                )}
                              </div>
                            )}

                            {/* Row 4: Notify */}
                            {(selectedAgent.defaultActions.includes("slack") || selectedAgent.defaultActions.includes("discord")) && (
                              <div style={{ marginBottom: 4, display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "10px", fontWeight: 700, minWidth: 60 }}>🔔 Notify:</span>
                                {selectedAgent.defaultActions.includes("slack") && (
                                  <Win98Button small onClick={() => handleNotify("slack")} disabled={actionLoading === "slack"}>
                                    {actionLoading === "slack" ? "⏳" : "💬 Slack"}
                                  </Win98Button>
                                )}
                                {selectedAgent.defaultActions.includes("discord") && (
                                  <Win98Button small onClick={() => handleNotify("discord")} disabled={actionLoading === "discord"}>
                                    {actionLoading === "discord" ? "⏳" : "🎮 Discord"}
                                  </Win98Button>
                                )}
                                <Win98Button small onClick={() => handleNotify("both")} disabled={!!actionLoading}>
                                  Oba kanály
                                </Win98Button>
                              </div>
                            )}

                            {/* Row 5: n8n */}
                            {selectedAgent.defaultActions.includes("n8n") && (
                              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                <span style={{ fontSize: "10px", fontWeight: 700, minWidth: 60 }}>⚡ n8n:</span>
                                <Win98Button small onClick={handleN8n} disabled={actionLoading === "n8n"}>
                                  {actionLoading === "n8n" ? "⏳ Spúšťam..." : "⚡ Spustiť workflow"}
                                </Win98Button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </Win98Panel>
                  )}

                  {!generating && !output && (
                    <div style={{ textAlign: "center", padding: 30, color: W98.grayText }}>
                      <Bot size={28} style={{ margin: "0 auto 8px", display: "block" }} />
                      <p>Zadaj inštrukciu a klikni "Spustiť agenta"</p>
                    </div>
                  )}
                </div>
              ) : (
                /* ── History tab ── */
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: "11px", color: W98.grayText }}>Posledné výstupy agenta</span>
                    <Win98Button small onClick={loadHistory}>🔄 Obnoviť</Win98Button>
                  </div>
                  {loadingHistory ? (
                    <Win98Progress value={50} style={{ width: 200 }} />
                  ) : historyDrafts.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 20, color: W98.grayText }}>
                      <Database size={24} style={{ margin: "0 auto 8px", display: "block" }} />
                      <p>Žiadna história. Spusti agenta a ulož výstup.</p>
                    </div>
                  ) : (
                    <div style={{ boxShadow: sunken, background: W98.fieldBg }}>
                      {/* Header */}
                      <div style={{ display: "grid", gridTemplateColumns: "24px 1fr 80px 70px 40px", gap: 4, padding: "3px 8px", background: W98.bg, fontWeight: 700, fontSize: "10px", borderBottom: "1px solid #c0c0c0" }}>
                        <span></span><span>Výstup</span><span>Stav</span><span>Dátum</span><span></span>
                      </div>
                      {historyDrafts.map((d) => (
                        <div key={d.id} style={{ display: "grid", gridTemplateColumns: "24px 1fr 80px 70px 40px", gap: 4, padding: "3px 8px", fontSize: "10px", borderBottom: "1px solid #f0f0f0", alignItems: "center" }}>
                          <span style={{ fontSize: "14px" }}>{getStatusBadge(d.status)}</span>
                          <span
                            style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}
                            onClick={() => { setOutput(d.output); setInput(d.input); setCurrentDraftId(d.id); setActiveTab("workspace"); }}
                            title="Klikni pre načítanie"
                          >
                            {d.output.slice(0, 60)}...
                          </span>
                          <span style={{ fontSize: "9px", color: W98.grayText }}>{d.status}</span>
                          <span style={{ fontSize: "9px", color: W98.grayText }}>{new Date(d.created_at).toLocaleDateString("sk-SK")}</span>
                          <Win98Button small onClick={() => deleteDraft(d.id).then(() => { toast.success("Zmazané"); loadHistory(); })} style={{ minWidth: 0, padding: "1px 4px" }}>🗑️</Win98Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Win98Window>
          ) : (
            /* No agent selected */
            <Win98Panel label="Vyber agenta">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
                {AGENTS.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => { setSelectedAgent(agent); setOutput(""); setCurrentDraftId(null); }}
                    style={{ boxShadow: raised, background: W98.bg, padding: 12, cursor: "pointer", textAlign: "center" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = sunken; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = raised; }}
                  >
                    <div style={{ width: 36, height: 36, background: agent.color + "20", border: `2px solid ${agent.color}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px" }}>
                      <span style={{ color: agent.color }}>{agent.icon}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "11px", marginBottom: 2 }}>{agent.name}</div>
                    <div style={{ fontSize: "9px", color: W98.grayText, lineHeight: 1.3 }}>{agent.description}</div>
                    <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                      {agent.defaultActions.slice(0, 4).map((a) => (
                        <span key={a} style={{ fontSize: "8px", background: "#e0e0e0", padding: "1px 3px" }}>{a}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Win98Panel>
          )}
        </div>
      </div>

      {/* ── Email Dialog ── */}
      {emailDialog.open && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 60 }} onClick={() => setEmailDialog({ open: false, to: "", subject: "" })} />
          <div style={{
            position: "fixed", left: "50%", top: "30%", transform: "translateX(-50%)",
            width: 380, zIndex: 61, background: W98.bg, boxShadow: raised,
          }}>
            <div style={{ background: W98.titleActive, padding: "3px 4px", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: "#fff", fontSize: "12px" }}>📧</span>
              <span style={{ fontFamily: W98.font, fontSize: "12px", fontWeight: 700, color: "#fff", flex: 1 }}>Odoslať emailom</span>
              <button onClick={() => setEmailDialog({ open: false, to: "", subject: "" })} style={{ width: 16, height: 14, background: W98.btnFace, boxShadow: raised, border: "none", cursor: "pointer" }}>x</button>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: "block", marginBottom: 2, fontSize: "12px" }}>Komu (email):</label>
                <Win98Input value={emailDialog.to} onChange={(e) => setEmailDialog(p => ({ ...p, to: e.target.value }))} placeholder="klient@email.com" type="email" />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 2, fontSize: "12px" }}>Predmet:</label>
                <Win98Input value={emailDialog.subject} onChange={(e) => setEmailDialog(p => ({ ...p, subject: e.target.value }))} />
              </div>
              <div style={{ fontSize: "10px", color: W98.grayText, marginBottom: 8 }}>
                Telo emailu: obsah vygenerovaný agentom
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
                <Win98Button onClick={() => setEmailDialog({ open: false, to: "", subject: "" })}>Zrušiť</Win98Button>
                <Win98Button onClick={handleEmail} disabled={actionLoading === "email"}>
                  {actionLoading === "email" ? "⏳ Odosielam..." : "📧 Odoslať"}
                </Win98Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
