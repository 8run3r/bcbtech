import {
  useScroll,
  useMotionValueEvent,
  motion,
  AnimatePresence,
} from "framer-motion";
import { useRef, useState, useEffect } from "react";
import VertexNetwork3D from "@/components/landing/VertexNetwork3D";
import GlitchText from "@/components/landing/GlitchText";
import { FileTree, type TreeViewElement } from "@/components/ui/file-tree";
import PretextHeadline from "@/components/ui/pretext-headline";

/* ──────────────────────────────────────────────
   Constants
────────────────────────────────────────────── */
const CHAPTERS = [0, 1, 2, 3, 4] as const;
type Chapter = (typeof CHAPTERS)[number];

const chapterAt = (progress: number): Chapter => {
  if (progress < 0.2) return 0;
  if (progress < 0.4) return 1;
  if (progress < 0.6) return 2;
  if (progress < 0.8) return 3;
  return 4;
};

/* ──────────────────────────────────────────────
   BOOT lines
────────────────────────────────────────────── */
const BOOT_LINES = [
  "> INITIALIZING COKTECH_OS v2.4...",
  "> LOADING MODULES...",
  "> WORLD_01_DIGITAL............OK",
  "> WORLD_02_AUTOMATION.........OK",
  "> ALL SYSTEMS OPERATIONAL",
];

const useTypedLines = (active: boolean) => {
  const [revealed, setRevealed] = useState<string[]>([]);
  const [currentChars, setCurrentChars] = useState(0);
  const lineIdx = revealed.length;

  useEffect(() => {
    if (!active) {
      setRevealed([]);
      setCurrentChars(0);
      return;
    }

    if (lineIdx >= BOOT_LINES.length) return;
    const line = BOOT_LINES[lineIdx];
    if (currentChars < line.length) {
      const t = setTimeout(() => setCurrentChars((c) => c + 1), 28);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setRevealed((r) => [...r, line]);
        setCurrentChars(0);
      }, 160);
      return () => clearTimeout(t);
    }
  }, [active, lineIdx, currentChars]);

  const currentLine =
    lineIdx < BOOT_LINES.length
      ? BOOT_LINES[lineIdx].slice(0, currentChars)
      : null;

  return { revealed, currentLine };
};

/* ──────────────────────────────────────────────
   HUD corners
────────────────────────────────────────────── */
const HudCorners = ({ color }: { color: string }) => (
  <>
    <span
      className="absolute top-6 left-6 w-6 h-6 pointer-events-none"
      style={{ borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}`, opacity: 0.5 }}
    />
    <span
      className="absolute top-6 right-6 w-6 h-6 pointer-events-none"
      style={{ borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}`, opacity: 0.5 }}
    />
    <span
      className="absolute bottom-6 left-6 w-6 h-6 pointer-events-none"
      style={{ borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}`, opacity: 0.5 }}
    />
    <span
      className="absolute bottom-6 right-6 w-6 h-6 pointer-events-none"
      style={{ borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}`, opacity: 0.5 }}
    />
  </>
);

/* ──────────────────────────────────────────────
   Tech chip
────────────────────────────────────────────── */
const TechChip = ({ label, color }: { label: string; color: string }) => (
  <span
    className="inline-block px-3 py-1 rounded-sm text-xs font-mono mr-2 mb-2"
    style={{
      fontFamily: "'JetBrains Mono', monospace",
      background: `${color}12`,
      border: `1px solid ${color}40`,
      color,
      letterSpacing: "0.06em",
    }}
  >
    {label}
  </span>
);

