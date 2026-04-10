/** HP / XP style pixel progress bar */
const PixelProgressBar = ({
  progress,
  color = "#00ffaa",
  label,
}: {
  progress: number; // 0-1
  color?: string;
  label?: string;
}) => {
  const filled = Math.round(progress * 16);
  const bar = "\u2588".repeat(filled) + "\u2591".repeat(16 - filled);

  return (
    <div className="flex items-center gap-2" style={{ fontFamily: "'VT323', monospace" }}>
      {label && (
        <span style={{ fontSize: 12, color, opacity: 0.6, letterSpacing: "0.1em" }}>{label}</span>
      )}
      <span style={{ fontSize: 14, color, letterSpacing: "1px" }}>[{bar}]</span>
      <span style={{ fontSize: 10, color, opacity: 0.5 }}>{Math.round(progress * 100)}%</span>
    </div>
  );
};

export default PixelProgressBar;
