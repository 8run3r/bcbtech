import { useState, type ReactNode, type CSSProperties } from "react";

/* ══════════════════════════════════════════════
   Windows 7 Aero Design System
   ══════════════════════════════════════════════ */

// Core Win7 Aero colors — named W98 for backward compat with imports
export const W98 = {
  bg: "#f0f0f0",
  desktop: "#1a3d6e",
  titleActive: "linear-gradient(180deg, #bad6f5 0%, #8ab8ee 30%, #6aa0e6 70%, #9dc1f3 100%)",
  titleInactive: "linear-gradient(180deg, #d8d8d8 0%, #c4c4c4 100%)",
  btnFace: "#e1e1e1",
  windowBg: "#f0f0f0",
  white: "#ffffff",
  black: "#1a1a1a",
  highlight: "#0078d7",
  highlightText: "#ffffff",
  fieldBg: "#ffffff",
  text: "#1a1a1a",
  grayText: "#767676",
  activeTitleText: "#000000",
  green: "#00875a",
  font: "'Segoe UI', 'Tahoma', sans-serif",
  fontMono: "'Consolas', 'Courier New', monospace",
};

// Aero-style shadow/border patterns — named for backward compat
export const raised =
  "0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.08)";
export const sunken =
  "inset 0 1px 3px rgba(0,0,0,0.1), 0 0 0 1px rgba(100,160,230,0.4)";
export const raisedOuter = "0 0 0 1px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.1)";
export const statusBar = "inset 0 1px 0 rgba(0,0,0,0.08)";

// Aero glass window frame
export const aeroBorder =
  "0 0 0 1px rgba(60,130,220,0.5), 0 8px 32px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.6)";

/* ── Win7 Button ── */
export const Win98Button = ({
  children,
  onClick,
  active,
  disabled,
  style,
  className = "",
  small,
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
  className?: string;
  small?: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: W98.font,
        fontSize: small ? "11px" : "12px",
        padding: small ? "3px 10px" : "5px 18px",
        background: active
          ? "linear-gradient(180deg, #c8dcf5 0%, #a8c8ef 100%)"
          : hovered
          ? "linear-gradient(180deg, #e8f2ff 0%, #d0e6ff 100%)"
          : "linear-gradient(180deg, #f2f2f2 0%, #e0e0e0 100%)",
        color: disabled ? W98.grayText : W98.black,
        border: active
          ? "1px solid #5080c0"
          : hovered
          ? "1px solid #7ab0e8"
          : "1px solid rgba(0,0,0,0.22)",
        borderRadius: 3,
        cursor: disabled ? "default" : "pointer",
        minWidth: small ? undefined : 75,
        whiteSpace: "nowrap" as const,
        boxShadow: active
          ? "inset 0 1px 2px rgba(0,0,0,0.1)"
          : "0 1px 2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
        outline: "none",
        transition: "background 0.1s, border-color 0.1s",
        ...style,
      }}
    >
      {children}
    </button>
  );
};

/* ── Window title bar controls (close / min / max) ── */
const WinCtrlBtn = ({
  type,
  onClick,
}: {
  type: "close" | "min" | "max";
  onClick?: () => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const baseColor =
    type === "close"
      ? hovered ? "#f1707a" : "rgba(200,100,100,0.15)"
      : hovered ? "#c8dcf5" : "rgba(150,190,240,0.15)";
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 26,
        height: 18,
        background: baseColor,
        border: "1px solid rgba(60,120,200,0.3)",
        borderRadius: type === "close" ? "0 3px 0 0" : 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: 0,
        transition: "background 0.1s",
      }}
    >
      {type === "close" && (
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path d="M1,1 L9,9 M9,1 L1,9" stroke={hovered ? "#fff" : "#333"} strokeWidth="1.5" />
        </svg>
      )}
      {type === "min" && (
        <svg width="10" height="2" viewBox="0 0 10 2">
          <line x1="1" y1="1" x2="9" y2="1" stroke="#333" strokeWidth="1.5" />
        </svg>
      )}
      {type === "max" && (
        <svg width="10" height="10" viewBox="0 0 10 10">
          <rect x="1" y="1" width="8" height="8" fill="none" stroke="#333" strokeWidth="1.5" />
          <line x1="1" y1="3.5" x2="9" y2="3.5" stroke="#333" strokeWidth="1" />
        </svg>
      )}
    </button>
  );
};