/* ──────────────────────────────────────────────
   Chapter fade wrapper
────────────────────────────────────────────── */
const ChapterWrapper = ({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) => (
  <AnimatePresence>
    {active && (
      <motion.div
        key="chapter"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0"
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

/* ──────────────────────────────────────────────
   Chapter 0 — BOOT
────────────────────────────────────────────── */
const Chapter0 = ({ active }: { active: boolean }) => {
  const { revealed, currentLine } = useTypedLines(active);

  return (
    <ChapterWrapper active={active}>
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ background: "#050508" }}
      >
        <HudCorners color="#00ffaa" />
        <div className="max-w-xl w-full px-8">
          {revealed.map((line, i) => (
            <p
              key={i}
              className="font-mono text-sm leading-relaxed"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "#00ffaa",
                marginBottom: "0.35rem",
              }}
            >
              {line}
            </p>
          ))}
          {currentLine !== null && (
            <p
              className="font-mono text-sm leading-relaxed flex items-center"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "#00ffaa",
              }}
            >
              {currentLine}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.7, repeat: Infinity }}
              >
                ▮
              </motion.span>
            </p>
          )}
        </div>
      </div>
    </ChapterWrapper>
  );
};

/* ──────────────────────────────────────────────
   File tree data
────────────────────────────────────────────── */
const FILE_TREE_ELEMENTS: TreeViewElement[] = [
  {
    id: "root",
    name: "my-nextjs-app",
    children: [
      {
        id: "app",
        name: "app",
        children: [
          { id: "layout", name: "layout.tsx" },
          { id: "page", name: "page.tsx" },
          {
            id: "api",
            name: "api",
            children: [{ id: "route", name: "route.ts" }],
          },
        ],
      },
      {
        id: "components",
        name: "components",
        children: [
          { id: "hero", name: "Hero.tsx" },
          { id: "navbar", name: "Navbar.tsx" },
          { id: "footer", name: "Footer.tsx" },
        ],
      },
      { id: "tsconfig", name: "tsconfig.json" },
      { id: "pkgjson", name: "package.json" },
    ],
  },
];

/* ──────────────────────────────────────────────
   Chapter 1 — WORLD_01 DIGITAL
────────────────────────────────────────────── */
const Chapter1 = ({ active }: { active: boolean }) => (
  <ChapterWrapper active={active}>
    <div
      className="w-full h-full flex flex-col md:flex-row items-stretch relative overflow-hidden"
      style={{ background: "#050508" }}
    >
      {/* Green tint — Digital world */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "rgba(0,255,170,0.05)" }}
      />

      {/* Left: 3D */}
      <div className="relative flex-1 min-h-[200px] md:min-h-0">
        <VertexNetwork3D />
      </div>

      {/* Right: text */}
      <div className="relative flex-1 flex flex-col justify-center px-8 py-10 md:py-0 z-10">
        <p
          className="font-mono text-xs mb-4"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "var(--neon-primary)",
            letterSpacing: "0.14em",
          }}
        >
          [ CHAPTER_01 // DIGITAL ]
        </p>
        <div className="mb-4">
          <PretextHeadline
            text="Web produkty ktoré fungujú."
            fontSize={32}
            color="var(--text-primary)"
            stagger={0.07}
            triggered={active}
          />
        </div>
        <p
          className="text-sm mb-6 max-w-xs"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: "var(--text-muted)",
            lineHeight: 1.7,
          }}
        >
          Staviame rýchle, dostupné a vizuálne presvedčivé webové produkty na modernom stacku.
        </p>

        <div className="mb-6">
          <FileTree
            elements={FILE_TREE_ELEMENTS}
            initialExpandedIds={["root", "app", "components"]}
            className="max-w-xs"
          />
        </div>

        <div>
          {["Next.js", "TypeScript", "Tailwind"].map((t) => (
            <TechChip key={t} label={t} color="var(--neon-primary)" />
          ))}
        </div>
      </div>

      <HudCorners color="var(--neon-primary)" />
    </div>
  </ChapterWrapper>
);

