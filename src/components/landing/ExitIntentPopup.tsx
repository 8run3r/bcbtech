import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ExitIntentPopup = () => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      if (e.clientY <= 5 && !dismissed && !sessionStorage.getItem("exitPopupShown")) {
        setShow(true);
        sessionStorage.setItem("exitPopupShown", "1");
      }
    },
    [dismissed]
  );

  useEffect(() => {
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [handleMouseLeave]);

  const close = () => {
    setShow(false);
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            onClick={close}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed left-1/2 top-1/2 z-[101] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-primary/30 bg-card p-8 shadow-2xl"
          >
            <button
              onClick={close}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            >
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
                Získajte <span className="text-primary font-semibold">bezplatnú konzultáciu</span> a nezáväzný nacenenie vášho projektu. 
                Garantujeme nekonkurenčné ceny na trhu.
              </p>

              <div className="w-full space-y-3">
                <Link
                  to="/kontakt"
                  onClick={close}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider hover:bg-primary/90 transition-all"
                >
                  Chcem bezplatnú ponuku <ArrowRight size={16} />
                </Link>

                <Link
                  to="/konfigurator"
                  onClick={close}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-foreground font-medium text-sm hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  Nakonfigurovať systém
                </Link>
              </div>

              <p className="text-[11px] text-muted-foreground/50 mt-5">
                Žiadne záväzky. Odpoveď do 24 hodín.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentPopup;