/* ── Win7 Window (Aero glass title bar) ── */
export const Win98Window = ({
  title,
  icon,
  children,
  onClose,
  onMinimize,
  onMaximize,
  style,
  className = "",
  active = true,
  toolbar,
  statusBar: statusBarContent,
  noPadding,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  style?: CSSProperties;
  className?: string;
  active?: boolean;
  toolbar?: ReactNode;
  statusBar?: ReactNode;
  noPadding?: boolean;
}) => (
  <div
    className={className}
    style={{
      background: W98.bg,
      borderRadius: "6px 6px 0 0",
      boxShadow: active ? aeroBorder : "0 0 0 1px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.15)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      ...style,
    }}
  >
    {/* Aero title bar */}
    <div
      style={{
        background: active ? W98.titleActive : W98.titleInactive,
        padding: "0 4px 0 8px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        userSelect: "none" as const,
        flexShrink: 0,
        height: 30,
        position: "relative",
      }}
    >
      {/* Glass shine overlay */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "50%",
        background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.1) 100%)",
        pointerEvents: "none",
      }} />
      {icon && <span style={{ display: "flex", zIndex: 1 }}>{icon}</span>}
      <span
        style={{
          fontFamily: W98.font,
          fontSize: "12px",
          fontWeight: 400,
          color: active ? W98.activeTitleText : "#666",
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap" as const,
          textShadow: "0 1px 0 rgba(255,255,255,0.6)",
          zIndex: 1,
        }}
      >
        {title}
      </span>
      <div style={{ display: "flex", gap: 1, zIndex: 1 }}>
        {onMinimize && <WinCtrlBtn type="min" onClick={onMinimize} />}
        {onMaximize && <WinCtrlBtn type="max" onClick={onMaximize} />}
        {onClose && <WinCtrlBtn type="close" onClick={onClose} />}
      </div>
    </div>

    {/* Toolbar */}
    {toolbar && (
      <div style={{
        borderBottom: "1px solid rgba(0,0,0,0.1)",
        padding: "3px 6px",
        display: "flex",
        alignItems: "center",
        gap: 3,
        flexShrink: 0,
        background: "rgba(255,255,255,0.5)",
      }}>
        {toolbar}
      </div>
    )}

    {/* Content */}
    <div style={{ flex: 1, overflow: "auto", padding: noPadding ? 0 : 10 }}>
      {children}
    </div>

    {/* Status bar */}
    {statusBarContent && (
      <div style={{
        borderTop: "1px solid rgba(0,0,0,0.1)",
        padding: "3px 8px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
        background: "rgba(240,244,250,0.9)",
        fontSize: "11px",
        fontFamily: W98.font,
        color: W98.grayText,
      }}>
        {statusBarContent}
      </div>
    )}
  </div>
);

/* ── Sunken field/well ── */
export const Win98Field = ({
  children,
  style,
  className = "",
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) => (
  <div
    className={className}
    style={{
      boxShadow: sunken,
      background: W98.fieldBg,
      borderRadius: 2,
      padding: 6,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ── Panel / groupbox ── */
export const Win98Panel = ({
  children,
  label,
  style,
  className = "",
}: {
  children: ReactNode;
  label?: string;
  style?: CSSProperties;
  className?: string;
}) => (
  <fieldset
    className={className}
    style={{
      border: "1px solid rgba(0,0,0,0.15)",
      borderRadius: 4,
      padding: "12px 10px 10px",
      margin: 0,
      background: "rgba(255,255,255,0.7)",
      ...style,
    }}
  >
    {label && (
      <legend
        style={{
          fontFamily: W98.font,
          fontSize: "11px",
          color: W98.grayText,
          padding: "0 6px",
          fontWeight: 600,
          letterSpacing: "0.03em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </legend>
    )}
    {children}
  </fieldset>
);

/* ── Input ── */
export const Win98Input = ({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
  readOnly,
  style,
}: {
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  readOnly?: boolean;
  style?: CSSProperties;
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    readOnly={readOnly}
    style={{
      fontFamily: W98.font,
      fontSize: "12px",
      background: disabled ? "#f5f5f5" : W98.fieldBg,
      color: W98.black,
      border: "1px solid rgba(0,0,0,0.2)",
      borderRadius: 2,
      padding: "4px 8px",
      outline: "none",
      width: "100%",
      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)",
      transition: "border-color 0.15s, box-shadow 0.15s",
      ...style,
    }}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = "#0078d7";
      e.currentTarget.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.06), 0 0 0 2px rgba(0,120,215,0.2)";
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = "rgba(0,0,0,0.2)";
      e.currentTarget.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.06)";
    }}
  />
);

/* ── Textarea ── */
export const Win98Textarea = ({
  value,
  onChange,
  placeholder,
  rows = 4,
  style,
}: {
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  style?: CSSProperties;
}) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    style={{
      fontFamily: W98.font,
      fontSize: "12px",
      background: W98.fieldBg,
      color: W98.black,
      border: "1px solid rgba(0,0,0,0.2)",
      borderRadius: 2,
      padding: "4px 8px",
      outline: "none",
      width: "100%",
      resize: "vertical",
      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)",
      ...style,
    }}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = "#0078d7";
      e.currentTarget.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.06), 0 0 0 2px rgba(0,120,215,0.2)";
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = "rgba(0,0,0,0.2)";
      e.currentTarget.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.06)";
    }}
  />
);

/* ── Select ── */
export const Win98Select = ({
  value,
  onChange,
  options,
  style,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  style?: CSSProperties;
}) => (
  <select
    value={value}
    onChange={onChange}
    style={{
      fontFamily: W98.font,
      fontSize: "12px",
      background: W98.fieldBg,
      color: W98.black,
      border: "1px solid rgba(0,0,0,0.2)",
      borderRadius: 2,
      padding: "3px 6px",
      outline: "none",
      cursor: "pointer",
      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)",
      ...style,
    }}
  >
    {options.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);

