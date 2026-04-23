# CokTech Digital Studio — Rebrand Brief & Claude Code Prompt

## 1. Projekt Overview

**Cieľ:** Prebudovať coktech.tech z pôvodnej stránky s kamera/lovable elementmi na čisté **Digital Studio + Automation Agency** — futuristický glassmorphism, dark mode, Pretext.js animácie pri načítaní.

**Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · Framer Motion · `@chenglou/pretext`
**Package manager:** pnpm

---

## 2. Vizuálna Identita

| Token | Hodnota |
|---|---|
| `--bg-base` | `#050508` |
| `--bg-glass` | `rgba(255,255,255,0.04)` |
| `--border-glass` | `rgba(255,255,255,0.08)` |
| `--neon-primary` | `#7B61FF` (electric violet) |
| `--neon-secondary` | `#00F5C4` (cyber mint) |
| `--neon-accent` | `#FF3D71` (hot coral) |
| `--text-primary` | `#F0EEF6` |
| `--text-muted` | `rgba(240,238,246,0.45)` |
| `--font-display` | `'Syne'` (Google Fonts — bold, geometric) |
| `--font-body` | `'DM Sans'` (familiar z brandingu) |
| `--font-mono` | `'JetBrains Mono'` (tech credibility) |

**Glassmorphism štandard:**
```css
backdrop-filter: blur(20px) saturate(180%);
background: var(--bg-glass);
border: 1px solid var(--border-glass);
box-shadow: 0 8px 32px rgba(123,97,255,0.08);
```

---

## 3. Štruktúra Stránky

```
/
├── <Navbar>           — logo + nav links + CTA button (glass pill)
├── <HeroSection>      — Pretext animácia + headline + subtext + 2x CTA
├── <ServicesSection>  — CokTech Digital | CokTech Automate (2 karty)
└── <FooterCTA>        — minimálny footer s kontaktom
```

**Odstránené elementy:**
- ❌ Všetky kamera / video / photography referencie
- ❌ Lovable / "cute" / friendly-first messaging
- ❌ Akékoľvek portfolio fotografie
- ❌ Testimonials sekcia (nateraz)
- ❌ Pricing sekcia (nateraz — pridáme neskôr)
- ❌ Case studies (nateraz)
- ❌ About/founder sekcia (nateraz)

---

## 4. HeroSection — Pretext Animácia Spec

### Čo sa deje pri načítaní (timeline 0–2.5s):

1. **0ms** — stránka je čierna, prázdna
2. **100ms** — Pretext `prepare()` beží na headline text
3. **300ms** — každé slovo headline sa "zapíše" zľava doprava pomocou `layoutWithLines()` — slová sa objavujú jedno po druhom s custom easing, nie typewriter ale "materializácia" (opacity 0→1 + translateY 8px→0 per word)
4. **800ms** — subheadline fade in (štandardný Framer Motion)
5. **1100ms** — CTA tlačidlá slide up
6. **1400ms** — background noise texture + neon glow orby pomaly pulsujú

### Pretext implementácia:
```ts
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

// prepare() raz pri mount
const prepared = prepareWithSegments(headlineText, '700 72px Syne')

// layout() pri každom resize — žiadny reflow
layoutWithLines(prepared, containerWidth, 84, (line) => {
  line.forEach((word, i) => animateWord(word, i * 60)) // 60ms stagger per word
})
```

### Headline text (návrh):
```
We build digital
products that work.
```
*Subtext:* `Web engineering & AI automation for businesses that want results.`

---

## 5. ServicesSection — 2 Karty

### Karta 1: CokTech Digital
- **Icon:** `</>`  v neon violet krúžku
- **Tagline:** Web & E-commerce Engineering
- **Body:** Next.js weby, headless e-shopy, UI systémy. Od nuly po produkciu.
- **Stack chips:** `Next.js` `TypeScript` `Framer Motion` `Tailwind`
- **CTA link:** `Zistiť viac →`

### Karta 2: CokTech Automate
- **Icon:** `⚡` v neon mint krúžku
- **Tagline:** AI Workflows & Automation
- **Body:** n8n, Make, custom AI agenti. Automatizuj to čo ťahá čas.
- **Stack chips:** `n8n` `Claude API` `Make` `Zapier`
- **CTA link:** `Zistiť viac →`

**Karta štýl:** glassmorphism card, hover efekt — subtle neon border glow + translateY(-4px)

---

## 6. Navbar

- **Ľavá strana:** `CokTech` logo (Syne Bold) + `.digital` (neon violet, mono font)
- **Pravá strana:** `Services` · `Work` · `Contact` + pill CTA button `Get a quote →`
- **Sticky** s `backdrop-filter: blur(24px)` pri scroll
- **Mobile:** hamburger → full screen glass overlay menu

---

## 7. Background / Atmosféra

- Solid `#050508` base
- 2x veľké neon orby (violet + mint) — `radial-gradient`, absolute positioned, `blur(120px)`, `opacity: 0.12`, pomaly pulsujú cez `@keyframes`
- SVG noise texture overlay `opacity: 0.03` (grain efekt)
- Žiadne obrázky, žiadne fotky — čisto typografia + geometria

