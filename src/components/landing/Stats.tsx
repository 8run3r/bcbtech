import { motion } from "framer-motion";

const stats = [
  { value: "50+", label: "Dokončených projektov" },
  { value: "12", label: "Členov tímu" },
  { value: "99%", label: "Spokojnosť klientov" },
  { value: "4r", label: "Na trhu" },
];

const Stats = () => {
  return (
    <section className="py-24 px-6 bg-card/50 border-y border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <span className="text-4xl sm:text-5xl font-bold text-primary glow-text">{s.value}</span>
              <p className="text-sm text-muted-foreground mt-2 font-mono">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
