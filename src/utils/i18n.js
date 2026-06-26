const dict = {
  en: {
    appName: "AMAL", appNameAr: "أمل",
    dashboard: "Dashboard", expenses: "Expenses", invoices: "Invoices", parents: "Properties", settings: "Settings",
    add: "Add", save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit", confirm: "Confirm", remove: "Remove",
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
    version: "AMAL v3.0", back: "Back",
    // Invoice items
    itemAdded: "Item added", itemRemoved: "Item removed", allItemsAdded: "All items added",
    groupForItems: "Group for all items", changeGroup: "Change group",
    invoiceName: "Invoice Name", generatedName: "Auto-generated name",
    linkToInvoice: "Link to Invoice", searchInvoice: "Search invoice...",
    noEndDate: "No end date", includeInTimeline: "Include in timeline",
    // AI Settings
    aiSettings: "AI Settings", enableAI: "Enable AI", aiProvider: "Provider",
    customEndpoint: "Custom Endpoint", model: "Model", apiKey: "API Key",
    processingMode: "Processing Mode", textOnly: "Text only (OCR)",
    imageOnly: "Image only", textAndImage: "Text + Image",
    systemPrompt: "System Prompt", authType: "Auth Type", bearer: "Bearer",
    custom: "Custom", saveAI: "Save AI Config", aiSaved: "AI configuration saved",
    aiDisabled: "AI is disabled. Enable it in settings.",
    testAI: "Test AI", processing: "Processing...",
    // Item management
    removeItemConfirm: "Remove this item?",
    editItem: "Edit Item", itemGroup: "Item Group",
    // Invoice image
    invoiceImage: "Invoice Image", tapToView: "Tap to view",
  },
  ar: {
    appName: "AMAL", appNameAr: "أمل",
    dashboard: "لوحة التحكم", expenses: "المصروفات", invoices: "الفواتير", parents: "الممتلكات", settings: "الإعدادات",
    add: "إضافة", save: "حفظ", cancel: "إلغاء", delete: "حذف", edit: "تعديل", confirm: "تأكيد", remove: "إزالة",
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
    version: "أمل v3.0", back: "رجوع",
    // Invoice items
    itemAdded: "تم إضافة البند", itemRemoved: "تم إزالة البند", allItemsAdded: "تم إضافة كل البنود",
    groupForItems: "المجموعة لكل البنود", changeGroup: "تغيير المجموعة",
    invoiceName: "اسم الفاتورة", generatedName: "اسم تلقائي",
    linkToInvoice: "ربط بفاتورة", searchInvoice: "ابحث عن فاتورة...",
    noEndDate: "بدون تاريخ انتهاء", includeInTimeline: "تضمين في الخط الزمني",
    // AI Settings
    aiSettings: "إعدادات الذكاء الاصطناعي", enableAI: "تفعيل الذكاء الاصطناعي", aiProvider: "المزود",
    customEndpoint: "نقطة النهاية المخصصة", model: "النموذج", apiKey: "مفتاح API",
    processingMode: "طريقة المعالجة", textOnly: "نص فقط (OCR)",
    imageOnly: "صورة فقط", textAndImage: "نص + صورة",
    systemPrompt: "تعليمات النظام", authType: "نوع المصادقة", bearer: "Bearer",
    custom: "مخصص", saveAI: "حفظ إعدادات AI", aiSaved: "تم حفظ إعدادات الذكاء الاصطناعي",
    aiDisabled: "الذكاء الاصطناعي معطل. فعله من الإعدادات.",
    testAI: "اختبار AI", processing: "جاري المعالجة...",
    // Item management
    removeItemConfirm: "إزالة هذا البند؟",
    editItem: "تعديل البند", itemGroup: "مجموعة البند",
    // Invoice image
    invoiceImage: "صورة الفاتورة", tapToView: "اضغط للعرض",
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
