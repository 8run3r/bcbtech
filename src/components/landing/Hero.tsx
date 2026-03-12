import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import EncryptedText from "@/components/ui/encrypted-text";
import { RippleButton } from "@/components/ui/ripple-button";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import SocialLinks from "@/components/SocialLinks";

const Hero = () => {
  const navigate = useNavigate();
  const [showIndicator, setShowIndicator] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const handleNavigate = useCallback((path: string) => {
    setTimeout(() => navigate(path), 300);
  }, [navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setShowIndicator(true), 2000);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.04] rounded-full blur-[200px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[11px] sm:text-sm text-muted-foreground mb-8 tracking-[0.12em] sm:tracking-[0.15em] uppercase font-mono leading-relaxed">

            <span className="text-primary/60">[</span>
            {" "}
            <EncryptedText
              text="Digitálne štúdio + Kamerové systémy"
              revealDelayMs={35}
              flipDelayMs={30}
              className="text-[11px] sm:text-sm tracking-[0.12em] sm:tracking-[0.15em]"
              encryptedClassName="text-primary/40"
              revealedClassName="text-muted-foreground" />

            {" "}
            <span className="text-primary/60">]</span>
          </motion.p>

          <h1 className="text-[clamp(2.6rem,9vw,8rem)] font-bold leading-[0.88] tracking-tighter mb-10">
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
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-sm sm:max-w-xl mx-auto mb-12 leading-relaxed px-2 sm:px-0">Webové aplikácie & profesionálna montáž kamerových systémov. Všetko pod jednou strechou.



          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">

            {/* Primary CTA — ripple effect */}
            <RippleButton
              onClick={() => handleNavigate("/kontakt")}
              rippleColor="hsl(160 100% 50% / 0.3)"
              className="w-full sm:w-auto group relative px-10 py-4 rounded-full font-semibold text-sm uppercase tracking-wider text-center bg-primary text-primary-foreground hover:brightness-110 transition-all duration-300"
            >
              Začať projekt
            </RippleButton>

            {/* Balíčky — interactive hover slide */}
            <InteractiveHoverButton
              onClick={() => handleNavigate("/balicky")}
              className="w-full sm:w-auto"
            >
              Balíčky
            </InteractiveHoverButton>

            {/* Riešenia — ripple ghost */}
            <RippleButton
              onClick={() => handleNavigate("/riesenia")}
              rippleColor="hsl(160 100% 50% / 0.2)"
              className="w-full sm:w-auto px-8 py-3 rounded-full text-sm text-foreground/70 hover:text-foreground border border-foreground/10 hover:border-foreground/20 backdrop-blur-sm font-semibold uppercase tracking-wider transition-all duration-300"
            >
              Naše riešenia
            </RippleButton>
          </motion.div>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center mt-8"
          >
            <SocialLinks />
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator — minimal pulse */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: showIndicator && scrollY < 200 ? 1 : 0,
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3 pointer-events-none"
      >
        <motion.div
          className="w-[1px] h-12 bg-gradient-to-b from-transparent via-primary/40 to-primary/80"
          animate={{ scaleY: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "top" }}
        />
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-primary/60"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>);


};

export default Hero;