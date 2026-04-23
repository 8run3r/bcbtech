import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Code2, Bot, Globe, Palette, ShoppingCart, FileText, Workflow, MessageSquare, Share2, Cpu } from "lucide-react";
import { type ElementType } from "react";

interface ServiceItem {
  icon: ElementType;
  text: string;
}

const digitalItems: ServiceItem[] = [
  { icon: Globe, text: "Web development" },
  { icon: Palette, text: "UI/UX dizajn" },
  { icon: ShoppingCart, text: "E-shop frontendy" },
  { icon: FileText, text: "Landing pages" },
];

const automateItems: ServiceItem[] = [
  { icon: Cpu, text: "AI automatizacie" },
  { icon: Workflow, text: "n8n workflows" },
  { icon: Share2, text: "Social media automation" },
  { icon: MessageSquare, text: "AI chatboty" },
];

const Card = ({
  title,
  description,
  icon: Icon,
  items,
  accent,
  accentRaw,
}: {
  title: string;
  description: string;
  icon: ElementType;
  items: ServiceItem[];
  accent: string;
  accentRaw: string;
}) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 transition-shadow duration-300"
      style={{
        boxShadow: "0 0 0 0 transparent",
      }}
      whileHover={{
        boxShadow: `0 0 30px 0 ${accentRaw}`,
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon size={20} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-white font-sans">{title}</h3>
      </div>
      <p className="text-white/50 text-sm leading-relaxed mb-6">{description}</p>
      <ul className="space-y-3">
        {items.map((item) => {
          const ItemIcon = item.icon;
          return (
            <li key={item.text} className="flex items-center gap-3 text-white/70 text-sm">
              <ItemIcon size={16} className="text-white/40 flex-shrink-0" />
              {item.text}
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
};

const RebrandServices = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="services" className="py-20 sm:py-28 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-sans">
            Co ponukame
          </h2>
          <p className="mt-3 text-white/40 text-sm sm:text-base">
            Dva piliere pre vas digitalny rast
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card
            title="CokTech Digital"
            description="Web development, UI/UX dizajn, E-shop frontendy, Landing pages."
            icon={Code2}
            items={digitalItems}
            accent="bg-violet"
            accentRaw="rgba(123,97,255,0.25)"
          />
          <Card
            title="CokTech Automate"
            description="AI automatizacie, n8n workflows, Social media automation, AI chatboty."
            icon={Bot}
            items={automateItems}
            accent="bg-mint"
            accentRaw="rgba(0,245,196,0.25)"
          />
        </div>
      </div>
    </section>
  );
};

export default RebrandServices;
