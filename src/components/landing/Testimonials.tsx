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
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[80px_1fr] gap-8 lg:gap-12">
          {/* Vertical label */}
          <div className="hidden lg:flex items-center justify-center">
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-mono -rotate-90 whitespace-nowrap">
              Testimonials
            </span>
          </div>

          {/* Main content */}
          <div>
            {/* Company badge + counter */}
            <div className="flex items-center justify-between mb-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.company}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 py-1.5 rounded-full border border-border bg-card/50 text-xs font-medium text-muted-foreground"
                >
                  {current.company}
                </motion.div>
              </AnimatePresence>
              <span className="text-sm font-mono text-muted-foreground">
                <span className="text-primary">
                  {String(active + 1).padStart(2, "0")}
                </span>
                /{String(testimonials.length).padStart(2, "0")}
              </span>
            </div>

            {/* Quote with word-by-word animation */}
            <div className="mb-12 min-h-[180px] sm:min-h-[140px]">
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={active}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[clamp(1.5rem,4vw,3rem)] font-bold tracking-tight leading-[1.15]"
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
                      className="inline-block mr-[0.3em]"
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
                className="mb-16"
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
            <div className="flex gap-2 mb-10">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    i === active
                      ? "w-10 bg-primary"
                      : "w-4 bg-border hover:bg-muted-foreground/40"
                  )}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>

            {/* Company ticker */}
            <div className="overflow-hidden border-t border-border pt-6">
              <motion.div
                animate={{ x: [0, -50 * companies.length] }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 20,
                    ease: "linear",
                  },
                }}
                className="flex gap-8 whitespace-nowrap"
              >
                {[...companies, ...companies, ...companies, ...companies].map(
                  (company, i) => (
                    <span
                      key={i}
                      className="text-xs text-muted-foreground/40 font-medium uppercase tracking-widest"
                    >
                      {company}
                    </span>
                  )
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
