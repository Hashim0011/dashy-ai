
import { Theme, AppSettings } from './types';

// DEFAULT SETTINGS (Used if nothing is saved in LocalStorage)
export const DEFAULT_SETTINGS: AppSettings = {
  sheetId: '', 
  sheetName: 'Dashboard Data',
  dataWebhookUrl: (import.meta.env.VITE_N8N_DATA_WEBHOOK_URL || ''),
  // UPDATED CHAT URL - Production Mode
  chatWebhookUrl: (import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL || '')
};

// --- THE ONE TRUE THEME (PREMIUM TECH NOIR) ---
// This theme is perfectly synced with the Landing Page aesthetics.
export const UNIFIED_THEME: Theme = {
  id: 'dashy-premium-v2',
  name: 'Dashy Ultimate',
  isDark: true,
  bg: '#030303', // Deepest Black (Landing Page Background)
  cardBg: '#0e0e0e', // Slightly lighter for Bento Cards
  textPrimary: '#ffffff',
  textSecondary: '#9ca3af', // Cool Gray
  accent: '#06b6d4', // Cyan 500 (Primary Brand Color)
  // Sophisticated gradient: Cyan -> Blue -> Purple hint
  accentGradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)', 
  borderColor: 'rgba(255, 255, 255, 0.08)', // Very subtle border
  shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', // Deep dreamy shadows
  // Curated Chart Colors for Black Background
  chartColors: [
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#10b981', // Emerald
    '#f43f5e', // Rose
    '#f59e0b', // Amber
    '#ec4899'  // Pink
  ]
};

// Legacy export for compatibility, but mapped to the unified theme (Also used for Landing Page prop)
export const LANDING_THEME = UNIFIED_THEME;

// Generator now always returns the single premium theme
export const generateRandomTheme = (previousId?: string): Theme => {
  return UNIFIED_THEME;
};

export const EXECUTIVE_PROMPT_TEMPLATE = `
You are a senior data analyst creating executive-level insights and recommendations. Transform raw data analysis into actionable business intelligence.

**CRITICAL REQUIREMENTS:**
- Every insight must answer "So what?" for the business
- Recommendations must be SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
- Use business-outcome language, not technical jargon
- Focus on actionable insights with clear ownership

**PROFESSIONAL TEMPLATE:**

## 📊 DATA INSIGHTS & STRATEGIC RECOMMENDATIONS

### EXECUTIVE OBSERVATIONS
• **Primary Pattern**: [What pattern was detected and its business significance]
• **Data Quality Status**: [Overall assessment of data reliability]
• **Business Impact**: [How this affects decision-making or operations]

### CRITICAL FINDINGS
1. **[Finding Title - Business Focused]**
   - **Evidence**: [Specific data pattern with metrics]
   - **Business Interpretation**: [What this means for the organization]
   - **Risk/Opportunity**: [Clear statement of impact]

2. **[Finding Title - Business Focused]**
   - **Evidence**: [Specific data pattern with metrics]
   - **Business Interpretation**: [What this means for the organization]
   - **Risk/Opportunity**: [Clear statement of impact]

### 🎯 PRIORITIZED RECOMMENDATIONS

#### IMMEDIATE ACTIONS (Next 2 Weeks)
**1. [Specific Action Title]**
- **Objective**: [Clear, measurable goal]
- **Steps**: [Concrete implementation steps]
- **Owner**: [Recommended department/role]
- **Success Metrics**: [How to measure improvement]
- **Expected Outcome**: [Tangible business result]

**2. [Specific Action Title]**
- **Objective**: [Clear, measurable goal]
- **Steps**: [Concrete implementation steps]
- **Owner**: [Recommended department/role]
- **Success Metrics**: [How to measure improvement]
- **Expected Outcome**: [Tangible business result]

#### STRATEGIC INITIATIVES (Next 1-3 Months)
**1. [Strategic Initiative Title]**
- **Business Case**: [Why this matters strategically]
- **Implementation Roadmap**: [Key phases and timeline]
- **Resources Required**: [People, tools, budget]
- **ROI Impact**: [Expected business value]

### 📈 SUCCESS MEASUREMENT FRAMEWORK
• **Short-term KPIs**: [30-day measurable metrics]
• **Long-term Metrics**: [90-day business outcomes]
• **Quality Indicators**: [Data health improvement targets]

### ⚠️ RISKS & MITIGATIONS
• **Current Risks**: [What could go wrong with current state]
• **Proactive Measures**: [How to prevent issues]
• **Contingency Plans**: [Backup strategies]
`;