/* ──────────────────────────────────────────────
   Circuit SVG (Chapter 2 decoration)
────────────────────────────────────────────── */
const CircuitSvg = () => (
  <svg
    viewBox="0 0 200 200"
    width="220"
    height="220"
    fill="none"
    className="opacity-70"
  >
    {/* Main flow paths */}
    <motion.path
      d="M20 100 H80 L100 80 H160"
      stroke="var(--neon-secondary)"
      strokeWidth="1"
      strokeDasharray="4 3"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    />
    <motion.path
      d="M20 120 H60 L80 140 H180"
      stroke="var(--neon-secondary)"
      strokeWidth="1"
      strokeDasharray="4 3"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 0.4 }}
    />
    <motion.path
      d="M100 20 V60 L120 80 V140 L100 160 V180"
      stroke="var(--neon-secondary)"
      strokeWidth="0.75"
      strokeDasharray="3 4"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 0.8 }}
    />
    {/* Nodes */}
    {([
      [80, 100],
      [100, 80],
      [160, 100],
      [60, 120],
      [80, 140],
      [100, 60],
      [120, 80],
      [120, 140],
      [100, 160],
    ] as [number, number][]).map(([cx, cy], i) => (
      <motion.circle
        key={i}
        cx={cx}
        cy={cy}
        r="3"
        fill="var(--neon-secondary)"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: i * 0.2,
          ease: "easeInOut",
        }}
      />
    ))}
  </svg>
);

/* ──────────────────────────────────────────────
   Chapter 2 — WORLD_02 AUTOMATION
────────────────────────────────────────────── */
const Chapter2 = ({ active }: { active: boolean }) => (
  <ChapterWrapper active={active}>
    <div
      className="w-full h-full flex flex-col md:flex-row items-stretch relative overflow-hidden"
      style={{ background: "#050508" }}
    >
      {/* Orange tint — Automation world */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "rgba(255,140,0,0.04)" }}
      />

      {/* Left: text */}
      <div className="relative flex-1 flex flex-col justify-center px-8 py-10 md:py-0 z-10">
        <p
          className="font-mono text-xs mb-4"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "var(--neon-secondary)",
            letterSpacing: "0.14em",
          }}
        >
          [ CHAPTER_02 // AUTOMATION ]
        </p>
        <div className="mb-4">
          <PretextHeadline
            text="Automatizácia ktorá šetrí čas."
            fontSize={32}
            color="var(--text-primary)"
            stagger={0.07}
            triggered={active}
          />
        </div>
        <p
          className="text-sm mb-6 max-w-xs"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: "var(--text-muted)",
            lineHeight: 1.7,
          }}
        >
          Prepájame nástroje, automatizujeme procesy a eliminujeme manuálnu prácu pomocou AI a no-code nástrojov.
        </p>

        <div>
          {["n8n", "Claude API", "Make"].map((t) => (
            <TechChip key={t} label={t} color="var(--neon-secondary)" />
          ))}
        </div>
      </div>

      {/* Right: circuit visual */}
      <div className="relative flex-1 flex items-center justify-center min-h-[200px] md:min-h-0">
        <CircuitSvg />
      </div>

      <HudCorners color="var(--neon-secondary)" />
    </div>
  </ChapterWrapper>
);

