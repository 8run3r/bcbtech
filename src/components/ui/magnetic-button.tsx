import { useRef, useEffect, useCallback, forwardRef } from "react";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  strength?: number;
  children: React.ReactNode;
}

/**
 * MagneticButton — subtly attracts toward the cursor when within range.
 * Strength 0.25 = gentle pull, 0.5 = stronger.
 */
const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ children, strength = 0.28, style, onMouseEnter, onMouseLeave, onMouseMove, ...props }, externalRef) => {
    const innerRef = useRef<HTMLButtonElement>(null);
    const ref = (externalRef as React.RefObject<HTMLButtonElement>) ?? innerRef;
    const frameRef = useRef<number>(0);
    const targetX = useRef(0);
    const targetY = useRef(0);
    const currentX = useRef(0);
    const currentY = useRef(0);
    const isHovering = useRef(false);

    const animate = useCallback(() => {
      const lerpFactor = isHovering.current ? 0.12 : 0.08;
      currentX.current += (targetX.current - currentX.current) * lerpFactor;
      currentY.current += (targetY.current - currentY.current) * lerpFactor;

      const el = (ref as React.RefObject<HTMLButtonElement>).current;
      if (el) {
        const mag = Math.sqrt(currentX.current ** 2 + currentY.current ** 2);
        const scale = 1 + mag * 0.001;
        el.style.transform = `translate(${currentX.current.toFixed(2)}px, ${currentY.current.toFixed(2)}px) scale(${scale.toFixed(4)})`;
      }
      frameRef.current = requestAnimationFrame(animate);
    }, [ref]);

    useEffect(() => {
      frameRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frameRef.current);
    }, [animate]);

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        const el = (ref as React.RefObject<HTMLButtonElement>).current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        targetX.current = (e.clientX - cx) * strength;
        targetY.current = (e.clientY - cy) * strength;
        onMouseMove?.(e);
      },
      [ref, strength, onMouseMove]
    );

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        isHovering.current = true;
        onMouseEnter?.(e);
      },
      [onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        isHovering.current = false;
        targetX.current = 0;
        targetY.current = 0;
        onMouseLeave?.(e);
      },
      [onMouseLeave]
    );

    return (
      <button
        ref={ref as React.RefObject<HTMLButtonElement>}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ willChange: "transform", ...style }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

MagneticButton.displayName = "MagneticButton";
export default MagneticButton;
