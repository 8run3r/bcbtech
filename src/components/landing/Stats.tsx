import { motion } from "framer-motion";

const stats = [
  { value: "50+", label: "Projektov" },
  { value: "12", label: "V tíme" },
  { value: "99%", label: "Spokojnosť" },
  { value: "4 roky", label: "Na trhu" },
];

const Stats = () => {
  return (
    <section className="py-20 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border/50 rounded-2xl overflow-hidden">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`text-center py-12 px-6 ${
                i < stats.length - 1 ? "border-r border-border/50" : ""
              } ${i < 2 ? "md:border-b-0 border-b border-border/50 md:border-b-transparent" : ""}`}
            >
              <span className="text-4xl sm:text-5xl font-bold text-foreground block mb-2">
                {s.value}
              </span>
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
