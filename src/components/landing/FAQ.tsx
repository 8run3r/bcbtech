import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Koľko kamier potrebujem pre svoj objekt?",
    a: "Závisí od veľkosti a typu priestoru. Pre rodinný dom zvyčajne stačia 2–4 kamery, pre menšiu firmu 4–8 a pre väčšie areály 8–16+. Radi vám pripravíme bezplatnú konzultáciu a návrh na mieru.",
  },
  {
    q: "Aký je rozdiel medzi IP a analógovou kamerou?",
    a: "IP kamery prenášajú obraz cez sieť (PoE), ponúkajú vyššie rozlíšenie (až 4K), AI detekciu a vzdialený prístup. Analógové systémy sú lacnejšie, ale s obmedzenou kvalitou. Odporúčame IP riešenia pre dlhodobú investíciu.",
  },
  {
    q: "Môžem sledovať kamery z mobilu?",
    a: "Áno, všetky naše systémy podporujú vzdialený prístup cez mobilnú aplikáciu (iOS aj Android). Stačí internetové pripojenie a máte prehľad o vašom objekte odkiaľkoľvek.",
  },
  {
    q: "Ako dlho trvá inštalácia kamerového systému?",
    a: "Štandardná inštalácia pre rodinný dom trvá 1 deň. Firemné riešenia s 8+ kamerami zvyčajne 2–3 dni vrátane konfigurácie, testovania a zaškolenia obsluhy.",
  },
  {
    q: "Poskytujete aj webové služby?",
    a: "Áno! Okrem bezpečnostných systémov vytvárame moderné webstránky, webové aplikácie a SaaS platformy. Používame React, TypeScript a najnovšie technológie. Pozrite naše webové balíčky.",
  },
  {
    q: "Aká je záruka na inštaláciu?",
    a: "Na prácu poskytujeme 1–2 roky záruky podľa balíčka. Na hardvér platí štandardná záruka výrobcu (zvyčajne 2–3 roky). Pri servisnej zmluve máte navyše prioritný servis a pravidelnú údržbu.",
  },
];

const FAQ = () => {
  return (
    <section className="py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-primary mb-4 block font-mono">
            [ FAQ ]
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Často kladené otázky
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Odpovede na najčastejšie otázky o našich službách.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border/50 rounded-xl px-6 bg-card/30 backdrop-blur-sm hover:border-primary/20 transition-colors duration-300 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left text-sm font-semibold py-5 hover:no-underline hover:text-primary transition-colors">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