/* ──────────────────────────────────────────────
   Chapter 3 — CONVERGENCE
────────────────────────────────────────────── */
const Chapter3 = ({ active }: { active: boolean }) => (
  <ChapterWrapper active={active}>
    <div
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden px-6"
      style={{ background: "#050508" }}
    >
      {/* Split gradient bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,255,170,0.08) 0%, rgba(5,5,8,0) 50%, rgba(255,140,0,0.07) 100%)",
        }}
      />

      <HudCorners color="var(--text-muted)" />

      <motion.p
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="font-mono text-xs mb-6 tracking-widest"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: "var(--text-muted)",
          letterSpacing: "0.2em",
        }}
      >
        [ CHAPTER_03 // CONVERGENCE ]
      </motion.p>

      <h2
        className="font-bold text-center mb-8"
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "clamp(2.5rem, 6vw, 5rem)",
          color: "var(--text-primary)",
        }}
      >
        <GlitchText glitchInterval={2800}>CokTech</GlitchText>
      </h2>

      {/* Divider line: violet | mint */}
      <div className="w-48 h-px mb-8 flex overflow-hidden rounded-full">
        <div className="flex-1" style={{ background: "var(--neon-primary)" }} />
        <div className="flex-1" style={{ background: "var(--neon-secondary)" }} />
      </div>

      <p
        className="text-center max-w-md text-sm mb-8"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: "var(--text-muted)",
          lineHeight: 1.7,
        }}
      >
        Dva svety. Jeden tím. Digitálne riešenia ktoré spájajú precízne
        web inžinierstvo s inteligentnou automatizáciou.
      </p>

      {/* Recent work badges — cosmetic placeholders (no images per rules) */}
      <div className="flex flex-wrap gap-3 justify-center">
        {["Klient_01", "Klient_02", "Klient_03"].map((label) => (
          <span
            key={label}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-sm font-mono text-xs"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              background: "var(--bg-glass)",
              border: "1px solid var(--border-glass)",
              color: "var(--text-muted)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--neon-primary)" }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  </ChapterWrapper>
);

/* ──────────────────────────────────────────────
   Chapter 4 — CTA
────────────────────────────────────────────── */
const Chapter4 = ({ active }: { active: boolean }) => (
  <ChapterWrapper active={active}>
    <div
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden px-6"
      style={{ background: "#050508" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(123,97,255,0.07) 0%, transparent 65%)",
        }}
      />

      <HudCorners color="var(--border-glass)" />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="font-mono text-xs mb-8 tracking-widest"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: "var(--text-muted)",
          letterSpacing: "0.2em",
        }}
      >
        [ CHAPTER_04 // SELECT_WORLD ]
      </motion.p>

      <h2
        className="font-bold text-center mb-10"
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "clamp(2rem, 4vw, 3rem)",
          color: "var(--text-primary)",
        }}
      >
        Vyber si svet
      </h2>

      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href="/balicky?tab=web"
          className="font-mono text-sm px-8 py-4 rounded-sm transition-all duration-300 hover:scale-[1.03] text-center"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            background: "rgba(0,255,170,0.1)",
            border: "1px solid rgba(0,255,170,0.45)",
            color: "var(--neon-primary)",
            letterSpacing: "0.08em",
          }}
        >
          WORLD_01 // デジタル →
        </a>
        <a
          href="/balicky?tab=automation"
          className="font-mono text-sm px-8 py-4 rounded-sm transition-all duration-300 hover:scale-[1.03] text-center"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            background: "rgba(255,140,0,0.08)",
            border: "1px solid rgba(255,140,0,0.45)",
            color: "var(--neon-secondary)",
            letterSpacing: "0.08em",
          }}
        >
          WORLD_02 // 自動化 →
        </a>
      </div>
    </div>
  </ChapterWrapper>
);

/* ──────────────────────────────────────────────
   Main component
────────────────────────────────────────────── */
const AnimeScrollStory = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState<Chapter>(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setChapter(chapterAt(latest));
  });

  return (
    <div ref={containerRef} style={{ height: "400vh" }}>
      <div
        className="sticky top-0 overflow-hidden"
        style={{ height: "100vh" }}
      >
        {/* Chapter layers */}
        <Chapter0 active={chapter === 0} />
        <Chapter1 active={chapter === 1} />
        <Chapter2 active={chapter === 2} />
        <Chapter3 active={chapter === 3} />
        <Chapter4 active={chapter === 4} />

        {/* Chapter progress indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 pointer-events-none"
        >
          {CHAPTERS.map((c) => (
            <motion.span
              key={c}
              className="rounded-full"
              animate={{
                width: chapter === c ? 20 : 4,
                background: chapter === c ? "var(--neon-primary)" : "rgba(255,255,255,0.15)",
              }}
              style={{ height: 4, display: "inline-block" }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimeScrollStory;
