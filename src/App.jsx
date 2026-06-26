import { useState } from "react";
import { AppProvider } from "./context/AppContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CollectionView from "./pages/CollectionView.jsx";
import Recipes from "./pages/Recipes.jsx";
import Settings from "./pages/Settings.jsx";

const T = {
  bg: "#F0F2F7", surface: "#FFFFFF", border: "#E2E6EF",
  accent: "#3B5BDB", text: "#1A1D23", textMuted: "#8B92A5",
};

const NAV_ITEMS = [
  { id: "dashboard", label: "Home", icon: "▦", color: "#3B5BDB" },
  { id: "consumables", label: "Items", icon: "◎", color: "#3B5BDB" },
  { id: "recipes", label: "Recipes", icon: "🍳", color: "#E03131" },
  { id: "finances", label: "Money", icon: "◆", color: "#7950F2" },
  { id: "settings", label: "More", icon: "⚙️", color: "#4A5160" },
];

function AppContent() {
  const [page, setPage] = useState("dashboard");
  const [moreMenu, setMoreMenu] = useState(false);

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
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
      background: T.bg, color: T.text, fontSize: 13,
    }}>
      <div style={{ flex: 1, overflow: "hidden", marginBottom: 56 }}>
        {renderPage()}
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: T.surface, borderTop: `1px solid ${T.border}`,
        display: "flex", justifyContent: "space-around", alignItems: "center",
        padding: "6px 0 calc(6px + env(safe-area-inset-bottom))",
        zIndex: 100, boxShadow: "0 -2px 10px rgba(0,0,0,0.05)"
      }}>
        {NAV_ITEMS.map(item => {
          const isActive = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "more") { setMoreMenu(!moreMenu); return; }
                setPage(item.id);
                setMoreMenu(false);
              }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 2, padding: "4px 6px", border: "none", background: "transparent",
                color: isActive ? item.color : T.textMuted,
                fontSize: 10, fontWeight: isActive ? 700 : 500,
                cursor: "pointer", minHeight: 44, minWidth: 52,
                transition: "color 0.15s", flex: 1
              }}
            >
              <span style={{ fontSize: 18, filter: item.id === "recipes" ? "none" : undefined }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* More menu overlay */}
      {moreMenu && (
        <div style={{
          position: "fixed", bottom: 60, right: 8, zIndex: 150,
          background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)", padding: "8px 0", minWidth: 160,
          animation: "fadeIn 0.15s ease-out"
        }}>
          {[
            { id: "durables", label: "Durables", icon: "◈", color: "#2F9E44" },
            { id: "car", label: "Car", icon: "◐", color: "#E67700" },
            { id: "settings", label: "Settings", icon: "⚙️", color: "#4A5160" },
          ].map(item => (
            <button key={item.id} onClick={() => { setPage(item.id); setMoreMenu(false); }} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 16px",
              border: "none", background: "transparent", color: T.textMid, fontSize: 13,
              fontWeight: 500, cursor: "pointer", textAlign: "left"
            }}
              onMouseEnter={e => e.currentTarget.style.background = T.bg}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 16, color: item.color }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {moreMenu && (
        <div onClick={() => setMoreMenu(false)} style={{
          position: "fixed", inset: 0, zIndex: 140, background: "transparent"
        }} />
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
