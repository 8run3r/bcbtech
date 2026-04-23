import { useState } from "react";
import { toast } from "sonner";
import {
  W98, raised,
  Win98Button, Win98Panel, Win98Input, Win98Textarea, Win98Select, Win98Tabs,
} from "../win98";

/* ═══════════════════════════════════════
   Template types & definitions
   ═══════════════════════════════════════ */

type TemplateType = "web" | "marketing" | "automation" | "analysis";

const TEMPLATE_TABS = [
  { id: "web" as const, label: "🌐 Web Build" },
  { id: "marketing" as const, label: "📢 Marketing" },
  { id: "automation" as const, label: "⚡ Automatizácia" },
  { id: "analysis" as const, label: "📊 Biznis Analýza" },
];

/* ═══════════════════════════════════════
   Brief fields per template
   ═══════════════════════════════════════ */

interface BriefField {
  key: string;
  label: string;
  placeholder: string;
  type: "input" | "textarea" | "select";
  options?: { value: string; label: string }[];
}

const WEB_FIELDS: BriefField[] = [
  { key: "companyName", label: "Názov firmy", placeholder: "Napr. Salon Lucia", type: "input" },
  { key: "industry", label: "Odvetvie", placeholder: "Napr. kaderníctvo, autoservis, eshop...", type: "input" },
  { key: "target", label: "Cieľovka", placeholder: "Napr. ženy 25-45 v Bratislave", type: "input" },
  { key: "mainProduct", label: "Hlavná služba/produkt", placeholder: "Napr. strihanie a farbenie vlasov", type: "input" },
  { key: "tone", label: "Tón komunikácie", placeholder: "Napr. priateľský a moderný", type: "select", options: [
    { value: "", label: "— Vyber —" },
    { value: "priateľský a moderný", label: "Priateľský a moderný" },
    { value: "profesionálny a dôveryhodný", label: "Profesionálny a dôveryhodný" },
    { value: "hravý a farebný", label: "Hravý a farebný" },
    { value: "luxusný a elegantný", label: "Luxusný a elegantný" },
    { value: "technický a presný", label: "Technický a presný" },
  ]},
  { key: "colors", label: "Farby značky", placeholder: "Napr. #2D5F4E zelená + #F4E8D1 krémová alebo 'navrhni'", type: "input" },
  { key: "materials", label: "Existujúce materiály", placeholder: "Napr. logo v /uploads/logo.png alebo 'nemajú nič'", type: "input" },
  { key: "requirements", label: "Špeciálne požiadavky", placeholder: "Napr. rezervačný formulár, galéria prác, cenník, mapa...", type: "textarea" },
];

const MARKETING_FIELDS: BriefField[] = [
  { key: "companyName", label: "Názov firmy", placeholder: "Napr. Salon Lucia", type: "input" },
  { key: "industry", label: "Odvetvie", placeholder: "Napr. kaderníctvo", type: "input" },
  { key: "target", label: "Cieľový zákazník", placeholder: "Napr. ženy 25-45 v Bratislave", type: "input" },
  { key: "mainProduct", label: "Hlavný produkt/služba", placeholder: "Čo predávajú?", type: "input" },
  { key: "budget", label: "Mesačný budget na marketing", placeholder: "Napr. 500€, 1000€, neznámy", type: "input" },
  { key: "channels", label: "Preferované kanály", placeholder: "Napr. Instagram, Google Ads, LinkedIn...", type: "input" },
  { key: "currentState", label: "Aktuálny stav marketingu", placeholder: "Čo už robia? Sociálne siete? Reklamy?", type: "textarea" },
  { key: "goals", label: "Ciele kampane", placeholder: "Napr. 50 nových zákazníkov mesačne, zvýšiť povedomie...", type: "textarea" },
  { key: "timeline", label: "Časový rámec", placeholder: "Napr. 3 mesiace, 6 mesiacov", type: "input" },
];

