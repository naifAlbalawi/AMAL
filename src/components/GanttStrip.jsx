export function GanttStrip({ records, windowStart, days, rowHeight = 30, compact = false }) {
  const labelW = compact ? 100 : 130;
  const dayW = compact ? 14 : 18;
  const totalW = labelW + days * dayW;
  const totalH = Math.max(records.length * rowHeight + 28, 50);
  const today = new Date("2026-06-17");
  const daysTo = (s) => Math.round((new Date(s) - today) / 86400000);

  const xOf = (ds) => labelW + Math.max(0, (new Date(ds) - windowStart) / 86400000) * dayW;
  const bLen = (s, e) => {
    const raw = (new Date(e) - new Date(s)) / 86400000;
    const clipped = Math.min(raw, days - Math.max(0, (new Date(s) - windowStart) / 86400000));
    return Math.max(clipped * dayW, 4);
  };
  const todayX = labelW + ((today - windowStart) / 86400000) * dayW;

  const ticks = [];
  let cur = new Date(windowStart);
  cur.setDate(1);
  while (cur <= new Date(windowStart.getTime() + days * 86400000)) {
    const x = labelW + ((cur - windowStart) / 86400000) * dayW;
    if (x >= labelW) ticks.push({ x, label: cur.toLocaleString("default", { month: "short" }) });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }

  const colors = { Low: "#FF6B35", Worn: "#E67700", OK: "#2F9E44", Good: "#2F9E44", Service: "#E67700", Fuel: "#FF6B35", Annual: "#E03131", Repair: "#E67700", Fixed: "#7950F2", Variable: "#3B5BDB", Subscription: "#7950F2", "One-time": "#3B5BDB", Investment: "#2F9E44", Savings: "#3B5BDB", Cleaning: "#3B5BDB", Parking: "#E67700", Toll: "#7950F2", Fine: "#E03131", Stocked: "#2F9E44", Damaged: "#E03131", Retired: "#888" };

  return (
    <div style={{ overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch" }}>
      <svg width={totalW} height={totalH} style={{ display: "block" }}>
        <rect x={0} y={0} width={totalW} height={24} fill="#1a1a1a" />
        <rect x={0} y={0} width={labelW} height={totalH} fill="#1a1a1a" />
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={t.x} y1={0} x2={t.x} y2={totalH} stroke="#2a2a2a" strokeWidth={1} />
            <text x={t.x + 4} y={16} fill="#666" fontSize={9} fontWeight={600}>{t.label}</text>
          </g>
        ))}
        {Array.from({ length: days }, (_, i) => {
          const x = labelW + i * dayW;
          return <line key={i} x1={x} y1={24} x2={x} y2={totalH} stroke="#222" strokeWidth={0.5} strokeDasharray="2,4" />;
        })}
        {records.map((r, i) => {
          const y = 24 + i * rowHeight;
          const sx = xOf(r.date || r.bought);
          const w = bLen(r.date || r.bought, r.ends);
          const d = daysTo(r.ends);
          const barColor = d < 0 ? "#E03131" : d <= 7 ? "#FF6B35" : colors[r.status || r.type] || "#3B5BDB";
          return (
            <g key={r.id}>
              <rect x={0} y={y} width={totalW} height={rowHeight} fill={i % 2 === 0 ? "#0F0F0F" : "#151515"} />
              <text x={8} y={y + rowHeight / 2 + 4} fill="#ccc" fontSize={compact ? 9 : 10} fontWeight={500}>
                {r.name.length > (compact ? 10 : 14) ? r.name.slice(0, compact ? 9 : 13) + "…" : r.name}
              </text>
              <rect x={sx} y={y + 7} width={w} height={rowHeight - 14} rx={4} fill={barColor} opacity={0.9} />
              {w > 35 && <text x={sx + 5} y={y + rowHeight / 2 + 4} fill="#fff" fontSize={8} fontWeight={700}>{r.ends.slice(5)}</text>}
            </g>
          );
        })}
        {todayX >= labelW && todayX <= totalW && (
          <g>
            <line x1={todayX} y1={0} x2={todayX} y2={totalH} stroke="#E03131" strokeWidth={2} strokeDasharray="4,3" />
            <rect x={todayX - 16} y={2} width={32} height={14} rx={3} fill="#E03131" />
            <text x={todayX} y={12} fill="#fff" fontSize={8} fontWeight={800} textAnchor="middle">TODAY</text>
          </g>
        )}
        <line x1={labelW} y1={0} x2={labelW} y2={totalH} stroke="#333" strokeWidth={1.5} />
      </svg>
    </div>
  );
}
