import { useState, useRef } from "react";
import { useApp } from "../context/AppContext.jsx";
import { exportData, readImportFile } from "../utils/exportImport.js";
import { ConfirmModal } from "../components/ConfirmModal.jsx";

const CURRENCIES = [
  { code: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "€", name: "Euro", flag: "🇪🇺" },
  { code: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "₩", name: "Korean Won", flag: "🇰🇷" },
  { code: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "C$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "₽", name: "Russian Ruble", flag: "🇷🇺" },
  { code: "R$", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "₺", name: "Turkish Lira", flag: "🇹🇷" },
  { code: "RM", name: "Malaysian Ringgit", flag: "🇲🇾" },
  { code: "₱", name: "Philippine Peso", flag: "🇵🇭" },
  { code: "฿", name: "Thai Baht", flag: "🇹🇭" },
  { code: "Rp", name: "Indonesian Rupiah", flag: "🇮🇩" },
  { code: "DH", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "SR", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "EGP", name: "Egyptian Pound", flag: "🇪🇬" },
  { code: "DZD", name: "Algerian Dinar", flag: "🇩🇿" },
];

function Card({ title, icon, children }) {
  return (
    <div style={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: 16, marginBottom: 12, overflow: "hidden" }}>
      <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #222" }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { state, setCurrency, replaceAll, resetData, currency, showToast } = useApp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  const totalItems = state.consumables.length + state.durables.length + state.car.length + state.finances.length + state.recipes.length;

  const handleExport = () => {
    try { exportData(state); showToast("Backup downloaded!", "success"); }
    catch (err) { showToast("Export failed", "error"); }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const data = await readImportFile(file);
      replaceAll(data);
      showToast("Data restored!", "success");
    } catch (err) {
      showToast("Import failed: " + err.message, "error");
    } finally { setImporting(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const handleReset = () => {
    resetData();
    setShowResetConfirm(false);
    showToast("Reset complete", "info");
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "16px 16px 8px", flexShrink: 0 }}>
        <div style={{ fontSize: 13, color: "#666", marginBottom: 2 }}>Preferences</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>⚙️ Settings</div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "8px 16px 80px", WebkitOverflowScrolling: "touch" }}>
        <Card title="Data Overview" icon="📊">
          <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Consumables", count: state.consumables.length, color: "#3B5BDB" },
              { label: "Durables", count: state.durables.length, color: "#2F9E44" },
              { label: "Car Events", count: state.car.length, color: "#E67700" },
              { label: "Finances", count: state.finances.length, color: "#7950F2" },
              { label: "Recipes", count: state.recipes.length, color: "#E03131" },
              { label: "Total", count: totalItems, color: "#fff" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px", background: "#0F0F0F", borderRadius: 12, border: "1px solid #222" }}>
                <div style={{ width: 10, height: 10, borderRadius: 99, background: item.color }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#888" }}>{item.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{item.count}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Currency" icon="💱">
          <div style={{ padding: "16px" }}>
            <button onClick={() => setShowCurrencyPicker(!showCurrencyPicker)} style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "1px solid #333",
              background: "#0F0F0F", color: "#fff", fontSize: 16, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <span>{CURRENCIES.find(c => c.code === currency)?.flag || "💵"} {currency}</span>
              <span style={{ color: "#666", fontSize: 12 }}>TAP TO CHANGE ▼</span>
            </button>

            {showCurrencyPicker && (
              <div style={{ marginTop: 10, maxHeight: 300, overflow: "auto", borderRadius: 12, border: "1px solid #333", background: "#0F0F0F" }}>
                {CURRENCIES.map(c => (
                  <button key={c.code} onClick={() => { setCurrency(c.code); setShowCurrencyPicker(false); showToast(`Currency set to ${c.code}`, "success"); }} style={{
                    width: "100%", padding: "12px 16px", border: "none", borderBottom: "1px solid #222",
                    background: currency === c.code ? "#3B5BDB22" : "transparent", color: "#fff",
                    fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                    textAlign: "left"
                  }}>
                    <span style={{ fontSize: 20 }}>{c.flag}</span>
                    <span style={{ flex: 1 }}>{c.name}</span>
                    <span style={{ fontWeight: 700, color: currency === c.code ? "#3B5BDB" : "#666" }}>{c.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card title="Backup & Restore" icon="💾">
          <div style={{ padding: "16px" }}>
            <button onClick={handleExport} style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "1px solid #3B5BDB",
              background: "#3B5BDB18", color: "#3B5BDB", fontWeight: 800, fontSize: 15,
              cursor: "pointer", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}>📤 Export All Data</button>
            <div style={{ fontSize: 11, color: "#555", textAlign: "center", marginBottom: 16 }}>Downloads a .json file to transfer to another phone</div>

            <input ref={fileRef} type="file" accept=".json,application/json" onChange={handleImport} style={{ display: "none" }} />
            <button onClick={() => fileRef.current?.click()} disabled={importing} style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "1px solid #333",
              background: "#0F0F0F", color: "#aaa", fontWeight: 700, fontSize: 15,
              cursor: importing ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}>{importing ? "⏳ Reading..." : "📥 Import Data"}</button>
            <div style={{ fontSize: 11, color: "#555", textAlign: "center", marginTop: 10 }}>Select a previously exported .json file</div>
          </div>
        </Card>

        <Card title="Danger Zone" icon="🚨">
          <div style={{ padding: "16px" }}>
            <button onClick={() => setShowResetConfirm(true)} style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "1px solid #E03131",
              background: "#E0313118", color: "#E03131", fontWeight: 800, fontSize: 15, cursor: "pointer"
            }}>🗑️ Reset All Data</button>
            <div style={{ fontSize: 11, color: "#555", textAlign: "center", marginTop: 10 }}>Export first! This erases everything forever.</div>
          </div>
        </Card>

        <div style={{ textAlign: "center", padding: "30px 0", color: "#444", fontSize: 12 }}>
          <div style={{ fontWeight: 700, color: "#555", marginBottom: 4 }}>LifeOS v2.0</div>
          <div>Built with React + Capacitor</div>
          <div>All data stays on your device</div>
        </div>
      </div>

      <ConfirmModal
        open={showResetConfirm}
        title="Reset Everything?"
        message="This permanently deletes ALL your items, recipes, categories, and settings. Export a backup first if you want to keep anything."
        confirmText="Yes, Reset All"
        confirmColor="#E03131"
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