const AUTOMATION_FIELDS: BriefField[] = [
  { key: "companyName", label: "Názov firmy", placeholder: "Napr. Stav-Mont s.r.o.", type: "input" },
  { key: "industry", label: "Odvetvie", placeholder: "Napr. stavebníctvo", type: "input" },
  { key: "employees", label: "Počet zamestnancov", placeholder: "Napr. 15", type: "input" },
  { key: "painPoints", label: "Najväčšie problémy (čo zaberá čas)", placeholder: "Napr. ručné fakturovanie, odpovedanie na emaily, plánovanie...", type: "textarea" },
  { key: "currentTools", label: "Aktuálne nástroje", placeholder: "Napr. Excel, Gmail, telefón, papierová agenda...", type: "textarea" },
  { key: "processes", label: "Procesy na automatizáciu", placeholder: "Popíš konkrétne kroky ktoré sa opakujú...", type: "textarea" },
  { key: "budget", label: "Rozpočet na automatizáciu", placeholder: "Napr. do 1000€ jednorazovo + 100€/mes.", type: "input" },
  { key: "integrations", label: "Požadované integrácie", placeholder: "Napr. Gmail, Google Calendar, faktúry, CRM...", type: "input" },
];

const ANALYSIS_FIELDS: BriefField[] = [
  { key: "companyName", label: "Názov firmy", placeholder: "Napr. AutoServis Kováč", type: "input" },
  { key: "industry", label: "Odvetvie", placeholder: "Napr. autoservis", type: "input" },
  { key: "location", label: "Lokalita", placeholder: "Napr. Bratislava - Petržalka", type: "input" },
  { key: "employees", label: "Počet zamestnancov", placeholder: "Napr. 8", type: "input" },
  { key: "revenue", label: "Ročný obrat (odhad)", placeholder: "Napr. 200 000€", type: "input" },
  { key: "yearsInBusiness", label: "Roky na trhu", placeholder: "Napr. 12", type: "input" },
  { key: "onlinePresence", label: "Aktuálna online prítomnosť", placeholder: "Majú web? Sociálne siete? Google profil?", type: "textarea" },
  { key: "mainProduct", label: "Hlavné produkty/služby", placeholder: "Čo konkrétne ponúkajú?", type: "textarea" },
  { key: "target", label: "Cieľový zákazník", placeholder: "Kto sú ich zákazníci?", type: "input" },
  { key: "biggestProblem", label: "Najväčší problém podľa majiteľa", placeholder: "Napr. nemáme dosť zákazníkov, nestíhame...", type: "textarea" },
  { key: "budget", label: "Rozpočet na digitalizáciu", placeholder: "Napr. 3000€ alebo neznámy", type: "input" },
];

const FIELDS_MAP: Record<TemplateType, BriefField[]> = {
  web: WEB_FIELDS,
  marketing: MARKETING_FIELDS,
  automation: AUTOMATION_FIELDS,
  analysis: ANALYSIS_FIELDS,
};

/* ═══════════════════════════════════════
   Prompt generators
   ═══════════════════════════════════════ */

