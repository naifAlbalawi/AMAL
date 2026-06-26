import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { GanttStrip } from "../components/GanttStrip.jsx";

const T = {
  bg: "#F0F2F7", surface: "#FFFFFF", border: "#E2E6EF",
  accent: "#3B5BDB", accentLight: "#EEF2FF",
  orange: "#FF6B35", orangeLight: "#FFF0EB",
  green: "#2F9E44", greenLight: "#EBFBEE",
  amber: "#E67700", amberLight: "#FFF8E6",
  red: "#E03131", redLight: "#FFF0F0",
  text: "#1A1D23", textMid: "#4A5160", textMuted: "#8B92A5",
};

const $ = (n) => `$${Number(n).toFixed(2)}`;
const daysTo = (s, today) => Math.round((new Date(s) - today) / 86400000);

function KpiCard({ label, value, sub, color, icon }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12,
      padding: "16px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      display: "flex", flexDirection: "column", gap: 4
    }}>
      <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: 11, color: T.textMuted }}>{sub}</div>
    </div>
  );
}

function BarBreakdown({ state }) {
  const cats = [
    { l: "Consumables", v: state.consumables.reduce((s, r) => s + (r.monthly || 0), 0), c: T.accent },
    { l: "Durables",    v: state.durables.reduce((s, r) => s + (r.monthly || 0), 0), c: T.green },
    { l: "Car",         v: state.car.filter(r => r.type === "Fuel").reduce((s, r) => s + (r.cost || 0), 0) / 2, c: T.amber },
    { l: "Bills",       v: state.finances.reduce((s, r) => s + (r.amount || 0), 0), c: "#7950F2" },
  ];
  const mx = Math.max(...cats.map(c => c.v), 1);
  return (
    <div style={{ padding: "14px 16px" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 14 }}>Monthly Spend</div>
      {cats.map(c => (
        <div key={c.l} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: T.textMid }}>{c.l}</span>
            <span style={{ fontSize: 12, color: c.c, fontWeight: 700 }}>{$(c.v)}</span>
          </div>
          <div style={{ height: 6, background: T.bg, borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(c.v / mx) * 100}%`, background: c.c, borderRadius: 99, transition: "width 0.5s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutCats({ state }) {
  const cats = [
    { l: "Bills", v: state.finances.reduce((s, r) => s + (r.amount || 0), 0), c: "#7950F2" },
    { l: "Consumables", v: state.consumables.reduce((s, r) => s + (r.monthly || 0), 0), c: T.accent },
    { l: "Car", v: state.car.filter(r => r.type === "Fuel").reduce((s, r) => s + (r.cost || 0), 0) / 2, c: T.amber },
    { l: "Durables", v: state.durables.reduce((s, r) => s + (r.monthly || 0), 0), c: T.green },
  ];
  const total = cats.reduce((s, c) => s + c.v, 0);
  let cumul = -90;
  const cx = 60, cy = 55, r = 40, ir = 24;
  const slices = cats.map(c => {
    const angle = total > 0 ? (c.v / total) * 360 : 0;
    const sa = cumul * Math.PI / 180;
    const ea = (cumul + angle) * Math.PI / 180;
    cumul += angle;
    const lg = angle > 180 ? 1 : 0;
    const pts = (a, rad) => `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`;
    return { ...c, path: `M${pts(sa, r)} A${r},${r},0,${lg},1,${pts(ea, r)} L${pts(ea, ir)} A${ir},${ir},0,${lg},0,${pts(sa, ir)} Z` };
  });

  return (
    <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
      <svg width={120} height={110}>
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.c} stroke="#fff" strokeWidth={2} />)}
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={10} fill={T.text} fontWeight={700}>{$(total)}</text>
      </svg>
      <div style={{ flex: 1 }}>
        {cats.map(c => {
          const pct = total > 0 ? Math.round((c.v / total) * 100) : 0;
          return (
            <div key={c.l} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: c.c, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: T.textMid }}>{c.l}</span>
              <span style={{ fontSize: 11, color: c.c, fontWeight: 700, marginLeft: "auto" }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { state, monthly, allRecs, TODAY } = useApp();
  const [editing, setEditing] = useState(false);

  const urgent = allRecs.filter(r => r.ends && daysTo(r.ends, TODAY) <= 7 && daysTo(r.ends, TODAY) >= 0);
  const upcoming = allRecs.filter(r => r.ends && daysTo(r.ends, TODAY) > 0 && daysTo(r.ends, TODAY) <= 30).slice(0, 6);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
        borderBottom: `1px solid ${T.border}`, background: T.surface, flexShrink: 0
      }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>▦ Dashboard</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setEditing(!editing)} style={{
          background: editing ? T.accent : T.bg, color: editing ? "#fff" : T.textMid,
          border: `1px solid ${editing ? T.accent : T.border}`, borderRadius: 6,
          padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, minHeight: 32
        }}>{editing ? "✓ Done" : "✎ Edit"}</button>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 12, background: T.bg, WebkitOverflowScrolling: "touch" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <KpiCard label="Monthly Burn" value={$(monthly)} sub="estimated" color={T.accent} />
          <KpiCard label="Annual" value={$(monthly * 12)} sub="projection" color="#7950F2" />
          <KpiCard label="Urgent" value={urgent.length} sub="need attention" color={urgent.length ? T.orange : T.green} />
          <KpiCard label="Tracked" value={allRecs.length + state.recipes.length} sub="total items" color={T.text} />
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
          <BarBreakdown state={state} />
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
          <DonutCats state={state} />
        </div>

        {urgent.length > 0 && (
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: T.text, borderBottom: `1px solid ${T.border}` }}>
              ⚠ Due within 7 days
            </div>
            {urgent.map(r => (
              <div key={r.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 16px", borderBottom: `1px solid ${T.border}`
              }}>
                <span style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>{r.name}</span>
                <span style={{ fontSize: 11, color: T.orange, fontWeight: 700, background: T.orangeLight, padding: "2px 8px", borderRadius: 99 }}>
                  {daysTo(r.ends, TODAY)}d
                </span>
              </div>
            ))}
          </div>
        )}

        {upcoming.length > 0 && (
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: T.text, borderBottom: `1px solid ${T.border}` }}>
              📋 Next 30 days
            </div>
            {upcoming.map(r => (
              <div key={r.id} style={{
                display: "flex", justifyContent: "space-between",
                padding: "10px 16px", borderBottom: `1px solid ${T.border}`
              }}>
                <span style={{ fontSize: 12, color: T.textMid }}>{r.name}</span>
                <span style={{ fontSize: 11, color: T.accent, fontWeight: 600 }}>{r.ends}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${T.border}` }}>
            📅 Full Timeline
          </div>
          <GanttStrip records={allRecs.filter(r => r.ends)} windowStart={new Date("2026-05-01")} days={240} rowHeight={24} compact />
        </div>

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
