import React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface InteractiveHoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  icon?: React.ReactNode;
}

const InteractiveHoverButton = React.forwardRef<HTMLButtonElement, InteractiveHoverButtonProps>(
  ({ className, text = "Button", icon, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative cursor-pointer overflow-hidden rounded-full border border-foreground/20 bg-background/90 backdrop-blur-md px-8 py-4 text-center font-semibold text-sm uppercase tracking-wider transition-all duration-300",
          className
        )}
        {...props}
      >
        {/* Sliding background */}
        <span className="absolute inset-0 flex w-full translate-x-[-100%] items-center justify-center bg-primary text-primary-foreground transition-all duration-300 group-hover:translate-x-0 group-active:translate-x-0">
          {icon || <ArrowRight className="h-5 w-5" />}
        </span>

        {/* Default text */}
        <span className="relative z-10 inline-flex items-center gap-2 transition-all duration-300 group-hover:translate-x-[200%] group-active:translate-x-[200%]">
          {children || text}
        </span>
      </button>
    );
  }
);

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
