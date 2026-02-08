import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Služby", href: "#services" },
  { label: "Projekty", href: "#projects" },
  { label: "Tech", href: "#tech" },
  { label: "Kontakt", href: "#contact" },
];

const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/50"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <a href="#" className="text-2xl font-bold tracking-tight">
          <span className="text-primary glow-text">nex</span>
          <span className="text-foreground">sol</span>
        </a>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-mono uppercase tracking-widest"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            className="text-sm bg-primary text-primary-foreground px-5 py-2 rounded-md font-semibold hover:bg-primary/90 transition-colors"
          >
            Začnime
          </a>
        </nav>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.nav
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-4 px-6 py-6">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-primary transition-colors font-mono uppercase tracking-widest text-sm"
              >
                {l.label}
              </a>
            ))}
          </div>
        </motion.nav>
      )}
    </motion.header>
  );
};

export default Header;
