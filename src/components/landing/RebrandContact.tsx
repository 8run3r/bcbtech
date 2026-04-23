import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Send, Loader2, CheckCircle, Mail, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ServiceType = "web" | "automation" | "both";

const RebrandContact = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [form, setForm] = useState({ name: "", email: "", message: "", service: "" as ServiceType | "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Vyplnte meno a email.");
      return;
    }

    setSending(true);

    const { error } = await supabase.from("contact_messages").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message || null,
      package_category: form.service || null,
    });

    setSending(false);

    if (error) {
      // Fallback — mailto
      const subject = encodeURIComponent("Kontakt z webu");
      const body = encodeURIComponent(`Meno: ${form.name}\nEmail: ${form.email}\nSluzba: ${form.service}\n\n${form.message}`);
      window.open(`mailto:info@coktech.tech?subject=${subject}&body=${body}`);
      toast.error("Nepodarilo sa odoslat, otvariam email klienta.");
      return;
    }

    setSent(true);
    toast.success("Sprava odoslana!");
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-violet/40 transition-colors backdrop-blur-xl";

  if (sent) {
    return (
      <section id="contact" className="py-20 sm:py-28 px-4">
        <div className="max-w-lg mx-auto text-center">
          <CheckCircle size={48} className="mx-auto mb-4 text-mint" />
          <h3 className="text-xl font-bold text-white font-sans mb-2">Dakujeme!</h3>
          <p className="text-white/50 text-sm">Ozveme sa vam do 24 hodin.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-20 sm:py-28 px-4">
      <div className="max-w-lg mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-sans">
            Kontakt
          </h2>
          <p className="mt-3 text-white/40 text-sm sm:text-base">
            Napisete nam a ozveme sa do 24h
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8"
        >
          <input
            type="text"
            placeholder="Meno"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputClass}
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={inputClass}
          />
          <select
            value={form.service}
            onChange={(e) => setForm((f) => ({ ...f, service: e.target.value as ServiceType }))}
            className={`${inputClass} appearance-none`}
          >
            <option value="" className="bg-black">Vyberte sluzbu</option>
            <option value="web" className="bg-black">Web</option>
            <option value="automation" className="bg-black">Automatizacia</option>
            <option value="both" className="bg-black">Oboje</option>
          </select>
          <textarea
            placeholder="Vasa sprava (volitelne)"
            rows={4}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            className={`${inputClass} resize-none`}
          />
          <button
            type="submit"
            disabled={sending}
            className="w-full py-3 rounded-lg bg-violet text-white font-medium text-sm tracking-wide hover:bg-violet/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {sending ? (
              <><Loader2 size={16} className="animate-spin" /> Odosielam...</>
            ) : (
              <><Send size={16} /> Odoslat</>
            )}
          </button>
        </motion.form>

        {/* Contact info */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/40 text-sm">
          <div className="flex items-center gap-2">
            <Mail size={14} />
            <span>info@coktech.tech</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>Bratislava, Slovensko</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RebrandContact;
