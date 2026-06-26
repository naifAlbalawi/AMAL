import { useState } from "react";
import { useApp } from "../context/AppContext";
import { BottomSheet } from "../components/BottomSheet";
import { ConfirmModal } from "../components/ConfirmModal";
import { t, isRTL } from "../utils/i18n";

function fmt(n, currency) { return `${currency}${(n || 0).toFixed(2)}`; }

export default function Parents() {
  const { state, addParent, updateParent, deleteParent, showToast, currency } = useApp();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [viewParent, setViewParent] = useState(null);
  const rtl = isRTL();

  const openNew = () => {
    setEditing({ id: "p_" + Date.now(), name: "", number: "", tag: "" });
    setSheetOpen(true);
  };

  const save = () => {
    if (!editing?.name.trim()) { showToast("Name required", "error"); return; }
    const exists = state.parents.find(p => p.id === editing.id);
    if (exists) updateParent(editing);
    else addParent(editing);
    showToast("Saved", "success");
    setSheetOpen(false);
    setEditing(null);
  };

  const linkedExpenses = (parentId) => state.expenses.filter(e => e.parentId === parentId);
  const totalForParent = (parentId) => linkedExpenses(parentId).reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{t("parents")}</h1>
        <button onClick={openNew} style={{ 
          background: "#7950F2", 
          color: "#fff", 
          border: "none", 
          borderRadius: 12, 
          padding: "10px 16px", 
          fontWeight: 700, 
          fontSize: 14, 
          cursor: "pointer",
          lineHeight: 1
        }}>+ {t("add")}</button>
      </div>

      {!viewParent ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {state.parents.map(p => {
            const count = linkedExpenses(p.id).length;
            const total = totalForParent(p.id);
            return (
              <div 
                key={p.id} 
                onClick={() => setViewParent(p)} 
                style={{ 
                  background: "#1a1a1a", 
                  border: "1px solid #222", 
                  borderRadius: 18, 
                  padding: 18, 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 16 
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "#222", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>⌂</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{t("number")}: {p.number || "-"} · {count} {t("expensesLinked")}</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, flexShrink: 0 }}>{fmt(total, currency)}</div>
              </div>
            );
          })}
          {state.parents.length === 0 && <div style={{ textAlign: "center", color: "#555", padding: 40, fontSize: 14 }}>{t("noParents")}</div>}
        </div>
      ) : (
        <div>
          <button onClick={() => setViewParent(null)} style={{ background: "none", border: "none", color: "#888", fontSize: 14, marginBottom: 14, cursor: "pointer", padding: "8px 0", display: "flex", alignItems: "center", gap: 6 }}>
            <span>←</span> {t("back")}
          </button>
          <div style={{ background: "#1a1a1a", borderRadius: 18, padding: 18, border: "1px solid #222", marginBottom: 18 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{viewParent.name}</div>
            <div style={{ fontSize: 14, color: "#888", marginTop: 6 }}>{t("number")}: {viewParent.number || "-"}</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 12 }}>{t("total")}: {fmt(totalForParent(viewParent.id), currency)}</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{t("expensesLinked")}</div>
          {linkedExpenses(viewParent.id).map(e => (
            <div key={e.id} style={{ background: "#1a1a1a", borderRadius: 14, padding: 14, marginBottom: 10, border: "1px solid #222" }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{e.name}</div>
              <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{fmt(e.amount, currency)} · {e.endDate}</div>
            </div>
          ))}
          {linkedExpenses(viewParent.id).length === 0 && <div style={{ color: "#555", fontSize: 14 }}>{t("noExpenses")}</div>}
        </div>
      )}

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editing?.id && state.parents.find(p => p.id === editing.id) ? t("edit") : t("newProperty")}>
        {editing && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "4px 0" }}>
            <label style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{t("propertyName")}</label>
            <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} style={{ padding: 14, borderRadius: 14, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 15 }} />
            <label style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{t("propertyNumber")}</label>
            <input value={editing.number} onChange={e => setEditing({ ...editing, number: e.target.value })} style={{ padding: 14, borderRadius: 14, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 15 }} />
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button onClick={save} style={{ flex: 1, padding: 16, borderRadius: 14, border: "none", background: "#7950F2", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>{t("save")}</button>
              <button onClick={() => setSheetOpen(false)} style={{ flex: 1, padding: 16, borderRadius: 14, border: "1px solid #333", background: "transparent", color: "#888", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>{t("cancel")}</button>
            </div>
            {editing.id && state.parents.find(p => p.id === editing.id) && (
              <button onClick={() => { setConfirmId(editing.id); setSheetOpen(false); }} style={{ padding: 14, borderRadius: 14, border: "1px solid #E03131", background: "transparent", color: "#E03131", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>{t("delete")}</button>
            )}
          </div>
        )}
      </BottomSheet>

      <ConfirmModal open={!!confirmId} title={t("delete")} message={t("deleteConfirm")} onConfirm={() => { deleteParent(confirmId); setConfirmId(null); showToast("Deleted", "info"); }} onCancel={() => setConfirmId(null)} />
    </div>
  );
}
