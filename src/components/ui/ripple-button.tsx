import React, { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RippleItem {
  x: number;
  y: number;
  size: number;
  id: number;
}

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  rippleColor?: string;
  duration?: number;
  children: React.ReactNode;
}

const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(
  ({ className, children, rippleColor = "hsl(var(--primary) / 0.4)", duration = 600, onClick, ...props }, ref) => {
    const [ripples, setRipples] = useState<RippleItem[]>([]);
    const counter = useRef(0);

    const createRipple = useCallback(
      (event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();

        let x: number, y: number;
        if ("touches" in event) {
          x = event.touches[0].clientX - rect.left;
          y = event.touches[0].clientY - rect.top;
        } else {
          x = event.clientX - rect.left;
          y = event.clientY - rect.top;
        }

        const size = Math.max(rect.width, rect.height) * 2;
        const id = counter.current++;

        setRipples((prev) => [...prev, { x, y, size, id }]);

        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, duration);
      },
      [duration]
    );

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        createRipple(e);
        onClick?.(e);
      },
      [createRipple, onClick]
    );

    return (
      <button
        ref={ref}
        className={cn(
          "relative overflow-hidden cursor-pointer",
          className
        )}
        onClick={handleClick}
        onTouchStart={createRipple}
        {...props}
      >
        {children}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none animate-[ripple-expand_var(--ripple-duration)_ease-out_forwards]"
            style={{
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
              backgroundColor: rippleColor,
              "--ripple-duration": `${duration}ms`,
            } as React.CSSProperties}
          />
        ))}
      </button>
    );
  }
);

RippleButton.displayName = "RippleButton";

export { RippleButton };
