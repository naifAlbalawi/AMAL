import { createContext, useContext, useReducer, useEffect, useCallback, useState } from "react";

const STORAGE_KEY = "lifeos_v2";

const DEFAULT_CATEGORIES = {
  consumables: ["Low", "OK", "Stocked"],
  durables: ["Good", "Worn", "Damaged", "Retired"],
  car: ["Service", "Fuel", "Annual", "Repair", "Cleaning", "Parking", "Toll", "Fine"],
  finances: ["Fixed", "Variable", "Subscription", "One-time", "Investment", "Savings"],
};

const DEFAULT_CURRENCY = "$";

const DEFAULT_DATA = {
  consumables: [
    { id:"c1", name:"Deodorant", price:4.50, bought:"2026-05-01", duration:45, ends:"2026-06-15", monthly:3.0, status:"Low" },
    { id:"c2", name:"Toothpaste", price:3.20, bought:"2026-05-10", duration:60, ends:"2026-07-09", monthly:1.6, status:"OK" },
    { id:"c3", name:"Shampoo", price:7.00, bought:"2026-04-20", duration:50, ends:"2026-06-09", monthly:4.2, status:"Low" },
    { id:"c4", name:"Body Wash", price:5.50, bought:"2026-05-15", duration:55, ends:"2026-07-09", monthly:3.0, status:"OK" },
    { id:"c5", name:"Razor Blades", price:12.0, bought:"2026-05-01", duration:90, ends:"2026-07-30", monthly:4.0, status:"OK" },
  ],
  durables: [
    { id:"d1", name:"Running Shoes", price:120, bought:"2026-01-15", ends:"2027-01-15", monthly:9.9, status:"Good" },
    { id:"d2", name:"Winter Jacket", price:85, bought:"2025-11-01", ends:"2027-11-01", monthly:3.5, status:"Good" },
    { id:"d3", name:"Work Trousers", price:45, bought:"2026-03-10", ends:"2027-03-10", monthly:3.75, status:"Good" },
    { id:"d4", name:"Backpack", price:60, bought:"2025-06-01", ends:"2027-06-01", monthly:2.5, status:"Worn" },
  ],
  car: [
    { id:"v1", name:"Oil Change", date:"2026-03-15", ends:"2026-09-15", cost:55, type:"Service" },
    { id:"v2", name:"Tyre Rotation", date:"2026-03-15", ends:"2026-09-15", cost:30, type:"Service" },
    { id:"v3", name:"Fuel — June 1", date:"2026-06-01", ends:"2026-06-15", cost:72, type:"Fuel" },
    { id:"v4", name:"Fuel — June 10", date:"2026-06-10", ends:"2026-06-24", cost:68, type:"Fuel" },
    { id:"v5", name:"Insurance", date:"2026-05-01", ends:"2027-05-01", cost:420, type:"Annual" },
    { id:"v6", name:"Windscreen Fix", date:"2026-04-22", ends:"2026-04-25", cost:180, type:"Repair" },
  ],
  finances: [
    { id:"f1", name:"Rent", amount:850, date:"2026-06-01", ends:"2026-07-01", type:"Fixed" },
    { id:"f2", name:"Groceries", amount:210, date:"2026-06-07", ends:"2026-06-21", type:"Variable" },
    { id:"f3", name:"Utilities", amount:95, date:"2026-06-05", ends:"2026-07-05", type:"Fixed" },
    { id:"f4", name:"Subscriptions", amount:38, date:"2026-06-01", ends:"2026-07-01", type:"Subscription" },
    { id:"f5", name:"Car Wash", amount:15, date:"2026-06-12", ends:"2026-06-26", type:"Variable" },
  ],
  recipes: [],
  categories: DEFAULT_CATEGORIES,
  settings: { currency: DEFAULT_CURRENCY, theme: "dark" },
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure categories exist for migration
      if (!parsed.categories) parsed.categories = DEFAULT_CATEGORIES;
      if (!parsed.settings) parsed.settings = { currency: DEFAULT_CURRENCY, theme: "dark" };
      return parsed;
    }
  } catch (e) { console.error("Load failed", e); }
  return DEFAULT_DATA;
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
}

