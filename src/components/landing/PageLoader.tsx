import { motion } from "framer-motion";

const PageLoader = ({ progress = 0 }: { progress?: number }) => {
  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center gap-8"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Animated grid lines */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.04]">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`h-${i}`}
            className="absolute left-0 right-0 h-px bg-primary"
            style={{ top: `${(i + 1) * 8}%` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`v-${i}`}
            className="absolute top-0 bottom-0 w-px bg-primary"
            style={{ left: `${(i + 1) * 8}%` }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.2, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>

      {/* Central loader */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Spinning ring */}
        <div className="relative w-16 h-16">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          {/* Inner pulse dot */}
          <motion.div
            className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-primary"
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Progress bar */}
        <div className="w-48 h-0.5 bg-foreground/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${Math.max(progress, 5)}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>

        {/* Text */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-mono"
        >
          Načítavam scénu
        </motion.p>
      </div>

      {/* Corner decorations */}
      <motion.div
        className="absolute top-6 left-6 w-8 h-8 border-l border-t border-primary/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      />
      <motion.div
        className="absolute top-6 right-6 w-8 h-8 border-r border-t border-primary/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      />
      <motion.div
        className="absolute bottom-6 left-6 w-8 h-8 border-l border-b border-primary/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      />
      <motion.div
        className="absolute bottom-6 right-6 w-8 h-8 border-r border-b border-primary/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      />
    </motion.div>
  );
};

export default PageLoader;
