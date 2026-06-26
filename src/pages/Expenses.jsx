import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { BottomSheet } from "../components/BottomSheet";
import { ConfirmModal } from "../components/ConfirmModal";
import { GanttStrip } from "../components/GanttStrip";
import { t, isRTL } from "../utils/i18n";

function fmt(n, currency) { return `${currency}${(n || 0).toFixed(2)}`; }
function daysBetween(a, b) { const ms = new Date(b) - new Date(a); return Math.max(0, Math.round(ms / 86400000)); }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0,10); }

export default function Expenses() {
  const { state, addExpense, updateExpense, deleteExpense, showToast, currency, TODAY } = useApp();
  const [filterTag, setFilterTag] = useState("all");
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [tagSheetOpen, setTagSheetOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B5BDB");
  const rtl = isRTL();

  const filtered = useMemo(() => {
    let list = state.expenses;
    if (filterTag !== "all") list = list.filter(e => e.tag === filterTag);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q) || (e.status || "").toLowerCase().includes(q));
    }
    return list.sort((a, b) => new Date(a.endDate || 0) - new Date(b.endDate || 0));
  }, [state.expenses, filterTag, search]);

  const tagMeta = (id) => state.tags.find(t => t.id === id) || { name: id, nameAr: id, color: "#888" };

  const openNew = () => {
    setEditingItem({
      id: "e_" + Date.now(),
      name: "",
      tag: filterTag !== "all" ? filterTag : (state.tags[0]?.id || "consumables"),
      amount: 0,
      startDate: TODAY.toISOString().slice(0,10),
      days: 30,
      endDate: addDays(TODAY, 30),
      monthly: 0,
      status: "",
      parentId: null,
      invoiceId: null,
    });
    setSheetOpen(true);
  };

  const handleSave = (item) => {
    if (!item.name.trim()) { showToast("Name required", "error"); return; }
    const exists = state.expenses.find(e => e.id === item.id);
    if (exists) updateExpense(item);
    else addExpense(item);
    showToast("Saved", "success");
    setSheetOpen(false);
    setEditingItem(null);
  };

  const tagTotals = useMemo(() => {
    const totals = {};
    state.tags.forEach(t => {
      totals[t.id] = state.expenses.filter(e => e.tag === t.id).reduce((s, e) => s + (e.monthly || 0), 0);
    });
    return totals;
  }, [state.expenses, state.tags]);

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{t("expenses")}</h1>
        <button onClick={openNew} style={{ background: "#3B5BDB", color: "#fff", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ {t("add")}</button>
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 8 }}>
        <button onClick={() => setFilterTag("all")} style={{ whiteSpace: "nowrap", padding: "6px 12px", borderRadius: 20, border: "1px solid #333", background: filterTag === "all" ? "#fff" : "#1a1a1a", color: filterTag === "all" ? "#000" : "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          {t("all")}
        </button>
        {state.tags.map(tag => (
          <button key={tag.id} onClick={() => setFilterTag(tag.id)} style={{ whiteSpace: "nowrap", padding: "6px 12px", borderRadius: 20, border: "1px solid #333", background: filterTag === tag.id ? tag.color : "#1a1a1a", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {rtl ? tag.nameAr : tag.name} {tagTotals[tag.id] > 0 ? fmt(tagTotals[tag.id], currency) : ""}
          </button>
        ))}
        <button onClick={() => setTagSheetOpen(true)} style={{ whiteSpace: "nowrap", padding: "6px 12px", borderRadius: 20, border: "1px dashed #555", background: "transparent", color: "#888", fontSize: 12, cursor: "pointer" }}>+ {t("newTag")}</button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("search")} style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #222", background: "#1a1a1a", color: "#fff", fontSize: 14, outline: "none", marginBottom: 12 }} />

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {["list", "board"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{ flex: 1, padding: 8, borderRadius: 10, border: "1px solid #222", background: view === v ? "#333" : "#0F0F0F", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{t(v)}</button>
        ))}
      </div>

      {view === "list" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(r => {
            const tag = tagMeta(r.tag);
            const d = daysBetween(TODAY, r.endDate);
            return (
              <div key={r.id} onClick={() => { setEditingItem({ ...r }); setSheetOpen(true); }} style={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: tag.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{rtl ? tag.nameAr : tag.name} · {r.status || "-"}</div>
                </div>
                <div style={{ textAlign: "end", flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{fmt(r.amount, currency)}</div>
                  <div style={{ fontSize: 11, color: d <= 7 ? "#FF6B35" : "#888" }}>{r.endDate}</div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{ textAlign: "center", color: "#555", padding: 40, fontSize: 13 }}>{t("noExpenses")}</div>}
        </div>
      ) : (
        <BoardView records={filtered} currency={currency} onEdit={r => { setEditingItem({ ...r }); setSheetOpen(true); }} onDelete={id => setConfirmId(id)} tagMeta={tagMeta} />
      )}

      <div style={{ marginTop: 20, marginBottom: 80 }}>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>{t("timeline")}</div>
        <GanttStrip records={filtered.filter(e => e.endDate)} compact />
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editingItem?.id && state.expenses.find(e => e.id === editingItem.id) ? t("edit") : t("add")}>
        {editingItem && <ExpenseForm item={editingItem} tags={state.tags} parents={state.parents} currency={currency} onChange={setEditingItem} onSave={() => handleSave(editingItem)} onCancel={() => setSheetOpen(false)} />}
      </BottomSheet>

      <BottomSheet open={tagSheetOpen} onClose={() => setTagSheetOpen(false)} title={t("newTag")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "4px 0" }}>
          <input value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder={t("tagName")} style={{ padding: 12, borderRadius: 12, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 14 }} />
          <input value={newTagColor} onChange={e => setNewTagColor(e.target.value)} type="color" style={{ width: "100%", height: 44, borderRadius: 12, border: "none", background: "none" }} />
          <button onClick={() => {
            if (!newTagName.trim()) return;
            const id = "tag_" + Date.now();
            state.dispatch({ type: "ADD_TAG", tag: { id, name: newTagName, nameAr: newTagName, color: newTagColor, statuses: [] } });
            setNewTagName(""); setTagSheetOpen(false); showToast("Tag added", "success");
          }} style={{ padding: 12, borderRadius: 12, border: "none", background: "#3B5BDB", color: "#fff", fontWeight: 700, cursor: "pointer" }}>{t("save")}</button>
        </div>
      </BottomSheet>

      <ConfirmModal open={!!confirmId} title={t("delete")} message={t("deleteConfirm")} onConfirm={() => { deleteExpense(confirmId); setConfirmId(null); showToast("Deleted", "info"); }} onCancel={() => setConfirmId(null)} />
    </div>
  );
}

function BoardView({ records, currency, onEdit, onDelete, tagMeta }) {
  const groups = {};
  records.forEach(r => { const k = r.status || "Other"; if (!groups[k]) groups[k] = []; groups[k].push(r); });
  return (
    <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
      {Object.entries(groups).map(([key, items]) => (
        <div key={key} style={{ minWidth: 220, background: "#1a1a1a", borderRadius: 16, border: "1px solid #222", padding: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: "#ccc" }}>{key} <span style={{ color: "#666" }}>({items.length})</span></div>
          {items.map(r => (
            <div key={r.id} style={{ background: "#0F0F0F", borderRadius: 10, padding: 10, marginBottom: 8, cursor: "pointer" }} onClick={() => onEdit(r)}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{fmt(r.amount, currency)} · {r.endDate}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <button onClick={e => { e.stopPropagation(); onDelete(r.id); }} style={{ fontSize: 11, color: "#E03131", background: "none", border: "none", padding: 0, cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ExpenseForm({ item, tags, parents, currency, onChange, onSave, onCancel }) {
  const tag = tags.find(t => t.id === item.tag) || tags[0];
  const statuses = tag?.statuses || [];

  const updateField = (field, value) => {
    let next = { ...item, [field]: value };
    if (field === "startDate" || field === "days") {
      next.endDate = addDays(next.startDate, parseInt(next.days || 0));
    } else if (field === "endDate") {
      next.days = daysBetween(next.startDate, next.endDate);
    }
    onChange(next);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "4px 0" }}>
      <label style={{ fontSize: 12, color: "#888" }}>{t("name")}</label>
      <input value={item.name} onChange={e => updateField("name", e.target.value)} placeholder={t("name")} style={{ padding: 12, borderRadius: 12, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 14 }} />

      <label style={{ fontSize: 12, color: "#888" }}>{t("tag")}</label>
      <select value={item.tag} onChange={e => updateField("tag", e.target.value)} style={{ padding: 12, borderRadius: 12, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 14 }}>
        {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      <label style={{ fontSize: 12, color: "#888" }}>{t("amount")} ({currency})</label>
      <input value={item.amount} onChange={e => updateField("amount", parseFloat(e.target.value) || 0)} type="number" step="0.01" style={{ padding: 12, borderRadius: 12, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 14 }} />

      <label style={{ fontSize: 12, color: "#888" }}>{t("monthly")} ({currency})</label>
      <input value={item.monthly || 0} onChange={e => updateField("monthly", parseFloat(e.target.value) || 0)} type="number" step="0.01" style={{ padding: 12, borderRadius: 12, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 14 }} />

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, color: "#888" }}>{t("startDate")}</label>
          <input value={item.startDate} onChange={e => updateField("startDate", e.target.value)} type="date" style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 14 }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, color: "#888" }}>{t("days")}</label>
          <input value={item.days} onChange={e => updateField("days", parseInt(e.target.value) || 0)} type="number" style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 14 }} />
        </div>
      </div>

      <label style={{ fontSize: 12, color: "#888" }}>{t("endDate")}</label>
      <input value={item.endDate} onChange={e => updateField("endDate", e.target.value)} type="date" style={{ padding: 12, borderRadius: 12, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 14 }} />

      {statuses.length > 0 && (
        <>
          <label style={{ fontSize: 12, color: "#888" }}>{t("status")}</label>
          <select value={item.status || ""} onChange={e => updateField("status", e.target.value)} style={{ padding: 12, borderRadius: 12, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 14 }}>
            <option value="">-</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </>
      )}

      <label style={{ fontSize: 12, color: "#888" }}>{t("linkToParent")}</label>
      <select value={item.parentId || ""} onChange={e => updateField("parentId", e.target.value || null)} style={{ padding: 12, borderRadius: 12, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 14 }}>
        <option value="">-</option>
        {parents.map(p => <option key={p.id} value={p.id}>{p.name} ({p.number})</option>)}
      </select>

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button onClick={onSave} style={{ flex: 1, padding: 14, borderRadius: 12, border: "none", background: "#3B5BDB", color: "#fff", fontWeight: 700, cursor: "pointer" }}>{t("save")}</button>
        <button onClick={onCancel} style={{ flex: 1, padding: 14, borderRadius: 12, border: "1px solid #333", background: "transparent", color: "#888", fontWeight: 700, cursor: "pointer" }}>{t("cancel")}</button>
      </div>
    </div>
  );
}
