import { useState } from "react";
import { useApp } from "../context/AppContext";
import { exportData } from "../utils/exportImport";
import { readImportFile } from "../utils/exportImport";
import { setLang, t, getLang, isRTL } from "../utils/i18n";
import { getDefaultProviders, loadAIConfig, saveAIConfig, isAIEnabled, setAIEnabled } from "../utils/aiConfig";

const CURRENCIES = ["$", "€", "£", "﷼", "د.إ", "د.ك"];

export default function Settings() {
  const { state, setSettings, replaceAll, resetData, showToast } = useApp();
  const [showCurrency, setShowCurrency] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiConfig, setAiConfig] = useState(loadAIConfig);
  const [aiEnabled, setAiEnabledState] = useState(isAIEnabled());
  const rtl = isRTL();

  const providers = getDefaultProviders();
  const selectedProvider = providers.find(p => p.id === aiConfig.provider) || providers[0];

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

  const saveAI = () => {
    saveAIConfig(aiConfig);
    setAIEnabled(aiEnabled);
    setSettings({ aiEnabled });
    showToast(t("aiSaved"), "success");
  };

  const updateAI = (field, value) => {
    setAiConfig(prev => ({ ...prev, [field]: value }));
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
        {/* Currency */}
        <div onClick={() => setShowCurrency(!showCurrency)} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: 18, borderBottom: "1px solid #222", cursor: "pointer"
        }}>
          <span style={{ fontSize: 15 }}>{t("currency")}</span>
          <span style={{ fontWeight: 700, color: "#3B5BDB", fontSize: 15 }}>{state.settings.currency}</span>
        </div>
        {showCurrency && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: 14 }}>
            {CURRENCIES.map(c => (
              <button key={c} onClick={() => { setSettings({ currency: c }); setShowCurrency(false); }} style={{
                padding: "10px 18px", borderRadius: 12,
                border: state.settings.currency === c ? "1px solid #3B5BDB" : "1px solid #333",
                background: state.settings.currency === c ? "#3B5BDB" : "#0F0F0F",
                color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14
              }}>{c}</button>
            ))}
          </div>
        )}

        {/* Language */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: 18, borderBottom: "1px solid #222"
        }}>
          <span style={{ fontSize: 15 }}>{t("language")}</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { setLang("en"); setSettings({ language: "en" }); }} style={{
              padding: "8px 14px", borderRadius: 10, border: "none",
              background: getLang() === "en" ? "#3B5BDB" : "#222",
              color: "#fff", fontSize: 13, cursor: "pointer",
              fontWeight: getLang() === "en" ? 700 : 500
            }}>{t("english")}</button>
            <button onClick={() => { setLang("ar"); setSettings({ language: "ar" }); }} style={{
              padding: "8px 14px", borderRadius: 10, border: "none",
              background: getLang() === "ar" ? "#3B5BDB" : "#222",
              color: "#fff", fontSize: 13, cursor: "pointer",
              fontWeight: getLang() === "ar" ? 700 : 500
            }}>{t("arabic")}</button>
          </div>
        </div>

        {/* AI Settings Toggle */}
        <div onClick={() => setShowAI(!showAI)} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: 18, borderBottom: showAI ? "1px solid #222" : "none", cursor: "pointer"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 15 }}>🤖 {t("aiSettings")}</span>
            <span style={{
              fontSize: 11, padding: "2px 8px", borderRadius: 10,
              background: aiEnabled ? "#2F9E44" : "#666",
              color: "#fff", fontWeight: 600
            }}>{aiEnabled ? "ON" : "OFF"}</span>
          </div>
          <span style={{ color: "#888", fontSize: 18 }}>{showAI ? "▲" : "▼"}</span>
        </div>

        {/* AI Configuration Panel */}
        {showAI && (
          <div style={{ padding: 16, borderBottom: "1px solid #222" }}>
            {/* Enable AI */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 14, color: "#ccc" }}>{t("enableAI")}</span>
              <button onClick={() => setAiEnabledState(!aiEnabled)} style={{
                width: 50, height: 28, borderRadius: 14, border: "none",
                background: aiEnabled ? "#3B5BDB" : "#444",
                position: "relative", cursor: "pointer",
                transition: "background 0.2s"
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", background: "#fff",
                  position: "absolute", top: 3,
                  left: aiEnabled ? 25 : 3,
                  transition: "left 0.2s"
                }} />
              </button>
            </div>

            {aiEnabled && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Provider */}
                <div>
                  <label style={{ fontSize: 12, color: "#888", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("aiProvider")}</label>
                  <select
                    value={aiConfig.provider}
                    onChange={e => updateAI("provider", e.target.value)}
                    style={{ padding: 12, borderRadius: 12, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 14, width: "100%" }}
                  >
                    {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                {/* Custom Endpoint */}
                {aiConfig.provider === "custom" && (
                  <div>
                    <label style={{ fontSize: 12, color: "#888", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("customEndpoint")}</label>
                    <input
                      value={aiConfig.customBaseUrl}
                      onChange={e => updateAI("customBaseUrl", e.target.value)}
                      placeholder="https://api.example.com/v1"
                      style={{ padding: 12, borderRadius: 12, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 14, width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                )}

                {/* Model */}
                <div>
                  <label style={{ fontSize: 12, color: "#888", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("model")}</label>
                  <input
                    value={aiConfig.model}
                    onChange={e => updateAI("model", e.target.value)}
                    placeholder={selectedProvider.defaultModel}
                    style={{ padding: 12, borderRadius: 12, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 14, width: "100%", boxSizing: "border-box" }}
                  />
                  <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>Default: {selectedProvider.defaultModel}</div>
                </div>

                {/* API Key */}
                <div>
                  <label style={{ fontSize: 12, color: "#888", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("apiKey")}</label>
                  <input
                    type="password"
                    value={aiConfig.apiKey}
                    onChange={e => updateAI("apiKey", e.target.value)}
                    placeholder="sk-..."
                    style={{ padding: 12, borderRadius: 12, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 14, width: "100%", boxSizing: "border-box" }}
                  />
                </div>

                {/* Auth Type */}
                <div>
                  <label style={{ fontSize: 12, color: "#888", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("authType")}</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => updateAI("authType", "Bearer")} style={{
                      flex: 1, padding: 10, borderRadius: 10,
                      border: aiConfig.authType === "Bearer" ? "1px solid #3B5BDB" : "1px solid #333",
                      background: aiConfig.authType === "Bearer" ? "#3B5BDB" : "#0F0F0F",
                      color: "#fff", fontSize: 13, cursor: "pointer"
                    }}>Bearer</button>
                    <button onClick={() => updateAI("authType", "Custom")} style={{
                      flex: 1, padding: 10, borderRadius: 10,
                      border: aiConfig.authType !== "Bearer" ? "1px solid #3B5BDB" : "1px solid #333",
                      background: aiConfig.authType !== "Bearer" ? "#3B5BDB" : "#0F0F0F",
                      color: "#fff", fontSize: 13, cursor: "pointer"
                    }}>{t("custom")}</button>
                  </div>
                  {aiConfig.authType !== "Bearer" && (
                    <input
                      value={aiConfig.authType}
                      onChange={e => updateAI("authType", e.target.value)}
                      placeholder="X-API-Key, Token, etc."
                      style={{ marginTop: 8, padding: 10, borderRadius: 10, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 13, width: "100%", boxSizing: "border-box" }}
                    />
                  )}
                </div>

                {/* Processing Mode */}
                <div>
                  <label style={{ fontSize: 12, color: "#888", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("processingMode")}</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { id: "text", label: t("textOnly") },
                      { id: "image", label: t("imageOnly") },
                      { id: "both", label: t("textAndImage") }
                    ].map(mode => (
                      <button key={mode.id} onClick={() => updateAI("mode", mode.id)} style={{
                        padding: 12, borderRadius: 10, textAlign: "start",
                        border: aiConfig.mode === mode.id ? "1px solid #3B5BDB" : "1px solid #333",
                        background: aiConfig.mode === mode.id ? "rgba(59,91,219,0.2)" : "#0F0F0F",
                        color: "#fff", fontSize: 13, cursor: "pointer"
                      }}>
                        <span style={{ fontWeight: aiConfig.mode === mode.id ? 700 : 500 }}>{mode.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* System Prompt */}
                <div>
                  <label style={{ fontSize: 12, color: "#888", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("systemPrompt")}</label>
                  <textarea
                    value={aiConfig.systemPrompt}
                    onChange={e => updateAI("systemPrompt", e.target.value)}
                    rows={5}
                    style={{
                      padding: 12, borderRadius: 12, border: "1px solid #333",
                      background: "#0F0F0F", color: "#fff", fontSize: 12,
                      resize: "none", width: "100%", boxSizing: "border-box",
                      fontFamily: "monospace"
                    }}
                  />
                </div>

                {/* Save AI Config */}
                <button onClick={saveAI} style={{
                  padding: 14, borderRadius: 14, border: "none",
                  background: "#3B5BDB", color: "#fff", fontWeight: 700,
                  cursor: "pointer", fontSize: 15
                }}>{t("saveAI")}</button>
              </div>
            )}
          </div>
        )}

        {/* Export / Import */}
        <button onClick={() => exportData(state)} style={{
          width: "100%", textAlign: "start", padding: 18, background: "none",
          border: "none", color: "#fff", fontSize: 15, borderBottom: "1px solid #222",
          cursor: "pointer", fontWeight: 500
        }}>⬆️ {t("export")}</button>

        <label style={{ display: "block", width: "100%", padding: 18, cursor: "pointer", fontSize: 15, fontWeight: 500 }}>
          ⬇️ {t("import")}
          <input type="file" accept="application/json" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleImport(e.target.files[0])} />
        </label>
      </div>

      <button onClick={() => { if (confirm("Erase everything?")) { resetData(); showToast("Reset", "warning"); } }} style={{
        width: "100%", padding: 18, borderRadius: 18, border: "1px solid #E03131",
        background: "rgba(224,49,49,0.08)", color: "#E03131", fontWeight: 700,
        cursor: "pointer", marginBottom: 24, fontSize: 15
      }}>{t("reset")}</button>

      <div style={{ textAlign: "center", color: "#444", fontSize: 13, paddingBottom: 40 }}>{t("version")}</div>
    </div>
  );
}
