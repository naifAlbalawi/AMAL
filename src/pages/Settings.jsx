import { useState } from "react";
import { useApp } from "../context/AppContext";
import { exportData } from "../utils/exportImport";
import { readImportFile } from "../utils/exportImport";
import { setLang, t, getLang, isRTL } from "../utils/i18n";

const CURRENCIES = ["$", "€", "£", "﷼", "د.إ", "د.ك"];

export default function Settings() {
  const { state, setSettings, replaceAll, resetData, showToast } = useApp();
  const [showCurrency, setShowCurrency] = useState(false);
  const rtl = isRTL();

  const stats = [
    { label: t("expenses"), count: state.expenses.length, color: "#3B5BDB" },
    { label: t("invoices"), count: state.invoices.length, color: "#E03131" },
    { label: t("properties"), count: state.parents.length, color: "#7950F2" },
    { label: t("total"), count: state.expenses.length + state.invoices.length + state.parents.length, color: "#fff" },
  ];

  const handleImport = async (file) => {
    try {
      const data = await readImportFile(file);
      replaceAll(data);
      showToast("Imported successfully", "success");
    } catch (e) { showToast("Import failed", "error"); }
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 20px" }}>{t("settings")}</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {stats.map(item => (
          <div key={item.label} style={{ background: "#1a1a1a", borderRadius: 18, padding: 16, border: "1px solid #222", textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>{item.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: item.color, marginTop: 6 }}>{item.count}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#1a1a1a", borderRadius: 18, border: "1px solid #222", overflow: "hidden", marginBottom: 20 }}>
        <div 
          onClick={() => setShowCurrency(!showCurrency)} 
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            padding: 18, 
            borderBottom: "1px solid #222", 
            cursor: "pointer" 
          }}
        >
          <span style={{ fontSize: 15 }}>{t("currency")}</span>
          <span style={{ fontWeight: 700, color: "#3B5BDB", fontSize: 15 }}>{state.settings.currency}</span>
        </div>
        {showCurrency && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: 14 }}>
            {CURRENCIES.map(c => (
              <button 
                key={c} 
                onClick={() => { setSettings({ currency: c }); setShowCurrency(false); }} 
                style={{ 
                  padding: "10px 18px", 
                  borderRadius: 12, 
                  border: state.settings.currency === c ? "1px solid #3B5BDB" : "1px solid #333", 
                  background: state.settings.currency === c ? "#3B5BDB" : "#0F0F0F", 
                  color: "#fff", 
                  fontWeight: 600, 
                  cursor: "pointer",
                  fontSize: 14
                }}
              >{c}</button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 18, borderBottom: "1px solid #222" }}>
          <span style={{ fontSize: 15 }}>{t("language")}</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button 
              onClick={() => { setLang("en"); setSettings({ language: "en" }); }} 
              style={{ 
                padding: "8px 14px", 
                borderRadius: 10, 
                border: "none", 
                background: getLang() === "en" ? "#3B5BDB" : "#222", 
                color: "#fff", 
                fontSize: 13, 
                cursor: "pointer",
                fontWeight: getLang() === "en" ? 700 : 500
              }}
            >{t("english")}</button>
            <button 
              onClick={() => { setLang("ar"); setSettings({ language: "ar" }); }} 
              style={{ 
                padding: "8px 14px", 
                borderRadius: 10, 
                border: "none", 
                background: getLang() === "ar" ? "#3B5BDB" : "#222", 
                color: "#fff", 
                fontSize: 13, 
                cursor: "pointer",
                fontWeight: getLang() === "ar" ? 700 : 500
              }}
            >{t("arabic")}</button>
          </div>
        </div>

        <button 
          onClick={() => exportData(state)} 
          style={{ 
            width: "100%", 
            textAlign: "start", 
            padding: 18, 
            background: "none", 
            border: "none", 
            color: "#fff", 
            fontSize: 15, 
            borderBottom: "1px solid #222", 
            cursor: "pointer",
            fontWeight: 500
          }}
        >⬆️ {t("export")}</button>

        <label style={{ display: "block", width: "100%", padding: 18, cursor: "pointer", fontSize: 15, fontWeight: 500 }}>
          ⬇️ {t("import")}
          <input type="file" accept="application/json" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleImport(e.target.files[0])} />
        </label>
      </div>

      <button 
        onClick={() => { if (confirm("Erase everything?")) { resetData(); showToast("Reset", "warning"); } }} 
        style={{ 
          width: "100%", 
          padding: 18, 
          borderRadius: 18, 
          border: "1px solid #E03131", 
          background: "rgba(224,49,49,0.08)", 
          color: "#E03131", 
          fontWeight: 700, 
          cursor: "pointer", 
          marginBottom: 24,
          fontSize: 15
        }}
      >
        {t("reset")}
      </button>

      <div style={{ textAlign: "center", color: "#444", fontSize: 13, paddingBottom: 40 }}>{t("version")}</div>
    </div>
  );
}
