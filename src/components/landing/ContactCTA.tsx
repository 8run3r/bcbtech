import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { RippleButton } from "@/components/ui/ripple-button";

const ContactCTA = () => {
  const navigate = useNavigate();

  const handleNavigate = useCallback((path: string) => {
    setTimeout(() => navigate(path), 300);
  }, [navigate]);

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}>

          <span className="text-xs uppercase tracking-[0.2em] text-primary mb-6 block font-mono">
            [ Kontakt ]
          </span>
          <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-bold tracking-tight leading-[0.95] mb-8">
            Máte nápad?
            <br />
            <span className="text-primary glow-text">Poďme tvoriť.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-12 leading-relaxed">
            Či už potrebujete web, appku alebo kamerový systém — ozvite sa
            a spoločne nájdeme to najlepšie riešenie.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <RippleButton
              onClick={() => handleNavigate("/kontakt")}
              rippleColor="hsl(160 100% 50% / 0.3)"
              className="w-full sm:w-auto group relative px-10 py-4 rounded-full font-semibold text-sm uppercase tracking-wider text-center bg-primary text-primary-foreground hover:brightness-110 transition-all duration-300"
            >
              Začať projekt
            </RippleButton>
            <a
              href="mailto:hello@coktech.sk"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              8run3r@gmail.com
            </a>
          </div>
        </motion.div>
      </div>
    </section>);
};

export default ContactCTA;