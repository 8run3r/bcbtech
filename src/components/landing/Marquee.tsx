import { motion } from "framer-motion";

const marqueeItems = [
  "React", "TypeScript", "Next.js", "Tailwind", "Node.js", "PostgreSQL",
  "Supabase", "Vercel", "Docker", "Figma", "AI/ML", "Web3",
];

const Marquee = () => {
  return (
    <div className="overflow-hidden py-6 border-y border-border/50 bg-card/30">
      <motion.div
        animate={{ x: [0, -1200] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="flex gap-8 whitespace-nowrap"
      >
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          <span
            key={i}
            className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-8"
          >
            {item}
            <span className="text-primary/40">◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default Marquee;
