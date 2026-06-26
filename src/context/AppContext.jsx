import { createContext, useContext, useReducer, useCallback, useState, useEffect } from "react";
import { loadLang } from "../utils/i18n";

const STORAGE_KEY = "amal_v3";
const LEGACY_KEY = "lifeos_v2";

const DEFAULT_TAGS = [
  { id: "consumables", name: "Consumables", nameAr: "مستهلكات", color: "#3B5BDB", statuses: ["Low", "OK", "Stocked"] },
  { id: "durables", name: "Durables", nameAr: "أصول", color: "#2F9E44", statuses: ["Good", "Worn", "Damaged", "Retired"] },
  { id: "car", name: "Car", nameAr: "سيارة", color: "#E67700", statuses: ["Service", "Fuel", "Annual", "Repair", "Cleaning", "Parking", "Toll", "Fine"] },
  { id: "finances", name: "Finances", nameAr: "مالية", color: "#7950F2", statuses: ["Fixed", "Variable", "Subscription", "One-time", "Investment", "Savings"] },
  { id: "invoices", name: "Invoices", nameAr: "فواتير", color: "#E03131", statuses: ["Paid", "Pending", "Overdue"] },
];

function daysBetween(a, b) {
  const ms = new Date(b) - new Date(a);
  return Math.max(0, Math.round(ms / 86400000));
}

function migrateV2(v2) {
  const expenses = [];
  const tags = [...DEFAULT_TAGS];
  (v2.consumables || []).forEach(i => expenses.push({
    id: i.id, name: i.name, tag: "consumables", amount: i.price || 0,
    startDate: i.bought, days: i.duration, endDate: i.ends, monthly: i.monthly || 0,
    status: i.status || "OK", parentId: null, invoiceId: null,
  }));
  (v2.durables || []).forEach(i => expenses.push({
    id: i.id, name: i.name, tag: "durables", amount: i.price || 0,
    startDate: i.bought, days: daysBetween(i.bought, i.ends), endDate: i.ends, monthly: i.monthly || 0,
    status: i.status || "Good", parentId: null, invoiceId: null,
  }));
  (v2.car || []).forEach(i => expenses.push({
    id: i.id, name: i.name, tag: "car", amount: i.cost || 0,
    startDate: i.date, days: daysBetween(i.date, i.ends), endDate: i.ends, monthly: 0,
    status: i.type || "Service", parentId: null, invoiceId: null,
  }));
  (v2.finances || []).forEach(i => expenses.push({
    id: i.id, name: i.name, tag: "finances", amount: i.amount || 0,
    startDate: i.date, days: daysBetween(i.date, i.ends), endDate: i.ends, monthly: 0,
    status: i.type || "Fixed", parentId: null, invoiceId: null,
  }));
  const invoices = (v2.recipes || []).map(r => ({
    id: r.id, name: r.name || "Invoice", date: r.date || new Date().toISOString().slice(0,10),
    image: r.image || null, extractedText: r.extractedText || "", items: [],
  }));
  return {
    expenses, tags, parents: [],
    invoices,
    settings: { currency: v2.settings?.currency || "$", language: loadLang(), theme: v2.settings?.theme || "dark" }
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (!p.tags) p.tags = DEFAULT_TAGS;
      if (!p.parents) p.parents = [];
      if (!p.invoices) p.invoices = [];
      if (!p.settings) p.settings = { currency: "$", language: loadLang(), theme: "dark" };
      return p;
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const m = migrateV2(JSON.parse(legacy));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
      return m;
    }
  } catch (e) { console.error("Load failed", e); }
  return {
    expenses: [], tags: DEFAULT_TAGS, parents: [], invoices: [],
    settings: { currency: "$", language: loadLang(), theme: "dark" }
  };
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
}

