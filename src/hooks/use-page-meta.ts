import { useEffect } from "react";

/**
 * Per-route document title + meta description for the SPA.
 * Restores the previous values on unmount so the landing page
 * keeps the defaults from index.html.
 */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = meta?.getAttribute("content") ?? null;
    if (description && meta) meta.setAttribute("content", description);

    return () => {
      document.title = prevTitle;
      if (meta && prevDesc !== null) meta.setAttribute("content", prevDesc);
    };
  }, [title, description]);
}
