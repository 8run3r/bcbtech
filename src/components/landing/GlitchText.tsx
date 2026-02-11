import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const GlitchText = ({
  children,
  className = "",
  glitchInterval = 4000,
}: {
  children: string;
  className?: string;
  glitchInterval?: number;
}) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, glitchInterval);
    return () => clearInterval(interval);
  }, [glitchInterval]);

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      {isGlitching && (
        <>
          <motion.span
            initial={{ x: -3, opacity: 0.8 }}
            animate={{ x: [- 3, 2, -1, 0], opacity: [0.8, 0.6, 0.4, 0] }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 text-primary z-0"
            style={{ clipPath: "inset(10% 0 60% 0)" }}
            aria-hidden="true"
          >
            {children}
          </motion.span>
          <motion.span
            initial={{ x: 3, opacity: 0.7 }}
            animate={{ x: [3, -2, 1, 0], opacity: [0.7, 0.5, 0.3, 0] }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 text-accent z-0"
            style={{ clipPath: "inset(50% 0 10% 0)" }}
            aria-hidden="true"
          >
            {children}
          </motion.span>
        </>
      )}
    </span>
  );
};

export default GlitchText;
