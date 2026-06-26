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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{t("parents")}</h1>
        <button onClick={openNew} style={{ background: "#7950F2", color: "#fff", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ {t("add")}</button>
      </div>

      {!viewParent ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {state.parents.map(p => {
            const count = linkedExpenses(p.id).length;
            const total = totalForParent(p.id);
            return (
              <div key={p.id} onClick={() => setViewParent(p)} style={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: 16, padding: 16, cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#222", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⌂</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{t("number")}: {p.number || "-"} · {count} {t("expensesLinked")}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{fmt(total, currency)}</div>
              </div>
            );
          })}
          {state.parents.length === 0 && <div style={{ textAlign: "center", color: "#555", padding: 40, fontSize: 13 }}>{t("noParents")}</div>}
        </div>
      ) : (
        <div>
          <button onClick={() => setViewParent(null)} style={{ background: "none", border: "none", color: "#888", fontSize: 13, marginBottom: 12, cursor: "pointer" }}>← {t("back")}</button>
          <div style={{ background: "#1a1a1a", borderRadius: 16, padding: 16, border: "1px solid #222", marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{viewParent.name}</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{t("number")}: {viewParent.number || "-"}</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 10 }}>{t("total")}: {fmt(totalForParent(viewParent.id), currency)}</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{t("expensesLinked")}</div>
          {linkedExpenses(viewParent.id).map(e => (
            <div key={e.id} style={{ background: "#1a1a1a", borderRadius: 12, padding: 12, marginBottom: 8, border: "1px solid #222" }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{e.name}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{fmt(e.amount, currency)} · {e.endDate}</div>
            </div>
          ))}
          {linkedExpenses(viewParent.id).length === 0 && <div style={{ color: "#555", fontSize: 13 }}>{t("noExpenses")}</div>}
        </div>
      )}

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editing?.id && state.parents.find(p => p.id === editing.id) ? t("edit") : t("newProperty")}>
        {editing && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "4px 0" }}>
            <label style={{ fontSize: 12, color: "#888" }}>{t("propertyName")}</label>
            <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} style={{ padding: 12, borderRadius: 12, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 14 }} />
            <label style={{ fontSize: 12, color: "#888" }}>{t("propertyNumber")}</label>
            <input value={editing.number} onChange={e => setEditing({ ...editing, number: e.target.value })} style={{ padding: 12, borderRadius: 12, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 14 }} />
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={save} style={{ flex: 1, padding: 14, borderRadius: 12, border: "none", background: "#7950F2", color: "#fff", fontWeight: 700, cursor: "pointer" }}>{t("save")}</button>
              <button onClick={() => setSheetOpen(false)} style={{ flex: 1, padding: 14, borderRadius: 12, border: "1px solid #333", background: "transparent", color: "#888", fontWeight: 700, cursor: "pointer" }}>{t("cancel")}</button>
            </div>
            {editing.id && state.parents.find(p => p.id === editing.id) && (
              <button onClick={() => { setConfirmId(editing.id); setSheetOpen(false); }} style={{ padding: 12, borderRadius: 12, border: "1px solid #E03131", background: "transparent", color: "#E03131", fontWeight: 700, cursor: "pointer" }}>{t("delete")}</button>
            )}
          </div>
        )}
      </BottomSheet>

      <ConfirmModal open={!!confirmId} title={t("delete")} message={t("deleteConfirm")} onConfirm={() => { deleteParent(confirmId); setConfirmId(null); showToast("Deleted", "info"); }} onCancel={() => setConfirmId(null)} />
    </div>
  );
}
