import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface EncryptedTextProps {
  text: string;
  className?: string;
  encryptedClassName?: string;
  revealedClassName?: string;
  revealDelayMs?: number;
  flipDelayMs?: number;
  charset?: string;
  triggerOnView?: boolean;
}

const DEFAULT_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?\\|";

const EncryptedText = ({
  text,
  className,
  encryptedClassName = "text-muted-foreground",
  revealedClassName = "text-foreground",
  revealDelayMs = 50,
  flipDelayMs = 40,
  charset = DEFAULT_CHARSET,
  triggerOnView = true,
}: EncryptedTextProps) => {
  const [revealed, setRevealed] = useState(0);
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [started, setStarted] = useState(!triggerOnView);
  const ref = useRef<HTMLSpanElement>(null);

  const randomChar = useCallback(() => {
    return charset[Math.floor(Math.random() * charset.length)];
  }, [charset]);

  // Initialize scrambled array
  useEffect(() => {
    setScrambled(text.split("").map((ch) => (ch === " " ? " " : randomChar())));
  }, [text, randomChar]);

  // Intersection observer
  useEffect(() => {
    if (!triggerOnView || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [triggerOnView]);

  // Reveal characters one by one
  useEffect(() => {
    if (!started) return;
    if (revealed >= text.length) return;
    const timer = setTimeout(() => setRevealed((r) => r + 1), revealDelayMs);
    return () => clearTimeout(timer);
  }, [started, revealed, text.length, revealDelayMs]);

  // Scramble unrevealed characters
  useEffect(() => {
    if (!started) return;
    if (revealed >= text.length) return;
    const timer = setInterval(() => {
      setScrambled((prev) =>
        prev.map((ch, i) => {
          if (i < revealed) return text[i];
          if (text[i] === " ") return " ";
          return randomChar();
        })
      );
    }, flipDelayMs);
    return () => clearInterval(timer);
  }, [started, revealed, text, flipDelayMs, randomChar]);

  return (
    <span ref={ref} className={cn("inline-block font-mono", className)} aria-label={text}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className={cn(
            "inline-block transition-all duration-200",
            i < revealed ? revealedClassName : encryptedClassName,
            i < revealed ? "opacity-100" : "opacity-70"
          )}
          style={{
            minWidth: char === " " ? "0.3em" : undefined,
          }}
        >
          {i < revealed ? char : scrambled[i] || char}
        </span>
      ))}
    </span>
  );
};

export default EncryptedText;