export const TRANSLATIONS = {
  en: {
    dashboard: "Dashboard",
    insights: "Insights",
    analysis: "Analysis",
    settings: "Settings",
    refresh: "Refresh Data",
    syncing: "Syncing...",
    live: "Live",
    error: "Error",
    rows: "Rows",
    filterData: "Filter Data",
    reset: "Reset",
    noData: "No Data",
    distributionBy: "Distribution by",
    comparison: "Comparison",
    dataVolume: "Data Volume",
    trend: "Trend",
    automatedInsights: "Automated Insights",
    observedPattern: "Observed Pattern",
    askChat: "Ask the AI Analyst about your data...",
    simulator: "Simulator",
    controlDeck: "Control Deck",
    revenueForecast: "Revenue Forecast",
    profitForecast: "Profit Forecast",
    visualization: "Visualization",
    variables: "Variables",
    year: "Year",
    all: "All",
    generatingReport: "Generating Strategic Executive Report...",
    strategicReport: "Strategic Executive Report",
    consultation: "AI Analyst Consultation",
    consultationDesc: "Deep dive into your data with the Smart Bot.",
    startChat: "Start Analysis",
    // Settings
    configureSettings: "Configure your dashboard and integrations",
    dataSource: "Data Source",
    dataSourceDesc: "Connect your Google Sheets to power your dashboard metrics",
    integrations: "Integrations",
    integrationsDesc: "Configure your n8n webhooks for automation",
    sheetId: "Sheet ID",
    sheetName: "Sheet Name / Tab",
    dataWebhook: "Metrics Refresh Webhook URL",
    chatWebhook: "Chat Advisor Webhook URL",
    syncNow: "Save & Sync Now",
    syncDesc: "This sync triggers the n8n webhook to refresh your live dashboard metrics.",
    webhookStatus: {
       test: "⚠️ TEST MODE DETECTED",
       testDesc: "Your URL ends in '/test'. You MUST click 'Execute Workflow' in n8n before clicking Save here.",
       prod: "✅ LIVE PRODUCTION MODE",
       prodDesc: "Live URL detected. Data will sync automatically."
    },
    // DATA DICTIONARY FOR FILTERS
    dictionary: {
      category: "Category",
      status: "Status",
      region: "Region",
      country: "Country",
      city: "City",
      state: "State",
      type: "Type",
      product: "Product",
      product_name: "Product Name",
      item: "Item",
      name: "Name",
      customer: "Customer",
      client: "Client",
      segment: "Segment",
      source: "Source",
      channel: "Channel",
      department: "Department",
      team: "Team",
      brand: "Brand",
      date: "Date",
      order_date: "Order Date",
      month: "Month",
      quarter: "Quarter",
      sales: "Sales",
      revenue: "Revenue",
      profit: "Profit",
      cost: "Cost",
      amount: "Amount",
      quantity: "Quantity",
      priority: "Priority",
      gender: "Gender",
      group: "Group",
      owner: "Owner",
      manager: "Manager",
      role: "Role",
      description: "Description",
      payment: "Payment",
      method: "Method"
    }
  },
  ar: {
    dashboard: "لوحة المعلومات",
    insights: "التحليلات الذكية",
    analysis: "محاكاة السيناريو",
    settings: "الإعدادات",
    refresh: "تحديث البيانات",
    syncing: "جاري المزامنة...",
    live: "متصل",
    error: "خطأ",
    rows: "سجل",
    filterData: "تصفية البيانات",
    reset: "إعادة تعيين",
    noData: "لا توجد بيانات",
    distributionBy: "التوزيع حسب",
    comparison: "مقارنة",
    dataVolume: "حجم البيانات",
    trend: "مؤشر",
    automatedInsights: "رؤى تلقائية",
    observedPattern: "النمط الملاحظ",
    askChat: "اسأل المحلل الذكي عن بياناتك...",
    simulator: "المحاكي",
    controlDeck: "لوحة التحكم",
    revenueForecast: "توقعات الإيرادات",
    profitForecast: "توقعات الأرباح",
    visualization: "الرسم البياني",
    variables: "المتغيرات",
    year: "السنة",
    all: "الكل",
    generatingReport: "جاري إنشاء التقرير الاستراتيجي التنفيذي...",
    strategicReport: "التقرير الاستراتيجي التنفيذي",
    consultation: "استشارة المحلل الذكي",
    consultationDesc: "تعمق في بياناتك من خلال المحادثة المباشرة.",
    startChat: "ابدأ التحليل",
    // Settings
    configureSettings: "تكوين لوحة القيادة وعمليات التكامل",
    dataSource: "مصدر البيانات",
    dataSourceDesc: "اربط جداول بيانات جوجل لتشغيل مؤشرات لوحة القيادة",
    integrations: "التكاملات والأتمتة",
    integrationsDesc: "قم بتكوين روابط الويب هوك الخاصة بـ n8n",
    sheetId: "معرف الشيت (Sheet ID)",
    sheetName: "اسم الورقة / التبويب",
    dataWebhook: "رابط ويب هوك تحديث البيانات",
    chatWebhook: "رابط ويب هوك المحادثة الذكية",
    syncNow: "حفظ ومزامنة الآن",
    syncDesc: "سيؤدي هذا إلى تشغيل الويب هوك لجلب البيانات الجديدة وعرضها.",
    webhookStatus: {
       test: "⚠️ وضع الاختبار (Test Mode)",
       testDesc: "الرابط ينتهي بـ '/test'. يجب عليك ضغط 'Execute Workflow' في n8n أولاً قبل الإرسال.",
       prod: "✅ وضع الإنتاج (Live Mode)",
       prodDesc: "رابط مباشر. ستتم المزامنة تلقائياً."
    },
    // DATA DICTIONARY FOR FILTERS
    dictionary: {
      category: "الفئة",
      status: "الحالة",
      region: "المنطقة",
      country: "الدولة",
      city: "المدينة",
      state: "المحافظة/الولاية",
      type: "النوع",
      product: "المنتج",
      product_name: "اسم المنتج",
      item: "العنصر",
      name: "الاسم",
      customer: "العميل",
      client: "العميل",
      segment: "الشريحة",
      source: "المصدر",
      channel: "القناة",
      department: "القسم",
      team: "الفريق",
      brand: "العلامة التجارية",
      date: "التاريخ",
      order_date: "تاريخ الطلب",
      month: "الشهر",
      quarter: "الربع السنوي",
      sales: "المبيعات",
      revenue: "الإيرادات",
      profit: "الأرباح",
      cost: "التكلفة",
      amount: "المبلغ",
      quantity: "الكمية",
      priority: "الأولوية",
      gender: "الجنس",
      group: "المجموعة",
      owner: "المالك",
      manager: "المدير",
      role: "الدور",
      description: "الوصف",
      payment: "الدفع",
      method: "الطريقة"
    }
  }
};

export const FILTERS: import('./types').FilterOption[] = [
  { id: 'timeRange', label: 'Time Range', type: 'select', options: ['All Time', 'Last 30 Days', 'This Year'] },
];
