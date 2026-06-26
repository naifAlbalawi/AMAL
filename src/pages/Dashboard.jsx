import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { GanttStrip } from "../components/GanttStrip.jsx";

const $ = (n, c) => `${c || "$"}${Number(n).toFixed(2)}`;
const daysTo = (s, today) => Math.round((new Date(s) - today) / 86400000);

function KpiCard({ label, value, sub, color, delay }) {
  return (
    <div style={{
      background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 16,
      padding: "18px 16px", display: "flex", flexDirection: "column", gap: 6,
      animation: `fadeInUp 0.4s ease ${delay}s both`
    }}>
      <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: "-0.03em" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#555" }}>{sub}</div>
    </div>
  );
}

function SectionCard({ title, icon, children, delay = 0 }) {
  return (
    <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 16, marginBottom: 12, overflow: "hidden", animation: `fadeInUp 0.4s ease ${delay}s both` }}>
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #222" }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function BarBreakdown({ state, currency }) {
  const cats = [
    { l: "Consumables", v: state.consumables.reduce((s, r) => s + (r.monthly || 0), 0), c: "#3B5BDB" },
    { l: "Durables", v: state.durables.reduce((s, r) => s + (r.monthly || 0), 0), c: "#2F9E44" },
    { l: "Car", v: state.car.filter(r => r.type === "Fuel").reduce((s, r) => s + (r.cost || 0), 0) / 2, c: "#E67700" },
    { l: "Bills", v: state.finances.reduce((s, r) => s + (r.amount || 0), 0), c: "#7950F2" },
  ];
  const mx = Math.max(...cats.map(c => c.v), 1);
  return (
    <div style={{ padding: "16px" }}>
      {cats.map(c => (
        <div key={c.l} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: "#aaa" }}>{c.l}</span>
            <span style={{ fontSize: 13, color: c.c, fontWeight: 700 }}>{$(c.v, currency)}</span>
          </div>
          <div style={{ height: 8, background: "#222", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(c.v / mx) * 100}%`, background: `linear-gradient(90deg, ${c.c}88, ${c.c})`, borderRadius: 99, transition: "width 0.8s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutCats({ state, currency }) {
  const cats = [
    { l: "Bills", v: state.finances.reduce((s, r) => s + (r.amount || 0), 0), c: "#7950F2" },
    { l: "Consumables", v: state.consumables.reduce((s, r) => s + (r.monthly || 0), 0), c: "#3B5BDB" },
    { l: "Car", v: state.car.filter(r => r.type === "Fuel").reduce((s, r) => s + (r.cost || 0), 0) / 2, c: "#E67700" },
    { l: "Durables", v: state.durables.reduce((s, r) => s + (r.monthly || 0), 0), c: "#2F9E44" },
  ];
  const total = cats.reduce((s, c) => s + c.v, 0);
  let cumul = -90;
  const cx = 55, cy = 50, r = 36, ir = 22;
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
    <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 16 }}>
      <svg width={110} height={100}>
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.c} stroke="#1a1a1a" strokeWidth={2} />)}
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={10} fill="#fff" fontWeight={700}>{$(total, currency)}</text>
      </svg>
      <div style={{ flex: 1 }}>
        {cats.map(c => {
          const pct = total > 0 ? Math.round((c.v / total) * 100) : 0;
          return (
            <div key={c.l} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: c.c }} />
              <span style={{ fontSize: 12, color: "#aaa", flex: 1 }}>{c.l}</span>
              <span style={{ fontSize: 12, color: c.c, fontWeight: 700 }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { state, monthly, allRecs, currency, TODAY } = useApp();
  const [showAll, setShowAll] = useState(false);

  const urgent = allRecs.filter(r => r.ends && daysTo(r.ends, TODAY) <= 7 && daysTo(r.ends, TODAY) >= 0);
  const upcoming = allRecs.filter(r => r.ends && daysTo(r.ends, TODAY) > 0 && daysTo(r.ends, TODAY) <= 30);
  const displayUpcoming = showAll ? upcoming : upcoming.slice(0, 4);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "16px 16px 8px", flexShrink: 0 }}>
        <div style={{ fontSize: 13, color: "#666", marginBottom: 2 }}>Good morning</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>Your Overview</div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "0 16px 80px", WebkitOverflowScrolling: "touch" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <KpiCard label="Monthly Burn" value={$(monthly, currency)} sub="this month" color="#3B5BDB" delay={0} />
          <KpiCard label="Annual" value={$(monthly * 12, currency)} sub="projection" color="#7950F2" delay={0.05} />
          <KpiCard label="Urgent" value={urgent.length} sub="need attention" color={urgent.length ? "#FF6B35" : "#2F9E44"} delay={0.1} />
          <KpiCard label="Tracked" value={allRecs.length + state.recipes.length} sub="total items" color="#fff" delay={0.15} />
        </div>

        <SectionCard title="Monthly Spend" icon="📊" delay={0.2}>
          <BarBreakdown state={state} currency={currency} />
        </SectionCard>

        <SectionCard title="Category Split" icon="🍩" delay={0.25}>
          <DonutCats state={state} currency={currency} />
        </SectionCard>

        {urgent.length > 0 && (
          <SectionCard title={`⚠️ ${urgent.length} Urgent`} icon="" delay={0.3}>
            <div style={{ padding: "0 16px 12px" }}>
              {urgent.map(r => (
                <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #222" }}>
                  <span style={{ fontSize: 13, color: "#ccc", fontWeight: 500 }}>{r.name}</span>
                  <span style={{ fontSize: 12, color: "#FF6B35", fontWeight: 700, background: "rgba(255,107,53,0.15)", padding: "3px 10px", borderRadius: 99 }}>{daysTo(r.ends, TODAY)}d left</span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {upcoming.length > 0 && (
          <SectionCard title="📋 Upcoming" icon="" delay={0.35}>
            <div style={{ padding: "0 16px" }}>
              {displayUpcoming.map(r => (
                <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #222" }}>
                  <span style={{ fontSize: 13, color: "#aaa" }}>{r.name}</span>
                  <span style={{ fontSize: 12, color: "#3B5BDB", fontWeight: 600 }}>{r.ends}</span>
                </div>
              ))}
              {upcoming.length > 4 && (
                <button onClick={() => setShowAll(!showAll)} style={{ width: "100%", padding: "10px", color: "#666", fontSize: 13, fontWeight: 600, background: "transparent", border: "none" }}>
                  {showAll ? "Show less ↑" : `Show all ${upcoming.length} →`}
                </button>
              )}
            </div>
          </SectionCard>
        )}

        <SectionCard title="Full Timeline" icon="📅" delay={0.4}>
          <GanttStrip records={allRecs.filter(r => r.ends)} windowStart={new Date("2026-05-01")} days={240} rowHeight={26} compact />
        </SectionCard>
      </div>
    </div>
  );
}
