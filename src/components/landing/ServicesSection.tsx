import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FileTree, TreeViewElement } from "@/components/ui/file-tree";
import { ImagesBadge } from "@/components/ui/images-badge";
import PretextHeadline from "@/components/ui/pretext-headline";

const digitalTree: TreeViewElement[] = [
  {
    id: "app",
    name: "app/",
    children: [
      {
        id: "pages",
        name: "pages/",
        children: [
          { id: "index", name: "page.tsx" },
          { id: "shop", name: "shop/page.tsx" },
        ],
      },
      { id: "layout", name: "layout.tsx" },
    ],
  },
  {
    id: "components",
    name: "components/",
    children: [
      { id: "ui", name: "ui/", children: [{ id: "btn", name: "Button.tsx" }] },
    ],
  },
  { id: "tailwind", name: "tailwind.config.ts" },
];

const automateTree: TreeViewElement[] = [
  {
    id: "workflows",
    name: "workflows/",
    children: [
      { id: "lead", name: "lead-capture.json" },
      { id: "invoice", name: "invoice-gen.json" },
      { id: "notify", name: "slack-notify.json" },
    ],
  },
  {
    id: "agents",
    name: "agents/",
    children: [
      { id: "classifier", name: "classifier.ts" },
      { id: "summarizer", name: "summarizer.ts" },
    ],
  },
  { id: "env", name: ".env.example" },
];

// Geometric SVG avatars — Digital green / Automation orange
const digitalAvatars = [
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='32'%3E%3Crect width='48' height='32' rx='4' fill='%2300ffaa' opacity='.25'/%3E%3Ctext x='24' y='20' font-size='10' fill='%2300ffaa' text-anchor='middle'%3ETS%3C/text%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='32'%3E%3Crect width='48' height='32' rx='4' fill='%2300ffaa' opacity='.18'/%3E%3Ctext x='24' y='20' font-size='10' fill='%2300ffaa' text-anchor='middle'%3ENX%3C/text%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='32'%3E%3Crect width='48' height='32' rx='4' fill='%2300ffaa' opacity='.12'/%3E%3Ctext x='24' y='20' font-size='10' fill='%2300ffaa' text-anchor='middle'%3ETW%3C/text%3E%3C/svg%3E",
];

const automateAvatars = [
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='32'%3E%3Crect width='48' height='32' rx='4' fill='%23FF8C00' opacity='.28'/%3E%3Ctext x='24' y='20' font-size='10' fill='%23FF8C00' text-anchor='middle'%3En8n%3C/text%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='32'%3E%3Crect width='48' height='32' rx='4' fill='%23FF8C00' opacity='.2'/%3E%3Ctext x='24' y='20' font-size='10' fill='%23FF8C00' text-anchor='middle'%3EMK%3C/text%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='32'%3E%3Crect width='48' height='32' rx='4' fill='%23FF8C00' opacity='.14'/%3E%3Ctext x='24' y='20' font-size='10' fill='%23FF8C00' text-anchor='middle'%3EAI%3C/text%3E%3C/svg%3E",
];

const DIGITAL_CHIPS = ["Next.js", "TypeScript", "Framer Motion", "Tailwind"];
const AUTOMATE_CHIPS = ["n8n", "Claude API", "Make", "Zapier"];

interface ServiceCardProps {
  label: string;
  icon: string;
  iconColor: string;
  title: string;
  body: string;
  chips: string[];
  ctaColor: string;
  treeData: TreeViewElement[];
  treeExpandIds: string[];
  badges: string[];
  badgeText: string;
  delay?: number;
}

const ServiceCard = ({
  label, icon, iconColor, title, body, chips, ctaColor,
  treeData, treeExpandIds, badges, badgeText, delay = 0,
}: ServiceCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="glass rounded-2xl p-7 flex flex-col gap-5 group transition-all duration-300 cursor-default"
      style={{ border: "1px solid var(--border-glass)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${iconColor}, 0 0 40px ${iconColor}22`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "";
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0"
          style={{ background: `${iconColor}22`, border: `1px solid ${iconColor}55` }}
        >
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
        <div>
          <span className="font-mono text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>
            {label}
          </span>
          <h3
            className="font-display font-bold text-lg leading-snug"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h3>
        </div>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
        {body}
      </p>

      {/* File tree */}
      <FileTree
        elements={treeData}
        initialExpandedIds={treeExpandIds}
        className="text-xs"
      />

      {/* Images badge */}
      <ImagesBadge text={badgeText} images={badges} />

      {/* Tech chips */}
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip}
            className="glass rounded-full px-3 py-1 font-mono text-xs"
            style={{ color: "var(--text-muted)", border: "1px solid var(--border-glass)" }}
          >
            {chip}
          </span>
        ))}
      </div>

      {/* CTA */}
      <a
        href="#contact"
        className="text-sm font-medium transition-opacity hover:opacity-80"
        style={{ color: ctaColor }}
      >
        Learn more →
      </a>
    </motion.div>
  );
};

const ServicesSection = () => {
  return (
    <section
      id="services"
      className="relative py-24 px-6 overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Section label */}
      <div className="max-w-5xl mx-auto mb-14 text-center">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-mono text-xs uppercase tracking-widest mb-4 block"
          style={{ color: "var(--neon-primary)" }}
        >
          What we do
        </motion.span>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="max-w-xl mx-auto"
        >
          <PretextHeadline
            text="Two studios. One team."
            fontSize={42}
            color="var(--text-primary)"
            stagger={0.08}
            triggered
          />
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6" id="work">
        <ServiceCard
          label="01 / DIGITAL"
          icon="</>"
          iconColor="var(--neon-primary)"
          title="Web & E-commerce Engineering"
          body="Next.js weby, headless e-shopy, UI systémy. Od nuly po produkciu."
          chips={DIGITAL_CHIPS}
          ctaColor="var(--neon-primary)"
          treeData={digitalTree}
          treeExpandIds={["app", "pages"]}
          badges={digitalAvatars}
          badgeText="3 recent projects"
          delay={0}
        />
        <ServiceCard
          label="02 / AUTOMATE"
          icon="⚡"
          iconColor="var(--neon-secondary)"
          title="AI Workflows & Automation"
          body="n8n, Make, custom AI agenti. Automatizuj to čo ťahá čas."
          chips={AUTOMATE_CHIPS}
          ctaColor="var(--neon-secondary)"
          treeData={automateTree}
          treeExpandIds={["workflows"]}
          badges={automateAvatars}
          badgeText="3 active workflows"
          delay={0.12}
        />
      </div>
    </section>
  );
};

export default ServicesSection;
