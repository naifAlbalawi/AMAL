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
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div ref={sheetRef} style={{ background: "#0F0F0F", borderTop: "1px solid #333", borderRadius: "20px 20px 0 0", maxHeight, overflowY: "auto", padding: "20px 16px 40px", animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
