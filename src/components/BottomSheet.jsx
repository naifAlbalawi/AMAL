import { useRef, useEffect } from "react";

export function BottomSheet({ open, onClose, title, children, maxHeight = "85vh" }) {
  const sheetRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (sheetRef.current && !sheetRef.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("touchstart", handler); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div ref={sheetRef} style={{
        background: "#1a1a1a", width: "100%", maxWidth: 520,
        borderRadius: "24px 24px 0 0", border: "1px solid #2a2a2a",
        padding: "24px 20px calc(24px + env(safe-area-inset-bottom))",
        maxHeight, overflow: "auto", animation: "slideUp 0.35s cubic-bezier(0.16,1,0.3,1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{title}</span>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 99, background: "#2a2a2a", color: "#888", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
