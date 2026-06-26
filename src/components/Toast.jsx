import { useEffect } from "react";

export function Toast({ message, type = "info", onClose, duration = 2500 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  const colors = {
    info:    { bg: "#EEF2FF", border: "#3B5BDB", text: "#3B5BDB" },
    success: { bg: "#EBFBEE", border: "#2F9E44", text: "#2F9E44" },
    error:   { bg: "#FFF0F0", border: "#E03131", text: "#E03131" },
    warning: { bg: "#FFF8E6", border: "#E67700", text: "#E67700" },
  };
  const c = colors[type] || colors.info;

  return (
    <div style={{
      position: "fixed", top: 16, left: 16, right: 16, zIndex: 9999,
      background: c.bg, border: `1px solid ${c.border}44`,
      color: c.text, padding: "12px 16px", borderRadius: 10,
      fontSize: 13, fontWeight: 600,
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      animation: "fadeIn 0.2s ease-out"
    }}>
      <span>{message}</span>
      <button onClick={onClose} style={{
        background: "transparent", border: "none", color: c.text,
        fontSize: 16, fontWeight: 800, cursor: "pointer", padding: "0 4px"
      }}>×</button>
    </div>
  );
}
