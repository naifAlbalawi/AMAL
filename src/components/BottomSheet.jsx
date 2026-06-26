import { useEffect, useRef } from "react";

export function BottomSheet({ open, onClose, title, children }) {
  const sheetRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("touchstart", onClick);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("touchstart", onClick);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "flex-end", justifyContent: "center"
    }}>
      <div ref={sheetRef} style={{
        background: "#fff", width: "100%", maxWidth: 520,
        borderRadius: "20px 20px 0 0",
        padding: "20px 20px calc(20px + env(safe-area-inset-bottom))",
        maxHeight: "85vh", overflow: "auto",
        animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#1A1D23" }}>{title}</span>
          <button onClick={onClose} style={{
            background: "#F0F2F7", border: "none", borderRadius: 99,
            width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#4A5160"
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
