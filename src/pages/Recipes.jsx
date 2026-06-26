import { useState, useRef } from "react";
import { useApp } from "../context/AppContext.jsx";
import { recognizeText } from "../utils/ocr.js";
import { BottomSheet } from "../components/BottomSheet.jsx";
import { ConfirmModal } from "../components/ConfirmModal.jsx";

const uid = () => Math.random().toString(36).slice(2, 10);

export default function Recipes() {
  const { state, addRecipe, updateRecipe, deleteRecipe, showToast } = useApp();
  const recipes = state.recipes || [];
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const fileInputRef = useRef(null);

  const filtered = recipes.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.extractedText || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingRecipe) return;
    const reader = new FileReader();
    reader.onload = (ev) => setEditingRecipe(prev => ({ ...prev, image: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleCamera = async () => {
    try {
      const { Camera } = await import('@capacitor/camera');
      const photo = await Camera.getPhoto({ quality: 85, allowEditing: false, resultType: 2, source: 1 });
      if (photo.dataUrl && editingRecipe) setEditingRecipe(prev => ({ ...prev, image: photo.dataUrl }));
    } catch { fileInputRef.current?.click(); }
  };

  const handleGallery = async () => {
    try {
      const { Camera } = await import('@capacitor/camera');
      const photo = await Camera.getPhoto({ quality: 85, allowEditing: false, resultType: 2, source: 2 });
      if (photo.dataUrl && editingRecipe) setEditingRecipe(prev => ({ ...prev, image: photo.dataUrl }));
    } catch { fileInputRef.current?.click(); }
  };

  const runOCR = async () => {
    if (!editingRecipe?.image) { showToast("Add an image first", "warning"); return; }
    setOcrLoading(true);
    try {
      const text = await recognizeText(editingRecipe.image);
      setEditingRecipe(prev => ({ ...prev, extractedText: text }));
      showToast("Text extracted!", "success");
    } catch {
      showToast("OCR failed. Try clearer image.", "error");
    } finally { setOcrLoading(false); }
  };

  const handleSave = () => {
    if (!editingRecipe?.name.trim()) { showToast("Recipe name required", "warning"); return; }
    if (recipes.find(r => r.id === editingRecipe.id)) updateRecipe(editingRecipe);
    else addRecipe(editingRecipe);
    showToast("Saved!", "success");
    setSheetOpen(false);
    setEditingRecipe(null);
  };

  const newRecipe = () => ({ id: uid(), name: "", image: null, extractedText: "", notes: "", createdAt: new Date().toISOString() });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "16px 16px 8px", flexShrink: 0 }}>
        <div style={{ fontSize: 13, color: "#666", marginBottom: 2 }}>Your collection</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 12 }}>🍳 Recipes</div>
        <div style={{ display: "flex", gap: 10 }}>
          <input type="text" placeholder="Search recipes..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, padding: "12px 14px", borderRadius: 12, border: "1px solid #222", background: "#1a1a1a", color: "#fff", fontSize: 14, outline: "none" }} />
          <button onClick={() => { setEditingRecipe(newRecipe()); setSheetOpen(true); }} style={{
            background: "#E03131", color: "#fff", border: "none", borderRadius: 12,
            padding: "0 18px", cursor: "pointer", fontSize: 22, fontWeight: 300, display: "flex", alignItems: "center", justifyContent: "center"
          }}>+</button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "8px 16px 80px", WebkitOverflowScrolling: "touch" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 56, marginBottom: 16, filter: "grayscale(0.3)" }}>🍳</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 8 }}>No recipes yet</div>
            <div style={{ fontSize: 14, color: "#555" }}>Tap + to save a recipe with a photo and OCR</div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {filtered.map(r => (
            <div key={r.id} onClick={() => { setEditingRecipe({ ...r }); setSheetOpen(true); }} style={{
              background: "#1a1a1a", border: "1px solid #222", borderRadius: 16, overflow: "hidden", cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s"
            }} onTouchStart={e => e.currentTarget.style.transform = "scale(0.98)"} onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}>
              {r.image ? (
                <div style={{ width: "100%", height: 130, overflow: "hidden" }}>
                  <img src={r.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ width: "100%", height: 100, background: "#222", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🍽️</div>
              )}
              <div style={{ padding: "12px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name || "Untitled"}</div>
                {r.extractedText && (
                  <div style={{ fontSize: 11, color: "#555", lineHeight: 1.4, maxHeight: 32, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{r.extractedText.slice(0, 80)}...</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 20 }} />
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editingRecipe?.id && recipes.find(r => r.id === editingRecipe.id) ? "Edit Recipe" : "New Recipe"}>
        {editingRecipe && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: "#666", fontWeight: 700, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.06em" }}>Recipe Name</label>
              <input style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 14, outline: "none" }}
                value={editingRecipe.name} onChange={e => setEditingRecipe(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Chicken Tikka Masala" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: "#666", fontWeight: 700, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.06em" }}>Photo</label>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleCamera} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1px solid #333", background: "#1a1a1a", color: "#aaa", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>📷 Camera</button>
                <button onClick={handleGallery} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1px solid #333", background: "#1a1a1a", color: "#aaa", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>🖼️ Gallery</button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePick} style={{ display: "none" }} />
              </div>
            </div>

            {editingRecipe.image && (
              <div style={{ marginBottom: 16, borderRadius: 12, overflow: "hidden", border: "1px solid #333" }}>
                <img src={editingRecipe.image} alt="" style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block" }} />
                <button onClick={runOCR} disabled={ocrLoading} style={{
                  width: "100%", padding: "12px", border: "none", background: "#3B5BDB", color: "#fff",
                  fontWeight: 700, fontSize: 14, cursor: ocrLoading ? "wait" : "pointer"
                }}>{ocrLoading ? "🔍 Reading..." : "🔍 Extract Text (OCR)"}</button>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: "#666", fontWeight: 700, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.06em" }}>Extracted Text / Ingredients</label>
              <textarea style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 14, outline: "none", minHeight: 100, resize: "vertical" }}
                value={editingRecipe.extractedText || ""} onChange={e => setEditingRecipe(p => ({ ...p, extractedText: e.target.value }))} placeholder="OCR text appears here, or type manually..." />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: "#666", fontWeight: 700, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.06em" }}>Your Notes</label>
              <textarea style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #333", background: "#0F0F0F", color: "#fff", fontSize: 14, outline: "none", minHeight: 60, resize: "vertical" }}
                value={editingRecipe.notes || ""} onChange={e => setEditingRecipe(p => ({ ...p, notes: e.target.value }))} placeholder="Add cooking notes, tips, etc..." />
            </div>

            <button onClick={handleSave} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "#E03131", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Save Recipe</button>

            {editingRecipe.id && recipes.find(r => r.id === editingRecipe.id) && (
              <button onClick={() => { setConfirmId(editingRecipe.id); setSheetOpen(false); }} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "transparent", color: "#E03131", fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 8 }}>Delete Recipe</button>
            )}
          </div>
        )}
      </BottomSheet>

      <ConfirmModal open={!!confirmId} title="Delete Recipe?" message="Remove this recipe and its photo permanently?" onConfirm={() => { deleteRecipe(confirmId); showToast("Deleted", "info"); setConfirmId(null); }} onCancel={() => setConfirmId(null)} />
    </div>
  );
}
