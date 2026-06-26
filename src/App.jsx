import { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { loadLang, t, isRTL } from "./utils/i18n";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Invoices from "./pages/Invoices";
import Parents from "./pages/Parents";
import Settings from "./pages/Settings";
import { Toast } from "./components/Toast";

function AppShell() {
  const [page, setPage] = useState("dashboard");
  const [moreOpen, setMoreOpen] = useState(false);
  const { toast, state } = useApp();
  const rtl = isRTL();

  useEffect(() => { loadLang(); }, []);

  const NAV = [
    { id: "dashboard", icon: "▦", label: t("dashboard") },
    { id: "expenses", icon: "◈", label: t("expenses") },
    { id: "invoices", icon: "🧾", label: t("invoices") },
    { id: "parents", icon: "⌂", label: t("parents") },
    { id: "more", icon: "☰", label: t("settings") },
  ];

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard />;
      case "expenses": return <Expenses />;
      case "invoices": return <Invoices />;
      case "parents": return <Parents />;
      case "settings": return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#0F0F0F", position: "relative", paddingBottom: 80, direction: rtl ? "rtl" : "ltr" }}>
      <div style={{ padding: 16 }}>{renderPage()}</div>

      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(15,15,15,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid #222", display: "flex", justifyContent: "space-around", padding: "8px 0", zIndex: 100, maxWidth: 480, margin: "0 auto", left: "50%", transform: "translateX(-50%)" }}>
        {NAV.map(item => {
          const active = page === item.id || (item.id === "more" && moreOpen);
          return (
            <button key={item.id} onClick={() => { if (item.id === "more") { setMoreOpen(!moreOpen); } else { setPage(item.id); setMoreOpen(false); } }}
              style={{ background: "none", border: "none", color: active ? "#fff" : "#666", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontSize: 10, fontWeight: 600, cursor: "pointer", flex: 1 }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {moreOpen && (
        <>
          <div onClick={() => setMoreOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 140, background: "transparent" }} />
          <div style={{ position: "fixed", bottom: 70, right: rtl ? "auto" : 16, left: rtl ? 16 : "auto", zIndex: 150, background: "#1a1a1a", border: "1px solid #333", borderRadius: 16, padding: 8, minWidth: 180, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <button onClick={() => { setPage("settings"); setMoreOpen(false); }} style={{ width: "100%", textAlign: "start", padding: "12px 16px", background: "none", border: "none", color: "#fff", fontSize: 14, borderRadius: 10 }}>{t("settings")}</button>
          </div>
        </>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
