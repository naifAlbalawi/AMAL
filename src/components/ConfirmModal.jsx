export function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmText = "Delete", confirmColor = "#E03131" }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 340,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        animation: "fadeIn 0.2s ease-out"
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1D23", marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 13, color: "#4A5160", marginBottom: 20, lineHeight: 1.5 }}>{message}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #E2E6EF",
            background: "#fff", color: "#4A5160", fontWeight: 600, cursor: "pointer", fontSize: 13
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "10px", borderRadius: 8, border: "none",
            background: confirmColor, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13
          }}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
