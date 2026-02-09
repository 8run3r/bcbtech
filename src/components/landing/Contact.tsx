import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-primary mb-4 block">
            Kontakt
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Poďme tvoriť
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Máte nápad? Ozvite sa a my ho premeníme na realitu.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="flex flex-col items-center p-6 rounded-lg bg-card border border-border">
            <Mail className="text-primary mb-3" size={24} strokeWidth={1.5} />
            <span className="text-sm text-muted-foreground">hello@nexsol.dev</span>
          </div>
          <div className="flex flex-col items-center p-6 rounded-lg bg-card border border-border">
            <Phone className="text-primary mb-3" size={24} strokeWidth={1.5} />
            <span className="text-sm text-muted-foreground">+421 900 000 000</span>
          </div>
          <div className="flex flex-col items-center p-6 rounded-lg bg-card border border-border">
            <MapPin className="text-primary mb-3" size={24} strokeWidth={1.5} />
            <span className="text-sm text-muted-foreground">Bratislava, SK</span>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="text"
            placeholder="Meno"
            className="bg-card border border-border rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          <input
            type="email"
            placeholder="Email"
            className="bg-card border border-border rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          <textarea
            placeholder="Opíšte váš projekt..."
            rows={5}
            className="sm:col-span-2 bg-card border border-border rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
          />
          <button
            type="submit"
            className="sm:col-span-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-md font-semibold hover:bg-primary/90 transition-all glow-primary"
          >
            Odoslať správu
          </button>
        </motion.form>
      </div>
    </section>
  );
};

export default Contact;
