
import { SaaSMetrics, FilterOption, KPIItem, AppSettings, BreakdownItem, TopPerformerItem, ChartType, SimulationDriver, ChatMessage } from '../types';

/**
 * 🧠 INTELLIGENT DATA ANALYST ENGINE & NETWORK LAYER
 * V2.1 - Smart Entropy Detection & Adaptive AI Prompts
 */

// --- UTILS ---
const parseNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (value === null || value === undefined || value === '') return 0;
  let cleaned = String(value).trim();
  // Handle Arabic numerals
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  for (let i = 0; i < 10; i++) {
    cleaned = cleaned.replace(new RegExp(arabicDigits[i], 'g'), i.toString());
  }
  // Remove currency symbols and commas, keep negative signs and decimals
  cleaned = cleaned.replace(/[^0-9.\-]/g, ''); 
  const result = parseFloat(cleaned);
  return isNaN(result) ? 0 : result;
};

const safeAdd = (a: number, b: number): number => {
  const factor = 10000; 
  return (Math.round(a * factor) + Math.round(b * factor)) / factor;
};

const isValidDate = (value: any): boolean => {
  if (!value) return false;
  if (typeof value === 'number') return false; 
  const s = String(value);
  if (s.length < 8) return false; 
  if (s.match(/^\d+$/)) return false; 
  const date = new Date(value);
  return !isNaN(date.getTime());
};

const getYearFromDate = (value: any): string => {
  if (!isValidDate(value)) return '';
  return new Date(value).getFullYear().toString();
};

const formatDateLabel = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return String(dateStr);
  }
};

const formatLabel = (key: string): string => {
  const withSpaces = key.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim();
  return withSpaces.replace(/\b\w/g, l => l.toUpperCase());
};

const createZeroMetrics = (lang = 'en'): SaaSMetrics => ({
  primaryMetricLabel: lang === 'ar' ? 'البيانات' : 'Data',
  secondaryMetricLabel: '-',
  mrr: 0, mrrGrowth: 0, activeUsers: 0, userGrowth: 0, churnRate: 0, churnChange: 0, newSignups: 0,
  kpiCards: [],
  recommendedMainChart: 'bar', recommendedDistChart: 'pie',
  trendAnalysis: lang === 'ar' ? 'لا توجد بيانات كافية للتحليل.' : 'Waiting for data...',
  distributionAnalysis: '', volumeAnalysis: '',
  revenueHistory: [], userHistory: [], categoryDistribution: [], regionalData: [],
  breakdownData: [], breakdownSeries: [], topPerformers: [], topPerformersLabel: '',
  drivers: [],
  insights: []
});

const findLargestArray = (obj: any): any[] => {
  if (!obj) return [];
  let largest: any[] = [];
  const isObjectArray = (arr: any[]) => Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'object';
  
  if (isObjectArray(obj)) return obj;
  
  if (Array.isArray(obj)) {
      const jsonMapped = obj.map((i: any) => i?.json || i?.body || i?.data).filter(i => i);
      if (isObjectArray(jsonMapped)) return jsonMapped;
      return obj; 
  }

  const traverse = (current: any, depth: number) => {
    if (!current || depth > 5) return; 
    if (Array.isArray(current)) {
       if (current.length > largest.length && isObjectArray(current)) {
          largest = current;
       }
       current.forEach(item => traverse(item, depth + 1));
       return;
    }
    if (typeof current === 'object') {
       const keys = Object.keys(current);
       for (const key of keys) { traverse(current[key], depth + 1); }
    }
  };
  
  if (typeof obj === 'string') {
     try { const parsed = JSON.parse(obj); return findLargestArray(parsed); } catch { return []; }
  }
  
  traverse(obj, 0);
  return largest;
};

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 180000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// Helper to extract text from unknown JSON structure
const extractTextFromJSON = (data: any): string => {
  if (data === null || data === undefined) return '';
  if (typeof data === 'string') return data;
  
  if (Array.isArray(data)) {
      if (data.length === 0) return '';
      if (data.length === 1) return extractTextFromJSON(data[0]);
      if (data.every(i => typeof i === 'string')) return data.join('\n');
      return extractTextFromJSON(data[0]);
  }

  if (typeof data !== 'object') return String(data);

  const commonKeys = ['output', 'text', 'message', 'response', 'content', 'answer', 'result', 'reply', 'body', 'data', 'choices', 'html'];
  for (const key of commonKeys) {
     if (data[key] !== undefined && data[key] !== null) {
        const val = data[key];
        if (typeof val === 'string' && val.trim().length > 0) return val;
        if (typeof val === 'object' || Array.isArray(val)) {
          const extracted = extractTextFromJSON(val);
          if (extracted) return extracted;
        }
     }
  }

  const keys = Object.keys(data);
  if (keys.length === 1) {
      return extractTextFromJSON(data[keys[0]]);
  }
  
  try { return JSON.stringify(data, null, 2); } catch { return String(data); }
};

