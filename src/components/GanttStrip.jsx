import { useRef, useEffect } from "react";

export function GanttStrip({ records, compact = false }) {
  const labelW = compact ? 100 : 130;
  const dayW = compact ? 14 : 18;
  const today = new Date();
  today.setHours(0,0,0,0);
  const windowStart = new Date(today);
  windowStart.setDate(today.getDate() - 30);
  const days = 60;
  const totalW = labelW + days * dayW;
  const totalH = Math.max(records.length * 28 + 32, 60);
  const scrollRef = useRef(null);

  const daysTo = (s) => Math.round((new Date(s) - today) / 86400000);
  const xOf = (ds) => labelW + Math.max(0, (new Date(ds) - windowStart) / 86400000) * dayW;
  const bLen = (s, e) => {
    const raw = (new Date(e) - new Date(s)) / 86400000;
    const clipped = Math.min(raw, days - Math.max(0, (new Date(s) - windowStart) / 86400000));
    return Math.max(clipped * dayW, 4);
  };
  const todayX = labelW + ((today - windowStart) / 86400000) * dayW;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = todayX - scrollRef.current.clientWidth / 2;
    }
  }, [todayX]);

  const ticks = [];
  let cur = new Date(windowStart);
  cur.setDate(1);
  while (cur <= new Date(windowStart.getTime() + days * 86400000)) {
    const x = labelW + ((cur - windowStart) / 86400000) * dayW;
    if (x >= labelW) ticks.push({ x, label: cur.toLocaleString("default", { month: "short" }) });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }

  const colors = { Low: "#FF6B35", Worn: "#E67700", OK: "#2F9E44", Good: "#2F9E44", Service: "#E67700", Fuel: "#FF6B35", Annual: "#E03131", Repair: "#E67700", Fixed: "#7950F2", Variable: "#3B5BDB", Subscription: "#7950F2", "One-time": "#3B5BDB", Investment: "#2F9E44", Savings: "#3B5BDB", Cleaning: "#3B5BDB", Parking: "#E67700", Toll: "#7950F2", Fine: "#E03131", Stocked: "#2F9E44", Damaged: "#E03131", Retired: "#888", Paid: "#2F9E44", Pending: "#E67700", Overdue: "#E03131" };

  return (
    <div 
      ref={scrollRef} 
      style={{ 
        overflowX: "auto", 
        overflowY: "hidden", 
        width: "100%", 
        border: "1px solid #2a2a2a", 
        borderRadius: 16, 
        background: "#0F0F0F",
        boxSizing: "border-box"
      }}
    >
      <svg width={totalW} height={totalH} style={{ display: "block" }}>
        {ticks.map((t, i) => (
          <text key={i} x={t.x} y={16} fill="#888" fontSize={10} textAnchor="middle">{t.label}</text>
        ))}
        {Array.from({ length: days }, (_, i) => {
          const x = labelW + i * dayW;
          return <line key={i} x1={x} y1={24} x2={x} y2={totalH} stroke="#1a1a1a" strokeWidth={1} />;
        })}
        {records.map((r, i) => {
          const y = 28 + i * 28;
          const sx = xOf(r.startDate || r.bought || r.date);
          const w = bLen(r.startDate || r.bought || r.date, r.endDate || r.ends);
          const d = daysTo(r.endDate || r.ends);
          const barColor = d < 0 ? "#E03131" : d <= 7 ? "#FF6B35" : colors[r.status || r.type] || "#3B5BDB";
          return (
            <g key={r.id}>
              <text x={labelW - 10} y={y + 17} fill="#ccc" fontSize={11} textAnchor="end">{r.name.length > (compact ? 10 : 14) ? r.name.slice(0, compact ? 9 : 13) + "…" : r.name}</text>
              <rect x={sx} y={y + 3} width={w} height={20} rx={8} fill={barColor} opacity={0.9} />
              {w > 40 && <text x={sx + w / 2} y={y + 17} fill="#fff" fontSize={9} textAnchor="middle">{(r.endDate || r.ends).slice(5)}</text>}
            </g>
          );
        })}
        {todayX >= labelW && todayX <= totalW && (
          <g>
            <line x1={todayX} y1={24} x2={todayX} y2={totalH} stroke="#fff" strokeWidth={1.5} strokeDasharray="4 2" />
            <text x={todayX} y={totalH - 4} fill="#fff" fontSize={9} textAnchor="middle" fontWeight={700}>TODAY</text>
          </g>
        )}
      </svg>
    </div>
  );
}
