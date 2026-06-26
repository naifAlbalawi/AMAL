const dict = {
  en: {
    appName: "AMAL", appNameAr: "أمل",
    dashboard: "Dashboard", expenses: "Expenses", invoices: "Invoices", parents: "Properties", settings: "Settings",
    add: "Add", save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit", confirm: "Confirm",
    name: "Name", number: "Number", amount: "Amount", price: "Price", cost: "Cost",
    startDate: "Start Date", endDate: "End Date", days: "Days", daysCount: "Number of Days",
    tag: "Tag / Group", status: "Status", parent: "Property", monthly: "Monthly",
    search: "Search", list: "List", board: "Board", timeline: "Timeline", today: "Today",
    uploadImage: "Upload Image / PDF", extractedText: "Extracted Text", parsedItems: "Parsed Items",
    addAsExpense: "Add as Expense", addAllItems: "Add All Items", noItems: "No items found",
    currency: "Currency", language: "Language", arabic: "Arabic", english: "English",
    export: "Export", import: "Import", reset: "Reset Data", all: "All",
    newTag: "New Group", tagName: "Group Name", color: "Color", manageTags: "Manage Groups",
    newProperty: "New Property", propertyName: "Property Name", propertyNumber: "Property Number",
    expensesLinked: "Linked Expenses", properties: "Properties", linkToParent: "Link to Property",
    urgent: "Urgent", upcoming: "Upcoming", overview: "Overview", low: "Low", ok: "OK",
    good: "Good", worn: "Worn", damaged: "Damaged", retired: "Retired",
    service: "Service", fuel: "Fuel", annual: "Annual", repair: "Repair",
    fixed: "Fixed", variable: "Variable", subscription: "Subscription", oneTime: "One-time",
    aiEnhance: "AI Enhancement", aiEnhanceHint: "Use AI to improve OCR results (configure API first)",
    useAI: "Use AI", itemName: "Item", total: "Total", date: "Date", type: "Type",
    noExpenses: "No expenses yet", noParents: "No properties yet", noInvoices: "No invoices yet",
    items: "items", perMonth: "/mo", deleteConfirm: "Are you sure you want to delete this?",
    version: "AMAL v3.0", back: "Back"
  },
  ar: {
    appName: "AMAL", appNameAr: "أمل",
    dashboard: "لوحة التحكم", expenses: "المصروفات", invoices: "الفواتير", parents: "الممتلكات", settings: "الإعدادات",
    add: "إضافة", save: "حفظ", cancel: "إلغاء", delete: "حذف", edit: "تعديل", confirm: "تأكيد",
    name: "الاسم", number: "الرقم", amount: "المبلغ", price: "السعر", cost: "التكلفة",
    startDate: "تاريخ البدء", endDate: "تاريخ الانتهاء", days: "الأيام", daysCount: "عدد الأيام",
    tag: "التصنيف / المجموعة", status: "الحالة", parent: "الممتلك", monthly: "شهري",
    search: "بحث", list: "قائمة", board: "لوحة", timeline: "الخط الزمني", today: "اليوم",
    uploadImage: "رفع صورة / PDF", extractedText: "النص المستخرج", parsedItems: "البنود المستخرجة",
    addAsExpense: "إضافة كمصروف", addAllItems: "إضافة كل البنود", noItems: "لا يوجد بنود",
    currency: "العملة", language: "اللغة", arabic: "العربية", english: "الإنجليزية",
    export: "تصدير", import: "استيراد", reset: "إعادة الضبط", all: "الكل",
    newTag: "مجموعة جديدة", tagName: "اسم المجموعة", color: "اللون", manageTags: "إدارة المجموعات",
    newProperty: "ممتلك جديد", propertyName: "اسم الممتلك", propertyNumber: "رقم الممتلك",
    expensesLinked: "المصروفات المرتبطة", properties: "الممتلكات", linkToParent: "ربط بممتلك",
    urgent: "عاجل", upcoming: "قادم", overview: "نظرة عامة", low: "منخفض", ok: "جيد",
    good: "ممتاز", worn: "مستهلك", damaged: "تالف", retired: "متقاعد",
    service: "صيانة", fuel: "وقود", annual: "سنوي", repair: "إصلاح",
    fixed: "ثابت", variable: "متغير", subscription: "اشتراك", oneTime: "لمرة واحدة",
    aiEnhance: "تحسين بالذكاء الاصطناعي", aiEnhanceHint: "استخدم الذكاء الاصطناعي لتحسين نتائج OCR ( اضبط API أولاً)",
    useAI: "استخدام AI", itemName: "البند", total: "الإجمالي", date: "التاريخ", type: "النوع",
    noExpenses: "لا توجد مصروفات", noParents: "لا توجد ممتلكات", noInvoices: "لا توجد فواتير",
    items: "بند", perMonth: "/شهر", deleteConfirm: "هل أنت متأكد من الحذف؟",
    version: "أمل v3.0", back: "رجوع"
  }
};

let currentLang = "en";

export function setLang(l) {
  currentLang = l;
  document.documentElement.lang = l;
  document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  try { localStorage.setItem("amal_lang", l); } catch(e) {}
}

export function loadLang() {
  try {
    const saved = localStorage.getItem("amal_lang");
    if (saved && dict[saved]) { setLang(saved); return saved; }
  } catch(e) {}
  setLang("en");
  return "en";
}

export function t(key) {
  return (dict[currentLang] && dict[currentLang][key]) || key;
}

export function getLang() { return currentLang; }
export function isRTL() { return currentLang === "ar"; }
