import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { BottomSheet } from "../components/BottomSheet";
import { ConfirmModal } from "../components/ConfirmModal";
import { GanttStrip } from "../components/GanttStrip";
import { t, isRTL } from "../utils/i18n";

function fmt(n, currency) { return `${currency}${(n || 0).toFixed(2)}`; }
function daysBetween(a, b) { 
  if (!a || !b) return 0;
  const ms = new Date(b) - new Date(a); 
  return Math.max(0, Math.round(ms / 86400000)); 
}
function addDays(d, n) { 
  if (!d) return "";
  const x = new Date(d); 
  x.setDate(x.getDate() + n); 
  return x.toISOString().slice(0,10); 
}

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
  const [linkSearch, setLinkSearch] = useState("");
  const rtl = isRTL();

  const filtered = useMemo(() => {
    let list = state.expenses;
    if (filterTag !== "all") list = list.filter(e => e.tag === filterTag);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q) || (e.status || "").toLowerCase().includes(q));
    }
    return list.sort((a, b) => {
      // Sort by endDate (nulls last), then by name
      if (a.endDate && b.endDate) return new Date(a.endDate) - new Date(b.endDate);
      if (a.endDate && !b.endDate) return -1;
      if (!a.endDate && b.endDate) return 1;
      return a.name.localeCompare(b.name);
    });
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
      hasEndDate: true,
    });
    setSheetOpen(true);
    setLinkSearch("");
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

  // Search invoices for linking (top 20 similar)
  const filteredInvoices = useMemo(() => {
    if (!linkSearch.trim() || !editingItem) return [];
    const q = linkSearch.toLowerCase();
    return state.invoices
      .filter(i => (i.name || i.generatedName || "").toLowerCase().includes(q))
      .slice(0, 20);
  }, [linkSearch, state.invoices, editingItem]);

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{t("expenses")}</h1>
        <button onClick={openNew} style={{
          background: "#3B5BDB", color: "#fff", border: "none", borderRadius: 12,
          padding: "10px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer", lineHeight: 1
        }}>+ {t("add")}</button>
      </div>

      {/* Tag filters */}
      <div style={{
        display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 12,
        scrollbarWidth: "none", msOverflowStyle: "none"
      }}>
        <button onClick={() => setFilterTag("all")} style={{
          flexShrink: 0, padding: "8px 16px", borderRadius: 20, border: "1px solid #333",
          background: filterTag === "all" ? "#fff" : "#1a1a1a",
          color: filterTag === "all" ? "#000" : "#fff",
          fontSize: 13, fontWeight: 600, cursor: "pointer", lineHeight: 1.2
        }}>{t("all")}</button>
        {state.tags.map(tag => (
          <button key={tag.id} onClick={() => setFilterTag(tag.id)} style={{
            flexShrink: 0, padding: "8px 16px", borderRadius: 20, border: "1px solid #333",
            background: filterTag === tag.id ? tag.color : "#1a1a1a",
            color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
            lineHeight: 1.2, maxWidth: 120, overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap"
          }}>{rtl ? tag.nameAr : tag.name}</button>
        ))}
        <button onClick={() => setTagSheetOpen(true)} style={{
          flexShrink: 0, padding: "8px 16px", borderRadius: 20, border: "1px dashed #555",
          background: "transparent", color: "#888", fontSize: 13, fontWeight: 600,
          cursor: "pointer", lineHeight: 1.2, whiteSpace: "nowrap"
        }}>+ {t("newTag")}</button>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={t("search")}
        style={{
          width: "100%", padding: "12px 16px", borderRadius: 14, border: "1px solid #222",
          background: "#1a1a1a", color: "#fff", fontSize: 15, outline: "none",
          marginBottom: 16, boxSizing: "border-box"
        }}
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {["list", "board"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            flex: 1, padding: "10px", borderRadius: 12, border: "1px solid #222",
            background: view === v ? "#333" : "#0F0F0F",
            color: view === v ? "#fff" : "#888",
            fontSize: 13, fontWeight: 600, cursor: "pointer", lineHeight: 1
          }}>{t(v)}</button>
        ))}
      </div>

      {view === "list" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(r => {
            const tag = tagMeta(r.tag);
            const d = r.endDate ? daysBetween(TODAY, r.endDate) : null;
            return (
              <div
                key={r.id}
                onClick={() => { setEditingItem({ ...r }); setSheetOpen(true); setLinkSearch(""); }}
                style={{
                  background: "#1a1a1a", border: "1px solid #222", borderRadius: 16,
                  padding: 16, display: "flex", alignItems: "center", gap: 14, cursor: "pointer"
                }}
              >
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: tag.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                    {rtl ? tag.nameAr : tag.name} · {r.status || "-"}
                    {r.invoiceId && <span style={{ color: "#3B5BDB", marginLeft: 6 }}>📎</span>}
                  </div>
                </div>
                <div style={{ textAlign: "end", flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{fmt(r.amount, currency)}</div>
                  <div style={{ fontSize: 12, color: d !== null && d <= 7 ? "#FF6B35" : "#888", marginTop: 2 }}>
                    {r.endDate || t("noEndDate")}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{ textAlign: "center", color: "#555", padding: 40, fontSize: 14 }}>{t("noExpenses")}</div>}
        </div>
      ) : (
        <BoardView records={filtered} currency={currency} onEdit={r => { setEditingItem({ ...r }); setSheetOpen(true); }} onDelete={id => setConfirmId(id)} tagMeta={tagMeta} />
      )}

      {/* Timeline - only show items WITH endDate */}
      <div style={{ marginTop: 24, marginBottom: 80 }}>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 10, fontWeight: 600 }}>{t("timeline")}</div>
        <GanttStrip records={filtered.filter(e => e.endDate)} compact />
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editingItem?.id && state.expenses.find(e => e.id === editingItem.id) ? t("edit") : t("add")}>
        {editingItem && <ExpenseForm
          item={editingItem}
          tags={state.tags}
          parents={state.parents}
          invoices={state.invoices}
          currency={currency}
          linkSearch={linkSearch}
          setLinkSearch={setLinkSearch}
          filteredInvoices={filteredInvoices}
          onChange={setEditingItem}
          onSave={() => handleSave(editingItem)}
          onCancel={() => setSheetOpen(false)}
          showToast={showToast}
        />}
      </BottomSheet>

      <BottomSheet open={tagSheetOpen} onClose={() => setTagSheetOpen(false)} title={t("newTag")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "4px 0" }}>
          <input value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder={t("tagName")} style={{ padding: 14, borderRadius: 14, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 15 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "#888", fontSize: 14 }}>{t("color")}</span>
            <input value={newTagColor} onChange={e => setNewTagColor(e.target.value)} type="color" style={{ width: 60, height: 44, borderRadius: 10, border: "none", background: "none" }} />
          </div>
          <button onClick={() => {
            if (!newTagName.trim()) return;
            const id = "tag_" + Date.now();
            state.dispatch({ type: "ADD_TAG", tag: { id, name: newTagName, nameAr: newTagName, color: newTagColor, statuses: [] } });
            setNewTagName(""); setTagSheetOpen(false); showToast("Tag added", "success");
          }} style={{ padding: 14, borderRadius: 14, border: "none", background: "#3B5BDB", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>{t("save")}</button>
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
    <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
      {Object.entries(groups).map(([key, items]) => (
        <div key={key} style={{ minWidth: 240, background: "#1a1a1a", borderRadius: 16, border: "1px solid #222", padding: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#ccc" }}>{key} <span style={{ color: "#666" }}>({items.length})</span></div>
          {items.map(r => (
            <div key={r.id} style={{ background: "#0F0F0F", borderRadius: 12, padding: 12, marginBottom: 10, cursor: "pointer", border: "1px solid #1a1a1a" }} onClick={() => onEdit(r)}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{fmt(r.amount, currency)} · {r.endDate || "No end"}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={e => { e.stopPropagation(); onDelete(r.id); }} style={{ fontSize: 12, color: "#E03131", background: "none", border: "none", padding: 0, cursor: "pointer" }}>{t("delete")}</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ExpenseForm({ item, tags, parents, invoices, currency, linkSearch, setLinkSearch, filteredInvoices, onChange, onSave, onCancel, showToast }) {
  const tag = tags.find(t => t.id === item.tag) || tags[0];
  const statuses = tag?.statuses || [];

  const updateField = (field, value) => {
    let next = { ...item, [field]: value };
    if (field === "hasEndDate" && !value) {
      next.endDate = null;
      next.days = 0;
    } else if (field === "hasEndDate" && value && !next.endDate) {
      next.endDate = new Date().toISOString().slice(0,10);
      next.days = 0;
    }
    if ((field === "startDate" || field === "days") && next.hasEndDate !== false) {
      if (next.startDate && next.days !== undefined) {
        next.endDate = addDays(next.startDate, parseInt(next.days || 0));
      }
    } else if (field === "endDate" && next.hasEndDate !== false) {
      if (next.startDate && next.endDate) {
        next.days = daysBetween(next.startDate, next.endDate);
      }
    }
    onChange(next);
  };

  const linkedInvoice = invoices.find(i => i.id === item.invoiceId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "4px 0" }}>
      <label style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{t("name")}</label>
      <input value={item.name} onChange={e => updateField("name", e.target.value)} placeholder={t("name")} style={{ padding: 14, borderRadius: 14, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 15 }} />

      <label style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{t("tag")}</label>
      <select value={item.tag} onChange={e => updateField("tag", e.target.value)} style={{ padding: 14, borderRadius: 14, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 15 }}>
        {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      <label style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{t("amount")} ({currency})</label>
      <input value={item.amount} onChange={e => updateField("amount", parseFloat(e.target.value) || 0)} type="number" step="0.01" style={{ padding: 14, borderRadius: 14, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 15 }} />

      <label style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{t("monthly")} ({currency})</label>
      <input value={item.monthly || 0} onChange={e => updateField("monthly", parseFloat(e.target.value) || 0)} type="number" step="0.01" style={{ padding: 14, borderRadius: 14, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 15 }} />

      {/* Has End Date Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 0" }}>
        <input
          type="checkbox"
          id="hasEndDate"
          checked={item.hasEndDate !== false}
          onChange={e => updateField("hasEndDate", e.target.checked)}
          style={{ width: 20, height: 20, accentColor: "#3B5BDB" }}
        />
        <label htmlFor="hasEndDate" style={{ fontSize: 14, color: "#ccc", cursor: "pointer" }}>{t("includeInTimeline")}</label>
      </div>

      {item.hasEndDate !== false && (
        <>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{t("startDate")}</label>
              <input value={item.startDate || ""} onChange={e => updateField("startDate", e.target.value)} type="date" style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 15, boxSizing: "border-box" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{t("days")}</label>
              <input value={item.days || 0} onChange={e => updateField("days", parseInt(e.target.value) || 0)} type="number" style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 15, boxSizing: "border-box" }} />
            </div>
          </div>

          <label style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{t("endDate")}</label>
          <input value={item.endDate || ""} onChange={e => updateField("endDate", e.target.value)} type="date" style={{ padding: 14, borderRadius: 14, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 15 }} />
        </>
      )}

      {statuses.length > 0 && (
        <>
          <label style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{t("status")}</label>
          <select value={item.status || ""} onChange={e => updateField("status", e.target.value)} style={{ padding: 14, borderRadius: 14, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 15 }}>
            <option value="">-</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </>
      )}

      <label style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{t("linkToParent")}</label>
      <select value={item.parentId || ""} onChange={e => updateField("parentId", e.target.value || null)} style={{ padding: 14, borderRadius: 14, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 15 }}>
        <option value="">-</option>
        {parents.map(p => <option key={p.id} value={p.id}>{p.name} ({p.number})</option>)}
      </select>

      {/* Link to Invoice */}
      <div>
        <label style={{ fontSize: 13, color: "#888", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("linkToInvoice")}</label>
        {linkedInvoice ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 14px", background: "#1a1a1a", borderRadius: 12,
            border: "1px solid #333"
          }}>
            <span style={{ fontSize: 14 }}>📎 {linkedInvoice.name || linkedInvoice.generatedName}</span>
            <button onClick={() => updateField("invoiceId", null)} style={{
              background: "none", border: "none", color: "#E03131",
              fontSize: 12, cursor: "pointer", fontWeight: 600
            }}>✕ {t("remove")}</button>
          </div>
        ) : (
          <>
            <input
              value={linkSearch}
              onChange={e => setLinkSearch(e.target.value)}
              placeholder={t("searchInvoice")}
              style={{
                padding: 12, borderRadius: 12, border: "1px solid #333",
                background: "#0F0F0F", color: "#fff", fontSize: 14,
                width: "100%", boxSizing: "border-box"
              }}
            />
            {filteredInvoices.length > 0 && (
              <div style={{
                background: "#1a1a1a", borderRadius: 12, border: "1px solid #333",
                marginTop: 6, maxHeight: 200, overflowY: "auto"
              }}>
                {filteredInvoices.map(inv => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      updateField("invoiceId", inv.id);
                      setLinkSearch("");
                      showToast(`Linked to ${inv.name || inv.generatedName}`, "success");
                    }}
                    style={{
                      padding: "10px 14px", cursor: "pointer",
                      borderBottom: "1px solid #222", fontSize: 13
                    }}
                  >
                    {inv.name || inv.generatedName}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button onClick={onSave} style={{ flex: 1, padding: 16, borderRadius: 14, border: "none", background: "#3B5BDB", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>{t("save")}</button>
        <button onClick={onCancel} style={{ flex: 1, padding: 16, borderRadius: 14, border: "1px solid #333", background: "transparent", color: "#888", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>{t("cancel")}</button>
      </div>
    </div>
  );
}
