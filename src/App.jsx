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
  const { toast } = useApp();
  const rtl = isRTL();

  useEffect(() => { loadLang(); }, []);

  const NAV = [
    { id: "dashboard", icon: "▦", label: t("dashboard") },
    { id: "expenses", icon: "◈", label: t("expenses") },
    { id: "invoices", icon: "🧾", label: t("invoices") },
    { id: "parents", icon: "⌂", label: t("parents") },
    { id: "settings", icon: "☰", label: t("settings") },
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
    <div style={{ 
      maxWidth: 480, 
      margin: "0 auto", 
      minHeight: "100vh", 
      background: "#0F0F0F", 
      position: "relative", 
      paddingBottom: 90,
      direction: rtl ? "rtl" : "ltr",
      overflowX: "hidden"
    }}>
      <div style={{ padding: "16px 16px 0" }}>{renderPage()}</div>

      <nav style={{ 
        position: "fixed", 
        bottom: 0, 
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 480,
        background: "rgba(15,15,15,0.95)", 
        backdropFilter: "blur(12px)", 
        borderTop: "1px solid #222", 
        display: "flex", 
        justifyContent: "space-around", 
        alignItems: "center",
        padding: "6px 0 12px", 
        zIndex: 100,
        boxSizing: "border-box"
      }}>
        {NAV.map(item => {
          const active = page === item.id;
          return (
            <button 
              key={item.id} 
              onClick={() => { setPage(item.id); setMoreOpen(false); }}
              style={{ 
                background: "none", 
                border: "none", 
                color: active ? "#fff" : "#666", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center",
                gap: 3, 
                fontSize: 11, 
                fontWeight: active ? 700 : 500,
                cursor: "pointer", 
                flex: 1,
                padding: "4px 0",
                minHeight: 50,
                lineHeight: 1.2
              }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>{item.icon}</span>
              <span style={{ whiteSpace: "nowrap", fontSize: 10 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

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
