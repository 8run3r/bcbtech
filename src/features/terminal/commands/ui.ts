import type { CommandDef } from "../types";

const THEME_PRESETS: Record<string, { primary: string; raw: string }> = {
  mint:   { primary: "#00ffaa", raw: "0,255,170" },
  cyan:   { primary: "#22e9ff", raw: "34,233,255" },
  amber:  { primary: "#FF8C00", raw: "255,140,0" },
  coral:  { primary: "#FF3D71", raw: "255,61,113" },
  blue:   { primary: "#4A9EFF", raw: "74,158,255" },
  violet: { primary: "#8B5CF6", raw: "139,92,246" },
};

const FONT_PRESETS: Record<string, string> = {
  mono:    "'JetBrains Mono', monospace",
  vt:      "'VT323', monospace",
  retro:   "'Space Mono', monospace",
  syne:    "'Syne', sans-serif",
};

export const uiCommands: CommandDef[] = [
  {
    name: "theme",
    category: "ui",
    desc: "Prepni accent farbu",
    usage: "<mint|cyan|amber|coral|blue|violet|reset>",
    run: (ctx) => {
      const arg = (ctx.args[0] || "").toLowerCase();
      if (!arg || arg === "list") {
        ctx.print([
          { text: "dostupné: " + Object.keys(THEME_PRESETS).join(", "), kind: "accent" },
        ]);
        return;
      }
      if (arg === "reset") {
        document.documentElement.style.removeProperty("--neon-primary");
        try { localStorage.removeItem("ct_theme_override"); } catch { /* noop */ }
        ctx.print({ text: "theme: reset na predvolené", kind: "accent" });
        return;
      }
      const preset = THEME_PRESETS[arg];
      if (!preset) {
        ctx.print({ text: `neznáma téma: ${arg}`, kind: "error" });
        return;
      }
      document.documentElement.style.setProperty("--neon-primary", preset.primary);
      try { localStorage.setItem("ct_theme_override", arg); } catch { /* noop */ }
      ctx.print({ text: `theme → ${arg} (${preset.primary})`, kind: "accent" });
    },
  },
  {
    name: "font",
    category: "ui",
    desc: "Prepni terminal font",
    usage: "<mono|vt|retro|syne>",
    run: (ctx) => {
      const arg = (ctx.args[0] || "").toLowerCase();
      if (!arg) {
        ctx.print({ text: "dostupné: " + Object.keys(FONT_PRESETS).join(", "), kind: "accent" });
        return;
      }
      const f = FONT_PRESETS[arg];
      if (!f) {
        ctx.print({ text: `neznámy font: ${arg}`, kind: "error" });
        return;
      }
      document.documentElement.style.setProperty("--terminal-font", f);
      try { localStorage.setItem("ct_terminal_font", arg); } catch { /* noop */ }
      ctx.print({ text: `font → ${arg}`, kind: "accent" });
    },
  },
  {
    name: "clear",
    category: "ui",
    desc: "Vyčisti výstup",
    aliases: ["cls"],
    run: (ctx) => ctx.clear(),
  },
];
