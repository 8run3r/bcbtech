import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";


const desktopLinks = [
  { label: "Balíčky", href: "/balicky" },
  { label: "Riešenia", href: "/riesenia" },
  { label: "Portfolio", href: "/portfolio" },
];

const mobileLinks = [
  { label: "Balíčky", href: "/balicky" },
  { label: "Riešenia", href: "/riesenia" },
  { label: "Portfolio", href: "/portfolio" },
];


const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Visibility: on subpages always visible, on homepage after scroll
  useEffect(() => {
    if (!isHome) {
      setVisible(true);
    } else {
      setVisible(scrolled);
    }
  }, [isHome, scrolled]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          visible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        } ${
          scrolled
            ? "bg-background/80 backdrop-blur-2xl border-b border-border/20 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-5 sm:px-8">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => {
              if (location.pathname === "/") {
                window.scrollTo({ top: 0 });
              }
            }}
            className="text-xl font-bold tracking-tight relative z-50"
          >
            <span className="text-primary">Cok</span>
            <span className="text-foreground"> Tech</span>
          </Link>

          {/* Center nav — desktop only */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {desktopLinks.map((l) => {
              const isActive = location.pathname === l.href;
              return (
                <Link
                  key={l.href}
                  to={l.href}
                  className={`shimmer-link relative text-[13px] px-5 py-2 rounded-full transition-all duration-300 uppercase tracking-wide font-medium ${
                    isActive
                      ? "text-primary-foreground bg-foreground"
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {l.label}
                  {!isActive && (
                    <span className="shimmer-underline absolute left-2 right-2 bottom-0 h-[2px] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA — desktop */}
          <Link
            to="/kontakt"
            className="hidden md:inline-flex text-[13px] uppercase tracking-wide font-medium bg-primary text-primary-foreground px-7 py-2.5 rounded-full hover:bg-primary/90 transition-all duration-300"
          >
            Kontakt
          </Link>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden relative z-50 w-10 h-10 flex items-center justify-center text-foreground rounded-full transition-colors hover:bg-foreground/5"
            aria-label="Menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={22} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu size={22} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* Mobile fullscreen menu — outside header to avoid z-index conflicts */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/98 backdrop-blur-xl" />

            {/* Menu content */}
            <nav className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-6 px-6">

              {mobileLinks.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ delay: 0.08 + i * 0.07, duration: 0.3 }}
                >
                  <Link
                    to={l.href}
                    className={`block text-3xl font-semibold transition-colors uppercase tracking-widest ${
                      location.pathname === l.href
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    }`}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ delay: 0.08 + mobileLinks.length * 0.07 + 0.05, duration: 0.3 }}
                className="mt-4"
              >
                <Link
                  to="/kontakt"
                  className="bg-primary text-primary-foreground px-10 py-3.5 rounded-full text-base uppercase tracking-wider font-semibold inline-block hover:bg-primary/90 transition-all"
                >
                  Kontakt
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

};

export default Header;
