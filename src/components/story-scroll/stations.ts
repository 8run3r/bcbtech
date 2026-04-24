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
}

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
    modelHint: "Prepojený uzol — technológie tvoriace celok",
  },
  {
    title: "E-Commerce",
    subtitle: "02 / SHOP",
    body: "Headless e-shopy s bleskovým loadom. Stripe, platobné brány, inventory management. Predávajte online bez kompromisov.",
    label: "「商店」",
    color: "#00e5ff",
    pos: [3, -18, -1],
    route: "/balicky?tab=web",
    cta: "Online obchod",
    modelHint: "Multifacetový kryštál — každá strana je iný produkt",
  },
  {
    title: "SEO & Marketing",
    subtitle: "03 / GROW",
    body: "Technické SEO, analytické dashboardy, optimalizácia konverzií. Organický rast bez zbytočného budgetu na reklamy.",
    label: "「成長」",
    color: "#FF3D71",
    pos: [-2.5, -36, 1],
    route: "/balicky?tab=marketing",
    cta: "Marketing plán",
    modelHint: "Kryštál jasnosti — dáta transformované na rast",
  },
  {
    title: "Full Stack Riešenie",
    subtitle: "04 / BUILD",
    body: "Kompletný projekt na mieru. Backend, frontend, DevOps, kontinuálna podpora. Všetko pod jednou strechou.",
    label: "「全力」",
    color: "#a855f7",
    pos: [2, -54, -1.5],
    route: "/kontakt",
    cta: "Začať projekt",
    modelHint: "Pulzujúci maják — plná sila v jednom riešení",
  },
  {
    title: "Workflow Automation",
    subtitle: "05 / AUTOMATE",
    body: "n8n, Make, Zapier — prepojenie nástrojov, automatické notifikácie, pipeline bez manuálnej práce. Šetrite 40+ hodín mesačne.",
    label: "「自動化」",
    color: "#FF8C00",
    pos: [0, -72, 0],
    route: "/balicky?tab=automation",
    cta: "Automatizovať",
    modelHint: "Tri rotujúce slučky — workflows bežiace non-stop",
  },
  {
    title: "AI Integrácia",
    subtitle: "06 / AI",
    body: "Custom AI agenti s Claude API. Chatboty, klasifikácia, sumarizácia, generovanie obsahu. AI pre váš biznis.",
    label: "「知能」",
    color: "#ff4757",
    pos: [-3, -90, -1],
    route: "/balicky?tab=automation",
    cta: "AI riešenie",
    modelHint: "Nekonečný uzol — neurónové prepojenia AI systému",
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
  },
];
