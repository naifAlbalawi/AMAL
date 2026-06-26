import { useState } from "react";
import { useApp } from "../context/AppContext";
import { GanttStrip } from "../components/GanttStrip";
import { t, isRTL } from "../utils/i18n";

function fmt(n, currency) { return `${currency}${n.toFixed(2)}`; }
function daysTo(a, b) { return Math.round((new Date(a) - new Date(b)) / 86400000); }

export default function Dashboard() {
  const { state, monthly, currency, TODAY } = useApp();
  const [showAll, setShowAll] = useState(false);
  const rtl = isRTL();

  const urgent = state.expenses.filter(r => r.endDate && daysTo(r.endDate, TODAY) <= 7 && daysTo(r.endDate, TODAY) >= 0);
  const upcoming = state.expenses.filter(r => r.endDate && daysTo(r.endDate, TODAY) > 0 && daysTo(r.endDate, TODAY) <= 30);
  const displayUpcoming = showAll ? upcoming : upcoming.slice(0, 4);

  const tagSpend = {};
  state.tags.forEach(tag => {
    const spend = state.expenses.filter(e => e.tag === tag.id).reduce((s, e) => s + (e.monthly || 0), 0);
    if (spend > 0) tagSpend[tag.id] = { ...tag, spend };
  });

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 6px" }}>{t("overview")}</h1>
      <p style={{ color: "#888", fontSize: 14, margin: "0 0 20px" }}>{t("appName")} · {TODAY.toLocaleDateString(rtl ? "ar-SA" : "en-US")}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "#1a1a1a", borderRadius: 18, padding: 18, border: "1px solid #222" }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 6, fontWeight: 500 }}>{t("monthly")}</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{fmt(monthly, currency)}</div>
        </div>
        <div style={{ background: "#1a1a1a", borderRadius: 18, padding: 18, border: "1px solid #222" }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 6, fontWeight: 500 }}>{t("items")}</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{state.expenses.length}</div>
        </div>
      </div>

      {Object.values(tagSpend).length > 0 && (
        <div style={{ background: "#1a1a1a", borderRadius: 18, padding: 18, border: "1px solid #222", marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 12, fontWeight: 600 }}>{t("expenses")}</div>
          {Object.values(tagSpend).map(tag => (
            <div key={tag.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: tag.color, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 14 }}>{rtl ? tag.nameAr : tag.name}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{fmt(tag.spend, currency)}{t("perMonth")}</div>
            </div>
          ))}
        </div>
      )}

      {urgent.length > 0 && (
        <div style={{ background: "rgba(224,49,49,0.08)", border: "1px solid rgba(224,49,49,0.25)", borderRadius: 18, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#FF6B35", marginBottom: 10 }}>{t("urgent")}</div>
          {urgent.map(r => (
            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 14 }}>{r.name}</span>
              <span style={{ fontSize: 13, color: "#FF6B35", fontWeight: 600 }}>{daysTo(r.endDate, TODAY)}d</span>
            </div>
          ))}
        </div>
      )}

      {upcoming.length > 0 && (
        <div style={{ background: "#1a1a1a", borderRadius: 18, padding: 16, border: "1px solid #222", marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{t("upcoming")}</div>
          {displayUpcoming.map(r => (
            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 14 }}>{r.name}</span>
              <span style={{ fontSize: 13, color: "#888" }}>{r.endDate}</span>
            </div>
          ))}
          {upcoming.length > 4 && (
            <button onClick={() => setShowAll(!showAll)} style={{ width: "100%", marginTop: 10, background: "none", border: "none", color: "#3B5BDB", fontSize: 13, fontWeight: 600, padding: "8px 0", cursor: "pointer" }}>
              {showAll ? "Show less" : `Show all (${upcoming.length})`}
            </button>
          )}
        </div>
      )}

      <div style={{ marginBottom: 80 }}>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 10, fontWeight: 600 }}>{t("timeline")}</div>
        <GanttStrip records={state.expenses.filter(e => e.endDate).sort((a,b) => new Date(a.endDate) - new Date(b.endDate))} compact />
      </div>
    </div>
  );
}
