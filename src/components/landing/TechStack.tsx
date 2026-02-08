import { motion } from "framer-motion";

const stack = [
  { name: "React", category: "Frontend" },
  { name: "Next.js", category: "Framework" },
  { name: "TypeScript", category: "Language" },
  { name: "Tailwind", category: "Styling" },
  { name: "Node.js", category: "Backend" },
  { name: "PostgreSQL", category: "Database" },
  { name: "Supabase", category: "BaaS" },
  { name: "Docker", category: "DevOps" },
  { name: "Vercel", category: "Deploy" },
  { name: "Figma", category: "Design" },
  { name: "OpenAI", category: "AI" },
  { name: "Stripe", category: "Payments" },
];

const TechStack = () => {
  return (
    <section id="tech" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-4 block">
            // tech stack
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Nástroje, ktoré ovládame
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {stack.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05, borderColor: "hsl(160 100% 50% / 0.4)" }}
              className="flex flex-col items-center justify-center p-6 rounded-lg bg-card border border-border text-center transition-all"
            >
              <span className="text-base font-semibold mb-1">{t.name}</span>
              <span className="text-xs font-mono text-muted-foreground">{t.category}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
