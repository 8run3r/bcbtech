import type { CommandDef } from "../types";
import { ROUTE_ART, COKTECH_LOGO } from "../asciiArt";

const FORTUNES = [
  "Predčasná optimalizácia je koreň všetkého zla. — Knuth",
  "Dva najťažšie problémy v computer science: cache invalidation, naming things, off-by-one errors.",
  "Funguje to. Necmukaj.",
  "Ak nevieš ako, opýtaj sa Stacka. Ak nevieš ani na čo sa spýtať, choď spať.",
  "Najlepší debug je `console.log(\"sem\")`.",
  "AI vie kódovať, ale nikdy nevidela klienta o 17:55 v piatok.",
  "Pre každý ticket je niekde kávovar.",
  "Test, ktorý prejde lokálne, je test ktorý prejde lokálne.",
  "Make it work, make it right, make it fast. V tom poradí.",
  "git push --force je posledný argument.",
];

const HACK_LINES = [
  "[ INIT ] connecting to mainframe...",
  "[ AUTH ] bypassing 2FA token...",
  "[ AUTH ] OK — root@coktech",
  "[ FIND ] scanning subnet 10.0.0.0/16",
  "[ FIND ] 142 hosts up",
  "[ EXPL ] CVE-2026-31337 — vuln found",
  "[ EXPL ] payload delivered",
  "[ ROOT ] shell access acquired",
  "[ DATA ] ░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%",
  "[ EXIT ] traces wiped",
  "",
  "...len žartujem, je to vizuálny gag :)",
];

export const eggCommands: CommandDef[] = [
  {
    name: "matrix",
    category: "egg",
    desc: "Matrix rain (30s)",
    usage: "[seconds]",
    run: (ctx) => {
      const ms = (Number(ctx.args[0]) || 30) * 1000;
      ctx.overlay("matrix", ms);
      ctx.print({ text: `> matrix rain spustený (Esc pre exit)`, kind: "accent" });
    },
  },
  {
    name: "glitch",
    category: "egg",
    desc: "CRT glitch (5s)",
    usage: "[seconds]",
    run: (ctx) => {
      const ms = (Number(ctx.args[0]) || 5) * 1000;
      ctx.overlay("glitch", ms);
      ctx.print({ text: `> chromatic aberration ON · ${ms / 1000}s`, kind: "accent" });
    },
  },
  {
    name: "panic",
    category: "egg",
    desc: "Red alert flash",
    run: (ctx) => {
      ctx.overlay("panic", 3500);
      ctx.print({ text: ">>>>>> SYSTEM PANIC <<<<<<", kind: "error" });
    },
  },
  {
    name: "boot",
    category: "egg",
    desc: "Fake reboot animation",
    run: (ctx) => {
      ctx.overlay("boot", 4500);
      ctx.print({ text: "rebooting coktech_os...", kind: "accent" });
    },
  },
  {
    name: "scan",
    category: "egg",
    desc: "Fake recon scan",
    run: (ctx) => {
      ctx.overlay("scan", 4000);
      ctx.print({ text: "spúšťam recon protokol...", kind: "accent" });
    },
  },
  {
    name: "vacuum",
    category: "egg",
    desc: "Vysaj UI (vrať Esc)",
    run: (ctx) => {
      ctx.overlay("vacuum", 6000);
      ctx.print({ text: "*VWOOOOM*", kind: "accent" });
    },
  },
  {
    name: "hack",
    category: "egg",
    desc: "Tváriť sa ako hacker",
    run: async (ctx) => {
      for (const line of HACK_LINES) {
        ctx.print({ text: line, kind: line.startsWith("[ ROOT") ? "accent" : "info" });
        await new Promise((r) => setTimeout(r, 280));
      }
    },
  },
  {
    name: "cat",
    category: "egg",
    desc: "ASCII art route",
    usage: "<route>",
    run: (ctx) => {
      const target = ctx.args[0] || ctx.pathname;
      const path = target.startsWith("/") ? target : `/${target}`;
      const art = ROUTE_ART[path];
      if (!art) {
        ctx.print({ text: `cat: ${path}: no art available`, kind: "warn" });
        return;
      }
      ctx.print(art.map((l) => ({ text: l, kind: "art" })));
    },
  },
  {
    name: "logo",
    category: "egg",
    desc: "Veľké CokTech logo",
    run: (ctx) => ctx.print(COKTECH_LOGO.map((l) => ({ text: l, kind: "art" }))),
  },
  {
    name: "fortune",
    category: "egg",
    desc: "Náhodná múdrosť",
    aliases: ["wisdom"],
    run: (ctx) => {
      const f = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
      ctx.print({ text: `❝ ${f} ❞`, kind: "accent" });
    },
  },
  {
    name: "summon",
    category: "egg",
    desc: "Vyvolaj easter egg",
    usage: "<doom|void|memory>",
    run: (ctx) => {
      const target = (ctx.args[0] || "").toLowerCase();
      if (!["doom", "void", "memory", "archive"].includes(target)) {
        ctx.print({ text: "summon: doom | void | memory | archive", kind: "warn" });
        return;
      }
      ctx.print({ text: `vyvolávam: ${target}`, kind: "accent" });
      setTimeout(() => {
        ctx.navigate(`/${target}`);
        ctx.closeTerminal();
      }, 600);
    },
  },
  {
    name: "konami",
    category: "egg",
    desc: "↑↑↓↓←→←→ B A",
    hidden: true,
    run: (ctx) => {
      ctx.print({ text: "+++ EXTRA LIFE GRANTED +++", kind: "accent" });
      ctx.overlay("glitch", 1500);
    },
  },
  {
    name: "sudo",
    category: "egg",
    desc: "...",
    hidden: true,
    run: (ctx) => {
      ctx.print({ text: `Permission denied: ${ctx.args.join(" ") || "rm -rf /"}`, kind: "error" });
      ctx.print({ text: "this incident will be reported.", kind: "warn" });
    },
  },
  {
    name: "rm",
    category: "egg",
    desc: "...",
    hidden: true,
    run: (ctx) => {
      if (ctx.args.includes("-rf") && ctx.args.includes("/")) {
        ctx.print({ text: "nice try.", kind: "warn" });
        ctx.overlay("panic", 2000);
      } else {
        ctx.print({ text: `rm: cannot remove '${ctx.args.join(" ") || "?"}': read-only filesystem`, kind: "error" });
      }
    },
  },
  {
    name: "exit",
    category: "ui",
    desc: "Zavri terminál",
    aliases: ["quit", "q"],
    run: (ctx) => ctx.closeTerminal(),
  },
];
