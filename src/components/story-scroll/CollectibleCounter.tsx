import { motion, AnimatePresence } from "framer-motion";

interface CollectibleCounterProps {
  collected: number;
  total: number;
  color: string;
}

const CollectibleCounter = ({ collected, total, color }: CollectibleCounterProps) => (
  <div
    className="absolute top-6 left-6 z-30 flex items-center gap-2"
    style={{ fontFamily: "'JetBrains Mono',monospace" }}
  >
    <span className="font-mono text-xs" style={{ color: "var(--text-muted)", fontSize: 9 }}>
      COLLECTED
    </span>
    <AnimatePresence mode="wait">
      <motion.span
        key={collected}
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 8, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="font-mono font-bold"
        style={{ color, fontSize: 13 }}
      >
        {collected}/{total}
      </motion.span>
    </AnimatePresence>
  </div>
);

export default CollectibleCounter;
