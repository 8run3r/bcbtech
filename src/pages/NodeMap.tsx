import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Scanlines from "@/components/ui/scanlines";

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
  type: "primary" | "secondary" | "ghost";
  connections: string[];
}

const NODES: Node[] = [
  { id: "CT-CORE", x: 50, y: 45, label: "CORE NODE", type: "primary", connections: ["CT-WEB", "CT-AUTO", "CT-SEC"] },
  { id: "CT-WEB", x: 25, y: 30, label: "WEB ENGINE", type: "primary", connections: ["CT-CORE", "CT-UI", "CT-API"] },
  { id: "CT-AUTO", x: 75, y: 30, label: "AUTOMATION", type: "primary", connections: ["CT-CORE", "CT-AI", "CT-DATA"] },
  { id: "CT-SEC", x: 50, y: 70, label: "SECURITY", type: "secondary", connections: ["CT-CORE"] },
  { id: "CT-UI", x: 12, y: 50, label: "UI LAYER", type: "secondary", connections: ["CT-WEB"] },
  { id: "CT-API", x: 35, y: 15, label: "API BRIDGE", type: "secondary", connections: ["CT-WEB", "CT-AUTO"] },
  { id: "CT-AI", x: 85, y: 50, label: "AI ENGINE", type: "secondary", connections: ["CT-AUTO"] },
  { id: "CT-DATA", x: 70, y: 60, label: "DATASTORE", type: "secondary", connections: ["CT-AUTO", "CT-SEC"] },
  { id: "CT-VOID", x: 50, y: 88, label: "???", type: "ghost", connections: ["CT-SEC"] },
  { id: "CT-OBS", x: 8, y: 80, label: "OBSERVER", type: "ghost", connections: [] },
];

const NodeMap = () => {
  const [loaded, setLoaded] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [pulsePhase, setPulsePhase] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { setTimeout(() => setLoaded(true), 600); }, []);
  useEffect(() => {
    const i = setInterval(() => setPulsePhase(p => p + 1), 2000);
    return () => clearInterval(i);
  }, []);

  // Draw connections on canvas
  const drawConnections = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    NODES.forEach(node => {
      node.connections.forEach(targetId => {
        const target = NODES.find(n => n.id === targetId);
        if (!target) return;

        const isHighlighted = hoveredNode === node.id || hoveredNode === target.id;

        ctx.beginPath();
        ctx.moveTo(node.x / 100 * canvas.width, node.y / 100 * canvas.height);
        ctx.lineTo(target.x / 100 * canvas.width, target.y / 100 * canvas.height);
        ctx.strokeStyle = isHighlighted ? "rgba(0,255,170,0.25)" : "rgba(0,255,170,0.05)";
        ctx.lineWidth = isHighlighted ? 1.5 : 0.5;
        ctx.stroke();
      });
    });
  }, [hoveredNode]);

  useEffect(() => { drawConnections(); }, [drawConnections, pulsePhase]);
  useEffect(() => {
    const handleResize = () => drawConnections();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawConnections]);

  return (
    <>
      <Scanlines />
      <main className="min-h-screen" style={{ background: "#000" }}>
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20">
          {/* Header */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <Link to="/" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--text-ghost)", letterSpacing: "0.15em" }}>
              {'<'} RETURN TO NODE
            </Link>

            <div className="mt-8 mb-2" style={{ borderBottom: "1px solid rgba(0,255,170,0.06)", paddingBottom: "0.5rem" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "var(--neon-primary)", opacity: 0.3, letterSpacing: "0.2em" }}>
                NETWORK TOPOLOGY // REAL-TIME VISUALIZATION
              </span>
            </div>

            <h1 style={{ fontFamily: "'VT323', monospace", fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "var(--text-primary)", letterSpacing: "-0.02em", marginTop: "1rem" }}>
              NODE MAP
            </h1>
          </motion.div>

          {/* Map area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={loaded ? { opacity: 1 } : {}}
            transition={{ delay: 0.5, duration: 1 }}
            className="relative mt-12"
            style={{ height: "60vh", minHeight: 400, border: "1px solid rgba(0,255,170,0.04)" }}
          >
            {/* Canvas for connection lines */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            {/* Nodes */}
            {NODES.map((node, i) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={loaded ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * 0.08 + 0.8, duration: 0.4, type: "spring" }}
                className="absolute flex flex-col items-center gap-1"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: "translate(-50%, -50%)",
                  cursor: "none",
                  zIndex: hoveredNode === node.id ? 10 : 1,
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
              >
                {/* Node dot */}
                <div
                  style={{
                    width: node.type === "primary" ? 10 : node.type === "ghost" ? 4 : 6,
                    height: node.type === "primary" ? 10 : node.type === "ghost" ? 4 : 6,
                    background: node.type === "ghost" ? "var(--amber)" : "var(--neon-primary)",
                    opacity: hoveredNode === node.id ? 1 : node.type === "ghost" ? 0.3 : 0.6,
                    boxShadow: hoveredNode === node.id
                      ? `0 0 15px ${node.type === "ghost" ? "var(--amber)" : "var(--neon-primary)"}`
                      : "none",
                    transition: "all 0.3s ease",
                    transform: node.type === "primary" ? "rotate(45deg)" : "none",
                  }}
                />
                {/* Label */}
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "7px",
                    color: hoveredNode === node.id ? "var(--text-primary)" : "var(--text-ghost)",
                    letterSpacing: "0.12em",
                    transition: "color 0.3s",
                    whiteSpace: "nowrap",
                    marginTop: 4,
                  }}
                >
                  {node.label}
                </span>
                {/* ID */}
                {hoveredNode === node.id && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "6px", color: "var(--neon-primary)", letterSpacing: "0.1em" }}
                  >
                    {node.id}
                  </motion.span>
                )}
              </motion.div>
            ))}

            {/* Selected node info panel */}
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-4 p-4"
                style={{
                  background: "rgba(0,0,0,0.85)",
                  border: "1px solid rgba(0,255,170,0.1)",
                  maxWidth: 250,
                }}
              >
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "var(--neon-primary)", letterSpacing: "0.15em" }}>
                  {selectedNode}
                </span>
                <h3 style={{ fontFamily: "'VT323', monospace", fontSize: "16px", color: "var(--text-primary)", marginTop: "0.25rem" }}>
                  {NODES.find(n => n.id === selectedNode)?.label}
                </h3>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.05em", marginTop: "0.5rem", lineHeight: 1.6 }}>
                  Connections: {NODES.find(n => n.id === selectedNode)?.connections.join(", ") || "ISOLATED"}
                </p>
              </motion.div>
            )}

            {/* Corner markers */}
            {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos, i) => (
              <span key={i} className={`absolute ${pos}`} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "7px", color: "var(--text-ghost)", letterSpacing: "0.1em" }}>
                +
              </span>
            ))}
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default NodeMap;