function generateWebPrompt(data: Record<string, string>): string {
  return `Si senior full-stack developer a web designer. Tvojou úlohou je postaviť kompletný, plne funkčný, produkčne-ready web pre zákazníka. Kód musí byť čistý, performantný a okamžite deploynuteľný.

═══════════════════════════════════════
ZÁKAZNÍCKY BRIEF
═══════════════════════════════════════

Firma: ${data.companyName || "[nevyplnené]"}
Odvetvie: ${data.industry || "[nevyplnené]"}
Cieľovka: ${data.target || "[nevyplnené]"}
Hlavná služba/produkt: ${data.mainProduct || "[nevyplnené]"}
Tón komunikácie: ${data.tone || "[nevyplnené]"}
Farby značky: ${data.colors || "nemajú, navrhni na základe odvetvia"}
Existujúce materiály: ${data.materials || "nemajú nič"}
Špeciálne požiadavky: ${data.requirements || "žiadne"}

═══════════════════════════════════════
TECH STACK (NEMEŇ)
═══════════════════════════════════════

- Next.js 14 App Router, TypeScript strict
- Tailwind CSS (utility-only, žiadne custom CSS súbory)
- Framer Motion pre animácie
- pnpm ako package manager
- Deployment: Vercel

═══════════════════════════════════════
POSTUP — DODRŽUJ PRESNE TOTO PORADIE
═══════════════════════════════════════

FÁZA 0: PRÍPRAVA
- Vytvor nový Next.js 14 projekt: pnpm create next-app@latest ${(data.companyName || "projekt").toLowerCase().replace(/[^a-z0-9]/g, "-")} --typescript --tailwind --app --src-dir --import-alias "@/*"
- cd do projektu
- pnpm add framer-motion lucide-react
- Skontroluj a uprav tailwind.config.ts: pridaj custom farby zákazníka, custom fonty
- V src/app/globals.css: pridaj CSS premenné pre farby, base styles, smooth scroll
- V src/app/layout.tsx: nastav metadata (title, description, og:image), fonty cez next/font/google

FÁZA 1: DESIGN SYSTEM
Na základe odvetvia a cieľovky zákazníka urob tieto rozhodnutia a ZAPÍŠ ICH do komentára na vrchu tailwind.config.ts:

1. FONT PAIRING — vyber 2 fonty z Google Fonts, ktoré sedia odvetviu:
   - Luxusný/beauty → Playfair Display + DM Sans
   - Tech/moderný → Space Grotesk + Inter
   - Tradičný/remeselný → Merriweather + Source Sans
   - Hravý/detský → Outfit + Nunito
   - Profesionálny/B2B → Instrument Serif + Geist Sans
   NIKDY nepoužívaj Arial. Vždy vyber niečo s charakterom.

2. FAREBNÁ SCHÉMA — ak zákazník nemá farby, navrhni na základe:
   - Odvetvie (zelená pre eco/health, modrá pre finance/tech, teplé pre food/beauty)
   - Primary (hlavná akcia), Secondary (accenty), Background, Surface, Text, Text-dim
   - Vždy definuj aj dark varianty

3. ŠTÝL ANIMÁCIÍ — podľa tónu:
   - Profesionálny → subtílne fadeUp, pomalý ease (duration 0.6-0.8)
   - Hravý → bounce, stagger, scale efekty
   - Luxusný → veľmi pomalý reveal, parallax, letter spacing animácie

4. LAYOUT ŠTÝL:
   - Koľko whitespace (tight vs spacious)
   - Border radius (sharp 0-4px / medium 8-12px / rounded 16-24px / pill)
   - Card style (outlined / filled / glassmorphism / shadow)

FÁZA 2: KOMPONENTY — POSTAV KAŽDÝ ZVLÁŠŤ
Vytvor tieto súbory v src/components/:

Navbar.tsx:
- Logo zákazníka (ak majú — next/image, ak nie — textové logo s fontom)
- Navigačné linky ku všetkým sekciám (smooth scroll)
- CTA button (hlavná akcia zákazníka)
- Mobile hamburger s AnimatePresence
- Sticky, backdrop-blur, border-bottom

HeroSection.tsx:
- Headline ktorý rieši hlavný problém cieľovky (NIE generický "Vitajte na našej stránke")
- Subheadline: 1 veta vysvetľujúca čo firma robí a pre koho
- 1-2 CTA buttony (primárny + sekundárny)
- Vizuál: obrázok ak je k dispozícii, inak gradient/pattern pozadie podľa design systému
- Framer Motion staggered reveal

ServicesSection.tsx:
- Nadpis relevantný pre odvetvie
- Grid kariet (2-4 podľa počtu služieb) — ikona + názov + krátky popis (2-3 vety)
- Ikony z lucide-react
- Hover efekt na kartách

ContactSection.tsx:
- Formulár: Meno, Email/Telefón, Správa + prípadne select podľa služby
- Kontaktné údaje: adresa, telefón, email, otváracia doba
- Google Maps embed ak je fyzická prevádzka

Footer.tsx:
- Logo, navigácia, kontakt, social linky, copyright
- Minimalistický

FÁZA 3: HLAVNÁ STRÁNKA
src/app/page.tsx:
- Import a renderuj všetky sekcie v logickom poradí
- Wrap v <main>

FÁZA 4: API ROUTES
src/app/api/contact/route.ts:
- Prijmi POST s formData
- console.log + return NextResponse.json({ success: true })
- Komentár: "TODO: napojiť na webhook alebo email service"

FÁZA 5: SEO & PERFORMANCE
- Metadata v layout.tsx: title, description, keywords, og:title, og:description
- Všetky obrázky cez next/image s alt textom
- Semantic HTML (main, section, nav, footer, h1-h3 hierarchia)
- Každá sekcia má id pre smooth scroll

FÁZA 6: FINÁLNA KONTROLA
- pnpm build — musí prejsť bez errorov
- Skontroluj mobile responsive (320px, 768px, 1024px, 1440px)

═══════════════════════════════════════
PRAVIDLÁ
═══════════════════════════════════════

- KAŽDÝ text na webe musí byť v SLOVENČINE
- NIKDY nepoužívaj placeholder text ako "Lorem ipsum" — vždy napíš reálny copy
- NIKDY nepoužívaj generické headlines ako "Vitajte" — vždy benefit-driven copy
- Všetky komponenty "use client" iba ak naozaj potrebujú (animácie, interaktivita, state)
- NEPRIDÁVAJ sekcie ktoré nie sú v briefe
- Ak brief hovorí "nemajú logo" — vytvor textové logo
- Ak brief hovorí "nemajú fotky" — použi gradient/pattern pozadia
- Kód musí byť čistý, typovaný, bez any typov
- Commit message: "feat: initial website build for ${data.companyName || "[firma]"}"`;
}

