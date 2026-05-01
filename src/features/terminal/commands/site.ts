import type { CommandDef, TerminalLine } from "../types";

/* ── Tiny corpus for `search` — kept in sync with public-facing copy ── */
const CORPUS: { keywords: string; title: string; route: string; snippet: string }[] = [
  { keywords: "web stránka prezentácia website starter business shop", title: "Webové stránky", route: "/balicky?tab=web", snippet: "Starter 390 € · Business 890 € · Shop 1 690 €" },
  { keywords: "automation automatizácia workflow agent ai n8n zapier", title: "Automatizácia", route: "/balicky?tab=automation", snippet: "Workflow 590 € · Agent 1 290 € · Hybrid od 2 490 €" },
  { keywords: "marketing seo ads ppc social media reklama", title: "Marketing", route: "/balicky?tab=marketing", snippet: "Audit 290 € · Mesačný retainer od 590 €" },
  { keywords: "kamery cctv ip security surveillance hikvision dahua", title: "Kamery", route: "/balicky", snippet: "Set 4 ks od 1 290 € · IP/CCTV/AI" },
  { keywords: "kontakt email telefón obhliadka", title: "Kontakt", route: "/kontakt", snippet: "studio@coktech.tech · +421 911 640 660" },
  { keywords: "portfolio projekty case study referencie", title: "Portfólio", route: "/portfolio", snippet: "Live projekty + before/after" },
  { keywords: "logika argumenty roi porovnanie agentúra freelancer", title: "Logika & ROI", route: "/logika", snippet: "Návratnosť, porovnanie, proces" },
  { keywords: "doom hra easter egg game", title: "Doom", route: "/doom", snippet: "ASCII shooter — len pre nájdených" },
];

const PRICING_TABLE = [
  "── ceny / orientačne ─────────────────────────",
  "  WEB",
  "    Starter           od   390 €",
  "    Business          od   890 €",
  "    Shop / E-shop     od 1 690 €",
  "  AUTOMATION",
  "    Workflow setup    od   590 €",
  "    AI agent          od 1 290 €",
  "  MARKETING",
  "    Audit             od   290 €",
  "    Retainer / mesiac od   590 €",
  "  HYBRID",
  "    Setup + retainer  od 1 990 €",
  "──────────────────────────────────────────────",
  "  /balicky pre detail   ·   /kontakt pre ponuku",
];

export const siteCommands: CommandDef[] = [
  {
    name: "search",
    category: "site",
    desc: "Fuzzy hľadanie po stránke",
    usage: "<query>",
    aliases: ["find", "s"],
    run: (ctx) => {
      const q = ctx.args.join(" ").trim().toLowerCase();
      if (!q) {
        ctx.print({ text: "použitie: /search <text>", kind: "warn" });
        return;
      }
      const tokens = q.split(/\s+/).filter(Boolean);
      const scored = CORPUS.map((item) => {
        const hay = (item.keywords + " " + item.title + " " + item.snippet).toLowerCase();
        const score = tokens.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0);
        return { item, score };
      })
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      if (!scored.length) {
        ctx.print({ text: `nič nenájdené pre "${q}"`, kind: "warn" });
        return;
      }
      ctx.print({ text: `── ${scored.length} výsledkov ───────────`, kind: "accent" });
      const lines: TerminalLine[] = [];
      scored.forEach((s) => {
        lines.push({ text: `▸ ${s.item.title}`, kind: "link", to: s.item.route });
        lines.push({ text: `   ${s.item.snippet}` });
      });
      ctx.print(lines);
    },
  },
  {
    name: "pricing",
    category: "site",
    desc: "Cenník inline",
    aliases: ["price", "cena", "ceny"],
    run: (ctx) => ctx.print(PRICING_TABLE.map((t) => ({ text: t }))),
  },
  {
    name: "kontakt-info",
    category: "site",
    desc: "Kontakt inline (bez nav)",
    aliases: ["contact", "info"],
    run: (ctx) => {
      ctx.print([
        { text: "── kontakt ────────────────────", kind: "accent" },
        { text: " e-mail   studio@coktech.tech" },
        { text: " telefón  +421 911 640 660" },
        { text: " adresa   Levice, SK" },
        { text: " hodiny   Pon–Pia 9-18, So 10-14" },
        { text: " web      coktech.tech" },
      ]);
    },
  },
  {
    name: "social",
    category: "site",
    desc: "Sociálne siete",
    run: (ctx) => {
      ctx.print([
        { text: "── social ─────────────────────", kind: "accent" },
        { text: " IG  @coktech.tech" },
        { text: " LI  /company/coktech" },
        { text: " FB  /coktech.tech" },
        { text: " YT  /@coktech" },
      ]);
    },
  },
  {
    name: "book",
    category: "site",
    desc: "Otvorí kontakt s predvolením",
    usage: "[obhliadka|web|auto|marketing]",
    run: (ctx) => {
      const topic = ctx.args[0] || "obhliadka";
      ctx.navigate(`/kontakt?subject=${encodeURIComponent(topic)}`);
      ctx.print({ text: `→ /kontakt?subject=${topic}`, kind: "accent" });
      ctx.closeTerminal();
    },
  },
  {
    name: "recent",
    category: "site",
    desc: "Posledné navštívené routy",
    run: (ctx) => {
      try {
        const raw = sessionStorage.getItem("ct_recent_routes");
        const routes: string[] = raw ? JSON.parse(raw) : [];
        if (!routes.length) {
          ctx.print({ text: "(žiadne posledné routy)", kind: "info" });
          return;
        }
        ctx.print(routes.slice(0, 10).map((r) => ({ text: ` ${r}`, kind: "link", to: r })));
      } catch {
        ctx.print({ text: "session storage chyba", kind: "error" });
      }
    },
  },
  {
    name: "uptime",
    category: "site",
    desc: "Build hash + verzia",
    run: (ctx) => {
      ctx.print([
        { text: " coktech_os v2.4", kind: "accent" },
        { text: ` build      ${import.meta.env.MODE}` },
        { text: ` host       ${window.location.host}` },
        { text: ` agent      ${navigator.userAgent.slice(0, 60)}` },
      ]);
    },
  },
];
