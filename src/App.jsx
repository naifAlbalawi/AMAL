import { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CollectionView from "./pages/CollectionView.jsx";
import Recipes from "./pages/Recipes.jsx";
import Settings from "./pages/Settings.jsx";

const NAV = [
  { id: "dashboard", label: "Home", icon: "▦" },
  { id: "consumables", label: "Items", icon: "🧴" },
  { id: "recipes", label: "Recipes", icon: "🍳" },
  { id: "finances", label: "Money", icon: "💰" },
  { id: "more", label: "More", icon: "⋮" },
];

const MORE_ITEMS = [
  { id: "durables", label: "Durables", icon: "👟" },
  { id: "car", label: "Car", icon: "🚗" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

function AppContent() {
  const [page, setPage] = useState("dashboard");
  const [moreOpen, setMoreOpen] = useState(false);
  const { toast } = useApp();

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard />;
      case "consumables": return <CollectionView spaceId="consumables" />;
      case "durables": return <CollectionView spaceId="durables" />;
      case "car": return <CollectionView spaceId="car" />;
      case "finances": return <CollectionView spaceId="finances" />;
      case "recipes": return <Recipes />;
      case "settings": return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#0F0F0F", color: "#fff", fontSize: 14, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif" }}>
      <div style={{ flex: 1, overflow: "hidden" }}>
        {renderPage()}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(15,15,15,0.95)", borderTop: "1px solid #222", backdropFilter: "blur(20px)", display: "flex", justifyContent: "space-around", alignItems: "center", padding: "8px 0 calc(8px + env(safe-area-inset-bottom))", zIndex: 100 }}>
        {NAV.map(item => {
          const active = page === item.id || (item.id === "more" && moreOpen);
          return (
            <button key={item.id} onClick={() => {
              if (item.id === "more") { setMoreOpen(!moreOpen); return; }
              setPage(item.id); setMoreOpen(false);
            }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 8px", border: "none", background: "transparent", color: active ? "#3B5BDB" : "#555", fontSize: 10, fontWeight: active ? 700 : 500, cursor: "pointer", minHeight: 44, minWidth: 56, flex: 1, transition: "color 0.2s" }}>
              <span style={{ fontSize: 20, filter: item.id === "recipes" ? "none" : undefined }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* More Menu */}
      {moreOpen && (
        <>
          <div onClick={() => setMoreOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 140, background: "transparent" }} />
          <div style={{ position: "fixed", bottom: 72, right: 12, zIndex: 150, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", padding: "8px 0", minWidth: 180, animation: "fadeInUp 0.2s ease" }}>
            {MORE_ITEMS.map(item => (
              <button key={item.id} onClick={() => { setPage(item.id); setMoreOpen(false); }} style={{ width: "100%", padding: "12px 18px", border: "none", background: "transparent", color: "#ccc", fontSize: 14, fontWeight: 500, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 16, left: 16, right: 16, zIndex: 9999, background: toast.type === "success" ? "rgba(47,158,68,0.95)" : toast.type === "error" ? "rgba(224,49,49,0.95)" : toast.type === "warning" ? "rgba(230,119,0,0.95)" : "rgba(59,91,219,0.95)", color: "#fff", padding: "14px 18px", borderRadius: 14, fontSize: 14, fontWeight: 600, backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: 10, animation: "fadeInUp 0.3s ease" }}>
          <span style={{ fontSize: 16 }}>{toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : toast.type === "warning" ? "⚠" : "ℹ️"}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
