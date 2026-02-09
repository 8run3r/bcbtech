import { motion } from "framer-motion";

const marqueeItems = [
  "React", "TypeScript", "Next.js", "Tailwind", "Node.js", "PostgreSQL",
  "Supabase", "Vercel", "Docker", "Figma", "AI/ML", "Web3",
];

const Marquee = () => {
  return (
    <div className="overflow-hidden py-8 border-y border-border/30">
      <motion.div
        animate={{ x: [0, -1200] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="flex gap-12 whitespace-nowrap"
      >
        {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
          <span
            key={i}
            className="text-[13px] text-foreground/30 uppercase tracking-[0.15em] flex items-center gap-12"
          >
            {item}
            <span className="text-primary/20 text-[8px]">●</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default Marquee;
