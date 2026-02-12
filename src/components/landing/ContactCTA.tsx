import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const ContactCTA = () => {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
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
            <Link
              to="/kontakt"
              className="group bg-foreground text-background px-10 py-4 rounded-full font-medium text-sm uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-all duration-500 inline-flex items-center gap-2"
            >
              Začať projekt
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="mailto:hello@nexsol.dev"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              hello@nexsol.dev
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactCTA;
