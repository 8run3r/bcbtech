/**
 * Service catalog — single source of truth for service landing pages.
 * Each entry drives the dynamic /sluzby/:slug route.
 *
 * Adding a new service = append to SERVICES below. Optional 3D scene is
 * looked up by `scene` slug in features/services/ServiceScene.tsx.
 */
import type { ComponentType, SVGProps } from "react";
import {
  Snowflake, Wind, Thermometer, Wrench, Gauge, Power,
  Camera, Shield, Eye, Wifi, MonitorPlay, Settings,
  Zap, Cable, Plug, Lightbulb, BatteryCharging, Sun,
  Sparkles, Bell, AlarmCheck, Lock, Radio, ShieldAlert,
} from "lucide-react";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export interface ServiceFeature {
  icon: Icon;
  title: string;
  desc: string;
}

export interface ServiceProcessStep {
  step: string;        // "01"
  title: string;
  desc: string;
}

export interface ServiceFAQ {
  q: string;
  a: string;
}

export interface ServiceConfig {
  slug: string;
  category: "tech-instalacie" | "digital";
  /** Short label shown in hero kicker, e.g. "[ HVAC.PROTOCOL ]" */
  kicker: string;
  title: string;
  tagline: string;
  /** SEO description + Sluzby index card subtitle */
  description: string;
  hero: {
    headline: string;
    sub: string;
    /** Ramps the section accent. Use one of the existing CSS-var palette colors */
    accent: string;
    /** rgb triplet of accent for alpha blends */
    accentRaw: string;
    /** Page background body color */
    bg: string;
  };
  features: ServiceFeature[];
  process: ServiceProcessStep[];
  faq: ServiceFAQ[];
  /** Optional pricing teaser shown above CTA */
  pricing?: { from: string; note?: string };
  cta: { title: string; sub: string; buttonText: string };
  /** Identifier of canvas/SVG hero scene to render. Falls back to default if undefined. */
  scene?: "ac-mist" | "camera-grid" | "circuit" | "solar" | "alarm-pulse";
  /** Show interactive AC kW calculator on this page */
  hasCalculator?: boolean;
}

