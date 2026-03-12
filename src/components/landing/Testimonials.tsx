import { type CSSProperties } from "react";
import { Star } from "lucide-react";

interface TestimonialItem {
  quote: string;
  highlight: string;
  author: string;
  role: string;
  company: string;
  initials: string;
  category: "web" | "camera";
  metric?: string;
  metricLabel?: string;
}

const testimonials: TestimonialItem[] = [
  {
    highlight: "Hotový za 2 týždne, nie za 2 mesiace.",
    quote: "Profesionálny prístup od prvého stretnutia. Web bol živý v rekordnom čase — presne to, čo malé firmy potrebujú. Výkon a dizajn na úrovni veľkých agentúr.",
    author: "Martin Kováč",
    role: "CEO",
    company: "TechNova SK",
    initials: "MK",
    category: "web",
    metric: "2×",
    metricLabel: "viac konverzií",
  },
  {
    highlight: "Systém funguje bez výpadkov už rok.",
    quote: "Kamerový systém nainštalovaný presne podľa plánu, v termíne a bez skrytých nákladov. Komunikácia bola výborná počas celého projektu.",
    author: "Jana Horváthová",
    role: "Manažérka prevádzky",
    company: "SecurePoint",
    initials: "JH",
    category: "camera",
    metric: "0",
    metricLabel: "výpadkov / rok",
  },
  {
    highlight: "Podpora po spustení je zlatá.",
    quote: "Moderný dizajn, rýchly web a skvelá podpora aj po spustení. Neriešim viac technické problémy — sústredím sa na biznis. Jednoznačne odporúčam.",
    author: "Peter Novák",
    role: "Zakladateľ",
    company: "DigiCraft",
    initials: "PN",
    category: "web",
    metric: "+64%",
    metricLabel: "nárast návštev",
  },
  {
    highlight: "Web aj kamery pod jednou strechou.",
    quote: "Komplexné riešenie webu aj bezpečnostných kamier od jedného dodávateľa. Ušetrili sme čas, peniaze aj nervy z koordinácie viacerých firiem.",
    author: "Lucia Šimková",
    role: "Riaditeľka",
    company: "SafeGuard Systems",
    initials: "LŠ",
    category: "camera",
    metric: "3×",
    metricLabel: "rýchlejšia reakcia",
  },
  {
    highlight: "AI funkcie, ktoré reálne šetria čas.",
    quote: "Implementovali nám automatizáciu pomocou AI, ktorá nahradila 3 hodiny manuálnej práce denne. Investícia sa vrátila do prvého mesiaca.",
    author: "Tomáš Blaho",
    role: "CTO",
    company: "AutoFlow Labs",
    initials: "TB",
    category: "web",
    metric: "3h",
    metricLabel: "ušetrených / deň",
  },
  {
    highlight: "Na sklad vidím aj cez Bratislavu.",
    quote: "Vzdialený prístup ku kamerám cez mobil funguje bez problémov aj v zahraničí. Notifikácie pri pohybe chodím okamžite. Spokojnosť na 100 %.",
    author: "Radoslav Mihálik",
    role: "Majiteľ",
    company: "StorePro SK",
    initials: "RM",
    category: "camera",
    metric: "24/7",
    metricLabel: "vzdialený dohľad",
  },
  {
    highlight: "E-shop s 0 záťažou na mňa.",
    quote: "Celý e-shop vrátane platobnej brány a skladu bol hotový do 3 týždňov. Tím riešil aj SEO a Google Analytics. Teraz predávam aj keď spím.",
    author: "Simona Kratochvílová",
    role: "Podnikateľka",
    company: "Boutique Bloom",
    initials: "SK",
    category: "web",
    metric: "3 týž.",
    metricLabel: "od nuly po live",
  },
  {
    highlight: "Inštalácia 12 kamier za jeden deň.",
    quote: "Montáž prebehla čisto, bez poškodenia maľovky a v dohodnutom čase. Technický tím vedel poradiť aj k optimálnemu umiestneniu pokrytia.",
    author: "Igor Červenák",
    role: "Facility Manager",
    company: "Logistic Hub BA",
    initials: "IČ",
    category: "camera",
    metric: "12",
    metricLabel: "kamier za 1 deň",
  },
];

