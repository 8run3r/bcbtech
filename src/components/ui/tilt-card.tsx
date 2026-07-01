import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";

/**
 * TiltCard — pointer-driven 3D tilt (±maxTilt°) with a glare highlight
 * that follows the cursor. Springs back to rest on leave.
 * Inert on touch devices (mouse pointers only) and under prefers-reduced-motion.
 */

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Max tilt angle in degrees */
  maxTilt?: number;
  /** RGB triplet for the glare highlight, e.g. "0,255,170" */
  glare?: string;
}

const SPRING = { stiffness: 260, damping: 22, mass: 0.7 };

const TiltCard = ({ children, className = "", style, maxTilt = 6, glare = "255,255,255" }: TiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const disabledRef = useRef(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareOn = useMotionValue(0);

  const sRotateX = useSpring(rotateX, SPRING);
  const sRotateY = useSpring(rotateY, SPRING);
  const sGlare = useSpring(glareOn, { stiffness: 180, damping: 26 });

  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(${glare}, 0.09) 0%, rgba(${glare}, 0.03) 30%, transparent 60%)`;

  useEffect(() => {
    disabledRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabledRef.current || e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateX.set((0.5 - py) * maxTilt * 2);
    rotateY.set((px - 0.5) * maxTilt * 2);
    glareX.set(px * 100);
    glareY.set(py * 100);
    glareOn.set(1);
  };

  const handleLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    rotateX.set(0);
    rotateY.set(0);
    glareOn.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`relative overflow-hidden ${className}`}
      style={{
        ...style,
        rotateX: sRotateX,
        rotateY: sRotateY,
        transformPerspective: 800,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {children}
      {/* glare — decorative, must never block taps */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: glareBg, opacity: sGlare }}
      />
    </motion.div>
  );
};

export default TiltCard;
