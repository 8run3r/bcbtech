import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { MessageCircle, PenTool, Rocket, Headphones } from "lucide-react";
import { type ElementType } from "react";

interface Step {
  icon: ElementType;
  title: string;
  description: string;
}

const steps: Step[] = [
  { icon: MessageCircle, title: "Konzultacia", description: "Zistime co potrebujete a navrheme riesenie." },
  { icon: PenTool, title: "Navrh", description: "Wireframy, prototyp, technicka architektura." },
  { icon: Rocket, title: "Realizacia", description: "Vyvoj, testovanie, iteracie a launch." },
  { icon: Headphones, title: "Podpora", description: "Mesacna udrzba, monitoring a optimalizacia." },
];

const RebrandProcess = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <section id="process" className="py-20 sm:py-28 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-sans">
            Ako pracujeme
          </h2>
          <p className="mt-3 text-white/40 text-sm sm:text-base">
            Od napadu po hotovy produkt v 4 krokoch
          </p>
        </motion.div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {/* Connecting line — desktop only */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-violet/40 via-mint/40 to-coral/40" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15, ease: "easeOut" }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <Icon size={24} className="text-violet" />
                </div>
                <span className="text-xs text-white/30 font-mono mb-1">0{i + 1}</span>
                <h3 className="text-base font-bold text-white font-sans mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed max-w-[200px]">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RebrandProcess;