export const fetchDashboardData = async (settings: AppSettings): Promise<{ rawData: any[], filters: FilterOption[], error?: boolean }> => {
  const processResponse = (rawData: any) => {
    const data = findLargestArray(rawData);
    if (!data || data.length === 0) return null;
    const filters = generateSmartFilters(data);
    return { rawData: data, filters };
  };
  
  const timestamp = Date.now();
  const triggerBody = JSON.stringify({ trigger: 'manual_refresh_v2', timestamp, sheetId: settings.sheetId, sheetName: settings.sheetName });
  const url = settings.dataWebhookUrl || '';
  
  if (!url) return { rawData: [], filters: [], error: true };
  
  const queryParams = new URLSearchParams({ t: timestamp.toString(), sheetId: settings.sheetId || '', sheetName: settings.sheetName || '' }).toString();
  
  const fetchStrategies = [
    { name: 'AllOrigins', url: `https://api.allorigins.win/get?url=${encodeURIComponent(`${url}?${queryParams}`)}`, method: 'GET', isAllOrigins: true },
    { name: 'Direct', url: `${url}?${queryParams}`, method: 'POST', body: triggerBody, headers: { 'Content-Type': 'application/json' } }
  ];

  for (const strategy of fetchStrategies) {
      try {
          const options: RequestInit = { method: strategy.method, headers: strategy.headers || {} };
          if (strategy.body) options.body = strategy.body;
          const res = await fetchWithTimeout(strategy.url, options);
          
          if (res.ok) {
              const text = await res.text();
              let json;
              try { json = JSON.parse(text); } catch { continue; }
              
              if (strategy.isAllOrigins && json.contents) {
                  try { json = JSON.parse(json.contents); } catch (e) { json = json.contents; }
              }
              
              const result = processResponse(json);
              if (result) return result;
          }
      } catch (e) { console.warn(`[N8N] ${strategy.name} failed`); }
  }
  return { rawData: [], filters: [], error: true };
};

// --- INTELLIGENCE LAYERS ---

const generateSmartFilters = (data: any[]): FilterOption[] => {
  if (data.length === 0) return [];
  const keys = Object.keys(data[0]);
  const potentialFilters: FilterOption[] = [];
  const BLOCKLIST = /id|uuid|guid|_id|key|token|url|link|image|thumb|desc|comment|json|row|index|password|secret/i;

  const dateCol = keys.find(k => !BLOCKLIST.test(k) && (/date|time|created|year/i.test(k) || isValidDate(data[0][k])));
  if (dateCol) {
     const years = new Set<string>();
     data.forEach(row => { const y = getYearFromDate(row[dateCol]); if (y) years.add(y); });
     if (years.size > 1) potentialFilters.push({ id: '__year', label: 'Year', type: 'select', options: Array.from(years).sort().reverse() });
  }

  keys.forEach(key => {
    if (BLOCKLIST.test(key) || key === dateCol) return;
    const uniqueValues = new Set(data.map(row => String(row[key] || '')));
    if (uniqueValues.size >= 2 && uniqueValues.size <= 20) {
       const options = Array.from(uniqueValues).filter(v => v && v !== 'undefined' && v !== 'null').sort();
       if (options.length > 0) potentialFilters.push({ id: key, label: formatLabel(key), type: 'select', options });
    }
  });
  return potentialFilters.slice(0, 4); 
};

type SemanticType = 'money' | 'percent' | 'users' | 'product' | 'location' | 'date' | 'rating' | 'generic';

const detectColumnType = (key: string): SemanticType => {
  const k = key.toLowerCase();
  if (/revenue|mrr|sales|profit|price|cost|amount|total|income|pay|salary|expense|value|إيراد|ربح|مبيعات|سعر|تكلفة|مبلغ|قيمة/i.test(k)) return 'money';
  if (/user|customer|client|staff|person|people|agent|manager|owner|gender|عميل|مستخدم|موظف|شخص/i.test(k)) return 'users';
  if (/product|item|sku|goods|stock|qty|quantity|order|count|منتج|عنصر|بضاعة|مخزون|كمية|طلب|عدد/i.test(k)) return 'product';
  if (/city|country|region|state|address|location|place|مدينة|دولة|منطقة|محافظة/i.test(k)) return 'location';
  if (/date|time|year|month|day|created|at|تاريخ|وقت|سنة/i.test(k)) return 'date';
  if (/rating|score|grade|star|rank|تقييم|نقاط|درجة/i.test(k)) return 'rating';
  if (/rate|percent|conversion|churn|growth|margin|roi|ratio|نسبة|معدل|نمو/i.test(k)) return 'percent';
  return 'generic';
};

