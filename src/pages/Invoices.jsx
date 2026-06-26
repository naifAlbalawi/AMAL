import { useState, useRef, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { BottomSheet } from "../components/BottomSheet";
import { ConfirmModal } from "../components/ConfirmModal";
import { extractTextFromImage, parseItemsFromText } from "../utils/ocr";
import { isAIEnabled, loadAIConfig, processWithAI } from "../utils/aiConfig";
import { t, isRTL } from "../utils/i18n";

export default function Invoices() {
  const { state, addInvoice, updateInvoice, deleteInvoice, addExpense, showToast, currency, TODAY } = useApp();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [removeItemIdx, setRemoveItemIdx] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const fileRef = useRef(null);
  const rtl = isRTL();

  const openNew = () => {
    const timestamp = Date.now();
    setEditing({
      id: "inv_" + timestamp,
      name: "",
      generatedName: "invoice_" + timestamp,
      date: new Date().toISOString().slice(0,10),
      image: null,
      imageData: null, // base64 for persistence
      extractedText: "",
      items: [],
      defaultTag: "invoices",
    });
    setSheetOpen(true);
  };

  const handleImage = async (file) => {
    if (!file) return;
    setProcessing(true);
    try {
      // Convert to base64 for persistence
      const base64 = await fileToBase64(file);
      const imageUrl = URL.createObjectURL(file);

      let text = "";
      let items = [];

      // Try AI first if enabled
      if (isAIEnabled()) {
        try {
          const aiConfig = loadAIConfig();
          const aiItems = await processWithAI(file, "", aiConfig);
          if (aiItems && aiItems.length > 0) {
            items = aiItems.map(it => ({ name: it.name, price: parseFloat(it.price) || 0, tag: "invoices", endDate: null }));
            text = "AI extracted " + items.length + " items";
            showToast(`AI found ${items.length} items`, "success");
          }
        } catch (aiErr) {
          console.log("AI failed, falling back to OCR:", aiErr);
        }
      }

      // Fallback to OCR
      if (items.length === 0) {
        text = await extractTextFromImage(file, (p) => {});
        items = parseItemsFromText(text).map(it => ({ ...it, tag: "invoices", endDate: null }));
      }

      // Generate name from first line of text if no name
      const firstLine = text.split('\n')[0]?.trim() || "";
      const generatedName = firstLine.length > 3 && firstLine.length < 50
        ? firstLine.replace(/[^\w\s]/g, '').replace(/\s+/g, '_').toLowerCase().slice(0, 30) + "_" + Date.now()
        : "invoice_" + Date.now();

      setEditing(prev => prev ? {
        ...prev,
        image: imageUrl,
        imageData: base64,
        extractedText: text,
        items,
        generatedName,
        name: prev.name || firstLine.slice(0, 40)
      } : null);

      showToast(items.length ? `Found ${items.length} items` : "No items parsed", items.length ? "success" : "warning");
    } catch (e) {
      showToast("OCR failed", "error");
    } finally {
      setProcessing(false);
    }
  };

  const removeItem = (idx) => {
    setEditing(prev => prev ? { ...prev, items: prev.items.filter((_, i) => i !== idx) } : null);
    showToast(t("itemRemoved"), "info");
    setRemoveItemIdx(null);
  };

  const updateItemTag = (idx, tag) => {
    setEditing(prev => {
      if (!prev) return null;
      const newItems = [...prev.items];
      newItems[idx] = { ...newItems[idx], tag };
      return { ...prev, items: newItems };
    });
  };

  const updateItemName = (idx, name) => {
    setEditing(prev => {
      if (!prev) return null;
      const newItems = [...prev.items];
      newItems[idx] = { ...newItems[idx], name };
      return { ...prev, items: newItems };
    });
  };

  const updateItemPrice = (idx, price) => {
    setEditing(prev => {
      if (!prev) return null;
      const newItems = [...prev.items];
      newItems[idx] = { ...newItems[idx], price: parseFloat(price) || 0 };
      return { ...prev, items: newItems };
    });
  };

  const setAllItemsTag = (tag) => {
    setEditing(prev => {
      if (!prev) return null;
      return { ...prev, items: prev.items.map(it => ({ ...it, tag })), defaultTag: tag };
    });
  };

  const addItemAsExpense = (item, invId) => {
    const tag = item.tag || editing?.defaultTag || "invoices";
    addExpense({
      id: "e_" + Date.now() + Math.random().toString(36).slice(2,5),
      name: item.name,
      tag: tag,
      amount: item.price,
      startDate: new Date().toISOString().slice(0,10),
      days: 0,
      endDate: item.endDate || null,
      monthly: 0,
      status: "Paid",
      parentId: null,
      invoiceId: invId,
    });
    showToast(t("itemAdded"), "success");
  };

  const addAllItems = () => {
    if (!editing) return;
    editing.items.forEach(it => addItemAsExpense(it, editing.id));
    showToast(t("allItemsAdded"), "success");
  };

  const saveInvoice = () => {
    if (!editing) return;
    if (!editing.name.trim()) { showToast("Name required", "error"); return; }
    const exists = state.invoices.find(i => i.id === editing.id);
    const toSave = { ...editing };
    delete toSave.image; // Don't save object URL
    if (exists) updateInvoice(toSave);
    else addInvoice(toSave);
    showToast("Saved", "success");
    setSheetOpen(false);
    setEditing(null);
  };

  // Search invoices for linking
  const [linkSearch, setLinkSearch] = useState("");
  const filteredInvoices = useMemo(() => {
    if (!linkSearch.trim()) return [];
    const q = linkSearch.toLowerCase();
    return state.invoices
      .filter(i => i.id !== editing?.id)
      .filter(i => (i.name || i.generatedName || "").toLowerCase().includes(q))
      .slice(0, 20);
  }, [linkSearch, state.invoices, editing]);

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{t("invoices")}</h1>
        <button onClick={openNew} style={{
          background: "#E03131", color: "#fff", border: "none", borderRadius: 12,
          padding: "10px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer", lineHeight: 1
        }}>+ {t("add")}</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {state.invoices.map(inv => (
          <div
            key={inv.id}
            onClick={() => {
              // Restore image URL from base64 if needed
              const imgUrl = inv.imageData ? `data:image/jpeg;base64,${inv.imageData}` : inv.image;
              setEditing({ ...inv, image: imgUrl });
              setSheetOpen(true);
            }}
            style={{
              background: "#1a1a1a", border: "1px solid #222", borderRadius: 18,
              overflow: "hidden", cursor: "pointer"
            }}
          >
            {inv.imageData || inv.image ? (
              <div style={{
                width: "100%", height: 120, overflow: "hidden",
                background: "#0F0F0F", position: "relative"
              }}>
                <img
                  src={inv.imageData ? `data:image/jpeg;base64,${inv.imageData}` : inv.image}
                  alt=""
                  style={{
                    width: "100%", height: "200%", objectFit: "cover",
                    objectPosition: "top center", opacity: 0.7,
                    marginTop: "-10%"
                  }}
                />
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: 40, background: "linear-gradient(transparent, #1a1a1a)"
                }} />
              </div>
            ) : (
              <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: 36 }}>🧾</div>
            )}
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{inv.name || inv.generatedName || "Untitled"}</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{inv.date} · {inv.items?.length || 0} {t("items")}</div>
            </div>
          </div>
        ))}
        {state.invoices.length === 0 && <div style={{ textAlign: "center", color: "#555", padding: 40, fontSize: 14 }}>{t("noInvoices")}</div>}
      </div>

      {/* Image Preview Modal */}
      {imagePreviewOpen && editing?.image && (
        <div onClick={() => setImagePreviewOpen(false)} style={{
          position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.9)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <img src={editing.image} alt="invoice full" style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: 12 }} />
        </div>
      )}

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editing?.id && state.invoices.find(i => i.id === editing.id) ? t("edit") : t("add")} maxHeight="92vh">
        {editing && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "4px 0" }}>
            {/* Invoice Name */}
            <div>
              <label style={{ fontSize: 12, color: "#888", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("invoiceName")}</label>
              <input
                value={editing.name}
                onChange={e => setEditing({ ...editing, name: e.target.value })}
                placeholder={editing.generatedName}
                style={{ padding: 14, borderRadius: 14, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 15, width: "100%", boxSizing: "border-box" }}
              />
              <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{t("generatedName")}: {editing.generatedName}</div>
            </div>

            <input
              value={editing.date}
              onChange={e => setEditing({ ...editing, date: e.target.value })}
              type="date"
              style={{ padding: 14, borderRadius: 14, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 15 }}
            />

            {/* Upload */}
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                padding: 14, borderRadius: 14, border: "1px dashed #555", background: "transparent",
                color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14
              }}
            >
              {processing ? "⏳ " + t("processing") : "📷 " + t("uploadImage")}
            </button>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={e => handleImage(e.target.files[0])} />

            {/* Image Preview - partial view */}
            {editing.image && (
              <div onClick={() => setImagePreviewOpen(true)} style={{
                width: "100%", height: 140, overflow: "hidden", borderRadius: 14,
                border: "1px solid #333", cursor: "pointer", position: "relative"
              }}>
                <img src={editing.image} alt="invoice" style={{
                  width: "100%", height: "200%", objectFit: "cover",
                  objectPosition: "top center", opacity: 0.8
                }} />
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: 40, background: "linear-gradient(transparent, #0F0F0F)",
                  display: "flex", alignItems: "flex-end", justifyContent: "center",
                  paddingBottom: 8, fontSize: 11, color: "#888"
                }}>{t("tapToView")}</div>
              </div>
            )}

            {/* Extracted Text */}
            {editing.extractedText && (
              <textarea
                value={editing.extractedText}
                onChange={e => setEditing({ ...editing, extractedText: e.target.value })}
                rows={3}
                style={{ padding: 14, borderRadius: 14, border: "1px solid #333", background: "#0F0F0F", color: "#aaa", fontSize: 12, resize: "none" }}
              />
            )}

            {/* Default Tag for all items */}
            {editing.items && editing.items.length > 0 && (
              <div>
                <label style={{ fontSize: 12, color: "#888", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("groupForItems")}</label>
                <select
                  value={editing.defaultTag || "invoices"}
                  onChange={e => setAllItemsTag(e.target.value)}
                  style={{ padding: 12, borderRadius: 12, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 14, width: "100%" }}
                >
                  {state.tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            )}

            {/* Items List */}
            {editing.items && editing.items.length > 0 && (
              <div style={{ background: "#0F0F0F", borderRadius: 14, border: "1px solid #222", padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#ccc" }}>{t("parsedItems")}</div>
                {editing.items.map((it, idx) => (
                  <div key={idx} style={{
                    display: "flex", flexDirection: "column", gap: 8,
                    padding: "10px 0", borderBottom: "1px solid #1a1a1a"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        value={it.name}
                        onChange={e => updateItemName(idx, e.target.value)}
                        style={{
                          flex: 1, padding: "8px 10px", borderRadius: 8,
                          border: "1px solid #333", background: "#1a1a1a",
                          color: "#fff", fontSize: 13
                        }}
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={it.price}
                        onChange={e => updateItemPrice(idx, e.target.value)}
                        style={{
                          width: 70, padding: "8px 10px", borderRadius: 8,
                          border: "1px solid #333", background: "#1a1a1a",
                          color: "#fff", fontSize: 13
                        }}
                      />
                      <button
                        onClick={() => { addItemAsExpense(it, editing.id); }}
                        style={{
                          background: "#2F9E44", color: "#fff", border: "none",
                          borderRadius: 8, padding: "6px 10px", fontSize: 11,
                          fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap"
                        }}
                      >+ {t("add")}</button>
                      <button
                        onClick={() => setRemoveItemIdx(idx)}
                        style={{
                          background: "transparent", color: "#E03131", border: "1px solid #E03131",
                          borderRadius: 8, padding: "6px 10px", fontSize: 11,
                          fontWeight: 700, cursor: "pointer"
                        }}
                      >✕</button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "#888" }}>{t("itemGroup")}:</span>
                      <select
                        value={it.tag || editing.defaultTag || "invoices"}
                        onChange={e => updateItemTag(idx, e.target.value)}
                        style={{
                          padding: "4px 8px", borderRadius: 6, border: "1px solid #333",
                          background: "#1a1a1a", color: "#fff", fontSize: 11
                        }}
                      >
                        {state.tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addAllItems}
                  style={{
                    width: "100%", marginTop: 12, padding: 12, borderRadius: 12,
                    border: "none", background: "#3B5BDB", color: "#fff",
                    fontWeight: 700, cursor: "pointer", fontSize: 14
                  }}
                >
                  {t("addAllItems")}
                </button>
              </div>
            )}

            {/* Link to Invoice */}
            <div>
              <label style={{ fontSize: 12, color: "#888", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("linkToInvoice")}</label>
              <input
                value={linkSearch}
                onChange={e => setLinkSearch(e.target.value)}
                placeholder={t("searchInvoice")}
                style={{
                  padding: 12, borderRadius: 12, border: "1px solid #333",
                  background: "#0F0F0F", color: "#fff", fontSize: 14, width: "100%", boxSizing: "border-box"
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
                        setEditing(prev => prev ? { ...prev, linkedInvoiceId: inv.id } : null);
                        setLinkSearch(inv.name || inv.generatedName || "");
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
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button onClick={saveInvoice} style={{
                flex: 1, padding: 16, borderRadius: 14, border: "none",
                background: "#E03131", color: "#fff", fontWeight: 700,
                cursor: "pointer", fontSize: 15
              }}>{t("save")}</button>
              <button onClick={() => setSheetOpen(false)} style={{
                flex: 1, padding: 16, borderRadius: 14, border: "1px solid #333",
                background: "transparent", color: "#888", fontWeight: 700,
                cursor: "pointer", fontSize: 15
              }}>{t("cancel")}</button>
            </div>
            {editing.id && state.invoices.find(i => i.id === editing.id) && (
              <button onClick={() => { setConfirmId(editing.id); setSheetOpen(false); }} style={{
                padding: 14, borderRadius: 14, border: "1px solid #E03131",
                background: "transparent", color: "#E03131", fontWeight: 700,
                cursor: "pointer", fontSize: 14
              }}>{t("delete")}</button>
            )}
          </div>
        )}
      </BottomSheet>

      <ConfirmModal open={!!confirmId} title={t("delete")} message={t("deleteConfirm")} onConfirm={() => { deleteInvoice(confirmId); setConfirmId(null); showToast("Deleted", "info"); }} onCancel={() => setConfirmId(null)} />
      <ConfirmModal open={removeItemIdx !== null} title={t("remove")} message={t("removeItemConfirm")} onConfirm={() => removeItem(removeItemIdx)} onCancel={() => setRemoveItemIdx(null)} confirmText={t("remove")} confirmColor="#E03131" />
    </div>
  );
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