function generateMarketingPrompt(data: Record<string, string>): string {
  return `Si senior marketingový stratég a content creator pracujúci pre digitálne štúdio. Tvojou úlohou je vytvoriť kompletný, implementovateľný marketingový plán pre zákazníka.

═══════════════════════════════════════
ZÁKAZNÍCKY BRIEF
═══════════════════════════════════════

Firma: ${data.companyName || "[nevyplnené]"}
Odvetvie: ${data.industry || "[nevyplnené]"}
Cieľový zákazník: ${data.target || "[nevyplnené]"}
Hlavný produkt/služba: ${data.mainProduct || "[nevyplnené]"}
Mesačný budget: ${data.budget || "neznámy"}
Preferované kanály: ${data.channels || "neurčené"}
Aktuálny stav: ${data.currentState || "neznámy"}
Ciele: ${data.goals || "neurčené"}
Časový rámec: ${data.timeline || "3 mesiace"}

═══════════════════════════════════════
VYPRACUJ PRESNE TIETO BODY
═══════════════════════════════════════

1. ANALÝZA CIEĽOVKY
- Demografické údaje (vek, pohlavie, lokalita, príjem)
- Psychografické údaje (záujmy, problémy, motivácie, obavy)
- Kde trávia čas online (platformy, skupiny, fóra)
- Aký typ obsahu konzumujú
- Čo ich presvedčí na nákup (recenzie? cena? odporúčania?)

2. KONKURENČNÁ ANALÝZA
- 3-5 hlavných konkurentov v danom odvetví a lokalite
- Čo robia dobre na sociálnych sieťach
- Kde majú medzery (slabý obsah, žiadne reels, neodpovedajú na komentáre)
- Aké formáty obsahu používajú

3. CONTENT STRATEGY (mesačný plán)
Pre každý kanál vytvor:
- Počet postov týždenne
- Typy obsahu (edukatívny / zábavný / predajný / UGC — v pomere 40/30/20/10)
- 10 konkrétnych nápadov na posty s textom a popisom vizuálu
- Najlepšie časy na posting
- Hashtag stratégia (10-15 hashtagov rozdelených na branded, odvetvové, lokálne)

4. PAID ADS STRATÉGIA
- Aké platformy (Meta Ads, Google Ads, TikTok Ads)
- Formáty reklám (carousel, video, single image, stories)
- Targeting nastavenia (záujmy, demographics, lookalike, retargeting)
- Rozdelenie budgetu medzi platformy
- 3 konkrétne ad copy texty (headline + primary text + CTA)
- A/B test plán

5. EMAIL/SMS MARKETING (ak relevantné)
- Welcome séria (3-5 emailov)
- Mesačný newsletter štruktúra
- Automatizované sekvencie (abandoned cart, follow-up, birthday)
- Návrh subject lines

6. MERANIE A KPIs
- Hlavné KPIs pre každý kanál
- Aké nástroje na tracking (Meta Pixel, GA4, UTM parametre)
- Týždenný a mesačný reporting template
- Benchmarky pre odvetvie

7. ČASOVÝ PLÁN IMPLEMENTÁCIE
Týždeň 1-2: [setup a príprava]
Týždeň 3-4: [spustenie prvých kampaní]
Mesiac 2: [optimalizácia a škálovanie]
Mesiac 3: [vyhodnotenie a ďalšie kroky]

8. AUTOMATIZÁCIE PRE MARKETING
- Social media scheduling (Buffer/Later cez n8n)
- Auto-reply na DMs a komentáre
- Lead magnet → email sequence automatizácia
- Reporting automatizácia (dáta → dashboard)

═══════════════════════════════════════
PRAVIDLÁ
═══════════════════════════════════════

- Píš v slovenčine
- Buď KONKRÉTNY — žiadne vágne "zvýšte engagement", vždy presný krok
- Všetky texty (posty, ads, emaily) napíš hotové, copy-paste ready
- Prispôsob tón a štýl komunikácie odvetviu a cieľovke
- Kde sa dá, uveď čísla a odhady (CTR, CPC, reach)
- Celý plán by mal byť implementovateľný bez ďalších otázok`;
}

