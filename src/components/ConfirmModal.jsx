export function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmText = "Delete", confirmColor = "#E03131" }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(8px)" }}>
      <div style={{ background: "#1a1a1a", borderRadius: 20, padding: 24, width: "100%", maxWidth: 340, border: "1px solid #2a2a2a", animation: "fadeIn 0.25s ease-out" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 14, color: "#888", marginBottom: 24, lineHeight: 1.5 }}>{message}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid #333", background: "transparent", color: "#888", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: confirmColor, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
