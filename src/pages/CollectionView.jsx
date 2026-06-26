import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { GanttStrip } from "../components/GanttStrip.jsx";
import { BottomSheet } from "../components/BottomSheet.jsx";
import { ConfirmModal } from "../components/ConfirmModal.jsx";

const $ = (n, c) => `${c || "$"}${Number(n).toFixed(2)}`;
const daysTo = (s, today) => Math.round((new Date(s) - today) / 86400000);
const uid = () => Math.random().toString(36).slice(2, 10);

const SPACE_META = {
  consumables: { label: "Consumables", icon: "🧴", color: "#3B5BDB", hasPrice: true, hasMonthly: true, hasStatus: true, dateLabel: "Bought", endLabel: "Runs out" },
  durables:    { label: "Durables",    icon: "👟", color: "#2F9E44", hasPrice: true, hasMonthly: true, hasStatus: true, dateLabel: "Bought", endLabel: "Replace by" },
  car:         { label: "Car",         icon: "🚗", color: "#E67700", hasCost: true, hasType: true, dateLabel: "Date", endLabel: "Due / Ends" },
  finances:    { label: "Finances",    icon: "💰", color: "#7950F2", hasAmount: true, hasType: true, dateLabel: "Date", endLabel: "Next due" },
};

const STATUS_COLORS = {
  Low: "#FF6B35", Worn: "#E67700", OK: "#2F9E44", Good: "#2F9E44", Stocked: "#3B5BDB",
  Damaged: "#E03131", Retired: "#888",
  Service: "#E67700", Fuel: "#FF6B35", Annual: "#E03131", Repair: "#E67700",
  Cleaning: "#3B5BDB", Parking: "#E67700", Toll: "#7950F2", Fine: "#E03131",
  Fixed: "#7950F2", Variable: "#3B5BDB", Subscription: "#7950F2", "One-time": "#3B5BDB",
  Investment: "#2F9E44", Savings: "#3B5BDB"
};

function getDefaultItem(space) {
  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  switch (space) {
    case "consumables": return { id: uid(), name: "", price: 0, bought: today, duration: 30, ends: nextMonth, monthly: 0, status: "OK" };
    case "durables":    return { id: uid(), name: "", price: 0, bought: today, ends: nextMonth, monthly: 0, status: "Good" };
    case "car":         return { id: uid(), name: "", date: today, ends: nextMonth, cost: 0, type: "Service" };
    case "finances":    return { id: uid(), name: "", amount: 0, date: today, ends: nextMonth, type: "Fixed" };
    default: return { id: uid(), name: "" };
  }
}

function Input({ label, value, onChange, type = "text", placeholder = "", step, min }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, color: "#666", fontWeight: 700, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      <input
        type={type}
        step={step}
        min={min}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #333",
          fontSize: 14, background: "#0F0F0F", color: "#fff", outline: "none",
          transition: "border-color 0.2s", fontFamily: "inherit"
        }}
        onFocus={e => e.target.style.borderColor = "#3B5BDB"}
        onBlur={e => e.target.style.borderColor = "#333"}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, color: "#666", fontWeight: 700, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={onChange}
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #333",
            fontSize: 14, background: "#0F0F0F", color: "#fff", outline: "none",
            appearance: "none", fontFamily: "inherit"
          }}
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#666", fontSize: 10, pointerEvents: "none" }}>▼</span>
      </div>
    </div>
  );
}

function ItemForm({ space, item, onChange, categories, onAddCategory }) {
  const meta = SPACE_META[space];
  const [newCat, setNewCat] = useState("");
  const cats = categories[space] || [];

  return (
    <div>
      <Input label="Name" value={item.name} onChange={e => onChange({ ...item, name: e.target.value })} placeholder={`e.g. ${space === "consumables" ? "Shampoo" : space === "car" ? "Oil Change" : "Rent"}`} />

      {meta.hasPrice && (
        <>
          <Input label="Price" value={item.price || ""} onChange={e => onChange({ ...item, price: parseFloat(e.target.value) || 0 })} type="number" step="0.01" />
          <Input label="Monthly Cost" value={item.monthly || ""} onChange={e => onChange({ ...item, monthly: parseFloat(e.target.value) || 0 })} type="number" step="0.01" />
        </>
      )}

      {meta.hasCost && (
        <Input label="Cost" value={item.cost || ""} onChange={e => onChange({ ...item, cost: parseFloat(e.target.value) || 0 })} type="number" step="0.01" />
      )}

      {meta.hasAmount && (
        <Input label="Amount" value={item.amount || ""} onChange={e => onChange({ ...item, amount: parseFloat(e.target.value) || 0 })} type="number" step="0.01" />
      )}

      <Input label={meta.dateLabel} value={item.date || item.bought || ""} onChange={e => {
        const val = e.target.value;
        if (item.bought !== undefined) onChange({ ...item, bought: val });
        else onChange({ ...item, date: val });
      }} type="date" />

      <Input label={meta.endLabel} value={item.ends} onChange={e => onChange({ ...item, ends: e.target.value })} type="date" />

      {(meta.hasStatus || meta.hasType) && (
        <>
          <Select
            label={meta.hasStatus ? "Status" : "Type"}
            value={item.status || item.type || ""}
            onChange={e => {
              if (meta.hasStatus) onChange({ ...item, status: e.target.value });
              else onChange({ ...item, type: e.target.value });
            }}
            options={cats}
          />
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input
              type="text"
              placeholder="New category..."
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 13, outline: "none" }}
            />
            <button
              onClick={() => { if (newCat.trim()) { onAddCategory(newCat.trim()); setNewCat(""); } }}
              style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "#3B5BDB", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >+ Add</button>
          </div>
        </>
      )}
    </div>
  );
}

