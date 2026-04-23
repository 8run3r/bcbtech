# Hero Section — Plán prepojenia so zaujímavými aspektmi stránky

## Problém

Súčasná Hero sekcia je vizuálne silná (Tsuki canvas, aurora, perspektíva), ale funguje
ako izolovaný intro — nehovorí nič o *obsahu* stránky. Návštevník vidí brand, tagline a
dve generické tlačidlá, ale nemá potuchu čo ho čaká vo zvyšku stránky.

Konkrétne chýba prepojenie s:
- Skutočným obsahom Digital World / Automation World (level systém, 3D modely)
- Portfóliom a reálnymi projektami
- Interaktívnymi prvkami (skryté zóny, skrytý terminál, Easter eggs)
- Živými metrikami stránky
- Vizuálnym jazykom subświatov (pixel grid vs. circuit board)

---

## Navrhované vylepšenia (prioritizované)

### 1. World Preview v paneloch `[VYSOKÁ PRIORITA]`

**Čo:** Namiesto generického "Web Engineering / AI Automation" text ukážeme konkrétny
obsah čo na návštevníka čaká.

**Implementácia — Digital panel:**
```
WORLD_01 // DIGITAL
─────────────────
▶ LEVEL 01 — Web Aplikácie
▶ LEVEL 02 — E-Commerce  
▶ LEVEL 03 — SEO & Marketing
▶ BOSS    — Full Stack Riešenie
[4 LEVELY] [Next.js/React/TypeScript]
```

**Implementácia — Automation panel:**
```
WORLD_02 // AUTOMATION
──────────────────────
▶ MODUL 01 — n8n Workflow Engine
▶ MODUL 02 — Claude AI Agenti
▶ MODUL 03 — Data Pipeline
▶ CORE     — Systémová Integrácia
[4 MODULY] [n8n/Claude/Make]
```

**Kde zmeniť:** `HeroSection.tsx` → panely vo `showPanels` bloku (riadky 498–562)

---

### 2. Interaktívny mini-terminál `[VYSOKÁ PRIORITA]`

**Čo:** Po zobrazení tlačidiel (progress > 0.75) sa objaví malý terminál kde môžeš
písať príkazy. Toto je unikátny differentiator — žiadna agentúra to nemá.

**Príkazy:**
| Príkaz | Odpoveď |
|--------|---------|
| `help` | Vypíše dostupné príkazy |
| `digital` | Scrolluje na Digital World |
| `automation` | Scrolluje na Automation World |
| `portfolio` | Naviguje na /portfolio |
| `contact` | Otvára kontaktný modal |
| `status` | Ukáže "fake" systémové štatistiky |
| `cls` / `clear` | Vymaže terminál |
| `whoami` | Vtipná odpoveď o CokTech |
| `hack` | Easter egg — glitch animácia |

**Kde implementovať:** Nová komponenta `HeroTerminal.tsx` vložená do `HeroSection.tsx`
pod entry buttons, zobrazená keď `progress > 0.72`

**Vizuál:**
```
┌─ CT-7X29 // TERMINAL ─────────────────────┐
│ > _                                        │
└───────────────────────────────────────────┘
```

---

### 3. Live HUD štatistiky `[STREDNÁ PRIORITA]`

**Čo:** V HUD corners (ktoré sú uz prítomné) pridáme live Supabase štatistiky miesto
statického textu.

**Dáta na zobrazenie:**
- Počet projektov v portfóliu (z `portfolio_items` tabuľky)
- Počet messagov / "leads" (anonymizovane ako "NODES: X")  
- Uptime (vypočítaný od dátumu launchu)

**Kde zmeniť:** `HeroSection.tsx` → HUD sekcia (riadky 628–649)

**Príklad:**
```
SYS :: COKTECH // MAIN_NODE
STATUS :: ONLINE // PROJECTS: 12 // NODES: 47
```

---

### 4. Page Depth Minimap `[STREDNÁ PRIORITA]`

**Čo:** Malá vertikálna mapa v pravom rohu obrazovky, ktorá ukazuje kde sa nachádzaš
na celej stránke. Navigácia kliknutím.

```
│ ■ HERO         (tu si)
│ ○ DIGITAL
│ ○ TRANSITION  
│ ○ AUTOMATION
│ ○ FOOTER
```

**Kde implementovať:** Nová komponenta `PageMinimap.tsx` pridaná do `Index.tsx` ako
globálny overlay (podobne ako Scanlines, RetroCursor).

---

### 5. World Signature Particles pri hover `[NÍZKA PRIORITA]`

**Čo:** Keď sa kurzor nachádza nad DIGITAL panelom, objaví sa pixel-grid efekt
(rovnaký ako v DigitalWorld). Nad AUTOMATION panelom sa objaví circuit-board efekt.

**Kde zmeniť:** `HeroSection.tsx` → obe motion.div karty, pridať `onMouseEnter`
s mini canvas overlay.

---

### 6. Scroll Teaser "Čo čaká dole" `[NÍZKA PRIORITA]`

**Čo:** Pri `progress > 0.90` (tesne pred koncom hero sekcie), pred vstupom do subświatov
ukážeme rýchly 2-sekundový preview — flash obrázkov z portfólia alebo krátky popis
levelov. Vytvorí anticipáciu.

**Kde implementovať:** `HeroSection.tsx` → nový blok za buttons, spustený pri
`showButtons && progress > 0.88`

---

## Poradie implementácie

```
1. Interaktívny terminál  ← najväčší wow efekt, najunikátnejšie
2. World Preview panely   ← informuje, prepája s obsahom
3. Live HUD štatistiky    ← ukazuje živosť stránky
4. Page Minimap           ← UX utility
5. World hover particles  ← polish
6. Scroll teaser          ← bonus
```

---

## Súbory na zmenu / vytvorenie

| Súbor | Akcia |
|-------|-------|
| `src/components/ui/hero-terminal.tsx` | Vytvoriť |
| `src/components/ui/page-minimap.tsx` | Vytvoriť |
| `src/components/landing/HeroSection.tsx` | Upraviť (panely + terminál + HUD) |
| `src/pages/Index.tsx` | Upraviť (pridať PageMinimap) |

---

## Technické poznámky

- Terminál nepoužíva žiadne externé deps — len `useState` + `useEffect` + `useRef`
- Supabase query pre live stats — jednoduchý `count` SELECT, volať pri `bootDone`
- Minimap sleduje `window.scrollY` cez pasívny event listener
- Všetky nové komponenty dodržiavajú existujúci design system (VT323, JetBrains Mono, #00ffaa)
