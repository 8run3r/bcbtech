import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const Kontakt = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16">

            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold tracking-tight leading-[1.05] mb-6">
              Poďme tvoriť
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Máte nápad? Ozvite sa a my ho premeníme na realitu.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">

            <div className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border">
              <Mail className="text-primary mb-3" size={24} strokeWidth={1.5} />
              <span className="text-sm text-muted-foreground">8run3r@gmail.com

              </span>
            </div>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border">
              <Phone className="text-primary mb-3" size={24} strokeWidth={1.5} />
              <span className="text-sm text-muted-foreground">+421 911 640 660</span>
            </div>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border">
              <MapPin className="text-primary mb-3" size={24} strokeWidth={1.5} />
              <span className="text-sm text-muted-foreground">Levice, SK</span>
            </div>
          </motion.div>

          <motion.form initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            onSubmit={(e) => e.preventDefault()}>

            <input
              type="text"
              placeholder="Meno"
              className="bg-card border border-border rounded-xl px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors" />

            <input
              type="email"
              placeholder="Email"
              className="bg-card border border-border rounded-xl px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors" />

            <textarea
              placeholder="Opíšte váš projekt..."
              rows={5}
              className="sm:col-span-2 bg-card border border-border rounded-xl px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none" />

            <button
              type="submit"
              className="sm:col-span-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-primary/90 transition-all">

              Odoslať správu
            </button>
          </motion.form>
        </div>
      </section>

      <Footer />
    </main>);

};

export default Kontakt;