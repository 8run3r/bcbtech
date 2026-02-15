import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import EncryptedText from "@/components/ui/encrypted-text";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.04] rounded-full blur-[200px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted-foreground mb-8 tracking-[0.15em] uppercase font-mono">

            <span className="text-primary/60">[</span>
            {" "}
            <EncryptedText
              text="Digitálne štúdio + Kamerové systémy"
              revealDelayMs={35}
              flipDelayMs={30}
              className="text-sm tracking-[0.15em]"
              encryptedClassName="text-primary/40"
              revealedClassName="text-muted-foreground"
            />
            {" "}
            <span className="text-primary/60">]</span>
          </motion.p>

          <h1 className="text-[clamp(3rem,8vw,8rem)] font-bold leading-[0.85] tracking-tighter mb-10">
            <motion.span
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="block text-foreground">
              Kód a Bezpečnosť

            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="block text-primary glow-text">

              bez kompromisov
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-14 leading-relaxed">

            Webové aplikácie & profesionálna montáž kamerových systémov.
            Všetko pod jednou strechou.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5">

            <Link
              to="/kontakt"
              className="group relative bg-foreground text-background px-10 py-4 rounded-full font-medium text-sm uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-all duration-500">

              Začať projekt
            </Link>
            <Link
              to="/kamery"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider font-medium flex items-center gap-2 group">

              Kamerové systémy
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>);

};

export default Hero;