---

---

# Claude Code Prompt

> Skopíruj a použi priamo v Claude Code

---

```
You are rebuilding the coktech.tech website from scratch as a Digital Studio & Automation Agency landing page. The old site had camera/photography and "lovable" elements — remove all of that completely. No photos, no camera references, no warm friendly tone. This is a technical creative studio.

TECH STACK: Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, @chenglou/pretext
PACKAGE MANAGER: pnpm

Install these packages first:
pnpm add @chenglou/pretext framer-motion

---

## DESIGN SYSTEM

CSS variables in globals.css:
--bg-base: #050508
--bg-glass: rgba(255,255,255,0.04)
--border-glass: rgba(255,255,255,0.08)
--neon-primary: #7B61FF
--neon-secondary: #00F5C4
--neon-accent: #FF3D71
--text-primary: #F0EEF6
--text-muted: rgba(240,238,246,0.45)

Fonts (add to layout.tsx via next/font/google):
- Syne (weights: 700, 800) — display/headlines
- DM Sans (weights: 400, 500) — body
- JetBrains Mono (weights: 400) — code chips, labels

---

## FILE STRUCTURE TO CREATE

app/
  layout.tsx         — fonts, metadata, dark background
  page.tsx           — assembles all sections
components/
  Navbar.tsx
  HeroSection.tsx    — contains Pretext animation logic
  ServicesSection.tsx
  FooterCTA.tsx

---

## HeroSection — PRETEXT ANIMATION (most important)

Install and use @chenglou/pretext for the headline. The headline is:
"We build digital products that work."

Logic:
1. On mount, call prepare() with the headline string and font '700 72px Syne'
2. Call layoutWithLines() to get word positions
3. Animate each word with Framer Motion: initial={{ opacity: 0, y: 8 }}, animate={{ opacity: 1, y: 0 }}
4. Stagger: each word delays by its index * 60ms
5. After all words appear (approx 800ms), animate in the subheadline, then the two CTA buttons
6. On window resize, re-run layout() only (not prepare()) — no DOM reflow

The subheadline text: "Web engineering & AI automation for businesses that want results."

Two CTA buttons:
- Primary (glass pill with neon violet border): "Start a project →"
- Secondary (text link with underline): "See our work"

Background during hero:
- Two large blurred orbs: one violet (#7B61FF, blur 140px, opacity 0.12) top-right, one mint (#00F5C4, blur 120px, opacity 0.10) bottom-left
- Both pulse slowly via CSS @keyframes (scale 1 → 1.15, 4s infinite alternate)
- SVG noise texture overlay at opacity 0.03

---

## NAVBAR

Left: "CokTech" in Syne Bold + ".digital" in JetBrains Mono neon violet (#7B61FF)
Right nav links: Services · Work · Contact
Right CTA: pill button "Get a quote →" with neon violet border, glass bg

Behavior:
- On scroll > 20px: add backdrop-filter blur(24px) + border-bottom glass border
- Mobile (<768px): hamburger icon → fullscreen overlay menu (glass bg, links centered)

---

## SERVICES SECTION

Two glassmorphism cards side by side (stack on mobile).

Card 1 — CokTech Digital:
- Icon: "</>" in a neon violet (#7B61FF) circle (40px)
- Label (mono): "01 / DIGITAL"
- Title (Syne): "Web & E-commerce Engineering"
- Body (DM Sans): "Next.js weby, headless e-shopy, UI systémy. Od nuly po produkciu."
- Tech chips: Next.js · TypeScript · Framer Motion · Tailwind (small mono pills with glass bg)
- CTA: "Learn more →" in neon violet

Card 2 — CokTech Automate:
- Icon: "⚡" in a neon mint (#00F5C4) circle (40px)
- Label (mono): "02 / AUTOMATE"
- Title (Syne): "AI Workflows & Automation"
- Body (DM Sans): "n8n, Make, custom AI agenti. Automatizuj to čo ťahá čas."
- Tech chips: n8n · Claude API · Make · Zapier
- CTA: "Learn more →" in neon mint

Card hover: translateY(-4px) + neon glow border (box-shadow 0 0 0 1px neon color)
Card base: backdrop-filter blur(20px), bg rgba(255,255,255,0.04), border rgba(255,255,255,0.08)

---

## FOOTER CTA

Minimal. Center aligned.
- Text (Syne, large): "Ready to build something real?"
- Subtext: "studio@coktech.tech"
- One button: "Start a conversation →"
- Bottom: tiny copyright "© 2025 CokTech Digital. Bratislava, Slovakia."

---

## RULES

- TypeScript strict, no `any`
- All components are 'use client' only where needed (Pretext + Framer Motion = client)
- Tailwind only for layout/spacing, CSS variables for colors
- No images, no <img> tags, no photos
- No camera, photography, or "lovable" references anywhere
- Mobile-first responsive
- Use Framer Motion's `useInView` for ServicesSection card entrance animations
- Pretext runs only in browser (guard with typeof window !== 'undefined')

Generate all files completely, no placeholders.
```
