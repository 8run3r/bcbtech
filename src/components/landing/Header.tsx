import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Portfólio", href: "#projects" },
  { label: "Balíčky", href: "#services" },
  { label: "Tech", href: "#tech" },
  { label: "Kontakt", href: "#contact" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border/30 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-8">
        {/* Logo */}
        <a href="#" className="text-xl font-bold tracking-tight z-10">
          <span className="text-primary">NEX</span>
          <span className="text-foreground">SOL</span>
        </a>

        {/* Center nav — desktop */}
        <nav className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13px] text-foreground/80 hover:text-foreground transition-colors tracking-wide uppercase font-medium"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA — desktop */}
        <a
          href="#contact"
          className="hidden md:inline-flex text-[13px] uppercase tracking-wide font-medium border border-foreground/20 text-foreground px-6 py-2.5 rounded-full hover:bg-foreground hover:text-background transition-all duration-300 z-10"
        >
          Začať projekt
        </a>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-foreground z-10"
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile fullscreen menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed inset-0 top-0 bg-background z-40 flex flex-col items-center justify-center gap-8"
          >
            {links.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="text-2xl font-medium text-foreground hover:text-primary transition-colors uppercase tracking-wider"
              >
                {l.label}
              </motion.a>
            ))}
            <motion.a
              href="#contact"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-4 border border-foreground/20 text-foreground px-8 py-3 rounded-full text-sm uppercase tracking-wider hover:bg-foreground hover:text-background transition-all"
            >
              Začať projekt
            </motion.a>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
