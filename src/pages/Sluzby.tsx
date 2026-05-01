import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PretextHeadline from "@/components/ui/pretext-headline";
import { SERVICES } from "@/data/services";
import ServiceScene from "@/features/services/ServiceScene";

const Sluzby = () => {
  return (
    <main className="relative bg-background min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-block text-xs uppercase tracking-[0.3em] font-mono mb-6"
            style={{ color: "var(--neon-primary)" }}
          >
            [ INDEX // SERVICES ]
          </motion.span>
          <PretextHeadline
            text="Služby"
            fontSize={88}
            fontWeight={800}
            color="var(--text-primary)"
            className="mb-6"
          />
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl"
          >
            Tech inštalácie a digital. Klimatizácie, kamery, fotovoltika, alarmy aj webové aplikácie.
            Žiadne stredné medzistupne — robíme všetko sami.
          </motion.p>
        </div>
      </section>

      {/* Service grid */}
      <section className="relative px-6 pb-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                to={`/sluzby/${s.slug}`}
                className="group relative block h-72 md:h-80 rounded-lg border bg-card/40 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-foreground/30"
                style={{
                  borderColor: `rgba(${s.hero.accentRaw},0.2)`,
                  ["--accent" as string]: s.hero.accent,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 60px rgba(${s.hero.accentRaw},0.15)`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "";
                }}
              >
                {/* Background scene */}
                {s.scene && (
                  <div className="absolute inset-0 opacity-50 group-hover:opacity-90 transition-opacity duration-500">
                    <ServiceScene variant={s.scene} accent={s.hero.accent} accentRaw={s.hero.accentRaw} />
                  </div>
                )}

                {/* Vignette */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85) 100%)" }}
                />

                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                  <div>
                    <span
                      className="text-[10px] uppercase tracking-[0.3em] font-mono"
                      style={{ color: s.hero.accent }}
                    >
                      {s.kicker}
                    </span>
                  </div>

                  <div>
                    <h3
                      className="text-3xl md:text-4xl font-bold tracking-tight mb-2"
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      {s.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{s.tagline}</p>
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider" style={{ color: s.hero.accent }}>
                      <span>Otvoriť</span>
                      <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                  </div>
                </div>

                {/* Corner brackets */}
                <span className="absolute top-3 right-3 w-4 h-4 border-t border-r opacity-50 group-hover:opacity-100 transition-opacity"
                      style={{ borderColor: s.hero.accent }} />
                <span className="absolute bottom-3 left-3 w-4 h-4 border-b border-l opacity-50 group-hover:opacity-100 transition-opacity"
                      style={{ borderColor: s.hero.accent }} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Sluzby;
