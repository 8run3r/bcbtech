/**
 * PageLoader — the single loading state used across the site.
 * One quiet mark + one moving hairline. No fake progress, no text soup.
 */
const PageLoader = ({ fullscreen = true }: { fullscreen?: boolean }) => (
  <div
    className="flex flex-col items-center justify-center gap-5"
    style={{ minHeight: fullscreen ? "100vh" : "60vh", background: "#000" }}
    role="status"
    aria-label="Načítavam"
  >
    <span
      style={{
        fontFamily: "'Syne', sans-serif",
        fontWeight: 800,
        fontSize: 15,
        letterSpacing: "0.18em",
        color: "var(--text-primary)",
        opacity: 0.85,
      }}
    >
      C<span style={{ color: "var(--neon-primary)" }}>T</span>
    </span>
    <span className="relative block overflow-hidden" style={{ width: 96, height: 1, background: "rgba(255,255,255,0.08)" }}>
      <span
        className="absolute top-0 h-full ct-loader-sweep"
        style={{ width: 36, background: "linear-gradient(90deg, transparent, var(--neon-primary), transparent)" }}
      />
    </span>
    <style>{`
      .ct-loader-sweep { animation: ctLoaderSweep 1.1s ease-in-out infinite; }
      @keyframes ctLoaderSweep {
        0% { left: -38%; }
        100% { left: 102%; }
      }
      @media (prefers-reduced-motion: reduce) {
        .ct-loader-sweep { animation: none; left: 31%; }
      }
    `}</style>
  </div>
);

export default PageLoader;
