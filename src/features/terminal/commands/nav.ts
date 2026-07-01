import type { CommandDef } from "../types";

const route = (path: string): CommandDef["run"] => (ctx) => {
  ctx.navigate(path);
  ctx.print({ text: `→ ${path}`, kind: "accent" });
  ctx.closeTerminal();
};

export const navCommands: CommandDef[] = [
  { name: "home", category: "nav", desc: "Domov",         aliases: ["/"],         run: route("/") },
  { name: "portfolio", category: "nav", desc: "Portfólio",                          run: route("/portfolio") },
  { name: "balicky", category: "nav", desc: "Balíčky",  aliases: ["pricing-page"], run: route("/balicky") },
  { name: "logika", category: "nav", desc: "Logika & ROI",                          run: route("/logika") },
  { name: "kontakt", category: "nav", desc: "Kontakt — formulár",                   run: route("/kontakt") },
  { name: "web",       category: "nav", desc: "Balíčky / web",        run: route("/balicky?tab=web") },
  { name: "auto",      category: "nav", desc: "Balíčky / automation", run: route("/balicky?tab=automation") },
  { name: "agenti",    category: "nav", desc: "Balíčky / AI agenti",  aliases: ["agents"], run: route("/balicky?tab=agents") },
  { name: "hybrid",    category: "nav", desc: "Balíčky / hybrid",     run: route("/balicky?tab=hybrid") },
  { name: "archive",   category: "nav", desc: "Archív",  hidden: true, run: route("/archive") },
  { name: "void",      category: "nav", desc: "Void",    hidden: true, run: route("/void") },
  { name: "doom",      category: "nav", desc: "Doom",    hidden: true, run: route("/doom") },
  { name: "memory",    category: "nav", desc: "Memory",  hidden: true, run: route("/memory") },
  {
    name: "cd", category: "nav", desc: "Zmeň route",
    usage: "<path>",
    run: (ctx) => {
      const target = ctx.args[0];
      if (!target || target === "..") {
        const parent = ctx.pathname.split("/").slice(0, -1).join("/") || "/";
        ctx.navigate(parent);
        ctx.print({ text: `→ ${parent}`, kind: "accent" });
        return;
      }
      const path = target.startsWith("/") ? target : `/${target}`;
      ctx.navigate(path);
      ctx.print({ text: `→ ${path}`, kind: "accent" });
    },
  },
  {
    name: "pwd", category: "nav", desc: "Aktuálny route",
    run: (ctx) => ctx.print({ text: ctx.pathname, kind: "accent" }),
  },
];
