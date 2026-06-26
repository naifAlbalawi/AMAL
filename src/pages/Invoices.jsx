import { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { BottomSheet } from "../components/BottomSheet";
import { ConfirmModal } from "../components/ConfirmModal";
import { extractTextFromImage, parseItemsFromText } from "../utils/ocr";
import { t, isRTL } from "../utils/i18n";

export default function Invoices() {
  const { state, addInvoice, updateInvoice, deleteInvoice, addExpense, showToast } = useApp();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef(null);
  const rtl = isRTL();

  const openNew = () => {
    setEditing({ id: "inv_" + Date.now(), name: "", date: new Date().toISOString().slice(0,10), image: null, extractedText: "", items: [] });
    setSheetOpen(true);
  };

  const handleImage = async (file) => {
    if (!file) return;
    setProcessing(true);
    try {
      const text = await extractTextFromImage(file, (p) => {});
      const items = parseItemsFromText(text);
      setEditing(prev => prev ? { ...prev, image: URL.createObjectURL(file), extractedText: text, items } : null);
      showToast(items.length ? `Found ${items.length} items` : "No items parsed", items.length ? "success" : "warning");
    } catch (e) {
      showToast("OCR failed", "error");
    } finally {
      setProcessing(false);
    }
  };

  const addItemAsExpense = (item, invId) => {
    addExpense({
      id: "e_" + Date.now() + Math.random().toString(36).slice(2,5),
      name: item.name,
      tag: "invoices",
      amount: item.price,
      startDate: new Date().toISOString().slice(0,10),
      days: 0,
      endDate: new Date().toISOString().slice(0,10),
      monthly: 0,
      status: "Paid",
      parentId: null,
      invoiceId: invId,
    });
  };

  const saveInvoice = () => {
    if (!editing) return;
    if (!editing.name.trim()) { showToast("Name required", "error"); return; }
    const exists = state.invoices.find(i => i.id === editing.id);
    if (exists) updateInvoice(editing);
    else addInvoice(editing);
    showToast("Saved", "success");
    setSheetOpen(false);
    setEditing(null);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{t("invoices")}</h1>
        <button onClick={openNew} style={{ 
          background: "#E03131", 
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

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {state.invoices.map(inv => (
          <div 
            key={inv.id} 
            onClick={() => { setEditing({ ...inv }); setSheetOpen(true); }} 
            style={{ 
              background: "#1a1a1a", 
              border: "1px solid #222", 
              borderRadius: 18, 
              overflow: "hidden", 
              cursor: "pointer" 
            }}
          >
            {inv.image ? (
              <img src={inv.image} alt="" style={{ width: "100%", height: 160, objectFit: "cover", opacity: 0.8 }} />
            ) : (
              <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: 40 }}>🧾</div>
            )}
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{inv.name || "Untitled"}</div>
              <div style={{ fontSize: 13, color: "#888", marginTop: 6 }}>{inv.date} · {inv.items?.length || 0} {t("items")}</div>
            </div>
          </div>
        ))}
        {state.invoices.length === 0 && <div style={{ textAlign: "center", color: "#555", padding: 40, fontSize: 14 }}>{t("noInvoices")}</div>}
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editing?.id && state.invoices.find(i => i.id === editing.id) ? t("edit") : t("add")} maxHeight="90vh">
        {editing && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "4px 0" }}>
            <input 
              value={editing.name} 
              onChange={e => setEditing({ ...editing, name: e.target.value })} 
              placeholder={t("name")} 
              style={{ padding: 14, borderRadius: 14, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 15 }} 
            />
            <input 
              value={editing.date} 
              onChange={e => setEditing({ ...editing, date: e.target.value })} 
              type="date" 
              style={{ padding: 14, borderRadius: 14, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 15 }} 
            />

            <button 
              onClick={() => fileRef.current?.click()} 
              style={{ 
                padding: 14, 
                borderRadius: 14, 
                border: "1px dashed #555", 
                background: "transparent", 
                color: "#fff", 
                fontWeight: 600, 
                cursor: "pointer",
                fontSize: 14
              }}
            >
              {processing ? "⏳ OCR..." : "📷 " + t("uploadImage")}
            </button>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={e => handleImage(e.target.files[0])} />

            {editing.image && <img src={editing.image} alt="invoice" style={{ width: "100%", borderRadius: 14, border: "1px solid #333" }} />}

            {editing.extractedText && (
              <textarea 
                value={editing.extractedText} 
                onChange={e => setEditing({ ...editing, extractedText: e.target.value })} 
                rows={4} 
                style={{ padding: 14, borderRadius: 14, border: "1px solid #333", background: "#0F0F0F", color: "#aaa", fontSize: 13, resize: "none" }} 
              />
            )}

            {editing.items && editing.items.length > 0 && (
              <div style={{ background: "#0F0F0F", borderRadius: 14, border: "1px solid #222", padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#ccc" }}>{t("parsedItems")}</div>
                {editing.items.map((it, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a1a1a" }}>
                    <span style={{ fontSize: 14 }}>{it.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>${it.price.toFixed(2)}</span>
                      <button 
                        onClick={() => addItemAsExpense(it, editing.id)} 
                        style={{ background: "#2F9E44", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                      >+ {t("add")}</button>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => { editing.items.forEach(it => addItemAsExpense(it, editing.id)); showToast("All items added", "success"); }} 
                  style={{ width: "100%", marginTop: 12, padding: 12, borderRadius: 12, border: "none", background: "#3B5BDB", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}
                >
                  {t("addAllItems")}
                </button>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button onClick={saveInvoice} style={{ flex: 1, padding: 16, borderRadius: 14, border: "none", background: "#E03131", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>{t("save")}</button>
              <button onClick={() => setSheetOpen(false)} style={{ flex: 1, padding: 16, borderRadius: 14, border: "1px solid #333", background: "transparent", color: "#888", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>{t("cancel")}</button>
            </div>
            {editing.id && state.invoices.find(i => i.id === editing.id) && (
              <button onClick={() => { setConfirmId(editing.id); setSheetOpen(false); }} style={{ padding: 14, borderRadius: 14, border: "1px solid #E03131", background: "transparent", color: "#E03131", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>{t("delete")}</button>
            )}
          </div>
        )}
      </BottomSheet>

      <ConfirmModal open={!!confirmId} title={t("delete")} message={t("deleteConfirm")} onConfirm={() => { deleteInvoice(confirmId); setConfirmId(null); showToast("Deleted", "info"); }} onCancel={() => setConfirmId(null)} />
    </div>
  );
}
