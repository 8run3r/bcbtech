import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ExitIntentPopup = () => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerPopup = useCallback(() => {
    if (!dismissed && !sessionStorage.getItem("exitPopupShown")) {
      setShow(true);
      sessionStorage.setItem("exitPopupShown", "1");
    }
  }, [dismissed]);

  useEffect(() => {
    // Method 1: mouseout on documentElement (works in iframes too)
    const handleMouseOut = (e: MouseEvent) => {
      // Only trigger when mouse leaves toward the top of the viewport
      if (
      e.clientY <= 0 &&
      e.relatedTarget === null)
      {
        triggerPopup();
      }
    };

    // Method 2: mouseleave on document (backup)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5) {
        triggerPopup();
      }
    };

    // Method 3: Fallback timer — show after 45s of inactivity as last resort
    // (useful for mobile / touch where mouse events don't exist)

    document.documentElement.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.documentElement.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [triggerPopup]);

  const close = () => {
    setShow(false);
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {show &&
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-xl"
          onClick={close} />

          <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateX: 15, y: 40 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, rotateX: -8, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-[90vw] max-w-md rounded-2xl border border-primary/30 bg-card p-8 shadow-2xl shadow-primary/10">

            <button
            onClick={close}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors">

              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-5">
                <Gift size={24} className="text-primary" />
              </div>

              <h2 className="text-2xl font-bold tracking-tight mb-2">
                Počkajte! Máme pre vás <span className="text-primary glow-text">špeciálnu ponuku</span>
              </h2>

              <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
                Získajte <span className="text-primary font-semibold">bezplatnú konzultáciu</span> a nezáväzné nacenenie vášho projektu. 
                Garantujeme nekonkurenčné ceny na trhu.
              </p>

              <div className="w-full space-y-3">
                <Link
                to="/kontakt"
                onClick={close}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider hover:bg-primary/90 transition-all">

                  Chcem bezplatnú ponuku <ArrowRight size={16} />
                </Link>

                <Link
                to="/kamery"
                onClick={close}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-foreground font-medium text-sm hover:border-primary/40 hover:bg-primary/5 transition-all">Prezrieť kamerové systémy


              </Link>
              </div>

              <p className="text-[11px] text-muted-foreground/50 mt-5">
                Žiadne záväzky. Odpoveď do 24 hodín.
              </p>
            </div>
          </motion.div>
        </div>
      }
    </AnimatePresence>);

};

export default ExitIntentPopup;