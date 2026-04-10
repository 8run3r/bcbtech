/**
 * Pretext → Three.js vertex bridge
 *
 * prepare()      — one-time, canvas measurement
 * layoutWithLines() — lines[] · word widths
 * wordToVertex() — cursor → Float32Array XY (NDC -1…+1)
 *
 * Key contract: layoutWithLines() gives us line text + width.
 * We measure individual word widths via OffscreenCanvas to derive X positions,
 * matching how Pretext laid the line out.
 *
 * Resize: call buildWordVertices(preparedRef.current, w) — no re-prepare().
 */
import { prepareWithSegments, layoutWithLines, type PreparedTextWithSegments } from "@chenglou/pretext";

export interface WordVertex {
  text: string;
  /** pixel X from left of container */
  x: number;
  /** pixel Y from top of text block */
  y: number;
  width: number;
}

// Re-usable OffscreenCanvas for measurement
let _canvas: OffscreenCanvas | null = null;
let _ctx: OffscreenCanvasRenderingContext2D | null = null;

function getCtx(): OffscreenCanvasRenderingContext2D | null {
  if (typeof OffscreenCanvas === "undefined") return null;
  if (!_canvas) {
    _canvas = new OffscreenCanvas(1, 1);
    _ctx = _canvas.getContext("2d");
  }
  return _ctx;
}

function measureWord(word: string, font: string): number {
  const ctx = getCtx();
  if (!ctx) return word.length * 20; // fallback
  ctx.font = font;
  return ctx.measureText(word).width;
}

/** One-time prepare — call once at mount, store in ref */
export function preparePretextHandle(
  text: string,
  fontSize: number,
  fontWeight = 700
): PreparedTextWithSegments {
  return prepareWithSegments(text, `${fontWeight} ${fontSize}px Syne`);
}

/**
 * Layout-only — call on every resize with the SAME prepared handle.
 * Returns word pixel positions and a Float32Array ready for Three.js (NDC coords).
 */
export function buildWordVertices(
  prepared: PreparedTextWithSegments,
  containerW: number,
  fontSize: number,
  lineHeightPx?: number,
  fontWeight = 700
): {
  wordData: WordVertex[];
  /** NDC positions for Three.js BufferGeometry (x,y,z per word) */
  ndcPositions: Float32Array;
  totalHeight: number;
} {
  const lh = lineHeightPx ?? Math.round(fontSize * 1.2);
  const font = `${fontWeight} ${fontSize}px Syne`;
  const result = layoutWithLines(prepared, containerW, lh);
  const totalHeight = result.height > 0 ? result.height : lh;

  const wordData: WordVertex[] = [];

  result.lines.forEach((line, lineIdx) => {
    const words = line.text.trim().split(/\s+/).filter(Boolean);
    const spaceW = measureWord(" ", font);
    let x = 0;
    const y = lineIdx * lh;

    words.forEach((word) => {
      const w = measureWord(word, font);
      wordData.push({ text: word, x, y, width: w });
      x += w + spaceW;
    });
  });

  // Convert pixel coords → NDC  (-1 … +1)
  const ndcPositions = new Float32Array(wordData.length * 3);
  wordData.forEach((w, i) => {
    // Center x: word midpoint relative to container
    const ndcX = ((w.x + w.width / 2) / containerW) * 2 - 1;
    // Center y: flip (SVG y grows downward, NDC grows upward)
    const ndcY = -((w.y + lh / 2) / totalHeight) * 2 + 1;
    ndcPositions[i * 3 + 0] = ndcX;
    ndcPositions[i * 3 + 1] = ndcY;
    ndcPositions[i * 3 + 2] = 0;
  });

  return { wordData, ndcPositions, totalHeight };
}

/** Generate random scatter positions (same length as target) */
export function buildScatterPositions(count: number, spread = 3): Float32Array {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    arr[i * 3 + 0] = (Math.random() - 0.5) * spread * 2;
    arr[i * 3 + 1] = (Math.random() - 0.5) * spread;
    arr[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
  }
  return arr;
}
