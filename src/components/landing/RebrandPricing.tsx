import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Check } from "lucide-react";

interface PricingPlan {
  name: string;
  price: string;
  monthly: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

const plans: PricingPlan[] = [
  {
    name: "Starter",
    price: "350 €",
    monthly: "+ 40 €/mes.",
    features: [
      "Landing page",
      "1 automatizacia",
      "Responsivny dizajn",
      "Zakladne SEO",
    ],
  },
  {
    name: "Business",
    price: "1 200 €",
    monthly: "+ 100 €/mes.",
    highlighted: true,
    badge: "Najoblubenejsi",
    features: [
      "Firemny web",
      "3 automatizacie",
      "AI chatbot",
      "Analytics dashboard",
      "Prioritna podpora",
    ],
  },
  {
    name: "Scale",
    price: "od 2 000 €",
    monthly: "+ 150 €/mes.",
    features: [
      "E-shop frontend",
      "Custom automatizacie",
      "Social media automation",
      "Dedickovany support",
      "Na mieru",
    ],
  },
];

const RebrandPricing = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="pricing" className="py-20 sm:py-28 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-sans">
            Cennik
          </h2>
          <p className="mt-3 text-white/40 text-sm sm:text-base">
            Transparentne ceny, ziadne skryte poplatky
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
              className={`relative backdrop-blur-xl rounded-2xl p-6 sm:p-8 flex flex-col ${
                plan.highlighted
                  ? "bg-white/[0.07] border-2 border-mint/40"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-mint text-black text-xs font-bold tracking-wide">
                  {plan.badge}
                </div>
              )}

              <h3 className="text-lg font-bold text-white font-sans">{plan.name}</h3>
              <div className="mt-4 mb-1">
                <span className="text-3xl sm:text-4xl font-bold text-white">{plan.price}</span>
              </div>
              <p className="text-white/40 text-sm mb-6">{plan.monthly}</p>

              <ul className="space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-white/70 text-sm">
                    <Check size={14} className={plan.highlighted ? "text-mint" : "text-violet"} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={scrollToContact}
                className={`mt-8 w-full py-3 rounded-lg font-medium text-sm tracking-wide transition-colors ${
                  plan.highlighted
                    ? "bg-mint text-black hover:bg-mint/80"
                    : "border border-violet/30 text-violet hover:bg-violet/10"
                }`}
              >
                Zacat
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RebrandPricing;
