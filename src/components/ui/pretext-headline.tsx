import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";

interface PretextLine {
  words: string[];
  y: number;
}

interface PretextHeadlineProps {
  text: string;
  /** CSS font-size in px */
  fontSize?: number;
  /** Line height in px — should be ≥ fontSize * 1.15 */
  lineHeightPx?: number;
  color?: string;
  fontWeight?: number | string;
  /** Delay between each word (seconds) */
  stagger?: number;
  /** Initial y offset for entrance */
  enterY?: number;
  className?: string;
  /** Trigger animation only when this is true */
  triggered?: boolean;
}

const PretextHeadline = ({
  text,
  fontSize = 64,
  lineHeightPx,
  color = "var(--text-primary)",
  fontWeight = 700,
  stagger = 0.065,
  enterY = 14,
  className = "",
  triggered = true,
}: PretextHeadlineProps) => {
  const lh = lineHeightPx ?? Math.round(fontSize * 1.18);
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<PretextLine[]>([]);
  const [totalHeight, setTotalHeight] = useState(lh * 2);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const width = el.offsetWidth;
      if (width < 10) return;

      try {
        const font = `${fontWeight} ${fontSize}px Syne`;
        const prepared = prepareWithSegments(text, font);
        const result = layoutWithLines(prepared, width, lh);

        const newLines: PretextLine[] = result.lines.map((line, i) => ({
          words: line.text.trim().split(/\s+/).filter(Boolean),
          y: i * lh,
        }));
        setLines(newLines);
        setTotalHeight(result.height > 0 ? result.height : newLines.length * lh);
      } catch {
        // fallback: single line
        setLines([{ words: text.trim().split(/\s+/).filter(Boolean), y: 0 }]);
        setTotalHeight(lh);
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, fontSize, lh, fontWeight]);

  let globalIdx = 0;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", height: totalHeight, width: "100%" }}
    >
      {lines.map((line, li) => (
        <div
          key={li}
          style={{
            position: "absolute",
            top: line.y,
            left: 0,
            display: "flex",
            flexWrap: "nowrap",
            gap: "0.28em",
          }}
        >
          {line.words.map((word) => {
            const idx = globalIdx++;
            return (
              <motion.span
                key={idx}
                initial={{ opacity: 0, y: enterY }}
                animate={triggered ? { opacity: 1, y: 0 } : { opacity: 0, y: enterY }}
                transition={{
                  delay: idx * stagger,
                  duration: 0.52,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  display: "inline-block",
                  fontFamily: "'Syne', sans-serif",
                  fontWeight,
                  fontSize,
                  lineHeight: `${lh}px`,
                  color,
                  whiteSpace: "nowrap",
                }}
              >
                {word}
              </motion.span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default PretextHeadline;