function reducer(state, action) {
  let next;
  switch (action.type) {
    case "ADD_EXPENSE": {
      const list = [...state.expenses, action.item];
      next = { ...state, expenses: list };
      break;
    }
    case "UPDATE_EXPENSE": {
      const list = state.expenses.map(i => i.id === action.item.id ? action.item : i);
      next = { ...state, expenses: list };
      break;
    }
    case "DELETE_EXPENSE": {
      const list = state.expenses.filter(i => i.id !== action.id);
      next = { ...state, expenses: list };
      break;
    }
    case "ADD_TAG": {
      if (state.tags.find(t => t.id === action.tag.id)) next = state;
      else next = { ...state, tags: [...state.tags, action.tag] };
      break;
    }
    case "REMOVE_TAG": {
      next = { ...state, tags: state.tags.filter(t => t.id !== action.id), expenses: state.expenses.map(e => e.tag === action.id ? { ...e, tag: "finances" } : e) };
      break;
    }
    case "ADD_PARENT": {
      next = { ...state, parents: [...state.parents, action.item] };
      break;
    }
    case "UPDATE_PARENT": {
      next = { ...state, parents: state.parents.map(p => p.id === action.item.id ? action.item : p) };
      break;
    }
    case "DELETE_PARENT": {
      next = { ...state, parents: state.parents.filter(p => p.id !== action.id), expenses: state.expenses.map(e => e.parentId === action.id ? { ...e, parentId: null } : e) };
      break;
    }
    case "ADD_INVOICE": {
      next = { ...state, invoices: [...state.invoices, action.item] };
      break;
    }
    case "UPDATE_INVOICE": {
      next = { ...state, invoices: state.invoices.map(i => i.id === action.item.id ? action.item : i) };
      break;
    }
    case "DELETE_INVOICE": {
      next = { ...state, invoices: state.invoices.filter(i => i.id !== action.id) };
      break;
    }
    case "SET_SETTINGS":
      next = { ...state, settings: { ...state.settings, ...action.settings } };
      break;
    case "REPLACE_ALL":
      next = { ...loadData(), ...action.data, tags: action.data.tags || DEFAULT_TAGS, parents: action.data.parents || [], invoices: action.data.invoices || [] };
      break;
    case "RESET":
      next = { expenses: [], tags: DEFAULT_TAGS, parents: [], invoices: [], settings: { currency: "$", language: state.settings.language, theme: "dark" } };
      break;
    default:
      return state;
  }
  saveData(next);
  return next;
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadData);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const addExpense = useCallback((item) => dispatch({ type: "ADD_EXPENSE", item }), []);
  const updateExpense = useCallback((item) => dispatch({ type: "UPDATE_EXPENSE", item }), []);
  const deleteExpense = useCallback((id) => dispatch({ type: "DELETE_EXPENSE", id }), []);
  const addTag = useCallback((tag) => dispatch({ type: "ADD_TAG", tag }), []);
  const removeTag = useCallback((id) => dispatch({ type: "REMOVE_TAG", id }), []);
  const addParent = useCallback((item) => dispatch({ type: "ADD_PARENT", item }), []);
  const updateParent = useCallback((item) => dispatch({ type: "UPDATE_PARENT", item }), []);
  const deleteParent = useCallback((id) => dispatch({ type: "DELETE_PARENT", id }), []);
  const addInvoice = useCallback((item) => dispatch({ type: "ADD_INVOICE", item }), []);
  const updateInvoice = useCallback((item) => dispatch({ type: "UPDATE_INVOICE", item }), []);
  const deleteInvoice = useCallback((id) => dispatch({ type: "DELETE_INVOICE", id }), []);
  const setSettings = useCallback((s) => dispatch({ type: "SET_SETTINGS", settings: s }), []);
  const replaceAll = useCallback((data) => dispatch({ type: "REPLACE_ALL", data }), []);
  const resetData = useCallback(() => dispatch({ type: "RESET" }), []);

  const currency = state.settings?.currency || "$";
  const TODAY = new Date(); TODAY.setHours(0,0,0,0);

  const monthly = state.expenses.reduce((s, r) => s + (r.monthly || 0), 0);

  return (
    <AppContext.Provider value={{
      state, dispatch, toast, showToast,
      addExpense, updateExpense, deleteExpense,
      addTag, removeTag,
      addParent, updateParent, deleteParent,
      addInvoice, updateInvoice, deleteInvoice,
      setSettings, replaceAll, resetData,
      currency, TODAY, monthly
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
