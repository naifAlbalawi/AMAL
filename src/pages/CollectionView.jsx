import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { GanttStrip } from "../components/GanttStrip.jsx";
import { BottomSheet } from "../components/BottomSheet.jsx";
import { ConfirmModal } from "../components/ConfirmModal.jsx";

const T = {
  bg: "#F0F2F7", surface: "#FFFFFF", surfaceHover: "#F4F6FB",
  border: "#E2E6EF", borderStrong: "#C8CFDE",
  accent: "#3B5BDB", accentLight: "#EEF2FF",
  orange: "#FF6B35", orangeLight: "#FFF0EB",
  green: "#2F9E44", greenLight: "#EBFBEE",
  amber: "#E67700", amberLight: "#FFF8E6",
  red: "#E03131", redLight: "#FFF0F0",
  text: "#1A1D23", textMid: "#4A5160", textMuted: "#8B92A5",
};

const $ = (n) => `$${Number(n).toFixed(2)}`;
const daysTo = (s, today) => Math.round((new Date(s) - today) / 86400000);
const uid = () => Math.random().toString(36).slice(2, 10);

const statusStyle = (s) => ({
  Low: { bg: T.orangeLight, color: T.orange },
  Worn: { bg: T.amberLight, color: T.amber },
  OK: { bg: T.greenLight, color: T.green },
  Good: { bg: T.greenLight, color: T.green },
}[s] || { bg: T.bg, color: T.textMuted });

const SPACES_META = {
  consumables: { label: "Consumables", icon: "◎", color: "#3B5BDB", fields: ["name","price","monthly","ends","status"] },
  durables:    { label: "Durables",    icon: "◈", color: "#2F9E44", fields: ["name","price","monthly","ends","status"] },
  car:         { label: "Car",         icon: "◐", color: "#E67700", fields: ["name","date","cost","type","ends"] },
  finances:    { label: "Finances",    icon: "◆", color: "#7950F2", fields: ["name","amount","date","type","ends"] },
};

function getDefaultItem(space) {
  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  switch (space) {
    case "consumables": return { id: uid(), name: "", price: 0, bought: today, duration: 30, ends: nextMonth, monthly: 0, status: "OK", color: "#3B5BDB" };
    case "durables":    return { id: uid(), name: "", price: 0, bought: today, ends: nextMonth, monthly: 0, status: "Good", color: "#2F9E44" };
    case "car":         return { id: uid(), name: "", date: today, ends: nextMonth, cost: 0, type: "Service", color: "#E67700" };
    case "finances":    return { id: uid(), name: "", amount: 0, date: today, ends: nextMonth, type: "Fixed", color: "#7950F2" };
    default: return { id: uid(), name: "" };
  }
}

