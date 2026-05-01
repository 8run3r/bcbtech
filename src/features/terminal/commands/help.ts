import type { CommandDef, TerminalLine, CategoryId } from "../types";

const CATEGORY_LABEL: Record<CategoryId, string> = {
  nav: "navigácia",
  info: "info",
  site: "stránka",
  ui: "rozhranie",
  egg: "easter eggs",
};

export const helpCommand: CommandDef = {
  name: "help",
  category: "info",
  desc: "Zoznam príkazov",
  aliases: ["?", "h"],
  run: (ctx) => {
    const lines: TerminalLine[] = [];
    lines.push({ text: "── coktech_os :: príkazy ─────────", kind: "accent" });

    const grouped: Record<CategoryId, CommandDef[]> = { nav: [], info: [], site: [], ui: [], egg: [] };
    for (const cmd of Object.values(ctx.registry)) {
      if (cmd.hidden) continue;
      // Avoid showing same command twice via aliases — registry has aliases as keys too
      if (cmd.name in grouped[cmd.category] === false) {
        if (!grouped[cmd.category].some((c) => c.name === cmd.name)) {
          grouped[cmd.category].push(cmd);
        }
      }
    }

    const order: CategoryId[] = ["nav", "site", "info", "ui", "egg"];
    for (const cat of order) {
      const cmds = grouped[cat];
      if (!cmds.length) continue;
      lines.push({ text: "" });
      lines.push({ text: `[ ${CATEGORY_LABEL[cat]} ]`, kind: "accent" });
      cmds.sort((a, b) => a.name.localeCompare(b.name));
      for (const c of cmds) {
        const usage = c.usage ? ` ${c.usage}` : "";
        const padded = (`/${c.name}${usage}`).padEnd(22, " ");
        lines.push({ text: ` ${padded} ${c.desc}` });
      }
    }
    lines.push({ text: "" });
    lines.push({ text: " tip: ↑↓ história · Tab autocomplete · Esc zavri", kind: "info" });
    ctx.print(lines);
  },
};
