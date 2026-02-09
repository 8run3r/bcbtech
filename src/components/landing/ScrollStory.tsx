import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface StorySlide {
  label: string;
  heading: string;
  description: string;
}

const slides: StorySlide[] = [
  {
    label: "01",
    heading: "Vytvárame digitálne produkty",
    description:
      "Každý projekt začína otázkou — ako zlepšiť zážitok vašich používateľov? Odpoveď hľadáme v dizajne, technológii a strategickom myslení.",
  },
  {
    label: "02",
    heading: "Od vízie po realitu",
    description:
      "Posúvame nápady od prvého nástinu až po nasadenie. Iterujeme rýchlo, staviame kvalitne a dodávame na čas.",
  },
  {
    label: "03",
    heading: "Technológia s účelom",
    description:
      "Nepoužívame technológie len preto, že sú nové. Vyberáme tie, ktoré riešia váš konkrétny problém najefektívnejšie.",
  },
];

const StorySection = ({ slide, index }: { slide: StorySlide; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [80, 0, 0, -80]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.95, 1, 1, 0.95]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center px-6"
    >
      {/* Background accent */}
      {index === 1 && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[180px]" />
        </div>
      )}
      {index === 2 && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 right-[20%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[160px]" />
        </div>
      )}

      <motion.div
        style={{ opacity, y, scale }}
        className="relative z-10 max-w-4xl mx-auto text-center"
      >
        <span className="inline-block text-xs uppercase tracking-[0.3em] text-primary mb-6">
          {slide.label}
        </span>
        <h2 className="text-[clamp(2.2rem,5vw,4.5rem)] font-bold leading-[1.05] tracking-tight mb-8">
          {slide.heading}
        </h2>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {slide.description}
        </p>
      </motion.div>
    </section>
  );
};

const ScrollStory = () => {
  return (
    <div>
      {slides.map((slide, i) => (
        <StorySection key={i} slide={slide} index={i} />
      ))}
    </div>
  );
};

export default ScrollStory;
