import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const showcaseItems = [
  {
    title: "FinTrack",
    category: "Fintech App",
    gradient: "from-primary/20 to-accent/10",
  },
  {
    title: "MedConnect",
    category: "HealthTech",
    gradient: "from-accent/20 to-primary/10",
  },
  {
    title: "ShopForge",
    category: "E-commerce",
    gradient: "from-primary/15 to-primary/5",
  },
];

const Showcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["5%", "-15%"]);

  return (
    <section ref={containerRef} className="py-24 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="px-8 mb-12"
      >
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-3 block">
          // vybrané práce
        </span>
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Portfólio
        </h2>
      </motion.div>

      <motion.div style={{ x }} className="flex gap-6 px-8">
        {showcaseItems.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`group relative flex-shrink-0 w-[400px] sm:w-[500px] h-[320px] sm:h-[380px] rounded-2xl bg-gradient-to-br ${item.gradient} border border-border/50 overflow-hidden cursor-pointer`}
          >
            {/* Inner grid pattern */}
            <div className="absolute inset-0 grid-bg opacity-40" />

            <div className="relative z-10 flex flex-col justify-end h-full p-8">
              <span className="text-xs font-mono text-primary uppercase tracking-widest mb-2">
                {item.category}
              </span>
              <h3 className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                {item.title}
              </h3>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Showcase;
