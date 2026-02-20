import { motion } from "framer-motion";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const categories = [
  {
    name: "Frontend",
    tools: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    name: "Backend",
    tools: ["Node.js", "PostgreSQL", "Supabase", "REST / GraphQL"],
  },
  {
    name: "DevOps & Deploy",
    tools: ["Docker", "Vercel", "GitHub Actions", "Cloudflare"],
  },
  {
    name: "Dizajn",
    tools: ["Figma", "Framer", "After Effects"],
  },
  {
    name: "AI & Automatizácia",
    tools: ["OpenAI", "LangChain", "Zapier", "n8n"],
  },
  {
    name: "Platby & Integrácie",
    tools: ["Stripe", "Shopify", "Twilio", "SendGrid"],
  },
];

const Tech = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="pt-32 sm:pt-40 pb-20 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold tracking-tight leading-[1.05] mb-6">
              Technológie
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Nástroje a technológie, ktoré denne používame na tvorbu moderných digitálnych produktov.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.6 }}
                className="p-8 rounded-2xl bg-card border border-border"
              >
                <h3 className="text-sm uppercase tracking-widest text-primary mb-6 font-semibold">
                  {cat.name}
                </h3>
                <ul className="space-y-3">
                  {cat.tools.map((tool) => (
                    <li
                      key={tool}
                      className="text-foreground/80 text-sm"
                    >
                      {tool}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Tech;
