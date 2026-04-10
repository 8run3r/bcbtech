import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TreeViewElement {
  id: string;
  name: string;
  isSelectable?: boolean;
  children?: TreeViewElement[];
}

interface FileTreeProps {
  elements: TreeViewElement[];
  className?: string;
  initialExpandedIds?: string[];
}

interface FolderProps {
  element: TreeViewElement;
  depth?: number;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
}

const FolderIcon = ({ open }: { open: boolean }) => (
  <svg
    width="16" height="16" viewBox="0 0 16 16" fill="none"
    className="flex-shrink-0"
    style={{ color: "var(--neon-primary)" }}
  >
    {open ? (
      <path d="M1.5 3.5h4l1.5 1.5H14.5v8h-13V3.5z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1" />
    ) : (
      <path d="M1.5 3.5h4l1.5 1.5H14.5v8h-13V3.5z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1" />
    )}
  </svg>
);

const FileIcon = () => (
  <svg
    width="14" height="14" viewBox="0 0 14 14" fill="none"
    className="flex-shrink-0"
    style={{ color: "var(--text-muted)" }}
  >
    <path d="M2 1h7l3 3v9H2V1z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1" />
    <path d="M9 1v3h3" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const TreeNode = ({ element, depth = 0, expandedIds, toggleExpand }: FolderProps) => {
  const isFolder = element.children && element.children.length > 0;
  const isOpen = expandedIds.has(element.id);

  return (
    <div>
      <button
        onClick={() => isFolder && toggleExpand(element.id)}
        className={cn(
          "flex items-center gap-2 w-full text-left py-1 px-2 rounded-md transition-colors text-sm",
          "hover:bg-white/5",
          isFolder ? "cursor-pointer" : "cursor-default"
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {/* Indicator line */}
        {depth > 0 && (
          <span
            className="absolute border-l"
            style={{
              left: `${depth * 16}px`,
              top: 0,
              bottom: 0,
              borderColor: "var(--border-glass)",
            }}
          />
        )}
        {isFolder ? <FolderIcon open={isOpen} /> : <FileIcon />}
        <span
          className="font-mono text-xs truncate"
          style={{ color: isFolder ? "var(--text-primary)" : "var(--text-muted)" }}
        >
          {element.name}
        </span>
        {isFolder && (
          <motion.span
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-auto text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            ›
          </motion.span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isFolder && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden relative"
          >
            {element.children!.map((child) => (
              <TreeNode
                key={child.id}
                element={child}
                depth={depth + 1}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FileTree = ({ elements, className, initialExpandedIds = [] }: FileTreeProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(initialExpandedIds)
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div
      className={cn(
        "glass rounded-xl p-3 font-mono text-xs w-full",
        className
      )}
    >
      {elements.map((el) => (
        <TreeNode
          key={el.id}
          element={el}
          expandedIds={expandedIds}
          toggleExpand={toggleExpand}
        />
      ))}
    </div>
  );
};

export default FileTree;
