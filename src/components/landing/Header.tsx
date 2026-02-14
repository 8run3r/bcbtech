import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const links = [
  { label: "Zabezpečenie", href: "/kamery" },
  { label: "Balíčky", href: "/balicky" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Tech", href: "/tech" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-2xl border-b border-border/20 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-8">
        {/* Logo */}
        <Link
          to="/"
          onClick={() => {
            if (location.pathname === "/") {
              window.scrollTo({ top: 0 });
            }
          }}
          className="text-xl font-bold tracking-tight z-10"
        >
          <span className="text-primary">Cok</span>
          <span className="text-foreground"> Tech</span>
        </Link>

        {/* Center nav — desktop */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {links.map((l) => {
            const isActive = location.pathname === l.href;
            return (
              <Link
                key={l.href}
                to={l.href}
                className={`relative text-[13px] px-5 py-2 rounded-full transition-all duration-300 uppercase tracking-wide font-medium ${
                  isActive
                    ? "text-primary-foreground bg-foreground"
                    : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA — desktop */}
        <Link
          to="/kontakt"
          className="hidden md:inline-flex text-[13px] uppercase tracking-wide font-medium bg-primary text-primary-foreground px-7 py-2.5 rounded-full hover:bg-primary/90 transition-all duration-300 z-10"
        >
          Kontakt
        </Link>

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
            className="md:hidden fixed inset-0 top-0 bg-background/98 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-8"
          >
            {links.map((l, i) => (
              <motion.div
                key={l.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to={l.href}
                  className={`text-2xl font-medium transition-colors uppercase tracking-wider ${
                    location.pathname === l.href ? "text-primary" : "text-foreground hover:text-primary"
                  }`}
                >
                  {l.label}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Link
                to="/kontakt"
                className="mt-4 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm uppercase tracking-wider inline-block hover:bg-primary/90 transition-all"
              >
                Kontakt
              </Link>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
