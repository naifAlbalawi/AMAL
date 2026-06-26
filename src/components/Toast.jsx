export function Toast({ message, type }) {
  const bg = type === "success" ? "#2F9E44" : type === "error" ? "#E03131" : type === "warning" ? "#E67700" : "#3B5BDB";
  return (
    <div style={{ position: "fixed", top: 16, left: 16, right: 16, zIndex: 400, display: "flex", justifyContent: "center" }}>
      <div style={{ background: bg, color: "#fff", padding: "12px 20px", borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: "0 10px 30px rgba(0,0,0,0.3)", animation: "fadeIn 0.25s ease-out" }}>
        {message}
      </div>
    </div>
  );
}