function getColumns(space) {
  switch (space) {
    case "consumables": return [
      { key: "name", label: "Item", render: r => <strong style={{ color: T.text }}>{r.name}</strong> },
      { key: "price", label: "Price", render: r => $(r.price) },
      { key: "monthly", label: "$/mo", render: r => <span style={{ color: T.accent, fontWeight: 700 }}>{$(r.monthly)}</span> },
      { key: "ends", label: "Runs out", render: (r, today) => { const d = daysTo(r.ends, today); return <span style={{ color: d < 0 ? T.red : d < 7 ? T.orange : T.green, fontWeight: 600 }}>{r.ends} ({d < 0 ? "overdue" : d + "d"})</span>; } },
      { key: "status", label: "Status", render: r => { const s = statusStyle(r.status); return <span style={{ background: s.bg, color: s.color, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{r.status}</span>; } },
    ];
    case "durables": return [
      { key: "name", label: "Item", render: r => <strong style={{ color: T.text }}>{r.name}</strong> },
      { key: "price", label: "Price", render: r => $(r.price) },
      { key: "monthly", label: "$/mo", render: r => <span style={{ color: T.green, fontWeight: 700 }}>{$(r.monthly)}</span> },
      { key: "ends", label: "Replace by", render: (r, today) => { const d = daysTo(r.ends, today); return <span style={{ color: d < 60 ? T.amber : T.textMid }}>{r.ends}</span>; } },
      { key: "status", label: "Condition", render: r => { const s = statusStyle(r.status); return <span style={{ background: s.bg, color: s.color, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{r.status}</span>; } },
    ];
    case "car": return [
      { key: "name", label: "Event", render: r => <strong style={{ color: T.text }}>{r.name}</strong> },
      { key: "date", label: "Date", render: r => r.date },
      { key: "cost", label: "Cost", render: r => <span style={{ color: T.amber, fontWeight: 700 }}>{$(r.cost)}</span> },
      { key: "type", label: "Type", render: r => <span style={{ background: T.amberLight, color: T.amber, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{r.type}</span> },
      { key: "ends", label: "Due / Ends", render: r => r.ends },
    ];
    case "finances": return [
      { key: "name", label: "Category", render: r => <strong style={{ color: T.text }}>{r.name}</strong> },
      { key: "amount", label: "Amount", render: r => <span style={{ color: "#7950F2", fontWeight: 700 }}>{$(r.amount)}</span> },
      { key: "date", label: "Date", render: r => r.date },
      { key: "type", label: "Type", render: r => <span style={{ background: "#F3F0FF", color: "#7950F2", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{r.type}</span> },
      { key: "ends", label: "Next due", render: r => r.ends },
    ];
    default: return [];
  }
}

function ItemForm({ space, item, onChange }) {
  const today = new Date().toISOString().slice(0, 10);
  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.border}`,
    fontSize: 13, marginBottom: 10, background: "#fff", color: T.text,
    outline: "none", fontFamily: "inherit"
  };
  const labelStyle = { fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: "0.04em" };

  return (
    <div>
      <label style={labelStyle}>Name</label>
      <input style={inputStyle} value={item.name} onChange={e => onChange({ ...item, name: e.target.value })} placeholder="Item name" />

      {(space === "consumables" || space === "durables") && (
        <>
          <label style={labelStyle}>Price</label>
          <input style={inputStyle} type="number" step="0.01" value={item.price || ""} onChange={e => onChange({ ...item, price: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
          <label style={labelStyle}>Monthly Cost</label>
          <input style={inputStyle} type="number" step="0.01" value={item.monthly || ""} onChange={e => onChange({ ...item, monthly: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
          <label style={labelStyle}>Ends On</label>
          <input style={inputStyle} type="date" value={item.ends} onChange={e => onChange({ ...item, ends: e.target.value })} />
          <label style={labelStyle}>Status</label>
          <select style={{ ...inputStyle, height: 40 }} value={item.status} onChange={e => onChange({ ...item, status: e.target.value })}>
            {space === "consumables" ? ["Low", "OK"].map(s => <option key={s} value={s}>{s}</option>)
              : ["Good", "Worn"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </>
      )}

      {space === "car" && (
        <>
          <label style={labelStyle}>Date</label>
          <input style={inputStyle} type="date" value={item.date} onChange={e => onChange({ ...item, date: e.target.value })} />
          <label style={labelStyle}>Cost</label>
          <input style={inputStyle} type="number" step="0.01" value={item.cost || ""} onChange={e => onChange({ ...item, cost: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
          <label style={labelStyle}>Type</label>
          <select style={{ ...inputStyle, height: 40 }} value={item.type} onChange={e => onChange({ ...item, type: e.target.value })}>
            {["Service", "Fuel", "Annual", "Repair"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <label style={labelStyle}>Ends / Due</label>
          <input style={inputStyle} type="date" value={item.ends} onChange={e => onChange({ ...item, ends: e.target.value })} />
        </>
      )}

      {space === "finances" && (
        <>
          <label style={labelStyle}>Amount</label>
          <input style={inputStyle} type="number" step="0.01" value={item.amount || ""} onChange={e => onChange({ ...item, amount: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
          <label style={labelStyle}>Date</label>
          <input style={inputStyle} type="date" value={item.date} onChange={e => onChange({ ...item, date: e.target.value })} />
          <label style={labelStyle}>Type</label>
          <select style={{ ...inputStyle, height: 40 }} value={item.type} onChange={e => onChange({ ...item, type: e.target.value })}>
            {["Fixed", "Variable"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <label style={labelStyle}>Next Due</label>
          <input style={inputStyle} type="date" value={item.ends} onChange={e => onChange({ ...item, ends: e.target.value })} />
        </>
      )}
    </div>
  );
}

export default function CollectionView({ spaceId }) {
  const { state, addItem, updateItem, deleteItem, TODAY } = useApp();
  const records = state[spaceId] || [];
  const meta = SPACES_META[spaceId];

  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [split, setSplit] = useState(0.55);
  const [draggingSplit, setDraggingSplit] = useState(false);
  const containerRef = useRef(null);

  const filtered = records.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
  const totalMonthly = records.reduce((s, r) => s + (r.monthly || r.amount || r.cost || 0), 0);
  const cols = getColumns(spaceId);

  const handleSave = () => {
    if (!editingItem?.name.trim()) return;
    if (records.find(r => r.id === editingItem.id)) {
      updateItem(spaceId, editingItem);
    } else {
      addItem(spaceId, editingItem);
    }
    setSheetOpen(false);
    setEditingItem(null);
  };

  const handleDelete = () => {
    if (confirmId) deleteItem(spaceId, confirmId);
    setConfirmId(null);
  };

  useEffect(() => {
    const onMove = e => {
      if (!draggingSplit || !containerRef.current) return;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const rect = containerRef.current.getBoundingClientRect();
      const frac = (clientY - rect.top) / rect.height;
      setSplit(Math.max(0.25, Math.min(0.8, frac)));
    };
    const onEnd = () => setDraggingSplit(false);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    return () => {
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
    };
  }, [draggingSplit]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }} ref={containerRef}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
        borderBottom: `1px solid ${T.border}`, background: T.surface, flexShrink: 0, flexWrap: "wrap"
      }}>
        <span style={{ fontSize: 16 }}>{meta.icon}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{meta.label}</span>
        <span style={{ color: T.textMuted, fontSize: 12 }}>{filtered.length} items</span>
        <span style={{ color: meta.color, fontWeight: 700, fontSize: 12 }}>{$(totalMonthly)}/mo</span>
        <div style={{ flex: 1 }} />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, width: 100, outline: "none" }}
        />
        <div style={{ display: "flex", background: T.bg, borderRadius: 6, padding: 2, border: `1px solid ${T.border}` }}>
          {[["list", "≡"], ["board", "⊞"]].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "4px 10px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: view === v ? T.surface : "transparent", color: view === v ? T.accent : T.textMuted,
              boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.1)" : "none", minHeight: 32
            }}>{label}</button>
          ))}
        </div>
        <button onClick={() => { setEditingItem(getDefaultItem(spaceId)); setSheetOpen(true); }} style={{
          background: T.accent, color: "#fff", border: "none", borderRadius: 6,
          padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, minHeight: 32
        }}>+ Add</button>
      </div>

      <div style={{ flex: split, overflow: "auto", minHeight: 80, WebkitOverflowScrolling: "touch" }}>
        {view === "list" ? (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: T.bg }}>
                {cols.map(c => (
                  <th key={c.key} style={{ padding: "8px 10px", textAlign: "left", fontSize: 11, color: T.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `2px solid ${T.border}`, whiteSpace: "nowrap" }}>{c.label}</th>
                ))}
                <th style={{ padding: "8px 10px", width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${T.border}`, background: i % 2 === 0 ? "#fff" : T.bg }}
                  onTouchStart={e => e.currentTarget.style.background = T.accentLight}
                  onTouchEnd={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : T.bg}>
                  {cols.map(c => (
                    <td key={c.key} style={{ padding: "9px 10px", color: T.textMid, verticalAlign: "middle", whiteSpace: "nowrap" }}>
                      {c.render ? c.render(r, TODAY) : r[c.key]}
                    </td>
                  ))}
                  <td style={{ padding: "4px" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => { setEditingItem({ ...r }); setSheetOpen(true); }} style={{
                        background: T.accentLight, color: T.accent, border: "none", borderRadius: 6,
                        padding: "4px 8px", fontSize: 11, fontWeight: 600, cursor: "pointer", minHeight: 28
                      }}>Edit</button>
                      <button onClick={() => setConfirmId(r.id)} style={{
                        background: T.redLight, color: T.red, border: "none", borderRadius: 6,
                        padding: "4px 8px", fontSize: 11, fontWeight: 600, cursor: "pointer", minHeight: 28
                      }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <BoardView records={filtered} spaceId={spaceId} onEdit={r => { setEditingItem({ ...r }); setSheetOpen(true); }} onDelete={id => setConfirmId(id)} />
        )}
      </div>

      <div onTouchStart={e => { e.preventDefault(); setDraggingSplit(true); }} onMouseDown={e => { e.preventDefault(); setDraggingSplit(true); }}
        style={{ height: 6, background: T.bg, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, cursor: "row-resize", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", userSelect: "none", touchAction: "none" }}>
        <div style={{ width: 40, height: 3, background: T.borderStrong, borderRadius: 99 }} />
      </div>

      <div style={{ flex: 1 - split, overflow: "auto", minHeight: 60, background: T.surface, WebkitOverflowScrolling: "touch" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderBottom: `1px solid ${T.border}`, background: T.bg, position: "sticky", top: 0, zIndex: 1 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>📅 Timeline</span>
          <span style={{ fontSize: 11, color: T.textMuted }}>May 2026 → Dec 2026</span>
        </div>
        <GanttStrip records={filtered} windowStart={new Date("2026-05-01")} days={210} rowHeight={28} compact />
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editingItem?.id && records.find(r => r.id === editingItem.id) ? "Edit Item" : "Add Item"}>
        {editingItem && <ItemForm space={spaceId} item={editingItem} onChange={setEditingItem} />}
        <button onClick={handleSave} style={{
          width: "100%", padding: "12px", borderRadius: 8, border: "none",
          background: T.accent, color: "#fff", fontWeight: 700, fontSize: 14,
          cursor: "pointer", marginTop: 8
        }}>Save</button>
      </BottomSheet>

      <ConfirmModal
        open={!!confirmId}
        title="Delete Item"
        message="Are you sure you want to delete this item? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}

function BoardView({ records, spaceId, onEdit, onDelete }) {
  const groups = {};
  records.forEach(r => {
    const key = r.status || r.type || "Other";
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });
  const colColors = {
    Low: T.orange, Worn: T.amber, OK: T.green, Good: T.green,
    Service: T.amber, Fuel: T.orange, Annual: T.red, Repair: T.red,
    Fixed: "#7950F2", Variable: T.accent
  };
  return (
    <div style={{ display: "flex", gap: 12, padding: 14, overflowX: "auto", alignItems: "flex-start", WebkitOverflowScrolling: "touch" }}>
      {Object.entries(groups).map(([key, items]) => (
        <div key={key} style={{ minWidth: 220, flex: "0 0 220px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: 99, background: colColors[key] || T.textMuted }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: T.textMid, textTransform: "uppercase", letterSpacing: "0.06em" }}>{key}</span>
            <span style={{ fontSize: 11, color: T.textMuted, marginLeft: "auto", background: T.bg, borderRadius: 99, padding: "1px 7px" }}>{items.length}</span>
          </div>
          {items.map(r => (
            <div key={r.id} style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderLeft: `3px solid ${colColors[key] || T.accent}`,
              borderRadius: 8, padding: "10px 12px", marginBottom: 8,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 4 }}>{r.name}</div>
              {r.price && <div style={{ fontSize: 11, color: T.textMuted }}>${r.price.toFixed(2)}</div>}
              {r.cost && <div style={{ fontSize: 11, color: T.amber, fontWeight: 600 }}>${r.cost.toFixed(2)}</div>}
              {r.amount && <div style={{ fontSize: 11, color: "#7950F2", fontWeight: 600 }}>${r.amount.toFixed(2)}</div>}
              {r.ends && <div style={{ fontSize: 10, color: daysTo(r.ends, new Date("2026-06-17")) < 7 ? T.orange : T.textMuted, marginTop: 3 }}>→ {r.ends}</div>}
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <button onClick={() => onEdit(r)} style={{ flex: 1, background: T.accentLight, color: T.accent, border: "none", borderRadius: 6, padding: "4px 0", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Edit</button>
                <button onClick={() => onDelete(r.id)} style={{ flex: 1, background: T.redLight, color: T.red, border: "none", borderRadius: 6, padding: "4px 0", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