/* ── Tab Control ── */
export const Win98Tabs = ({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; icon?: ReactNode }[];
  active: string;
  onChange: (id: string) => void;
}) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 2, paddingLeft: 4 }}>
    {tabs.map((tab) => {
      const isActive = tab.id === active;
      return (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            fontFamily: W98.font,
            fontSize: "12px",
            padding: "5px 14px",
            background: isActive
              ? "linear-gradient(180deg, #f0f6ff 0%, #e4eeff 100%)"
              : "linear-gradient(180deg, #e8e8e8 0%, #d8d8d8 100%)",
            color: isActive ? W98.highlight : W98.black,
            border: isActive
              ? "1px solid rgba(0,100,200,0.4)"
              : "1px solid rgba(0,0,0,0.15)",
            borderBottom: isActive ? "1px solid #f0f6ff" : "1px solid rgba(0,0,0,0.15)",
            borderRadius: "4px 4px 0 0",
            cursor: "pointer",
            position: "relative" as const,
            zIndex: isActive ? 2 : 1,
            marginBottom: isActive ? -1 : 0,
            paddingBottom: isActive ? 6 : 5,
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontWeight: isActive ? 600 : 400,
            transition: "background 0.1s",
          }}
        >
          {tab.icon}
          {tab.label}
        </button>
      );
    })}
  </div>
);

/* ── Progress Bar ── */
export const Win98Progress = ({
  value,
  max = 100,
  style,
}: {
  value: number;
  max?: number;
  style?: CSSProperties;
}) => (
  <div
    style={{
      border: "1px solid rgba(0,0,0,0.15)",
      borderRadius: 8,
      background: "#e8e8e8",
      height: 16,
      overflow: "hidden",
      ...style,
    }}
  >
    <div
      style={{
        height: "100%",
        width: `${Math.min(100, (value / max) * 100)}%`,
        background: "linear-gradient(180deg, #5ab0f0 0%, #0078d7 100%)",
        borderRadius: 8,
        transition: "width 0.3s ease",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
      }}
    />
  </div>
);

/* ── TreeView item (sidebar nav) ── */
export const Win98TreeItem = ({
  label,
  icon,
  active,
  onClick,
  indent = 0,
  badge,
}: {
  label: string;
  icon?: ReactNode;
  active?: boolean;
  onClick?: () => void;
  indent?: number;
  badge?: number;
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: W98.font,
        fontSize: "12px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        width: "100%",
        padding: `5px 8px 5px ${8 + indent * 14}px`,
        background: active
          ? "linear-gradient(90deg, rgba(0,120,215,0.15) 0%, rgba(0,120,215,0.05) 100%)"
          : hovered
          ? "rgba(0,0,0,0.04)"
          : "transparent",
        color: active ? W98.highlight : W98.black,
        border: "none",
        borderLeft: active ? "2px solid #0078d7" : "2px solid transparent",
        cursor: "pointer",
        textAlign: "left" as const,
        whiteSpace: "nowrap" as const,
        fontWeight: active ? 600 : 400,
        transition: "background 0.1s",
      }}
    >
      {icon && (
        <span style={{
          display: "flex",
          width: 16,
          height: 16,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: active ? W98.highlight : W98.grayText,
        }}>
          {icon}
        </span>
      )}
      <span style={{ flex: 1 }}>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span style={{
          background: "#0078d7",
          color: "#fff",
          fontSize: "10px",
          fontWeight: 700,
          padding: "1px 6px",
          borderRadius: 10,
          minWidth: 18,
          textAlign: "center" as const,
        }}>
          {badge}
        </span>
      )}
    </button>
  );
};

/* ── Desktop icon ── */
export const Win98DesktopIcon = ({
  label,
  icon,
  onClick,
  selected,
}: {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  selected?: boolean;
}) => (
  <button
    onClick={onClick}
    onDoubleClick={onClick}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      padding: "6px 8px",
      background: selected ? "rgba(0,120,215,0.2)" : "transparent",
      border: selected ? "1px dashed rgba(0,120,215,0.5)" : "1px solid transparent",
      borderRadius: 4,
      cursor: "pointer",
      width: 80,
    }}
  >
    <span style={{
      display: "flex",
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
    }}>
      {icon}
    </span>
    <span style={{
      fontFamily: W98.font,
      fontSize: "11px",
      color: "#fff",
      textAlign: "center" as const,
      textShadow: "0 1px 3px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.5)",
      lineHeight: "14px",
      wordBreak: "break-word" as const,
    }}>
      {label}
    </span>
  </button>
);

/* ── Status bar segment ── */
export const Win98StatusSegment = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <div
    style={{
      padding: "2px 8px",
      fontFamily: W98.font,
      fontSize: "11px",
      color: W98.grayText,
      display: "flex",
      alignItems: "center",
      gap: 4,
      ...style,
    }}
  >
    {children}
  </div>
);