export default function CollectionView({ spaceId }) {
  const { state, addItem, updateItem, deleteItem, addCategory, removeCategory, currency, TODAY, showToast } = useApp();
  const records = state[spaceId] || [];
  const meta = SPACE_META[spaceId];
  const categories = state.categories || {};

  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [catSheetOpen, setCatSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [split, setSplit] = useState(0.55);
  const [draggingSplit, setDraggingSplit] = useState(false);
  const containerRef = useRef(null);

  const filtered = records.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
  const totalMonthly = records.reduce((s, r) => s + (r.monthly || r.amount || r.cost || 0), 0);

  const handleSave = () => {
    if (!editingItem?.name.trim()) { showToast("Name is required", "warning"); return; }
    if (records.find(r => r.id === editingItem.id)) updateItem(spaceId, editingItem);
    else addItem(spaceId, editingItem);
    showToast(records.find(r => r.id === editingItem.id) ? "Updated!" : "Added!", "success");
    setSheetOpen(false);
    setEditingItem(null);
  };

  useEffect(() => {
    const onMove = e => {
      if (!draggingSplit || !containerRef.current) return;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const rect = containerRef.current.getBoundingClientRect();
      setSplit(Math.max(0.25, Math.min(0.8, (clientY - rect.top) / rect.height)));
    };
    const onEnd = () => setDraggingSplit(false);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    return () => { window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onEnd); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onEnd); };
  }, [draggingSplit]);

  const getStatusColor = (val) => STATUS_COLORS[val] || "#666";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }} ref={containerRef}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid #222", background: "#0F0F0F", flexShrink: 0, flexWrap: "wrap" }}>
        <span style={{ fontSize: 20 }}>{meta.icon}</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{meta.label}</div>
          <div style={{ fontSize: 11, color: "#555" }}>{filtered.length} items · {$(totalMonthly, currency)}/mo</div>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => setCatSheetOpen(true)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #333", background: "#1a1a1a", color: "#888", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>🏷️ Tags</button>
        <button onClick={() => { setEditingItem(getDefaultItem(spaceId)); setSheetOpen(true); }} style={{
          background: meta.color, color: "#fff", border: "none", borderRadius: 10,
          padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, minHeight: 36
        }}>+ Add</button>
      </div>

      <div style={{ padding: "8px 16px", background: "#0F0F0F", borderBottom: "1px solid #222" }}>
        <input type="text" placeholder="🔍 Search items..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #222", background: "#1a1a1a", color: "#fff", fontSize: 14, outline: "none" }} />
      </div>

      <div style={{ display: "flex", background: "#0F0F0F", borderBottom: "1px solid #222" }}>
        {["list", "board"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            flex: 1, padding: "10px", border: "none", borderBottom: view === v ? `2px solid ${meta.color}` : "2px solid transparent",
            background: "transparent", color: view === v ? meta.color : "#555", fontWeight: view === v ? 700 : 500,
            fontSize: 13, cursor: "pointer", textTransform: "capitalize"
          }}>{v}</button>
        ))}
      </div>

      <div style={{ flex: split, overflow: "auto", minHeight: 80, WebkitOverflowScrolling: "touch" }}>
        {view === "list" ? (
          <div style={{ padding: 8 }}>
            {filtered.map(r => (
              <div key={r.id} style={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: 14, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${getStatusColor(r.status || r.type)}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {meta.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "#555", display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ color: meta.color, fontWeight: 700 }}>{$(r.monthly || r.amount || r.cost || r.price || 0, currency)}</span>
                    <span style={{ background: `${getStatusColor(r.status || r.type)}22`, color: getStatusColor(r.status || r.type), padding: "1px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{r.status || r.type}</span>
                    <span>{r.ends}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => { setEditingItem({ ...r }); setSheetOpen(true); }} style={{ padding: "6px 12px", borderRadius: 8, background: "#2a2a2a", color: "#aaa", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Edit</button>
                  <button onClick={() => setConfirmId(r.id)} style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(224,49,49,0.15)", color: "#E03131", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Del</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <BoardView records={filtered} spaceId={spaceId} meta={meta} currency={currency} onEdit={r => { setEditingItem({ ...r }); setSheetOpen(true); }} onDelete={id => setConfirmId(id)} />
        )}
      </div>

      <div onTouchStart={e => { e.preventDefault(); setDraggingSplit(true); }} onMouseDown={e => { e.preventDefault(); setDraggingSplit(true); }}
        style={{ height: 6, background: "#1a1a1a", borderTop: "1px solid #222", borderBottom: "1px solid #222", cursor: "row-resize", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 3, background: "#333", borderRadius: 99 }} />
      </div>

      <div style={{ flex: 1 - split, overflow: "auto", minHeight: 60, background: "#0F0F0F", WebkitOverflowScrolling: "touch" }}>
        <div style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>📅 Timeline · May → Dec 2026</div>
        <GanttStrip records={filtered} windowStart={new Date("2026-05-01")} days={210} rowHeight={28} compact />
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editingItem?.id && records.find(r => r.id === editingItem.id) ? "Edit Item" : `New ${meta.label.slice(0, -1)}`}>
        {editingItem && <ItemForm space={spaceId} item={editingItem} onChange={setEditingItem} categories={categories} onAddCategory={(cat) => addCategory(spaceId, cat)} />}
        <button onClick={handleSave} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: meta.color, color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", marginTop: 4 }}>Save</button>
      </BottomSheet>

      <BottomSheet open={catSheetOpen} onClose={() => setCatSheetOpen(false)} title="Manage Categories" maxHeight="70vh">
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Current categories for {meta.label}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(categories[spaceId] || []).map(cat => (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "#222", borderRadius: 10, border: "1px solid #333" }}>
                <span style={{ fontSize: 13, color: "#ccc" }}>{cat}</span>
                <button onClick={() => removeCategory(spaceId, cat)} style={{ color: "#E03131", fontSize: 16, fontWeight: 700, cursor: "pointer", background: "none", border: "none", padding: 0, minHeight: 0, minWidth: 0 }}>×</button>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>

      <ConfirmModal open={!!confirmId} title="Delete Item?" message="This will permanently remove this item." onConfirm={() => { deleteItem(spaceId, confirmId); showToast("Deleted", "info"); setConfirmId(null); }} onCancel={() => setConfirmId(null)} />
    </div>
  );
}

function BoardView({ records, spaceId, meta, currency, onEdit, onDelete }) {
  const groups = {};
  records.forEach(r => { const k = r.status || r.type || "Other"; if (!groups[k]) groups[k] = []; groups[k].push(r); });
  return (
    <div style={{ display: "flex", gap: 12, padding: 14, overflowX: "auto", alignItems: "flex-start", WebkitOverflowScrolling: "touch" }}>
      {Object.entries(groups).map(([key, items]) => (
        <div key={key} style={{ minWidth: 260, flex: "0 0 260px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, padding: "0 4px" }}>
            <div style={{ width: 8, height: 8, borderRadius: 99, background: STATUS_COLORS[key] || "#666" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em" }}>{key}</span>
            <span style={{ fontSize: 11, color: "#555", marginLeft: "auto", background: "#222", borderRadius: 99, padding: "2px 8px" }}>{items.length}</span>
          </div>
          {items.map(r => (
            <div key={r.id} style={{ background: "#1a1a1a", border: "1px solid #222", borderLeft: `3px solid ${STATUS_COLORS[key] || meta.color}`, borderRadius: 12, padding: "14px", marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 6 }}>{r.name}</div>
              <div style={{ fontSize: 12, color: meta.color, fontWeight: 700, marginBottom: 4 }}>{$(r.monthly || r.amount || r.cost || r.price || 0, currency)}</div>
              <div style={{ fontSize: 11, color: "#555" }}>→ {r.ends}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={() => onEdit(r)} style={{ flex: 1, padding: "8px", borderRadius: 8, background: "#2a2a2a", color: "#aaa", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none" }}>Edit</button>
                <button onClick={() => onDelete(r.id)} style={{ flex: 1, padding: "8px", borderRadius: 8, background: "rgba(224,49,49,0.15)", color: "#E03131", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
