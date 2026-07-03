import type { ModelVariant } from "./DraggableModel";

export interface Station {
  title: string;
  subtitle: string;
  body: string;
  label: string;
  color: string;
  pos: [number, number, number];
  route: string;
  cta: string;
  modelHint: string;
  /** Model placement relative to station centre + look-at anchor */
  modelOffset: [number, number, number];
  modelVariant: ModelVariant;
  modelScale: number;
}

/**
 * Acts — the descent is structured as 4 acts of 2 stations each.
 * Every act has its own environment, camera behaviour and material mood.
 */
export interface Act {
  roman: string;
  name: string;
  jp: string;
}

// Camera moves are per-station — see CAM_MOVES in choreography.ts
export const ACTS: Act[] = [
  { roman: "I",   name: "STAVBA",       jp: "「構築」" },
  { roman: "II",  name: "INTELIGENCIA", jp: "「知性」" },
  { roman: "III", name: "TOK",          jp: "「流れ」" },
  { roman: "IV",  name: "SPOJENIE",     jp: "「接続」" },
];

export const stationAct = (i: number) => Math.min(Math.floor(i / 2), ACTS.length - 1);

export const STATIONS: Station[] = [
  {
    title: "Web Aplikácie",
    subtitle: "01 / WEB",
    body: "Next.js, React, TypeScript. Rýchle, responzívne weby a web appky na mieru. Od landing page po komplexné SaaS platformy.",
    label: "「構築」",
    color: "#00ffaa",
    pos: [0, 0, 0],
    route: "/balicky?tab=web",
    cta: "Webové balíčky",
    modelHint: "Tri obrazovky — jeden web, každé zariadenie",
    modelOffset: [1.4, 0.5, 0.8],
    modelVariant: "webFrames",
    modelScale: 1.1,
  },
  {
    title: "E-Commerce",
    subtitle: "02 / SHOP",
    body: "Headless e-shopy s bleskovým loadom. Stripe, platobné brány, sklad aj objednávky pod kontrolou. Predávajte online bez kompromisov.",
    label: "「商店」",
    color: "#00e5ff",
    pos: [3, -18, -1],
    route: "/balicky?tab=web",
    cta: "Online obchod",
    modelHint: "Produkt v skeneri — každá objednávka zaznamenaná",
    modelOffset: [-1.6, 0.4, -1.0],
    modelVariant: "commerce",
    modelScale: 1.2,
  },
  {
    title: "AI Agenti",
    subtitle: "03 / AGENTS",
    body: "Custom AI agenti s Claude API. Odpovedajú zákazníkom, triedia dopyty, pripravujú podklady. Pracujú 24/7 — pre malú firmu aj enterprise.",
    label: "「代理」",
    color: "#FF3D71",
    pos: [-2.5, -36, 1],
    route: "/balicky?tab=agents",
    cta: "Nasadiť agenta",
    modelHint: "Jadro a jeho agenti — pracujú, kým vy spíte",
    modelOffset: [1.6, 0.4, -1.0],
    modelVariant: "agentCore",
    modelScale: 1.1,
  },
  {
    title: "Fakturácia & Doklady",
    subtitle: "04 / INVOICE",
    body: "Automatické faktúry, párovanie platieb, upomienky, exporty pre účtovníka. Papierovačky, ktoré sa vybavia samé.",
    label: "「請求」",
    color: "#a855f7",
    pos: [2, -54, -1.5],
    route: "/balicky?tab=automation",
    cta: "Zautomatizovať",
    modelHint: "Doklady, ktoré sa pečiatkujú samé",
    modelOffset: [-1.4, 0.5, 0.8],
    modelVariant: "invoiceStack",
    modelScale: 1.2,
  },
  {
    title: "Workflow Automatizácie",
    subtitle: "05 / FLOW",
    body: "n8n, Make, Zapier — prepojenie nástrojov, automatické notifikácie, pipeline bez manuálnej práce. Šetrite 40+ hodín mesačne.",
    label: "「自動化」",
    color: "#FF8C00",
    pos: [0, -72, 0],
    route: "/balicky?tab=automation",
    cta: "Automatizovať",
    modelHint: "Pipeline — dáta tečú non-stop",
    modelOffset: [1.2, 0.3, 0.6],
    modelVariant: "pipeline",
    modelScale: 1.2,
  },
  {
    title: "Systémové Integrácie",
    subtitle: "06 / SYNC",
    body: "CRM, fakturačný systém, sklad, e-shop — všetko prepojené do jedného celku. API integrácie, ktoré držia. Pre malé firmy aj enterprise.",
    label: "「統合」",
    color: "#ff4757",
    pos: [-3, -90, -1],
    route: "/kontakt",
    cta: "Prepojiť systémy",
    modelHint: "Dva systémy — jedno pevné spojenie",
    modelOffset: [-1.6, 0.4, -0.8],
    modelVariant: "dockLink",
    modelScale: 1.1,
  },
  {
    title: "Prečo CokTech",
    subtitle: "07 / WHY",
    body: "3× rýchlejšie dodanie. 60% nižšie náklady. Žiadny overhead. Enterprise kvalita za startup cenu. Transparentný proces.",
    label: "「理解」",
    color: "#4A9EFF",
    pos: [2.5, -108, 1],
    route: "/logika",
    cta: "Naša logika",
    modelHint: "Kryštál — transparentný prístup k vášmu projektu",
    modelOffset: [1.4, 0.5, 0.6],
    modelVariant: "crystal",
    modelScale: 1.1,
  },
  {
    title: "Spojme sa",
    subtitle: "08 / CONNECT",
    body: "Signál je vyslaný. Stačí kliknúť a začíname. Prvá konzultácia je zadarmo, odpovieme do 24 hodín.",
    label: "「接続」",
    color: "#00ffaa",
    pos: [0, -126, 0],
    route: "/kontakt",
    cta: "Napíšte nám",
    modelHint: "Pulzujúci maják — signál čakajúci na vaše spojenie",
    modelOffset: [1.1, 0.3, 0.6],
    modelVariant: "beacon",
    modelScale: 1.2,
  },
];
