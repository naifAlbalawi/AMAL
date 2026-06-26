export function Toast({ message, type = "info" }) {
  const colors = {
    info:    { bg: "rgba(59,91,219,0.95)", icon: "ℹ️" },
    success: { bg: "rgba(47,158,68,0.95)", icon: "✓" },
    error:   { bg: "rgba(224,49,49,0.95)", icon: "✕" },
    warning: { bg: "rgba(230,119,0,0.95)", icon: "⚠" },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{
      position: "fixed", top: 12, left: 12, right: 12, zIndex: 9999,
      background: c.bg, color: "#fff", padding: "14px 18px", borderRadius: 14,
      fontSize: 14, fontWeight: 600, backdropFilter: "blur(20px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      display: "flex", alignItems: "center", gap: 10,
      animation: "fadeInUp 0.3s ease"
    }}>
      <span style={{ fontSize: 16 }}>{c.icon}</span>
      <span>{message}</span>
    </div>
  );
}