/* ────────────────────────────────────────────────────────────────────────── */
/* SERVICE ENTRIES                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

const klimatizacie: ServiceConfig = {
  slug: "klimatizacie",
  category: "tech-instalacie",
  kicker: "[ HVAC.PROTOCOL ]",
  title: "Klimatizácie",
  tagline: "Inštalácia, servis a optimalizácia chladenia",
  description:
    "Profesionálna inštalácia split a multi-split klimatizácií, tepelné čerpadlá vzduch-vzduch, servis a údržba. Energetická trieda A++ a vyššie.",
  hero: {
    headline: "Chladenie ako protokol.",
    sub: "Tichá prevádzka, presná regulácia, zmluvný servis. Inštalujeme značky Daikin, Samsung, LG, Mitsubishi a ďalšie.",
    accent: "#4A9EFF",
    accentRaw: "74,158,255",
    bg: "#000208",
  },
  scene: "ac-mist",
  hasCalculator: true,
  features: [
    {
      icon: Snowflake,
      title: "Split & Multi-split",
      desc: "Nástenné, kazetové, parapetné. Jedna vonkajšia jednotka môže obsluhovať až 5 vnútorných.",
    },
    {
      icon: Thermometer,
      title: "Tepelné čerpadlá",
      desc: "Klimatizácia funguje aj v zime — vykurovanie do -25 °C s COP nad 4.0. Šetrí 60-70 % nákladov oproti elektrike.",
    },
    {
      icon: Wind,
      title: "Filtrácia vzduchu",
      desc: "HEPA, ionizácia, PM2.5 sensor. Odstraňuje peľ, prach, baktérie a vírusy z bytového vzduchu.",
    },
    {
      icon: Wrench,
      title: "Servis & čistenie",
      desc: "Pravidelná dezinfekcia výparníka, kontrola tlaku chladiva, výmena filtrov. Dlhšia životnosť, nižšia spotreba.",
    },
    {
      icon: Gauge,
      title: "Smart riadenie",
      desc: "WiFi modul, hlasové ovládanie cez Alexu/Google Home, geofencing — zapne sa keď dorazíš domov.",
    },
    {
      icon: Power,
      title: "Energetická efektivita",
      desc: "Triedy A++ a vyššie, inverter kompresor, ECO režim. Návratnosť investície do 3-5 rokov.",
    },
  ],
  process: [
    { step: "01", title: "Obhliadka", desc: "Bezplatná návšteva, premeranie priestoru, návrh výkonu a polohy jednotiek." },
    { step: "02", title: "Návrh & cenovka", desc: "Konkrétna značka + model, fixná cena vrátane montáže — žiadne dodatočné prekvapenia." },
    { step: "03", title: "Montáž", desc: "Inštalácia za 1 deň pre split, 2-3 dni pre multi-split. Čisto, bez prachu." },
    { step: "04", title: "Spustenie & školenie", desc: "Tlaková skúška, doplnenie chladiva, prejdenie ovládania s tebou." },
    { step: "05", title: "Servis 24/7", desc: "Zmluvný servis 1× ročne v cene. Pri poruche reakcia do 24 h." },
  ],
  faq: [
    {
      q: "Koľko stojí inštalácia klimatizácie?",
      a: "Split jednotka pre miestnosť 20 m² stojí inštalovaná od 890 €. Multi-split pre celý byt od 2 490 €. Tepelné čerpadlo vzduch-vzduch od 1 890 €. Cena vždy zahŕňa montáž, materiál a uvedenie do prevádzky.",
    },
    {
      q: "Aký výkon klimatizácie potrebujem?",
      a: "Hrubá orientácia: 1 kW chladiaceho výkonu na 10 m² obytnej plochy pri štandardnej výške 2,7 m. Pre presný výpočet použi naš kalkulátor vyššie alebo nás kontaktuj — pri obhliadke vypočítame podľa orientácie okien, izolácie a zdrojov tepla.",
    },
    {
      q: "Funguje klimatizácia aj na vykurovanie?",
      a: "Áno, väčšina moderných split jednotiek je tepelné čerpadlo vzduch-vzduch. Vykurujú efektívne až do -25 °C s COP 3-4 (z 1 kWh elektriny získaš 3-4 kWh tepla). V Bratislave a okolí pokryjú 100 % vykurovania panelového bytu.",
    },
    {
      q: "Ako často treba klimatizáciu servisovať?",
      a: "Odporúčaný servis 1× ročne — čistenie výparníka, kontrola chladiva, výmena filtrov. Bez servisu klesá výkon o 5-10 % ročne a rastie spotreba. Pri zmluvnom servise je servis v cene.",
    },
    {
      q: "Koľko hluku vydáva klimatizácia?",
      a: "Vnútorná jednotka 19-26 dB(A) v tichom režime — tichšie ako šepot. Vonkajšia 45-55 dB(A) — porovnateľné s ľadničkou na 1 m. Vyberáme modely s certifikátom Quiet Mark.",
    },
    {
      q: "Aký je rozdiel medzi inverterom a on/off klimatizáciou?",
      a: "Inverter plynule reguluje výkon kompresora — udržuje stabilnú teplotu, šetrí 30-40 % energie a má 2× dlhšiu životnosť. On/off len zapína a vypína. V roku 2026 inštalujeme výhradne inverter modely.",
    },
  ],
  pricing: { from: "od 890 €", note: "fixná cena vrátane montáže a materiálu" },
  cta: {
    title: "Bezplatná obhliadka do 48 hodín",
    sub: "Pošli adresu a vyberieme ti riešenie na mieru. Žiadne tlačenie do drahšieho modelu.",
    buttonText: "Objednať obhliadku",
  },
};

const kamery: ServiceConfig = {
  slug: "kamery",
  category: "tech-instalacie",
  kicker: "[ SURVEILLANCE ]",
  title: "Kamerové systémy",
  tagline: "IP a CCTV kamery pre firmy aj rezidencie",
  description:
    "Profesionálna inštalácia kamerových systémov Hikvision, Dahua, Uniview. AI detekcia, vzdialený dohľad, NVR integrácia.",
  hero: {
    headline: "Vidíš všetko. Aj v noci.",
    sub: "IP kamery 4K, AI detekcia osôb a vozidiel, vzdialený dohľad cez mobil, šifrované NVR úložisko.",
    accent: "#00ffaa",
    accentRaw: "0,255,170",
    bg: "#000a06",
  },
  scene: "camera-grid",
  features: [
    { icon: Camera, title: "IP & CCTV kamery", desc: "Hikvision, Dahua, Uniview — 4K rozlíšenie, IR nočné videnie do 100 m." },
    { icon: Eye, title: "AI detekcia", desc: "Rozlíši človeka od zvieraťa, detekuje vozidlo, číta ŠPZ. Žiadne falošné poplachy." },
    { icon: Shield, title: "NVR úložisko", desc: "Šifrované záznamy 30+ dní, RAID redundancia, bez závislosti na cloude." },
    { icon: Wifi, title: "PoE infraštruktúra", desc: "Jeden kábel = napájanie + dáta. Čistá inštalácia, žiadne adaptéry." },
    { icon: MonitorPlay, title: "Vzdialený prístup", desc: "Mobilná app, web klient, push notifikácie pri pohybe." },
    { icon: Settings, title: "Servis & rozšírenie", desc: "Pravidelný servis, firmware updaty, postupné rozširovanie." },
  ],
  process: [
    { step: "01", title: "Bezpečnostný audit", desc: "Pochôdzka objektu, identifikácia slepých miest, návrh počtu a typov kamier." },
    { step: "02", title: "Návrh systému", desc: "Konkrétne modely, kabeláž, NVR konfigurácia. Fixná cena." },
    { step: "03", title: "Montáž", desc: "Káblové trasy, montáž kamier, konfigurácia siete. Bytový dom 1-2 dni." },
    { step: "04", title: "Konfigurácia AI", desc: "Detekčné zóny, časové plány, notifikácie. Prejdeme ovládanie spolu." },
    { step: "05", title: "Údržba", desc: "Servis 1-2× ročne, firmware updaty, kontrola SD/HDD." },
  ],
  faq: [
    { q: "Koľko stojí kamerový systém?", a: "Štartovací set 4 kamier + NVR pre rodinný dom od 1 290 €. Firemný systém 8-16 kamier od 3 490 €. Cena zahŕňa montáž, kabeláž a konfiguráciu." },
    { q: "Potrebujem internet?", a: "Nie. Kamerový systém s NVR funguje aj bez internetu — záznamy sa ukladajú lokálne. Internet potrebuješ len ak chceš vzdialený prístup z mobilu." },
    { q: "Môže ma niekto hacknúť?", a: "Pri správnej konfigurácii nie. Inštalujeme len kamery so silným šifrovaním (Hikvision SADP, Dahua DMSS), meníme default heslá, oddeľujeme kamerový VLAN od bežnej siete." },
    { q: "Ako dlho sa uchovávajú záznamy?", a: "Štandardne 30 dní pri 24/7 nahrávaní. Pri pohybovom režime aj 90+ dní. NVR kapacitu prispôsobujeme tvojej požiadavke." },
  ],
  pricing: { from: "od 1 290 €", note: "set 4 kamier vrátane montáže" },
  cta: { title: "Bezplatný bezpečnostný audit", sub: "Identifikujeme slepé miesta a navrhneme optimálny systém.", buttonText: "Objednať audit" },
};

const fotovoltika: ServiceConfig = {
  slug: "fotovoltika",
  category: "tech-instalacie",
  kicker: "[ SOLAR.GRID ]",
  title: "Fotovoltika",
  tagline: "Solárne panely + batéria + smart distribúcia",
  description:
    "Kompletné fotovoltické systémy pre rodinné domy a firmy. Panely Tier 1, hybridné meniče, lítiové batérie, monitoring spotreby.",
  hero: {
    headline: "Slnko ako rezerva siete.",
    sub: "Panely Tier 1 (Jinko, Trina), hybridné meniče Solax/Huawei, batérie LiFePO4. Návratnosť 6-9 rokov.",
    accent: "#FF8C00",
    accentRaw: "255,140,0",
    bg: "#040200",
  },
  scene: "solar",
  features: [
    { icon: Sun, title: "Solárne panely", desc: "Monokryštalické 400-450 Wp, účinnosť 21 %, 25 rokov záruka výkonu." },
    { icon: BatteryCharging, title: "Lítiové batérie", desc: "LiFePO4 5-15 kWh, 10 000 cyklov, plne nabitá za 3 hodiny." },
    { icon: Power, title: "Hybridné meniče", desc: "Súbežné nabíjanie batérie + napájanie domu + predaj do siete." },
    { icon: Gauge, title: "Smart monitoring", desc: "Real-time spotreba, predikcia výroby, optimalizácia podľa cien elektriny." },
    { icon: Plug, title: "Wallbox pre EV", desc: "Nabíjačka pre elektromobil 7-22 kW, riadená podľa prebytku zo solárov." },
    { icon: Sparkles, title: "Dotácia Zelená domácnostiam", desc: "Pomôžeme s podaním a spracovaním žiadosti — dotácia 50 % nákladov." },
  ],
  process: [
    { step: "01", title: "Energetický audit", desc: "Analýza ročnej spotreby, orientácie strechy, návrh veľkosti systému." },
    { step: "02", title: "Projekt + dotácia", desc: "Projektová dokumentácia, žiadosť o pripojenie do siete, Zelená domácnostiam." },
    { step: "03", title: "Montáž", desc: "Strešná konštrukcia, panely, kabeláž, menič, batéria. 2-3 dni." },
    { step: "04", title: "Pripojenie", desc: "Revízia, registrácia u distribútora, prvé spustenie." },
    { step: "05", title: "Monitoring", desc: "Aktivujeme app, prejdeme reportovanie, odporučíme nastavenia." },
  ],
  faq: [
    { q: "Aká je návratnosť investície?", a: "Pri 4-6 kWp systéme na rodinnom dome je návratnosť 6-9 rokov pri aktuálnych cenách elektriny. So Zelenou domácnostiam 4-6 rokov." },
    { q: "Funguje fotovoltika v zime?", a: "Áno — pri jasnej zime aj 80 % menovitého výkonu. Sneh sa z naklonených panelov zošmykuje sám. Ročná výroba na východnom Slovensku ~950-1100 kWh/kWp." },
    { q: "Potrebujem batériu?", a: "Ak chceš vyššiu sebestačnosť (60-80 % vlastnej spotreby z FV) áno. Bez batérie predáš prebytky do siete za nižšiu cenu ako za akú kupuješ." },
  ],
  pricing: { from: "od 6 990 €", note: "5 kWp + 5 kWh batéria, pred dotáciou" },
  cta: { title: "Bezplatný energetický audit", sub: "Vypočítame návratnosť a pomôžeme s dotáciou.", buttonText: "Objednať audit" },
};

const elektroinstalacie: ServiceConfig = {
  slug: "elektroinstalacie",
  category: "tech-instalacie",
  kicker: "[ POWER.GRID ]",
  title: "Elektroinštalácie",
  tagline: "Silnoprúd, slaboprúd, smart home",
  description:
    "Kompletné elektroinštalácie pre rodinné domy, byty, firmy. Revízie, prerábky, smart home (KNX, Loxone, Shelly).",
  hero: {
    headline: "Káble, ktoré ti rozumejú.",
    sub: "Silnoprúdové rozvody, slaboprúd (LAN, audio), smart home protokoly KNX, Loxone, Shelly. Vždy s revíziou.",
    accent: "#FF8C00",
    accentRaw: "255,140,0",
    bg: "#040200",
  },
  scene: "circuit",
  features: [
    { icon: Zap, title: "Kompletné rozvody", desc: "Nová elektroinštalácia, prerábka starej hliníkovej, dimenzovanie podľa noriem." },
    { icon: Cable, title: "Slaboprúd & LAN", desc: "Štruktúrovaná kabeláž Cat6/6a, optické trasy, telefón, audio rozvody." },
    { icon: Lightbulb, title: "Smart home", desc: "KNX, Loxone, Shelly. Riadené osvetlenie, žalúzie, kúrenie, scény." },
    { icon: ShieldAlert, title: "Revízie", desc: "Východiskové, periodické, mimoriadne. Protokol na úrade aj banke." },
    { icon: Plug, title: "Rozvádzače", desc: "Bytové aj firemné rozvádzače, ističe, prúdové chrániče, prepäťové ochrany." },
    { icon: Wrench, title: "Pohotovosť", desc: "Výpadok prúdu, zhorený istič, problém s rozvádzačom — výjazd do 4 hodín." },
  ],
  process: [
    { step: "01", title: "Obhliadka", desc: "Premeranie, identifikácia rizík, návrh trás." },
    { step: "02", title: "Projekt", desc: "Schémy, výkazy materiálu, fixná cena." },
    { step: "03", title: "Realizácia", desc: "Drážky, kabeláž, rozvádzač, zásuvky, vypínače." },
    { step: "04", title: "Revízia", desc: "Meranie, protokol, odovzdanie." },
  ],
  faq: [
    { q: "Koľko stojí elektroinštalácia v rodinnom dome?", a: "Nová elektroinštalácia v dome 120 m² od 8 900 € vrátane materiálu, rozvádzača a revízie. Prerábka starej od 5 900 €." },
    { q: "Robíte aj smart home?", a: "Áno — Shelly (najdostupnejšie), Loxone (komplexné), KNX (premium). Návrh prispôsobíme rozpočtu." },
  ],
  pricing: { from: "od 5 900 €", note: "prerábka, vrátane revízie" },
  cta: { title: "Cenová ponuka do 24 h", sub: "Pošli pôdorys alebo opíš objekt — pripravíme konkrétny rozpočet.", buttonText: "Žiadať ponuku" },
};

const alarmy: ServiceConfig = {
  slug: "alarmy",
  category: "tech-instalacie",
  kicker: "[ SECURITY.LOOP ]",
  title: "Alarmy a zabezpečenie",
  tagline: "Alarmy, prístupy, dochádzka",
  description:
    "Bezdrôtové aj drôtové alarmy, prístupové systémy, dochádzkové terminály. Napojenie na PCO, mobilná app.",
  hero: {
    headline: "Tiché až do prvej anomálie.",
    sub: "Alarmy Jablotron, Paradox. Prístupové systémy s NFC, biometriou, mobil ako kľúč. Napojenie na PCO.",
    accent: "#FF3D71",
    accentRaw: "255,61,113",
    bg: "#040002",
  },
  scene: "alarm-pulse",
  features: [
    { icon: Bell, title: "Bezdrôtové alarmy", desc: "Jablotron, Paradox. Detektory pohybu, dverí, dymu, vody, plynu." },
    { icon: Lock, title: "Prístupové systémy", desc: "NFC karty, biometria, kódy, mobil. Logy kto kedy vstúpil." },
    { icon: AlarmCheck, title: "Dochádzka", desc: "Terminály na pracoviskách, automatické exporty pre mzdy." },
    { icon: Radio, title: "PCO napojenie", desc: "Pri narušení výjazd zásahovky do 8 minút v Bratislave." },
    { icon: Eye, title: "Mobilná app", desc: "Zapni/vypni alarm odkiaľkoľvek, video verifikácia, history." },
    { icon: ShieldAlert, title: "Servis", desc: "Pravidelná kontrola batérií, senzorov, komunikácie. 1× ročne." },
  ],
  process: [
    { step: "01", title: "Obhliadka", desc: "Identifikácia rizík, počet a typ detektorov." },
    { step: "02", title: "Návrh", desc: "Konkrétna značka, fixná cena vrátane PCO." },
    { step: "03", title: "Montáž", desc: "Bezdrôtová inštalácia za 1 deň, drôtová 2-3 dni." },
    { step: "04", title: "Aktivácia", desc: "Napojenie na PCO, otestovanie, prejdenie ovládania." },
  ],
  faq: [
    { q: "Koľko stojí alarm pre rodinný dom?", a: "Bezdrôtový set Jablotron pre dom 100-150 m² od 990 € vrátane montáže. PCO služba 12-25 €/mesiac." },
    { q: "Funguje alarm pri výpadku prúdu?", a: "Áno — záložná batéria 24-48 h, GSM modul beží na vlastnej baterke. Pri výpadku ide notifikácia na PCO." },
  ],
  pricing: { from: "od 990 €", note: "bezdrôtový set Jablotron" },
  cta: { title: "Bezplatná obhliadka", sub: "Identifikujeme riziká a navrhneme presný rozsah ochrany.", buttonText: "Objednať obhliadku" },
};

export const SERVICES: ServiceConfig[] = [
  klimatizacie,
  kamery,
  fotovoltika,
  elektroinstalacie,
  alarmy,
];

export function getServiceBySlug(slug: string): ServiceConfig | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