function generateAutomationPrompt(data: Record<string, string>): string {
  return `Si AI automation architect. Tvojou úlohou je navrhnúť a detailne popísať automatizačné workflow pre zákazníka. Výstup musí byť dostatočne detailný na to, aby sa dal priamo implementovať v n8n.

═══════════════════════════════════════
ZÁKAZNÍCKY BRIEF
═══════════════════════════════════════

Firma: ${data.companyName || "[nevyplnené]"}
Odvetvie: ${data.industry || "[nevyplnené]"}
Počet zamestnancov: ${data.employees || "neznámy"}
Najväčšie problémy: ${data.painPoints || "[nevyplnené]"}
Aktuálne nástroje: ${data.currentTools || "neznáme"}
Procesy na automatizáciu: ${data.processes || "[nevyplnené]"}
Rozpočet: ${data.budget || "neznámy"}
Požadované integrácie: ${data.integrations || "neurčené"}

═══════════════════════════════════════
VYPRACUJ PRESNE TIETO BODY
═══════════════════════════════════════

1. AUDIT PROCESOV
Pre každý identifikovaný proces popíš:
- Aktuálny stav (manuálne kroky, kto to robí, koľko času to trvá)
- Pain points (kde vznikajú chyby, oneskorenia, frustrácia)
- Automatizačný potenciál (0-10, kde 10 = plne automatizovateľné)
- Priorita (high/medium/low na základe ROI)

2. NAVRHNUTÉ WORKFLOW (pre každý)
Pre každé workflow uveď:
- Názov workflow
- Trigger (čo ho spustí — webhook, cron, email, form submission...)
- Kroky (node po node v n8n formáte):
  1. [Trigger node] → popis
  2. [Node typ] → popis + nastavenia
  3. [Node typ] → popis + nastavenia
  ...
- Výstup (čo sa stane na konci)
- Error handling (čo ak niečo zlyhá)
- Estimated setup time
- Mesačná cena prevádzky (API calls, hosting)

3. INTEGRAČNÁ MAPA
- Aké služby sa prepájajú (Gmail, Calendar, CRM, fakturačný systém...)
- Aké API klúče / prístupy budú potrebné
- Aké webhooky treba nastaviť
- Data flow diagram (text-based)

4. IMPLEMENTAČNÝ PLÁN
Fáza 1 (Týždeň 1): Quick wins — najjednoduchšie workflow s najväčším impactom
Fáza 2 (Týždeň 2-3): Core automatizácie — hlavné procesy
Fáza 3 (Týždeň 4): Optimalizácia — monitoring, error handling, notifikácie

5. ROI KALKULÁCIA
Pre každé workflow:
- Aktuálny čas (hodiny/mesiac na manuálnu prácu)
- Čas po automatizácii
- Ušetrené hodiny mesačne
- Hodnota ušetreného času (hodiny × hodinová sadzba)
- Setup cena
- Mesačná cena prevádzky
- Break-even bod (za koľko mesiacov sa to vráti)

CELKOVÉ ROI:
- Celkové ušetrené hodiny mesačne
- Celková mesačná úspora v €
- Celková investícia (setup + 12 mesiacov prevádzky)
- ROI za 12 mesiacov

6. MONITORING & MAINTENANCE
- Aké metriky sledovať
- Aké alerty nastaviť (zlyhanie workflow, neočakávané dáta)
- Mesačný maintenance checklist
- Kto je zodpovedný za monitoring

═══════════════════════════════════════
PRAVIDLÁ
═══════════════════════════════════════

- Píš v slovenčine
- Buď extrémne konkrétny — presné node typy v n8n, presné nastavenia
- Každé workflow musí byť reálne implementovateľné, nie teoretické
- Uveď konkrétne čísla kde sa dá (čas, cena, úspora)
- Ak proces nie je vhodný na automatizáciu, povedz to priamo
- Zoraď workflow podľa priority (najväčší ROI prvý)`;
}

