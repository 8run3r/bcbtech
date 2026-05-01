import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { ServiceConfig } from "@/data/services";

interface Props {
  service: ServiceConfig;
}

/**
 * AC kW calculator. Heuristic: 100 W / m² for standard ceiling 2.7 m,
 * +sun penalty +20-40 %, +people +100 W each, +electronics +20 %.
 * Output is rounded up to nearest 0.5 kW and matched to typical split tier.
 */
const ServiceCalculator = ({ service }: Props) => {
  const { hero, kicker } = service;
  const [area, setArea] = useState(25);
  const [height, setHeight] = useState(2.7);
  const [sun, setSun] = useState<"low" | "med" | "high">("med");
  const [people, setPeople] = useState(2);

  const kw = useMemo(() => {
    const sunMult = sun === "high" ? 1.35 : sun === "med" ? 1.15 : 1.0;
    const heightMult = height / 2.7;
    const base = area * 100 * sunMult * heightMult;
    const peopleW = people * 100;
    const electronicsW = area * 20;
    const totalW = base + peopleW + electronicsW;
    return Math.ceil(totalW / 500) * 0.5; // round up to nearest 0.5 kW
  }, [area, height, sun, people]);

  const tier = useMemo(() => {
    if (kw <= 2.5) return { label: "Split 2.5 kW", note: "~890 €", model: "ideálne pre miestnosť do 25 m²" };
    if (kw <= 3.5) return { label: "Split 3.5 kW", note: "~1 090 €", model: "miestnosť 25–35 m²" };
    if (kw <= 5.0) return { label: "Split 5.0 kW", note: "~1 390 €", model: "miestnosť 35–50 m²" };
    if (kw <= 7.0) return { label: "Split 7.0 kW", note: "~1 690 €", model: "veľká miestnosť alebo open space" };
    return { label: "Multi-split systém", note: "od 2 490 €", model: "treba viac vnútorných jednotiek" };
  }, [kw]);

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <span className="text-xs uppercase tracking-[0.2em] font-mono mb-4 block" style={{ color: hero.accent }}>
            {kicker} / CALCULATOR
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: "Syne, sans-serif" }}>
            Aký výkon potrebuješ
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Posúvaj sliderami — výpočet sa upraví v reálnom čase. Heuristika, presný výpočet pri obhliadke.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative grid md:grid-cols-2 gap-10 p-8 md:p-12 rounded-lg border bg-card/40 backdrop-blur-sm overflow-hidden"
          style={{ borderColor: `rgba(${hero.accentRaw},0.25)` }}
        >
          {/* Inputs */}
          <div className="space-y-8">
            <Slider
              label="Plocha miestnosti"
              value={area}
              min={10}
              max={120}
              step={1}
              suffix="m²"
              accent={hero.accent}
              onChange={setArea}
            />
            <Slider
              label="Výška stropu"
              value={height}
              min={2.3}
              max={5}
              step={0.1}
              suffix="m"
              accent={hero.accent}
              onChange={setHeight}
            />

            <div>
              <div className="flex justify-between text-xs font-mono uppercase tracking-wider mb-3">
                <span className="text-muted-foreground">Slnečné žiarenie</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["low", "med", "high"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSun(s)}
                    className="px-4 py-3 rounded text-xs font-mono uppercase tracking-wider transition-all"
                    style={{
                      background: sun === s ? `rgba(${hero.accentRaw},0.18)` : "rgba(255,255,255,0.02)",
                      border: `1px solid rgba(${hero.accentRaw},${sun === s ? 0.5 : 0.15})`,
                      color: sun === s ? hero.accent : undefined,
                    }}
                  >
                    {s === "low" ? "tieň" : s === "med" ? "stred" : "slnko"}
                  </button>
                ))}
              </div>
            </div>

            <Slider
              label="Počet osôb"
              value={people}
              min={1}
              max={10}
              step={1}
              suffix=""
              accent={hero.accent}
              onChange={setPeople}
            />
          </div>

          {/* Result */}
          <div
            className="relative flex flex-col justify-center p-8 rounded"
            style={{
              background: `linear-gradient(135deg, rgba(${hero.accentRaw},0.08), transparent)`,
              border: `1px solid rgba(${hero.accentRaw},0.2)`,
            }}
          >
            <div className="text-xs font-mono uppercase tracking-[0.2em] mb-3 opacity-60">odporúčaný výkon</div>
            <motion.div
              key={kw}
              initial={{ opacity: 0.5, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-baseline gap-3 mb-8"
            >
              <span className="text-7xl font-bold tabular-nums" style={{ color: hero.accent, fontFamily: "Syne, sans-serif" }}>
                {kw.toFixed(1)}
              </span>
              <span className="text-3xl font-bold opacity-60" style={{ fontFamily: "Syne, sans-serif" }}>kW</span>
            </motion.div>

            <div className="border-t border-border/40 pt-6 space-y-2">
              <div className="text-xs font-mono uppercase tracking-wider opacity-60">odporúčaná jednotka</div>
              <div className="text-xl font-bold" style={{ fontFamily: "Syne, sans-serif" }}>{tier.label}</div>
              <div className="text-sm text-muted-foreground">{tier.model}</div>
              <div className="text-sm font-mono pt-2" style={{ color: hero.accent }}>{tier.note}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  accent: string;
  onChange: (v: number) => void;
}

const Slider = ({ label, value, min, max, step, suffix, accent, onChange }: SliderProps) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between text-xs font-mono uppercase tracking-wider mb-3">
        <span className="text-muted-foreground">{label}</span>
        <span style={{ color: accent }}>{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full appearance-none bg-transparent cursor-pointer focus:outline-none"
        style={{
          ["--accent" as string]: accent,
          background: `linear-gradient(to right, ${accent} 0%, ${accent} ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`,
          height: 4,
          borderRadius: 2,
        }}
      />
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${accent};
          border: 2px solid #000;
          box-shadow: 0 0 10px ${accent};
          cursor: pointer;
          margin-top: -6px;
        }
        input[type=range]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${accent};
          border: 2px solid #000;
          box-shadow: 0 0 10px ${accent};
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default ServiceCalculator;
