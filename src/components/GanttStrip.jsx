const T = {
  bg: "#F0F2F7", surface: "#FFFFFF", border: "#E2E6EF",
  borderStrong: "#C8CFDE", accent: "#3B5BDB", red: "#E03131", orange: "#FF6B35",
  text: "#1A1D23", textMuted: "#8B92A5"
};

export function GanttStrip({ records, windowStart, days, rowHeight = 32, compact = false }) {
  const labelW = compact ? 110 : 150;
  const dayW = compact ? 16 : 20;
  const totalW = labelW + days * dayW;
  const totalH = Math.max(records.length * rowHeight + 30, 60);
  const today = new Date("2026-06-17");

  const xOf = (ds) => labelW + Math.max(0, (new Date(ds) - windowStart) / 86400000) * dayW;
  const bLen = (s, e) => {
    const raw = (new Date(e) - new Date(s)) / 86400000;
    const clipped = Math.min(raw, days - Math.max(0, (new Date(s) - windowStart) / 86400000));
    return Math.max(clipped * dayW, 6);
  };
  const todayX = labelW + ((today - windowStart) / 86400000) * dayW;
  const daysTo = (s) => Math.round((new Date(s) - today) / 86400000);

  const ticks = [];
  let cur = new Date(windowStart);
  cur.setDate(1);
  while (cur <= new Date(windowStart.getTime() + days * 86400000)) {
    const x = labelW + ((cur - windowStart) / 86400000) * dayW;
    if (x >= labelW) ticks.push({ x, label: cur.toLocaleString("default", { month: "short" }) + " '" + String(cur.getFullYear()).slice(2) });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }

  return (
    <div style={{ overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch" }}>
      <svg width={totalW} height={totalH} style={{ display: "block", fontFamily: "inherit" }}>
        <rect x={0} y={0} width={totalW} height={26} fill={T.bg} />
        <rect x={0} y={0} width={labelW} height={totalH} fill={T.bg} />
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={t.x} y1={0} x2={t.x} y2={totalH} stroke={T.border} strokeWidth={1} />
            <text x={t.x + 4} y={17} fill={T.textMuted} fontSize={10} fontWeight={600}>{t.label}</text>
          </g>
        ))}
        {Array.from({ length: days }, (_, i) => {
          const x = labelW + i * dayW;
          return <line key={i} x1={x} y1={26} x2={x} y2={totalH} stroke={T.border} strokeWidth={0.5} strokeDasharray="2,4" />;
        })}
        {records.map((r, i) => {
          const y = 26 + i * rowHeight;
          const sx = xOf(r.date || r.bought);
          const w = bLen(r.date || r.bought, r.ends);
          const d = daysTo(r.ends);
          const barColor = d < 0 ? T.red : d <= 7 ? T.orange : r.color || T.accent;
          return (
            <g key={r.id}>
              <rect x={0} y={y} width={totalW} height={rowHeight} fill={i % 2 === 0 ? T.surface : T.bg} />
              <text x={8} y={y + rowHeight / 2 + 4} fill={T.text} fontSize={compact ? 10 : 11} fontWeight={500}>
                {r.name.length > (compact ? 12 : 16) ? r.name.slice(0, compact ? 11 : 15) + "…" : r.name}
              </text>
              <rect x={sx} y={y + 6} width={w} height={rowHeight - 13} rx={3} fill={barColor} opacity={0.88} />
              {w > 40 && <text x={sx + 5} y={y + rowHeight / 2 + 4} fill="#fff" fontSize={9} fontWeight={700}>{r.ends}</text>}
            </g>
          );
        })}
        {todayX >= labelW && todayX <= totalW && (
          <g>
            <line x1={todayX} y1={0} x2={todayX} y2={totalH} stroke={T.red} strokeWidth={2} strokeDasharray="4,3" />
            <rect x={todayX - 14} y={2} width={28} height={14} rx={3} fill={T.red} />
            <text x={todayX} y={12} fill="#fff" fontSize={8} fontWeight={800} textAnchor="middle">TODAY</text>
          </g>
        )}
        <line x1={labelW} y1={0} x2={labelW} y2={totalH} stroke={T.borderStrong} strokeWidth={1.5} />
      </svg>
    </div>
  );
}
