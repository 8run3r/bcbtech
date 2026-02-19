import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  company: string;
}

const testimonials: TestimonialItem[] = [
  {
    quote: "Profesionálny prístup od prvého stretnutia. Web bol hotový v rekordnom čase a funguje bezchybne.",
    author: "Martin Kováč",
    role: "CEO",
    company: "TechNova SK",
  },
  {
    quote: "Kamerový systém nainštalovaný presne podľa plánu. Výborná komunikácia a spoľahlivosť na 100 percent.",
    author: "Jana Horváthová",
    role: "Manažérka prevádzky",
    company: "SecurePoint",
  },
  {
    quote: "Moderný dizajn, rýchly web a skvelá podpora aj po spustení. Jednoznačne odporúčam.",
    author: "Peter Novák",
    role: "Zakladateľ",
    company: "DigiCraft",
  },
  {
    quote: "Komplexné riešenie webu aj kamier pod jednou strechou. Ušetrili sme čas aj peniaze.",
    author: "Lucia Šimková",
    role: "Riaditeľka",
    company: "SafeGuard Systems",
  },
];

const companies = testimonials.map((t) => t.company);

const Testimonials = () => {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > active ? 1 : -1);
      setActive(index);
    },
    [active]
  );

  // Auto-cycle
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const current = testimonials[active];
  const words = current.quote.split(" ");

  return (
    <section className="relative py-20 sm:py-32 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Mobile label */}
        <div className="lg:hidden mb-6">
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-mono">
            Testimonials
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[60px_1fr] gap-4 lg:gap-8">
          {/* Vertical label — desktop only */}
          <div className="hidden lg:flex items-start pt-16 justify-center">
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-mono -rotate-90 whitespace-nowrap">
              Testimonials
            </span>
          </div>

          {/* Main content */}
          <div className="min-w-0">
            {/* Company badge + counter */}
            <div className="flex items-center justify-between mb-8 sm:mb-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.company}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-border bg-card/50 text-[11px] sm:text-xs font-medium text-muted-foreground"
                >
                  {current.company}
                </motion.div>
              </AnimatePresence>
              <span className="text-xs sm:text-sm font-mono text-muted-foreground">
                <span className="text-primary">
                  {String(active + 1).padStart(2, "0")}
                </span>
                /{String(testimonials.length).padStart(2, "0")}
              </span>
            </div>

            {/* Quote with word-by-word animation */}
            <div className="mb-8 sm:mb-12 min-h-[120px] sm:min-h-[140px]">
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={active}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-[1.2] sm:leading-[1.15] break-words"
                >
                  {words.map((word, i) => (
                    <motion.span
                      key={`${active}-${i}`}
                      initial={{ opacity: 0, y: 15, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{
                        delay: 0.1 + i * 0.04,
                        duration: 0.4,
                        ease: "easeOut",
                      }}
                      className="inline-block mr-[0.25em]"
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.blockquote>
              </AnimatePresence>
            </div>

            {/* Author */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="mb-10 sm:mb-16"
              >
                <p className="text-sm font-semibold text-foreground">
                  {current.author}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {current.role}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation dots */}
            <div className="flex gap-2 mb-8 sm:mb-10">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    i === active
                      ? "w-8 sm:w-10 bg-primary"
                      : "w-3 sm:w-4 bg-border hover:bg-muted-foreground/40"
                  )}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