const row1 = [...testimonials, ...testimonials, ...testimonials];
const row2 = [...testimonials.slice(4), ...testimonials.slice(0, 4), ...testimonials.slice(4), ...testimonials.slice(0, 4), ...testimonials.slice(4), ...testimonials.slice(0, 4)];

const Stars = () => (
  <div className="flex gap-0.5 mb-4">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} size={13} className="fill-primary text-primary" />
    ))}
  </div>
);

const TestimonialCard = ({ item }: { item: TestimonialItem }) => (
  <div className="flex-shrink-0 w-[360px] sm:w-[400px] rounded-2xl p-6 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1"
    style={{
      background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
      border: "1px solid rgba(255,255,255,0.07)",
      backdropFilter: "blur(10px)",
    }}
  >
    {/* Top row: stars + metric */}
    <div className="flex items-start justify-between">
      <Stars />
      {item.metric && (
        <div className="text-right">
          <div className="text-lg font-bold text-primary leading-none">{item.metric}</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">{item.metricLabel}</div>
        </div>
      )}
    </div>

    {/* Highlight */}
    <p className="text-sm font-semibold text-white leading-snug">
      "{item.highlight}"
    </p>

    {/* Full quote */}
    <p className="text-xs text-zinc-400 leading-relaxed flex-1">
      {item.quote}
    </p>

    {/* Divider */}
    <div className="h-px bg-white/5" />

    {/* Author row */}
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{
          background: item.category === "web"
            ? "linear-gradient(135deg, rgba(0,255,148,0.25), rgba(0,255,148,0.08))"
            : "linear-gradient(135deg, rgba(99,179,237,0.25), rgba(99,179,237,0.08))",
          color: item.category === "web" ? "hsl(var(--primary))" : "#63b3ed",
          border: `1px solid ${item.category === "web" ? "rgba(0,255,148,0.2)" : "rgba(99,179,237,0.2)"}`,
        }}
      >
        {item.initials}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-white truncate">{item.author}</p>
        <p className="text-[10px] text-zinc-500 truncate">{item.role} · {item.company}</p>
      </div>
      <span
        className="ml-auto text-[9px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
        style={{
          background: item.category === "web" ? "rgba(0,255,148,0.08)" : "rgba(99,179,237,0.08)",
          color: item.category === "web" ? "hsl(var(--primary))" : "#63b3ed",
          border: `1px solid ${item.category === "web" ? "rgba(0,255,148,0.15)" : "rgba(99,179,237,0.15)"}`,
        }}
      >
        {item.category === "web" ? "Web" : "Kamera"}
      </span>
    </div>
  </div>
);

const maskStyle: CSSProperties = {
  maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
};

const Testimonials = () => {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <style>{`
        @keyframes scrollLeft {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        @keyframes scrollRight {
          from { transform: translateX(-33.333%); }
          to   { transform: translateX(0); }
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-14 px-6">
        <span className="text-xs uppercase tracking-[0.2em] text-primary block font-mono mb-4">
          [ Čo hovoria klienti ]
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Dôvera postavená na výsledkoch
        </h2>
        <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">
          Reálne projekty. Reálni ľudia. Merateľné výsledky.
        </p>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="relative overflow-hidden mb-5 group" style={maskStyle}>
        <div
          className="flex gap-5 w-max group-hover:[animation-play-state:paused]"
          style={{ animation: "scrollLeft 40s linear infinite" }}
        >
          {row1.map((item, i) => (
            <TestimonialCard key={`r1-${i}`} item={item} />
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="relative overflow-hidden group" style={maskStyle}>
        <div
          className="flex gap-5 w-max group-hover:[animation-play-state:paused]"
          style={{ animation: "scrollRight 50s linear infinite" }}
        >
          {row2.map((item, i) => (
            <TestimonialCard key={`r2-${i}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
