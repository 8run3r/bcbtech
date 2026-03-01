import { cn } from "@/lib/utils";

interface ProgressiveBlurProps {
  className?: string;
  height?: string;
  position?: "top" | "bottom";
  blurLevels?: number[];
}

export function ProgressiveBlur({
  className,
  height = "30%",
  position = "bottom",
  blurLevels = [0.5, 1, 2, 4, 8, 16, 32, 64],
}: ProgressiveBlurProps) {
  const isBottom = position === "bottom";

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 z-10",
        isBottom ? "bottom-0" : "top-0",
        className
      )}
      style={{ height }}
    >
      {blurLevels.map((blur, i) => {
        const segmentHeight = 100 / blurLevels.length;
        const start = i * segmentHeight;
        const end = (i + 1) * segmentHeight;

        return (
          <div
            key={i}
            className="absolute inset-x-0"
            style={{
              [isBottom ? "top" : "bottom"]: `${start}%`,
              height: `${segmentHeight}%`,
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              maskImage: isBottom
                ? `linear-gradient(to bottom, transparent ${0}%, black ${100}%)`
                : `linear-gradient(to top, transparent ${0}%, black ${100}%)`,
              WebkitMaskImage: isBottom
                ? `linear-gradient(to bottom, transparent ${0}%, black ${100}%)`
                : `linear-gradient(to top, transparent ${0}%, black ${100}%)`,
            }}
          />
        );
      })}
    </div>
  );
}
