import type { CommandDef } from "../types";
import { navCommands } from "./nav";
import { infoCommands } from "./info";
import { siteCommands } from "./site";
import { uiCommands } from "./ui";
import { eggCommands } from "./egg";
import { helpCommand } from "./help";

const ALL: CommandDef[] = [
  helpCommand,
  ...navCommands,
  ...infoCommands,
  ...siteCommands,
  ...uiCommands,
  ...eggCommands,
];

export const REGISTRY: Record<string, CommandDef> = {};
for (const cmd of ALL) {
  REGISTRY[cmd.name] = cmd;
  if (cmd.aliases) for (const a of cmd.aliases) REGISTRY[a] = cmd;
}

/** Names of canonical commands (no aliases) — useful for tab completion. */
export const CANONICAL_NAMES = ALL.map((c) => c.name).sort();
