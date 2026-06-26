import { useState, useRef } from "react";
import { useApp } from "../context/AppContext.jsx";
import { recognizeText } from "../utils/ocr.js";
import { BottomSheet } from "../components/BottomSheet.jsx";
import { ConfirmModal } from "../components/ConfirmModal.jsx";
import { Toast } from "../components/Toast.jsx";

const T = {
  bg: "#F0F2F7", surface: "#FFFFFF", border: "#E2E6EF",
  accent: "#3B5BDB", accentLight: "#EEF2FF",
  orange: "#FF6B35", orangeLight: "#FFF0EB",
  green: "#2F9E44", greenLight: "#EBFBEE",
  red: "#E03131", redLight: "#FFF0F0",
  text: "#1A1D23", textMid: "#4A5160", textMuted: "#8B92A5",
};

const uid = () => Math.random().toString(36).slice(2, 10);

export default function Recipes() {
  const { state, addRecipe, updateRecipe, deleteRecipe } = useApp();
  const recipes = state.recipes || [];
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const filtered = recipes.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.extractedText || "").toLowerCase().includes(search.toLowerCase())
  );

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingRecipe) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditingRecipe(prev => ({ ...prev, image: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = async () => {
    try {
      const { Camera } = await import('@capacitor/camera');
      const photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: 2, // DataUrl
        source: 1, // Camera
      });
      if (photo.dataUrl && editingRecipe) {
        setEditingRecipe(prev => ({ ...prev, image: photo.dataUrl }));
      }
    } catch (err) {
      console.log("Camera not available, falling back to file input", err);
      fileInputRef.current?.click();
    }
  };

  const handleGalleryPick = async () => {
    try {
      const { Camera } = await import('@capacitor/camera');
      const photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: 2, // DataUrl
        source: 2, // Photos
      });
      if (photo.dataUrl && editingRecipe) {
        setEditingRecipe(prev => ({ ...prev, image: photo.dataUrl }));
      }
    } catch (err) {
      console.log("Gallery not available, falling back to file input", err);
      fileInputRef.current?.click();
    }
  };

  const runOCR = async () => {
    if (!editingRecipe?.image) {
      showToast("Please add an image first", "warning");
      return;
    }
    setOcrLoading(true);
    try {
      const text = await recognizeText(editingRecipe.image, (p) => console.log("OCR progress:", p));
      setEditingRecipe(prev => ({ ...prev, extractedText: text }));
      showToast("Text extracted successfully!", "success");
    } catch (err) {
      console.error("OCR failed", err);
      showToast("OCR failed. Try a clearer image.", "error");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSave = () => {
    if (!editingRecipe?.name.trim()) {
      showToast("Recipe name is required", "warning");
      return;
    }
    if (recipes.find(r => r.id === editingRecipe.id)) {
      updateRecipe(editingRecipe);
      showToast("Recipe updated!", "success");
    } else {
      addRecipe(editingRecipe);
      showToast("Recipe added!", "success");
    }
    setSheetOpen(false);
    setEditingRecipe(null);
  };

  const handleDelete = () => {
    if (confirmId) {
      deleteRecipe(confirmId);
      showToast("Recipe deleted", "info");
    }
    setConfirmId(null);
  };

  const newRecipe = () => ({
    id: uid(),
    name: "",
    image: null,
    extractedText: "",
    notes: "",
    createdAt: new Date().toISOString(),
  });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
        borderBottom: `1px solid ${T.border}`, background: T.surface, flexShrink: 0
      }}>
        <span style={{ fontSize: 16 }}>🍳</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Recipes</span>
        <span style={{ color: T.textMuted, fontSize: 12 }}>{filtered.length}</span>
        <div style={{ flex: 1 }} />
        <input
          type="text"
          placeholder="Search recipes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, width: 120, outline: "none" }}
        />
        <button onClick={() => { setEditingRecipe(newRecipe()); setSheetOpen(true); }} style={{
          background: T.accent, color: "#fff", border: "none", borderRadius: 6,
          padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, minHeight: 32
        }}>+ Add</button>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 12, background: T.bg, WebkitOverflowScrolling: "touch" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: T.textMuted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🍳</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6 }}>No recipes yet</div>
            <div style={{ fontSize: 13 }}>Tap "+ Add" to save your first recipe with a photo</div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {filtered.map(r => (
            <div key={r.id} style={{
              background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12,
              overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
            }}>
              {r.image ? (
                <div style={{ width: "100%", height: 140, background: "#000", overflow: "hidden" }}>
                  <img src={r.image} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ width: "100%", height: 100, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, fontSize: 24 }}>🍽️</div>
              )}
              <div style={{ padding: "10px 12px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name || "Untitled"}</div>
                {r.extractedText && (
                  <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.4, maxHeight: 40, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {r.extractedText.slice(0, 100)}...
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <button onClick={() => { setEditingRecipe({ ...r }); setSheetOpen(true); }} style={{
                    flex: 1, background: T.accentLight, color: T.accent, border: "none", borderRadius: 6,
                    padding: "5px 0", fontSize: 11, fontWeight: 600, cursor: "pointer"
                  }}>Edit</button>
                  <button onClick={() => setConfirmId(r.id)} style={{
                    flex: 1, background: T.redLight, color: T.red, border: "none", borderRadius: 6,
                    padding: "5px 0", fontSize: 11, fontWeight: 600, cursor: "pointer"
                  }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 20 }} />
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editingRecipe?.id && recipes.find(r => r.id === editingRecipe.id) ? "Edit Recipe" : "New Recipe"}>
        {editingRecipe && (
          <div>
            <label style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: "0.04em" }}>Recipe Name</label>
            <input style={{
              width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.border}`,
              fontSize: 13, marginBottom: 12, background: "#fff", color: T.text, outline: "none", fontFamily: "inherit"
            }} value={editingRecipe.name} onChange={e => setEditingRecipe(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Chicken Tikka" />

            <label style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: "0.04em" }}>Photo</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button onClick={handleCameraCapture} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${T.border}`,
                background: T.bg, color: T.textMid, fontWeight: 600, fontSize: 12, cursor: "pointer"
              }}>📷 Camera</button>
              <button onClick={handleGalleryPick} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${T.border}`,
                background: T.bg, color: T.textMid, fontWeight: 600, fontSize: 12, cursor: "pointer"
              }}>🖼️ Gallery</button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePick} style={{ display: "none" }} />
            </div>

            {editingRecipe.image && (
              <div style={{ marginBottom: 12, borderRadius: 8, overflow: "hidden", border: `1px solid ${T.border}` }}>
                <img src={editingRecipe.image} alt="Preview" style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }} />
                <button onClick={runOCR} disabled={ocrLoading} style={{
                  width: "100%", padding: "10px", border: "none", background: T.accent, color: "#fff",
                  fontWeight: 700, fontSize: 13, cursor: ocrLoading ? "wait" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                }}>
                  {ocrLoading ? (
                    <><span className="animate-pulse">🔍</span> Reading text...</>
                  ) : (
                    <>🔍 Extract Text (OCR)</>
                  )}
                </button>
              </div>
            )}

            <label style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: "0.04em" }}>Extracted Text</label>
            <textarea style={{
              width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.border}`,
              fontSize: 13, marginBottom: 12, background: "#fff", color: T.text, outline: "none",
              fontFamily: "inherit", minHeight: 80, resize: "vertical"
            }} value={editingRecipe.extractedText || ""} onChange={e => setEditingRecipe(p => ({ ...p, extractedText: e.target.value }))} placeholder="OCR text will appear here, or type manually..." />

            <label style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: "0.04em" }}>Your Notes</label>
            <textarea style={{
              width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.border}`,
              fontSize: 13, marginBottom: 12, background: "#fff", color: T.text, outline: "none",
              fontFamily: "inherit", minHeight: 60, resize: "vertical"
            }} value={editingRecipe.notes || ""} onChange={e => setEditingRecipe(p => ({ ...p, notes: e.target.value }))} placeholder="Add your own notes..." />

            <button onClick={handleSave} style={{
              width: "100%", padding: "12px", borderRadius: 8, border: "none",
              background: T.accent, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer"
            }}>Save Recipe</button>
          </div>
        )}
      </BottomSheet>

      <ConfirmModal
        open={!!confirmId}
        title="Delete Recipe"
        message="Delete this recipe and its photo permanently?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
