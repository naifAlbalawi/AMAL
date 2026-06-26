import { useState, useRef } from "react";
import { useApp } from "../context/AppContext.jsx";
import { exportData, readImportFile } from "../utils/exportImport.js";
import { ConfirmModal } from "../components/ConfirmModal.jsx";
import { Toast } from "../components/Toast.jsx";

const T = {
  bg: "#F0F2F7", surface: "#FFFFFF", border: "#E2E6EF",
  accent: "#3B5BDB", accentLight: "#EEF2FF",
  red: "#E03131", redLight: "#FFF0F0",
  text: "#1A1D23", textMid: "#4A5160", textMuted: "#8B92A5",
};

export default function Settings() {
  const { state, replaceAll, resetData } = useApp();
  const [toast, setToast] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  const showToast = (message, type = "info") => setToast({ message, type });

  const handleExport = () => {
    try {
      exportData(state);
      showToast("Backup file downloaded!", "success");
    } catch (err) {
      showToast("Export failed: " + err.message, "error");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const data = await readImportFile(file);
      replaceAll(data);
      showToast("Data imported successfully!", "success");
    } catch (err) {
      showToast("Import failed: " + err.message, "error");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleReset = () => {
    resetData();
    setShowResetConfirm(false);
    showToast("All data reset to defaults", "info");
  };

  const totalItems = state.consumables.length + state.durables.length + state.car.length + state.finances.length + state.recipes.length;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{
        display: "flex", alignItems: "center", padding: "12px 16px",
        borderBottom: `1px solid ${T.border}`, background: T.surface, flexShrink: 0
      }}>
        <span style={{ fontSize: 16, marginRight: 8 }}>⚙️</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Settings</span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 16, background: T.bg, WebkitOverflowScrolling: "touch" }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 2 }}>Data Overview</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>{totalItems} items stored locally</div>
          </div>
          <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "Consumables", count: state.consumables.length, color: "#3B5BDB" },
              { label: "Durables", count: state.durables.length, color: "#2F9E44" },
              { label: "Car Events", count: state.car.length, color: "#E67700" },
              { label: "Finances", count: state.finances.length, color: "#7950F2" },
              { label: "Recipes", count: state.recipes.length, color: "#E03131" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: T.bg, borderRadius: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: item.color }} />
                <span style={{ fontSize: 12, color: T.textMid, flex: 1 }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Backup & Restore</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Move your data to another phone</div>
          </div>

          <div style={{ padding: "16px" }}>
            <button onClick={handleExport} style={{
              width: "100%", padding: "12px", borderRadius: 8, border: `1px solid ${T.accent}`,
              background: T.accentLight, color: T.accent, fontWeight: 700, fontSize: 14,
              cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}>
              📤 Export All Data
            </button>
            <div style={{ fontSize: 11, color: T.textMuted, textAlign: "center", marginBottom: 14 }}>
              Downloads a .json file you can save anywhere
            </div>

            <input ref={fileRef} type="file" accept=".json,application/json" onChange={handleImport} style={{ display: "none" }} />
            <button onClick={() => fileRef.current?.click()} disabled={importing} style={{
              width: "100%", padding: "12px", borderRadius: 8, border: `1px solid ${T.border}`,
              background: "#fff", color: T.textMid, fontWeight: 700, fontSize: 14,
              cursor: importing ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}>
              {importing ? "⏳ Reading file..." : "📥 Import Data"}
            </button>
            <div style={{ fontSize: 11, color: T.textMuted, textAlign: "center", marginTop: 10 }}>
              Select a previously exported .json file to restore
            </div>
          </div>
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Danger Zone</div>
          </div>
          <div style={{ padding: "16px" }}>
            <button onClick={() => setShowResetConfirm(true)} style={{
              width: "100%", padding: "12px", borderRadius: 8, border: `1px solid ${T.red}`,
              background: T.redLight, color: T.red, fontWeight: 700, fontSize: 14, cursor: "pointer"
            }}>
              🗑️ Reset All Data
            </button>
            <div style={{ fontSize: 11, color: T.textMuted, textAlign: "center", marginTop: 10 }}>
              This will erase everything and restore defaults. Export first if you want to keep your data.
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "20px 0", color: T.textMuted, fontSize: 11 }}>
          <div>LifeOS v1.0</div>
          <div style={{ marginTop: 4 }}>Built with React + Capacitor</div>
          <div style={{ marginTop: 4 }}>Data stored locally on your device</div>
        </div>
      </div>

      <ConfirmModal
        open={showResetConfirm}
        title="Reset All Data?"
        message="This will permanently delete all your items, recipes, and settings. This cannot be undone. Make sure you exported a backup first."
        confirmText="Reset Everything"
        confirmColor={T.red}
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