// --- MAIN DATA PROCESSING ENGINE ---

export const processRawData = (data: any[], lang: 'en' | 'ar' = 'en'): SaaSMetrics => {
  if (!Array.isArray(data) || data.length === 0) return createZeroMetrics(lang);
  
  const validData = data.filter(row => row && typeof row === 'object');
  if (validData.length === 0) return createZeroMetrics(lang);

  // 1. SCAN COLUMNS & DETECT TYPES
  const keys = Object.keys(validData[0]);
  const numberCols: { key: string, sum: number, avg: number, max: number, type: SemanticType, score: number }[] = [];
  const stringCols: { key: string, unique: number, type: SemanticType }[] = [];
  let dateCol: string | null = null;

  dateCol = keys.find(k => /date|time|created|published/i.test(k) && isValidDate(validData[0][k])) || 
            keys.find(k => isValidDate(validData[0][k])) || null;

  keys.forEach(key => {
      if (key === dateCol || /id|uuid|json/i.test(key)) return;
      
      const val = validData[0][key];
      const type = detectColumnType(key);
      
      let isNum = typeof val === 'number';
      if (!isNum && typeof val === 'string') {
          isNum = !isNaN(parseFloat(val.replace(/[^0-9.-]/g, ''))) && val.length < 15;
      }

      if (isNum) {
          const values = validData.map(r => parseNumber(r[key]));
          const sum = values.reduce((a, b) => a + b, 0);
          const max = Math.max(...values);
          const avg = sum / values.length;
          
          let score = 1;
          if (type === 'money') score += 10;
          if (type === 'users' || type === 'product') score += 5;
          if (/total|sum|amount|revenue|price/i.test(key)) score += 5;
          
          numberCols.push({ key, sum, avg, max, type, score });
      } else {
          const uniqueCount = new Set(validData.map(r => String(r[key]))).size;
          stringCols.push({ key, unique: uniqueCount, type });
      }
  });

  numberCols.sort((a, b) => b.score - a.score);

  const primaryMetric = numberCols[0] || null;
  const secondaryMetric = numberCols[1] || null;
  
  // 2. GENERATE INTELLIGENT KPIs
  const kpiCards: KPIItem[] = [];
  const rowCount = validData.length;

  if (primaryMetric) {
      kpiCards.push({
          id: 'kpi-1',
          label: lang === 'ar' ? `إجمالي ${formatLabel(primaryMetric.key)}` : `Total ${formatLabel(primaryMetric.key)}`,
          value: primaryMetric.sum.toLocaleString(undefined, { maximumFractionDigits: 1 }),
          rawValue: primaryMetric.sum,
          iconType: primaryMetric.type
      });
  } else {
      kpiCards.push({
          id: 'kpi-1',
          label: lang === 'ar' ? 'إجمالي السجلات' : 'Total Records',
          value: rowCount.toLocaleString(),
          iconType: 'list'
      });
  }

  if (primaryMetric) {
      kpiCards.push({
          id: 'kpi-2',
          label: lang === 'ar' ? `متوسط ${formatLabel(primaryMetric.key)}` : `Avg ${formatLabel(primaryMetric.key)}`,
          value: primaryMetric.avg.toLocaleString(undefined, { maximumFractionDigits: 1 }),
          iconType: 'percent'
      });
  } else {
      const entityCol = stringCols.find(c => c.unique > 1 && c.unique < rowCount) || stringCols[0];
      if (entityCol) {
          kpiCards.push({
              id: 'kpi-2',
              label: lang === 'ar' ? `${formatLabel(entityCol.key)} (فريد)` : `Unique ${formatLabel(entityCol.key)}`,
              value: entityCol.unique.toLocaleString(),
              iconType: entityCol.type === 'users' ? 'users' : 'list'
          });
      } else {
          kpiCards.push({ id: 'kpi-2', label: 'Rows', value: rowCount.toString(), iconType: 'list' });
      }
  }

  if (secondaryMetric) {
      kpiCards.push({
          id: 'kpi-3',
          label: lang === 'ar' ? `إجمالي ${formatLabel(secondaryMetric.key)}` : `Total ${formatLabel(secondaryMetric.key)}`,
          value: secondaryMetric.sum.toLocaleString(undefined, { maximumFractionDigits: 1 }),
          iconType: secondaryMetric.type
      });
  } else if (primaryMetric) {
      kpiCards.push({
          id: 'kpi-3',
          label: lang === 'ar' ? `أعلى ${formatLabel(primaryMetric.key)}` : `Max ${formatLabel(primaryMetric.key)}`,
          value: primaryMetric.max.toLocaleString(undefined, { maximumFractionDigits: 1 }),
          iconType: 'trend'
      });
  } else {
      kpiCards.push({ id: 'kpi-3', label: 'Fields', value: keys.length.toString(), iconType: 'generic' });
  }

  const statusCol = stringCols.find(c => c.unique >= 2 && c.unique <= 8 && /status|state|priority|type|cat/i.test(c.key)) || 
                    stringCols.find(c => c.unique >= 2 && c.unique <= 5);

  if (statusCol) {
      const counts: Record<string, number> = {};
      validData.forEach(r => { const s = String(r[statusCol.key]); counts[s] = (counts[s] || 0) + 1; });
      const topEntry = Object.entries(counts).sort((a,b) => b[1] - a[1])[0];
      
      kpiCards.push({
          id: 'kpi-4',
          label: lang === 'ar' ? `الأكثر: ${topEntry[0]}` : `Most: ${topEntry[0]}`,
          value: topEntry[1].toLocaleString(),
          iconType: 'alert'
      });
  } else {
      kpiCards.push({
          id: 'kpi-4',
          label: lang === 'ar' ? 'حجم البيانات' : 'Dataset Size',
          value: rowCount.toLocaleString(),
          iconType: 'Database' as any
      });
  }

  // 3. SMART CHART (Trends or Top Rankings)
  let history: any[] = [];
  let chartType: ChartType = 'area';
  let trendAnalysis = '';

  if (dateCol && primaryMetric) {
      const dateMap = new Map<string, number>();
      validData.forEach(row => {
          const d = formatDateLabel(row[dateCol!]);
          const v = parseNumber(row[primaryMetric.key]);
          dateMap.set(d, safeAdd((dateMap.get(d) || 0), v));
      });
      history = Array.from(dateMap.entries())
          .map(([name, value]) => ({ name, value }))
          .sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());
      
      if (history.length <= 1) chartType = 'bar';

      trendAnalysis = lang === 'ar' 
          ? `يظهر الرسم البياني تطور ${formatLabel(primaryMetric.key)} عبر الزمن.`
          : `Timeline analysis of ${formatLabel(primaryMetric.key)}.`;

  } else {
      // If no date, show Top 15 entities
      const groupCol = stringCols.find(c => c.unique > 3 && c.unique < 50) || stringCols[0];
      
      if (groupCol) {
          const groupMap = new Map<string, number>();
          validData.forEach(row => {
              const k = String(row[groupCol.key] || 'Unknown');
              const v = primaryMetric ? parseNumber(row[primaryMetric.key]) : 1; 
              groupMap.set(k, safeAdd((groupMap.get(k) || 0), v));
          });

          history = Array.from(groupMap.entries())
             .map(([name, value]) => ({ name, value }))
             .sort((a,b) => b.value - a.value)
             .slice(0, 15); 

          chartType = 'bar';
          trendAnalysis = lang === 'ar'
             ? `توزيع ${formatLabel(primaryMetric?.key || 'العدد')} حسب ${formatLabel(groupCol.key)}.`
             : `Ranking of ${formatLabel(groupCol.key)} by ${formatLabel(primaryMetric?.key || 'Count')}.`;
      } else {
          history = validData.slice(0, 10).map((r, i) => ({ name: `#${i+1}`, value: primaryMetric ? parseNumber(r[primaryMetric.key]) : 1 }));
          chartType = 'bar';
      }
  }

  // 4. DISTRIBUTION (Simple Pie)
  const distCol = stringCols.find(c => c.unique >= 2 && c.unique <= 10 && c.key !== (history[0] as any)?.name) || stringCols[0];
  const distData = [];
  if (distCol) {
      const dMap = new Map<string, number>();
      validData.forEach(row => {
         const k = String(row[distCol.key] || 'Other');
         const v = primaryMetric ? parseNumber(row[primaryMetric.key]) : 1;
         dMap.set(k, safeAdd((dMap.get(k) || 0), v));
      });
      distData.push(...Array.from(dMap.entries()).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value));
  }

  // 5. INTELLIGENT MATRIX BREAKDOWN (With Entropy & Duplicate Prevention)
  const catCandidates = stringCols.filter(c => c.unique >= 2 && c.unique <= 15).sort((a,b) => b.unique - a.unique);
  let breakdownData: any[] = [];
  let breakdownSeries: string[] = [];
  let volumeAnalysis = '';

  if (catCandidates.length >= 2) {
      let bestX = catCandidates[0].key;
      let bestS = '';
      
      // Try to find a series column that isn't 1-to-1 with the X column (High Entropy)
      for (let i = 1; i < catCandidates.length; i++) {
         const candidateS = catCandidates[i].key;
         
         const checkMap: Record<string, Set<string>> = {};
         let sampleCount = 0;
         
         for (const row of validData) {
            if (sampleCount > 50) break; // check first 50 rows
            const xVal = String(row[bestX]);
            const sVal = String(row[candidateS]);
            if (!checkMap[xVal]) checkMap[xVal] = new Set();
            checkMap[xVal].add(sVal);
            sampleCount++;
         }
         
         const totalUnique = Object.values(checkMap).reduce((acc, set) => acc + set.size, 0);
         const avgUnique = totalUnique / Object.keys(checkMap).length;
         
         if (avgUnique > 1.2) {
            bestS = candidateS;
            break; 
         }
      }

      if (bestS) {
          const seriesSet = new Set<string>();
          const aggregation: Record<string, any> = {};
          validData.forEach(row => {
              const xVal = String(row[bestX] || 'Unknown');
              const sVal = String(row[bestS] || 'Other');
              const v = primaryMetric ? parseNumber(row[primaryMetric.key]) : 1;
              if (!aggregation[xVal]) aggregation[xVal] = { name: xVal };
              seriesSet.add(sVal);
              aggregation[xVal][sVal] = safeAdd((aggregation[xVal][sVal] as number || 0), v);
          });
          breakdownData = Object.values(aggregation).sort((a:any, b:any) => {
             const sumA = Object.values(a).reduce((acc:number, val) => typeof val === 'number' ? acc + val : acc, 0) as number;
             const sumB = Object.values(b).reduce((acc:number, val) => typeof val === 'number' ? acc + val : acc, 0) as number;
             return sumB - sumA;
          }).slice(0, 10);
          breakdownSeries = Array.from(seriesSet);
          volumeAnalysis = lang === 'ar' ? `تحليل: ${formatLabel(bestX)} حسب ${formatLabel(bestS)}.` : `Analysis: ${formatLabel(bestX)} by ${formatLabel(bestS)}.`;
      }
  }

  // 6. TOP LIST (Simple ranking)
  const { topPerformers, topPerformersLabel } = (() => {
     const labelCol = stringCols.find(c => c.unique > 5 && c.key !== (breakdownSeries.length > 0 ? catCandidates[0].key : '')) || stringCols[0];
     if (!labelCol) return { topPerformers: [], topPerformersLabel: '' };
     const scoreMap: Record<string, number> = {};
     validData.forEach(r => {
         const n = String(r[labelCol.key]);
         const v = primaryMetric ? parseNumber(r[primaryMetric.key]) : 1;
         scoreMap[n] = safeAdd((scoreMap[n] || 0), v);
     });
     const list = Object.entries(scoreMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5);
     return { topPerformers: list, topPerformersLabel: formatLabel(labelCol.key) };
  })();

  // 7. SIMULATION DRIVERS
  const drivers: SimulationDriver[] = numberCols
      .filter(col => !/id|code|zip|year|phone/i.test(col.key) && col.sum > 0)
      .slice(0, 5) 
      .map(col => {
         const isNegative = /cost|expense|tax|loss|churn|debt|تكلفة|مصروف|خصم/i.test(col.key);
         let driverType: 'money' | 'percent' | 'count' | 'generic' = 'generic';
         if (col.type === 'money') driverType = 'money';
         else if (col.type === 'percent') driverType = 'percent';
         else if (col.type === 'users' || col.type === 'product') driverType = 'count';

         return {
            id: col.key,
            label: formatLabel(col.key),
            originalValue: col.sum,
            type: driverType,
            impact: isNegative ? 'negative' : 'positive'
         };
      });

  // 8. AUTOMATED INSIGHTS
  const insights: string[] = [];
  if (primaryMetric) {
     if (topPerformers.length > 0 && primaryMetric.sum > 0) {
        const topVal = topPerformers[0].value;
        const share = (topVal / primaryMetric.sum) * 100;
        if (share > 20) {
           insights.push(lang === 'ar' 
              ? `📊 **قاعدة باريتو:** يمثل "${topPerformers[0].name}" نسبة ${share.toFixed(0)}% من إجمالي ${formatLabel(primaryMetric.key)}.` 
              : `📊 **Pareto Principle:** "${topPerformers[0].name}" drives ${share.toFixed(0)}% of all ${formatLabel(primaryMetric.key)}.`);
        }
     }
     if (history.length > 4 && dateCol) {
        const firstHalf = history.slice(0, Math.floor(history.length / 2)).reduce((a,b) => a+b.value, 0);
        const secondHalf = history.slice(Math.floor(history.length / 2)).reduce((a,b) => a+b.value, 0);
        const growth = ((secondHalf - firstHalf) / firstHalf) * 100;
        const trendIcon = growth > 0 ? '📈' : '📉';
        insights.push(lang === 'ar' 
           ? `${trendIcon} **تحليل الاتجاه:** هناك ${growth > 0 ? 'نمو' : 'انخفاض'} بنسبة ${Math.abs(growth).toFixed(1)}% في النصف الأخير من الفترة.`
           : `${trendIcon} **Momentum:** Trend is ${growth > 0 ? 'UP' : 'DOWN'} by ${Math.abs(growth).toFixed(1)}% in the recent period.`);
     }
     const values = history.map(h => h.value);
     if (values.length > 5) {
        const mean = values.reduce((a,b) => a+b,0) / values.length;
        const variance = values.reduce((a,b) => a + Math.pow(b-mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        const cv = stdDev / mean;
        if (cv > 0.5) {
            insights.push(lang === 'ar' ? '⚠️ **تذبذب عالٍ:** البيانات تظهر تقلبات كبيرة، مما قد يشير إلى عدم استقرار.' : '⚠️ **High Volatility:** Significant fluctuations detected in the data stream.');
        }
     }
  }

  return {
    primaryMetricLabel: primaryMetric ? formatLabel(primaryMetric.key) : (lang === 'ar' ? 'عدد' : 'Count'),
    secondaryMetricLabel: distCol ? formatLabel(distCol.key) : 'Type',
    mrr: primaryMetric ? primaryMetric.sum : rowCount,
    mrrGrowth: 0, activeUsers: rowCount, userGrowth: 0, churnRate: 0, churnChange: 0, newSignups: 0,
    kpiCards,
    recommendedMainChart: chartType,
    recommendedDistChart: 'pie',
    revenueHistory: history,
    userHistory: [],
    categoryDistribution: distData,
    regionalData: [],
    breakdownData,
    breakdownSeries,
    topPerformers,
    topPerformersLabel,
    trendAnalysis,
    distributionAnalysis: lang === 'ar' ? 'توزيع النسب.' : 'Percentage distribution.',
    volumeAnalysis,
    drivers,
    insights
  };
};

// --- REPORT GENERATION (UPDATED) ---

const REPORT_PROMPT_TEMPLATE = `
You are an expert business data analyst and senior corporate report designer, specialized in generating CLEAN, RESPONSIVE HTML reports that will be immediately converted to PDF by my backend.

Your goal:
Generate a COMPLETE, PROFESSIONAL, PRINT-READY BUSINESS REPORT based ONLY on the synced data I provide from my SaaS platform.

The report must:
- Be fully responsive for PDF print.
- **CRITICAL:** Use standard CSS to remove browser headers/footers (@page { margin: 0 }).
- **VISUALS:** Include CSS-based charts using simple, robust layouts.

================================================
SYNCED DATA (JSON INPUT FROM MY PLATFORM)
================================================
{{SYNCED_DATA_JSON}}
================================================

RULES:
1) BASE EVERYTHING STRICTLY ON THE SYNCED DATA JSON.
2) LANGUAGE & DIRECTION:
   - If "report_language" == "ar", write in Arabic with dir="rtl".
   - Else, write in English with dir="ltr".
3) OUTPUT FORMAT:
   - Return ONE valid HTML document ONLY.
   - NO markdown, NO backticks.
   - **CSS REQUIREMENTS (FIXED FOR PDF):**
      - Include a <style> block.
      - * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
      
      /* HIDE BROWSER HEADERS */
      - @page { size: auto; margin: 0mm; } 
      
      /* MAIN BODY */
      - body { 
          font-family: 'Helvetica Neue', Arial, sans-serif; 
          margin: 0; 
          padding: 20mm; 
          background: white; 
          color: black; 
        }
      
      - h1 { font-size: 24px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; color: #111; border-bottom: 2px solid #000; padding-bottom: 10px; }
      - h2 { font-size: 14px; color: #666; margin-top: 0; margin-bottom: 30px; font-weight: normal; }
      - h3 { font-size: 14px; font-weight: bold; background: #f3f4f6; padding: 8px 12px; margin-top: 25px; margin-bottom: 15px; border-radius: 4px; text-transform: uppercase; }
      - p, li { font-size: 11px; line-height: 1.5; color: #333; }
      
      /* DASHBOARD GRID */
      - .dashboard-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 25px; }
      - .kpi-card { border: 1px solid #e5e7eb; padding: 12px; border-radius: 6px; background: #f9fafb; page-break-inside: avoid; }
      - .kpi-label { font-size: 9px; text-transform: uppercase; color: #6b7280; font-weight: 700; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      - .kpi-value { font-size: 20px; font-weight: 800; color: #111827; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

      /* VISUAL CHARTS CONTAINER */
      - .charts-section { display: flex; gap: 20px; margin-bottom: 30px; height: 160px; page-break-inside: avoid; }
      - .chart-box { flex: 1; border: 1px solid #e5e7eb; padding: 15px; border-radius: 6px; display: flex; flex-direction: column; overflow: hidden; }
      - .chart-title { font-size: 10px; font-weight: bold; margin-bottom: 10px; text-align: center; text-transform: uppercase; color: #374151; }
      
      /* VERTICAL BAR CHART (Trends) - ROBUST LAYOUT */
      - .bar-chart { flex: 1; display: flex; align-items: flex-end; justify-content: space-between; gap: 4px; padding-top: 10px; }
      - .bar-col { display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end; }
      /* AI GENERATED inline style height: X% */
      - .bar { width: 90%; background: #1f2937; border-radius: 2px 2px 0 0; min-height: 1px; } 
      - .bar-lbl { font-size: 7px; color: #6b7280; margin-top: 4px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }

      /* HORIZONTAL RANK CHART (Performance) - PERCENTAGE LAYOUT */
      - .rank-list { display: flex; flex-direction: column; justify-content: space-around; flex: 1; }
      - .rank-row { display: flex; align-items: center; width: 100%; height: 18px; margin-bottom: 4px; }
      /* Name: 30%, Bar: 50%, Value: 20% to prevent overlap */
      - .rank-name { width: 30%; font-size: 9px; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 5px; }
      - .rank-track { width: 50%; height: 6px; background: #f3f4f6; border-radius: 3px; overflow: hidden; display: flex; }
      - .rank-fill { height: 100%; background: #1f2937; border-radius: 3px; }
      - .rank-val { width: 20%; font-size: 9px; font-weight: 700; text-align: right; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-left: 5px; }

      /* DATA TABLE STYLES */
      - table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; page-break-inside: auto; }
      - th { text-align: left; border-bottom: 2px solid #111; padding: 6px; font-weight: bold; text-transform: uppercase; font-size: 9px; }
      - td { border-bottom: 1px solid #eee; padding: 6px; color: #333; }
      - tr:nth-child(even) { background-color: #f9fafb; }
      - tr:last-child td { border-bottom: none; }

REPORT STRUCTURE:

[1] CLEAN HEADER
- <h1 style="border:none; margin:0;">{{report_title}}</h1>

[2] DASHBOARD GRID
- <div class="dashboard-grid"> ...kpi-cards... </div>

[3] CHARTS
- <div class="charts-section">
  <!-- LEFT: TRENDS -->
  <div class="chart-box">
     <div class="chart-title">Trends</div>
     <div class="bar-chart">
        <!-- Generate 5-7 bars. Calculate height % relative to max value. -->
     </div>
  </div>
  <!-- RIGHT: TOP PERFORMERS -->
  <div class="chart-box">
     <div class="chart-title">Top Performers</div>
     <div class="rank-list">
        <!-- Generate 5 rows. Calculate width % relative to max value. -->
     </div>
  </div>
</div>

[4] AI RECOMMENDATIONS
- <h3>AI Recommendations</h3>
- <p>Based on the analysis of {{metrics.record_count}} records:</p>
- <ul>
  <!-- Generate 3-4 bullet points from 'insights' array. -->
  <li>...</li>
</ul>

[5] DETAILED DATA TABLE
- <h3>Detailed Data Table</h3>
- <p>Comprehensive breakdown of the top records.</p>
- <table>
   <thead>
      <tr>
         <th>Name / Item</th>
         <th style="text-align:right;">Value</th>
      </tr>
   </thead>
   <tbody>
      <!-- Generate 10 rows from 'detailed_table_data'. If data is missing, use 'top_performers' -->
      <!-- Example: <tr><td>Item Name</td><td style="text-align:right;">1,234</td></tr> -->
   </tbody>
</table>

Make it look professional. Ensure NO TEXT overflows the borders. Use ellipsis if needed.
`;

export const generateStrategicReport = async (metrics: SaaSMetrics, settings: AppSettings): Promise<string> => {
   if (!settings.chatWebhookUrl) throw new Error("API Connection Missing");

   // Prepare a concentrated version of the metrics
   const trendsSlice = metrics.revenueHistory.length > 0 ? metrics.revenueHistory.slice(-7) : [];
   const tableData = metrics.revenueHistory.length > 0 ? metrics.revenueHistory.slice(0, 15) : metrics.topPerformers;

   const reportData = {
      report_title: "Strategic Performance Report",
      // REMOVED generated_at to avoid header clutter
      report_language: document.documentElement.dir === 'rtl' ? 'ar' : 'en',
      metrics: {
         primary_metric: metrics.primaryMetricLabel,
         total_value: metrics.mrr,
         record_count: metrics.activeUsers,
         top_performer: metrics.topPerformers[0] || null,
      },
      kpis: metrics.kpiCards.map(k => ({ label: k.label, value: k.value })),
      trends: trendsSlice, 
      breakdown: metrics.breakdownData.slice(0, 5),
      top_performers: metrics.topPerformers.slice(0, 5),
      detailed_table_data: tableData, // PASSED FOR TABLE GENERATION
      insights: metrics.insights
   };

   const prompt = REPORT_PROMPT_TEMPLATE.replace('{{SYNCED_DATA_JSON}}', JSON.stringify(reportData, null, 2));

   // Re-use the chat endpoint for report generation
   let url = settings.chatWebhookUrl.trim();
   const hasQuery = url.includes('?');
   url = `${url}${hasQuery ? '&' : '?'}t=${Date.now()}`;

   try {
      const response = await fetchWithTimeout(url, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            message: "GENERATE_REPORT",
            chatInput: "GENERATE_REPORT", 
            context: prompt, // We send the full instructions as context
            timestamp: new Date().toISOString()
         })
      }, 120000); // Longer timeout for report generation

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      
      // Try to parse if it's JSON, otherwise return raw text
      try {
         const json = JSON.parse(text);
         return extractTextFromJSON(json);
      } catch {
         return text;
      }
   } catch (error) {
      console.error("Report Generation Failed:", error);
      throw error;
   }
};

