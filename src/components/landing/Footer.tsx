import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Logo & tagline */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Link to="/" className="text-2xl font-bold tracking-tight inline-block mb-4">
                <span className="text-primary">NEX</span>
                <span className="text-foreground">SOL</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Digitálne riešenia pre moderné značky. Od dizajnu po produkciu — všetko pod jednou strechou.
              </p>
            </motion.div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-5">Navigácia</h4>
            <ul className="space-y-3">
              {[
                { label: "Portfólio", href: "/portfolio" },
                { label: "Balíčky", href: "/balicky" },
                { label: "Tech", href: "/tech" },
                { label: "Kontakt", href: "/kontakt" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-5">Sociálne siete</h4>
            <ul className="space-y-3">
              {["GitHub", "LinkedIn", "Instagram", "Twitter"].map((name) => (
                <li key={name}>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 nexsol. Všetky práva vyhradené.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Ochrana súkromia
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Podmienky
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