function generateAnalysisPrompt(data: Record<string, string>): string {
  return `Si skúsený biznis konzultant a digitálny stratég, ktorý pracuje pre COK Tech — web engineering a AI automation studio. Tvojou úlohou je kompletne zanalyzovať firmu zákazníka a vytvoriť actionable plán čo potrebuje aby reálne rástla.

═══════════════════════════════════════
INFO O FIRME
═══════════════════════════════════════

Názov firmy: ${data.companyName || "[nevyplnené]"}
Odvetvie: ${data.industry || "[nevyplnené]"}
Lokalita: ${data.location || "[nevyplnené]"}
Počet zamestnancov: ${data.employees || "neznámy"}
Ročný obrat (odhad): ${data.revenue || "neznámy"}
Roky na trhu: ${data.yearsInBusiness || "neznáme"}
Aktuálna online prítomnosť: ${data.onlinePresence || "neznáma"}
Hlavné produkty/služby: ${data.mainProduct || "[nevyplnené]"}
Cieľový zákazník: ${data.target || "[nevyplnené]"}
Najväčší problém podľa majiteľa: ${data.biggestProblem || "[nevyplnené]"}
Rozpočet na digitalizáciu: ${data.budget || "neznámy"}

═══════════════════════════════════════
ANALÝZA — VYPRACUJ VŠETKY TIETO BODY
═══════════════════════════════════════

1. DIGITÁLNA ZRELOSŤ (0-10)
Ohodnoť firmu v týchto oblastiach a daj celkové skóre:
- Web prítomnosť (majú web? je moderný? mobile-friendly? SEO?)
- Social media (aktívne? pravidelný posting? engagement?)
- Online predaj (predávajú online? aký kanál?)
- Interné procesy (fakturácia? CRM? komunikácia? je niečo automatizované?)
- Dátová gramotnosť (sledujú metriky? analytics? ROI kampaní?)

2. KONKURENČNÁ ANALÝZA
- Kto sú 3 hlavní konkurenti v ich lokalite/odvetví?
- Čo robia online lepšie?
- Kde majú konkurenti slabiny, ktoré sa dajú využiť?
- Aký je priemerný pricing v odvetví?

3. ZÁKAZNÍCKA CESTA (CUSTOMER JOURNEY MAP)
Popíš krok za krokom ako ich typický zákazník:
- OBJAVÍ firmu (kde hľadá? Google? Instagram? odporúčanie?)
- POROVNÁ s konkurenciou (čo rozhoduje? cena? recenzie? lokalita?)
- ROZHODNE SA (čo je posledný impulz?)
- NAKÚPI/OBJEDNÁ (aký je proces?)
- VRÁTI SA (je dôvod sa vrátiť? retention stratégia?)
Označ kde sú NAJVÄČŠIE STRATY v tejto ceste.

4. QUICK WINS (čo spraviť TENTO MESIAC)
- 3-5 konkrétnych akcií ktoré prinesú výsledok do 30 dní
- Zoraď podľa impact/effort (najprv high impact + low effort)
- Pri každom odhadni: koľko to stojí, koľko času zaberie, aký výsledok

5. AUTOMATIZAČNÉ PRÍLEŽITOSTI
Pre každý bod: čo sa automatizuje, nástroj, koľko času ušetrí mesačne, setup cena, mesačná cena:
- Social media posting
- Lead capture a follow-up
- Fakturácia a notifikácie
- Zákaznícky support (chatbot/auto-reply)
- Reporting a analytika
- Iné špecifické pre odvetvie

6. WEBOVÁ STRATÉGIA
- Potrebujú nový web alebo stačí vylepšiť existujúci?
- Aký typ webu (landing page / multi-page / eshop / booking)?
- SEO stratégia: kľúčové slová (lokálne SEO ak fyzická prevádzka)
- Content stratégia: aký obsah vytvárať a kde

7. MARKETINGOVÁ STRATÉGIA (3-6 mesiacov)
Mesiac 1-2: [konkrétne kroky]
Mesiac 3-4: [konkrétne kroky]
Mesiac 5-6: [konkrétne kroky]
- Kanály, budget, KPIs

8. CENOVÁ PONUKA OD COKTECH
Na základe analýzy navrhni konkrétny balík:

Jednorazové:
- Web: [typ] — [cena]€
- Automatizácie: [počet a typ] — [cena]€
- Setup celkom: [cena]€

Mesačný retainer:
- Hosting & správa webu: [cena]€/mo
- Automatizácie monitoring: [cena]€/mo
- Retainer celkom: [cena]€/mo

ROI odhad:
- Ušetrené hodiny mesačne
- Nových zákazníkov (konzervatívny odhad)
- Break-even v mesiacoch

═══════════════════════════════════════
FORMÁT VÝSTUPU
═══════════════════════════════════════

- Píš v slovenčine
- Buď konkrétny — žiadne vágne rady, vždy presný krok
- Používaj čísla a odhady
- Tón: profesionálny ale zrozumiteľný pre netechnického majiteľa
- Na konci pridaj "Ďalšie kroky" — 3 veci čo by mal klient spraviť ZAJTRA
- Celá analýza 1500-2500 slov`;
}

