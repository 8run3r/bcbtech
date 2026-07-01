import type { CommandDef, TerminalLine } from "../types";

const PAGE_LOAD_AT = Date.now();

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h) return `${h}h ${m}m ${sec}s`;
  if (m) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export const infoCommands: CommandDef[] = [
  {
    name: "whoami",
    category: "info",
    desc: "Tvoj browser fingerprint",
    run: (ctx) => {
      const ua = navigator.userAgent;
      const vendor = navigator.vendor || "—";
      const lang = navigator.language;
      const platform = (navigator as { platform?: string }).platform || "—";
      const cores = navigator.hardwareConcurrency || "?";
      const mem = (navigator as { deviceMemory?: number }).deviceMemory ?? "?";
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const screenWH = `${screen.width}×${screen.height}`;
      const viewWH = `${window.innerWidth}×${window.innerHeight}`;
      const dpr = window.devicePixelRatio.toFixed(1);
      const cookies = navigator.cookieEnabled ? "ENABLED" : "DISABLED";
      const online = navigator.onLine ? "ONLINE" : "OFFLINE";

      // Parse short browser name from UA
      let browser = "unknown";
      if (/Firefox\//.test(ua)) browser = "Firefox";
      else if (/Edg\//.test(ua)) browser = "Edge";
      else if (/Chrome\//.test(ua)) browser = "Chrome";
      else if (/Safari\//.test(ua)) browser = "Safari";

      const lines: TerminalLine[] = [
        { text: "── identity ──────────────────", kind: "accent" },
        { text: ` browser    ${browser}` },
        { text: ` platform   ${platform}` },
        { text: ` vendor     ${vendor}` },
        { text: ` lang       ${lang}` },
        { text: ` timezone   ${tz}` },
        { text: ` cores      ${cores}` },
        { text: ` memory     ${mem} GB` },
        { text: ` screen     ${screenWH} (DPR ${dpr})` },
        { text: ` viewport   ${viewWH}` },
        { text: ` cookies    ${cookies}` },
        { text: ` network    ${online}` },
      ];
      ctx.print(lines);
    },
  },
  {
    name: "time",
    category: "info",
    desc: "Aktuálny čas + uptime stránky",
    run: (ctx) => {
      const now = new Date();
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const local = now.toLocaleString("sk-SK", { hour12: false });
      const iso = now.toISOString();
      const uptime = formatDuration(Date.now() - PAGE_LOAD_AT);
      ctx.print([
        { text: ` local      ${local}`, kind: "info" },
        { text: ` iso (utc)  ${iso}`, kind: "info" },
        { text: ` tz         ${tz}`, kind: "info" },
        { text: ` uptime     ${uptime}`, kind: "accent" },
      ]);
    },
  },
  {
    name: "history",
    category: "info",
    desc: "Posledné príkazy",
    run: (ctx) => {
      if (!ctx.history.length) {
        ctx.print({ text: "(história je prázdna)", kind: "info" });
        return;
      }
      const lines = ctx.history.slice(0, 20).map((h, i) => ({
        text: ` ${String(i + 1).padStart(2, "0")}  ${h}`,
      }));
      ctx.print(lines);
    },
  },
  {
    name: "ls",
    category: "info",
    desc: "Vypíš dostupné routy",
    run: (ctx) => {
      const routes = [
        ["/", "domov"],
        ["/portfolio", "live projekty"],
        ["/balicky", "ceny + balíčky"],
        ["/logika", "ROI + porovnania"],
        ["/kontakt", "formulár + telefón"],
      ];
      ctx.print(routes.map(([p, d]) => ({ text: ` ${p.padEnd(14)}  ${d}`, kind: "info" })));
    },
  },
  {
    name: "echo",
    category: "info",
    desc: "Vypíš text",
    usage: "<text>",
    run: (ctx) => {
      ctx.print({ text: ctx.args.join(" ") || "" });
    },
  },
  {
    name: "date",
    category: "info",
    desc: "Krátky dátum",
    run: (ctx) => {
      ctx.print({ text: new Date().toLocaleString("sk-SK"), kind: "accent" });
    },
  },
];
