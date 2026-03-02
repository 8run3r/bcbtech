import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import cokLogo from "@/assets/coktech-logo.png";

const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-border/10 py-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Logo & tagline */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}>

              <Link to="/" className="flex items-center gap-2.5 inline-block mb-4">
                <img src={cokLogo} alt="Cok Tech logo" className="h-8 w-auto" />
                <span className="text-2xl font-bold tracking-tight">
                  <span className="text-primary">Cok</span>
                  <span className="text-foreground"> Tech</span>
                </span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">
                Webové aplikácie & kamerové systémy. Od dizajnu po montáž — všetko pod jednou strechou.
              </p>
              <div className="space-y-2">
                <a href="mailto:8run3r@gmail.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Mail size={14} className="text-primary/60" /> 8run3r@gmail.com
                </a>
                <a href="tel:+421911640660" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Phone size={14} className="text-primary/60" /> +421 911 640 660
                </a>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin size={14} className="text-primary/60" /> Levice, Slovensko
                </span>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-5">Navigácia</h4>
            <ul className="space-y-3">
              {[
              { label: "Portfólio", href: "/portfolio" },
              { label: "Kamery", href: "/kamery" },
              { label: "Balíčky", href: "/balicky" },
              { label: "Tech", href: "/tech" },
              { label: "Kontakt", href: "/kontakt" }].
              map((link) =>
              <li key={link.href}>
                  <Link
                  to={link.href}
                  className="shimmer-link relative text-sm text-muted-foreground hover:text-foreground transition-colors">

                    {link.label}
                    <span className="shimmer-underline absolute left-0 right-0 bottom-0 h-[1px] rounded-full" />
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-5">Služby</h4>
            <ul className="space-y-3">
              {[
              { label: "Web aplikácie", href: "/balicky?tab=web" },
              { label: "Kamerové systémy", href: "/kamery" },
              { label: "UI/UX Dizajn", href: "/balicky" },
              { label: "AI & Automatizácia", href: "/tech" }].
              map((link) =>
              <li key={link.label}>
                  <Link
                  to={link.href}
                  className="shimmer-link relative text-sm text-muted-foreground hover:text-foreground transition-colors">

                    {link.label}
                    <span className="shimmer-underline absolute left-0 right-0 bottom-0 h-[1px] rounded-full" />
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Cok Tech. Všetky práva vyhradené.
          </p>
          <p className="text-xs text-muted-foreground">
            Levice, Slovensko · IČO: 12345678
          </p>
        </div>
      </div>
    </footer>);

};

export default Footer;