const GENERATORS: Record<TemplateType, (data: Record<string, string>) => string> = {
  web: generateWebPrompt,
  marketing: generateMarketingPrompt,
  automation: generateAutomationPrompt,
  analysis: generateAnalysisPrompt,
};

/* ═══════════════════════════════════════
   Component
   ═══════════════════════════════════════ */

export const PromptBotPage = () => {
  const [activeTab, setActiveTab] = useState<TemplateType>("web");
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({
    web: {}, marketing: {}, automation: {}, analysis: {},
  });
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [showOutput, setShowOutput] = useState(false);

  const currentData = formData[activeTab] || {};
  const fields = FIELDS_MAP[activeTab];

  const updateField = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [key]: value },
    }));
  };

  const generate = () => {
    const generator = GENERATORS[activeTab];
    const prompt = generator(currentData);
    setGeneratedPrompt(prompt);
    setShowOutput(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt).then(
      () => toast.success("Prompt skopírovaný do schránky!"),
      () => toast.error("Nepodarilo sa skopírovať"),
    );
  };

  const clearForm = () => {
    setFormData(prev => ({ ...prev, [activeTab]: {} }));
    setShowOutput(false);
    setGeneratedPrompt("");
  };

  const filledCount = fields.filter(f => (currentData[f.key] || "").trim()).length;
  const totalCount = fields.length;

  const labelStyle = { fontFamily: W98.font, fontSize: "12px", color: W98.black, display: "block", marginBottom: 2, fontWeight: 600 };
  const hintStyle = { fontFamily: W98.font, fontSize: "10px", color: W98.grayText, marginTop: 1 };

  return (
    <div style={{ fontFamily: W98.font, fontSize: "12px", color: W98.black }}>
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
        <span style={{ fontSize: "20px" }}>🤖</span>
        <span style={{ fontWeight: 700 }}>Prompt Bot — Generátor promptov pre klientov</span>
        <span style={{ marginLeft: "auto", fontSize: "11px", color: W98.grayText }}>
          {filledCount}/{totalCount} polí vyplnených
        </span>
      </div>

      {/* Tabs */}
      <Win98Tabs
        tabs={TEMPLATE_TABS}
        active={activeTab}
        onChange={(id) => { setActiveTab(id as TemplateType); setShowOutput(false); }}
      />

      <div style={{
        border: "1px solid rgba(0,0,0,0.15)",
        borderTop: "none",
        borderRadius: "0 0 4px 4px",
        background: "rgba(255,255,255,0.7)",
        padding: 12,
      }}>
        {!showOutput ? (
          /* ── Brief Form ── */
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px" }}>
              {fields.map((field) => {
                const isWide = field.type === "textarea";
                return (
                  <div key={field.key} style={{ gridColumn: isWide ? "1 / -1" : undefined, marginBottom: 4 }}>
                    <label style={labelStyle}>{field.label}:</label>
                    {field.type === "input" && (
                      <Win98Input
                        value={currentData[field.key] || ""}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                      />
                    )}
                    {field.type === "textarea" && (
                      <Win98Textarea
                        value={currentData[field.key] || ""}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={3}
                      />
                    )}
                    {field.type === "select" && field.options && (
                      <Win98Select
                        value={currentData[field.key] || ""}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        options={field.options}
                        style={{ width: "100%" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 12, borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 10 }}>
              <Win98Button onClick={clearForm}>🗑️ Vyčistiť</Win98Button>
              <Win98Button onClick={generate} style={{ background: "linear-gradient(180deg, #d0e8ff 0%, #a0c8f0 100%)", borderColor: "#0078d7" }}>
                ⚡ Generovať prompt
              </Win98Button>
            </div>
          </>
        ) : (
          /* ── Generated Prompt Output ── */
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: "13px" }}>✅ Prompt vygenerovaný</span>
              <span style={{ fontSize: "11px", color: W98.grayText }}>
                ({generatedPrompt.length} znakov)
              </span>
            </div>

            <div style={{
              background: "#1a1a2e",
              color: "#e0e0e0",
              fontFamily: W98.fontMono,
              fontSize: "11px",
              padding: 12,
              borderRadius: 4,
              border: "1px solid rgba(0,0,0,0.3)",
              maxHeight: 420,
              overflow: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              lineHeight: 1.5,
              boxShadow: "inset 0 2px 6px rgba(0,0,0,0.3)",
            }}>
              {generatedPrompt}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 10, borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 10 }}>
              <Win98Button onClick={() => setShowOutput(false)}>← Späť na formulár</Win98Button>
              <Win98Button onClick={copyToClipboard} style={{ background: "linear-gradient(180deg, #d0f0d0 0%, #a0d8a0 100%)", borderColor: "#00875a" }}>
                📋 Kopírovať prompt
              </Win98Button>
            </div>
          </>
        )}
      </div>

      {/* Help hint */}
      <Win98Panel label="Návod" style={{ marginTop: 12 }}>
        <div style={{ fontSize: "11px", color: W98.grayText, lineHeight: 1.6 }}>
          <strong>1.</strong> Vyber typ promptu (Web / Marketing / Automatizácia / Analýza)<br />
          <strong>2.</strong> Vyplň brief od klienta — čím viac detailov, tým lepší výstup<br />
          <strong>3.</strong> Klikni "Generovať prompt" a skopíruj výsledok<br />
          <strong>4.</strong> Použi prompt v Claude Code, ChatGPT alebo inom AI nástroji<br />
          <br />
          <em>Tip: Prompt funguje najlepšie s Claude Opus alebo Sonnet. Pre web build odporúčam Claude Code.</em>
        </div>
      </Win98Panel>
    </div>
  );
};
