import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import beforeImg from "@/assets/before-cameras.jpg";
import afterImg from "@/assets/after-cameras.jpg";

const BeforeAfter = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const onPointerDown = () => { isDragging.current = true; };
  const onPointerUp = () => { isDragging.current = false; };
  const onPointerMove = (e: React.PointerEvent) => {
    if (isDragging.current) updateSlider(e.clientX);
  };

  return (
    <section className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-primary mb-4 block font-mono">
            [ Pred & Po ]
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Rozdiel je viditeľný
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Posuňte slider a porovnajte priestor pred a po inštalácii kamerového systému.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          ref={containerRef}
          className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden cursor-col-resize select-none border border-border/30"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onPointerMove={onPointerMove}
          onClick={(e) => updateSlider(e.clientX)}
        >
          {/* After image (full background) */}
          <img
            src={afterImg}
            alt="Po inštalácii"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />

          {/* Before image (clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src={beforeImg}
              alt="Pred inštaláciou"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ width: `${containerRef.current?.offsetWidth || 1000}px`, maxWidth: "none" }}
              draggable={false}
            />
          </div>

          {/* Slider line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
            style={{ left: `${sliderPos}%` }}
          >
            {/* Handle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7 4L3 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground" />
                <path d="M13 4L17 10L13 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground" />
              </svg>
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full z-20">
            Pred
          </div>
          <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full z-20">
            Po
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BeforeAfter;