function reducer(state, action) {
  let next;
  switch (action.type) {
    case "ADD_ITEM": {
      const list = [...(state[action.space] || []), action.item];
      next = { ...state, [action.space]: list };
      break;
    }
    case "UPDATE_ITEM": {
      const list = (state[action.space] || []).map(i => i.id === action.item.id ? action.item : i);
      next = { ...state, [action.space]: list };
      break;
    }
    case "DELETE_ITEM": {
      const list = (state[action.space] || []).filter(i => i.id !== action.id);
      next = { ...state, [action.space]: list };
      break;
    }
    case "ADD_RECIPE":
      next = { ...state, recipes: [...state.recipes, action.recipe] };
      break;
    case "UPDATE_RECIPE":
      next = { ...state, recipes: state.recipes.map(r => r.id === action.recipe.id ? action.recipe : r) };
      break;
    case "DELETE_RECIPE":
      next = { ...state, recipes: state.recipes.filter(r => r.id !== action.id) };
      break;
    case "ADD_CATEGORY": {
      const cats = { ...state.categories };
      if (!cats[action.space].includes(action.category)) {
        cats[action.space] = [...cats[action.space], action.category];
      }
      next = { ...state, categories: cats };
      break;
    }
    case "REMOVE_CATEGORY": {
      const cats = { ...state.categories };
      cats[action.space] = cats[action.space].filter(c => c !== action.category);
      next = { ...state, categories: cats };
      break;
    }
    case "SET_CURRENCY":
      next = { ...state, settings: { ...state.settings, currency: action.currency } };
      break;
    case "REPLACE_ALL":
      next = { ...DEFAULT_DATA, ...action.data, categories: action.data.categories || DEFAULT_CATEGORIES, settings: action.data.settings || { currency: DEFAULT_CURRENCY, theme: "dark" } };
      break;
    case "RESET":
      next = DEFAULT_DATA;
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

  const addItem = useCallback((space, item) => dispatch({ type: "ADD_ITEM", space, item }), []);
  const updateItem = useCallback((space, item) => dispatch({ type: "UPDATE_ITEM", space, item }), []);
  const deleteItem = useCallback((space, id) => dispatch({ type: "DELETE_ITEM", space, id }), []);
  const addRecipe = useCallback((recipe) => dispatch({ type: "ADD_RECIPE", recipe }), []);
  const updateRecipe = useCallback((recipe) => dispatch({ type: "UPDATE_RECIPE", recipe }), []);
  const deleteRecipe = useCallback((id) => dispatch({ type: "DELETE_RECIPE", id }), []);
  const addCategory = useCallback((space, category) => dispatch({ type: "ADD_CATEGORY", space, category }), []);
  const removeCategory = useCallback((space, category) => dispatch({ type: "REMOVE_CATEGORY", space, category }), []);
  const setCurrency = useCallback((currency) => dispatch({ type: "SET_CURRENCY", currency }), []);
  const replaceAll = useCallback((data) => dispatch({ type: "REPLACE_ALL", data }), []);
  const resetData = useCallback(() => dispatch({ type: "RESET" }), []);

  const allRecs = [...state.consumables, ...state.durables, ...state.car, ...state.finances];
  const currency = state.settings?.currency || DEFAULT_CURRENCY;

  const monthly =
    state.consumables.reduce((s, r) => s + (r.monthly || 0), 0) +
    state.durables.reduce((s, r) => s + (r.monthly || 0), 0) +
    state.car.filter(r => r.type === "Fuel").reduce((s, r) => s + (r.cost || 0), 0) / 2 +
    state.finances.reduce((s, r) => s + (r.amount || 0), 0);

  return (
    <AppContext.Provider value={{
      state, dispatch, toast, showToast,
      addItem, updateItem, deleteItem,
      addRecipe, updateRecipe, deleteRecipe,
      addCategory, removeCategory,
      setCurrency, replaceAll, resetData,
      allRecs, monthly, currency,
      TODAY: new Date("2026-06-17")
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
