import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

const RebrandHero = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden">
      {/* Background glow — lighter blurs on mobile for perf */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[min(600px,90vw)] aspect-square rounded-full bg-violet/10 blur-[80px] sm:blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[min(400px,70vw)] aspect-square rounded-full bg-mint/5 blur-[70px] sm:blur-[100px]" />
      </div>

      {/* Glassmorphism card */}
      <div className="relative z-10 max-w-3xl w-full">
        <div className="backdrop-blur-xl bg-white/5 border border-violet/20 rounded-2xl p-6 sm:p-12 lg:p-16">
          <motion.h1
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-sans text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight"
          >
            Web Engineering &amp; AI Automation Studio
          </motion.h1>

          <motion.p
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-4 sm:mt-6 text-sm sm:text-lg text-white/60 leading-relaxed"
          >
            Tvorime weby, automatizujeme procesy, skalujeme biznis.
          </motion.p>

          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3"
          >
            <button
              onClick={() => scrollTo("services")}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-violet text-white font-medium text-sm tracking-wide hover:bg-violet/80 transition-colors"
            >
              Pozriet sluzby
            </button>
            <button
              onClick={() => scrollTo("contact")}
              className="w-full sm:w-auto px-6 py-3 rounded-lg border border-mint/30 text-mint font-medium text-sm tracking-wide hover:bg-mint/10 transition-colors"
            >
              Bezplatna konzultacia
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default RebrandHero;
