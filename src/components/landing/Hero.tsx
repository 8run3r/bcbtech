import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 grid-bg noise-bg" />
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted-foreground mb-8 tracking-[0.15em] uppercase"
          >
            Digitálne štúdio — 2026
          </motion.p>

          <h1 className="text-[clamp(3rem,8vw,8rem)] font-bold leading-[0.85] tracking-tighter mb-10">
            <motion.span
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="block text-foreground"
            >
              Kód, ktorý
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="block text-primary glow-text"
            >
              posúva hranice
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-14 leading-relaxed"
          >
            Od nápadu po produkciu. Vytvárame webové zážitky,
            ktoré si ľudia pamätajú.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <Link
              to="/kontakt"
              className="group relative bg-foreground text-background px-10 py-4 rounded-full font-medium text-sm uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-all duration-500"
            >
              Začať projekt
            </Link>
            <Link
              to="/portfolio"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider font-medium flex items-center gap-2"
            >
              Pozrieť práce
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