// --- CHAT ENGINE ---

export const sendChatMessageToN8N = async (message: string, history: ChatMessage[], contextData: SaaSMetrics, settings: AppSettings): Promise<string> => {
   if (!settings.chatWebhookUrl) {
      throw new Error("Chat Webhook URL is missing in settings.");
   }

   const kpiSummary = contextData.kpiCards.slice(0, 6).map(k => `| ${k.label} | ${k.value} |`).join('\n');
   const topPerformerName = contextData.topPerformers[0]?.name || 'N/A';
   const topPerformerValue = contextData.topPerformers[0]?.value || '0';

   const systemContext = `
--- DASHBOARD LIVE DATA ---
Primary Metric: ${contextData.primaryMetricLabel} = ${contextData.mrr}
Total Records: ${contextData.activeUsers}
Top Performer: ${topPerformerName} (${topPerformerValue})

| Metric | Value |
|--------|-------|
${kpiSummary}

INSTRUCTIONS FOR AI:
1. **TRANSACTIONAL QUESTIONS** (e.g., 'How many...', 'What is...', 'Who is...'):
   - Reply with **ONLY** the number or name. Maximum 10 words.
   - Example User: "How many users?"
   - Example You: "There are 1,240 active users."
   - STOP. Do not add advice.

2. **ANALYTICAL QUESTIONS** (e.g., 'Why...', 'Explain...'):
   - Provide exactly 3 bullet points explaining the data.
   - Use the numbers from the context.

3. **STRATEGIC QUESTIONS** (e.g., 'How to grow...', 'Give me a plan'):
   - ONLY THEN provides a detailed, professional strategy.
   - Focus on High-Value targets (Top Performers).

GENERAL RULES:
- Never say "Based on the data provided". Just answer.
- If the data is missing, say "I do not have that data".
--- END DATA ---
   `;

   let url = settings.chatWebhookUrl.trim();
   const hasQuery = url.includes('?');
   url = `${url}${hasQuery ? '&' : '?'}t=${Date.now()}`;

   const makeRequest = async (bodyPayload: any) => {
      const response = await fetchWithTimeout(url, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Accept': '*/*' },
         body: JSON.stringify(bodyPayload),
      }, 60000);

      if (!response.ok) throw new Error(`HTTP_ERROR_${response.status}`);
      const text = await response.text();
      try {
          const data = JSON.parse(text);
          return extractTextFromJSON(data);
      } catch { return text; }
   };

   try {
      const richPayload = {
         message,
         chatInput: message,
         sessionId: 'dashboard-session',
         context: systemContext,
         history: history.slice(-6) 
      };
      
      try {
         return await makeRequest(richPayload);
      } catch (err) {
         // Fallback for simple webhook schemas
         return await makeRequest({ message, text: message });
      }

   } catch (error) {
      console.error("Chat Error:", error);
      throw error;
   }
};
