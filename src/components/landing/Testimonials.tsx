import { type CSSProperties } from "react";
import { motion } from "framer-motion";

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  company: string;
}

const testimonials: TestimonialItem[] = [
  {
    quote: "Profesionálny prístup od prvého stretnutia. Web bol hotový v rekordnom čase a funguje bezchybne.",
    author: "Martin Kováč",
    role: "CEO",
    company: "TechNova SK",
  },
  {
    quote: "Kamerový systém nainštalovaný presne podľa plánu. Výborná komunikácia a spoľahlivosť na 100 percent.",
    author: "Jana Horváthová",
    role: "Manažérka prevádzky",
    company: "SecurePoint",
  },
  {
    quote: "Moderný dizajn, rýchly web a skvelá podpora aj po spustení. Jednoznačne odporúčam.",
    author: "Peter Novák",
    role: "Zakladateľ",
    company: "DigiCraft",
  },
  {
    quote: "Komplexné riešenie webu aj kamier pod jednou strechou. Ušetrili sme čas aj peniaze.",
    author: "Lucia Šimková",
    role: "Riaditeľka",
    company: "SafeGuard Systems",
  },
];

const row1 = [...testimonials, ...testimonials, ...testimonials];
const row2 = [...testimonials, ...testimonials, ...testimonials];

const TestimonialCard = ({ item }: { item: TestimonialItem }) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    className="flex-shrink-0 w-[380px] bg-zinc-900/80 border border-white/5 rounded-2xl p-6 px-7 hover:border-white/10 transition-colors duration-200"
  >
    <div className="mb-4">
      <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-zinc-400">
        {item.company}
      </span>
    </div>
    <p className="mb-5 text-white/90" style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.6 }}>
      "{item.quote}"
    </p>
    <div>
      <p className="text-sm font-bold text-white">{item.author}</p>
      <p className="text-xs text-zinc-500 mt-0.5">{item.role}</p>
    </div>
  </motion.div>
);

const maskStyle: CSSProperties = {
  maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
};

const Testimonials = () => {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
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

      <div className="mb-12 text-center">
        <span className="text-xs uppercase tracking-[0.2em] text-primary block font-mono">
          [ Testimonials ]
        </span>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="relative overflow-hidden mb-6 group" style={maskStyle}>
        <div
          className="flex gap-6 group-hover:[animation-play-state:paused]"
          style={{ animation: "scrollLeft 35s linear infinite" }}
        >
          {row1.map((item, i) => (
            <TestimonialCard key={`r1-${i}`} item={item} />
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="relative overflow-hidden group" style={maskStyle}>
        <div
          className="flex gap-6 group-hover:[animation-play-state:paused]"
          style={{ animation: "scrollRight 40s linear infinite" }}
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
