import { ReactNode } from "react";
import Scanlines from "@/components/ui/scanlines";
import RetroCursor from "@/components/ui/retro-cursor";

/**
 * Wraps any page with the atmospheric CRT/cursor overlays.
 * Used by sub-pages to maintain consistent ARG feel.
 */
const AtmosphereWrapper = ({ children }: { children: ReactNode }) => (
  <>
    <Scanlines />
    <RetroCursor />
    {children}
  </>
);

export default AtmosphereWrapper;
