import type { NavigateFunction } from "react-router-dom";

export type LineKind =
  | "cmd"     // echoed user command (green)
  | "info"    // default muted output
  | "accent"  // theme accent color
  | "error"   // red
  | "warn"    // yellow
  | "art"     // ASCII / preformatted, monospace
  | "link";   // clickable route link

export interface TerminalLine {
  text: string;
  kind?: LineKind;
  /** When kind === "link", clicking navigates here */
  to?: string;
}

export type CategoryId = "nav" | "info" | "site" | "ui" | "egg";

export interface CommandContext {
  args: string[];
  /** Raw input (without leading slash) */
  raw: string;
  navigate: NavigateFunction;
  closeTerminal: () => void;
  print: (line: string | TerminalLine | TerminalLine[]) => void;
  clear: () => void;
  /** Trigger a fullscreen visual overlay (matrix, glitch, panic, boot…) */
  overlay: (kind: OverlayKind, durationMs?: number) => void;
  history: string[];
  pathname: string;
  /** All registered commands — used by `help` and `search` */
  registry: Record<string, CommandDef>;
}

export interface CommandDef {
  name: string;
  category: CategoryId;
  desc: string;
  /** Optional usage hint shown in help, e.g. "<query>" */
  usage?: string;
  /** Alternative names that route to this command */
  aliases?: string[];
  /** When true, the command is hidden from `help` (still callable). */
  hidden?: boolean;
  run: (ctx: CommandContext) => void | Promise<void>;
}

export type OverlayKind =
  | "matrix"
  | "glitch"
  | "panic"
  | "boot"
  | "vacuum"
  | "scan"
  | null;
