import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MESSAGES = [
  "NODE SYNC: 99.7%",
  "SIGNAL INTEGRITY: NOMINAL",
  "AURORA LEVELS: STABLE",
  "DATA STREAM ACTIVE",
  "MEMORY FRAGMENT RECOVERED",
  "SUBSYSTEM CHECK: PASSED",
  "FREQUENCY LOCKED: 427.3MHz",
  "ENCRYPTION: AES-512-QR",
  "LATENCY: 0.003ms",
  "OBSERVER COUNT: UNKNOWN",
  "THREAD_7X: MONITORING",
  "PACKET LOSS: 0.00%",
  "HANDSHAKE: VERIFIED",
  "SECTOR 04: ACTIVE",
  "TIMESTAMP DRIFT: -0.002s",
  "NEURAL MAP: LOADING",
  "ARCHIVE INDEX: 847/1024",
  "SIGNAL: ████████░░ 82%",
  "ENV_STABLE: TRUE",
  "NEXT SYNC: 00:47:12",
  "UPLINK: ESTABLISHED",
  "WARNING: ANOMALY DETECTED IN SECTOR 11",
  "GHOST SIGNAL AT 192.168.0.???",
  "RECURSION DEPTH: 7",
  "VOID BOUNDARY: 12.4 PARSECS",
];

interface SystemMessage {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

let messageId = 0;

const SystemMessages = () => {
  const [messages, setMessages] = useState<SystemMessage[]>([]);

  const spawnMessage = useCallback(() => {
    const colors = ["var(--neon-primary)", "var(--text-dim)", "var(--amber-dim)", "var(--neon-cold)"];
    const msg: SystemMessage = {
      id: messageId++,
      text: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
      x: 5 + Math.random() * 85,
      y: 5 + Math.random() * 85,
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    setMessages(prev => [...prev.slice(-3), msg]); // Keep max 4

    // Auto remove after 4-7 seconds
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== msg.id));
    }, 4000 + Math.random() * 3000);
  }, []);

  useEffect(() => {
    // Spawn messages at random intervals
    const scheduleNext = () => {
      const delay = 6000 + Math.random() * 12000; // 6-18 seconds
      return setTimeout(() => {
        spawnMessage();
        timerId = scheduleNext();
      }, delay);
    };

    // Initial spawn after 5s
    let timerId = setTimeout(() => {
      spawnMessage();
      timerId = scheduleNext();
    }, 5000);

    return () => clearTimeout(timerId);
  }, [spawnMessage]);

  return (
    <div className="fixed inset-0 z-[50] pointer-events-none overflow-hidden">
      <AnimatePresence>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(2px)" }}
            transition={{ duration: 0.8 }}
            style={{
              position: "absolute",
              left: `${msg.x}%`,
              top: `${msg.y}%`,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "9px",
              color: msg.color,
              letterSpacing: "0.1em",
              whiteSpace: "nowrap",
              opacity: 0.35,
              textShadow: `0 0 8px ${msg.color}`,
            }}
          >
            {msg.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default SystemMessages;
