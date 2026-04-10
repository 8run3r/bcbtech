import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";

/**
 * SmoothScroll — wraps the app with Lenis for buttery-smooth inertia scrolling.
 * Compatible with framer-motion useScroll (Lenis fires native scroll events).
 */
let globalLenis: Lenis | null = null;

export function getLenis() {
  return globalLenis;
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,          // seconds for full scroll (higher = smoother/slower)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo out
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,   // slight resistance for elegance
      touchMultiplier: 1.8,   // natural on touch
      infinite: false,
    });

    lenisRef.current = lenis;
    globalLenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      globalLenis = null;
    };
  }, []);

  return <>{children}</>;
}
