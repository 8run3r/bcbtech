import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

/**
 * Anime-styled pretext effect — characters appear one by one
 * with a glitch/scramble phase before settling.
 * Inspired by Serial Experiments Lain / TSUKI aesthetic.
 */

const GLITCH_CHARS = "█▓▒░アイウエオカキクケコ01";

interface AnimeTextProps {
  text: string;
  className?: string;
  color?: string;
  fontSize?: string;
  delay?: number;
  speed?: number;
  triggered?: boolean;
}

const AnimeText = ({
  text,
  className = "",
  color = "var(--text-primary)",
  fontSize = "14px",
  delay = 0,
  speed = 40,
  triggered = true,
}: AnimeTextProps) => {
  const [chars, setChars] = useState<string[]>(Array(text.length).fill(""));
  const [settled, setSettled] = useState<boolean[]>(Array(text.length).fill(false));
  const started = useRef(false);

  useEffect(() => {
    if (!triggered || started.current) return;
    started.current = true;

    const totalDelay = delay;

    text.split("").forEach((targetChar, i) => {
      if (targetChar === " ") {
        setTimeout(() => {
          setChars(prev => { const n = [...prev]; n[i] = " "; return n; });
          setSettled(prev => { const n = [...prev]; n[i] = true; return n; });
        }, totalDelay);
        return;
      }

      // Scramble phase
      const scrambleCount = 3 + Math.floor(Math.random() * 4);
      for (let s = 0; s < scrambleCount; s++) {
        setTimeout(() => {
          setChars(prev => {
            const n = [...prev];
            n[i] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
            return n;
          });
        }, totalDelay + i * speed + s * 30);
      }

      // Settle
      setTimeout(() => {
        setChars(prev => { const n = [...prev]; n[i] = targetChar; return n; });
        setSettled(prev => { const n = [...prev]; n[i] = true; return n; });
      }, totalDelay + i * speed + scrambleCount * 30);
    });
  }, [triggered, text, delay, speed]);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={triggered ? { opacity: 1 } : {}}
      transition={{ duration: 0.3, delay: delay / 1000 }}
      style={{
        fontFamily: "'VT323', monospace",
        fontSize,
        color,
        letterSpacing: "0.02em",
        display: "inline-block",
      }}
    >
      {chars.map((char, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            color: settled[i] ? color : "var(--neon-primary)",
            opacity: settled[i] ? 1 : 0.6,
            textShadow: settled[i] ? "none" : `0 0 8px ${color}`,
            transition: "color 0.15s, opacity 0.15s, text-shadow 0.15s",
            minWidth: char === " " ? "0.3em" : undefined,
          }}
        >
          {char || "\u00A0"}
        </span>
      ))}
    </motion.div>
  );
};

export default AnimeText;
