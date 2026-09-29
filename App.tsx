
import React, { useState, useEffect, useMemo } from 'react';
import { generateRandomTheme, FILTERS as DEFAULT_FILTERS, TRANSLATIONS, DEFAULT_SETTINGS, UNIFIED_THEME } from './constants';
import { fetchDashboardData, processRawData, generateStrategicReport } from './services/n8nService';
import { Theme, ViewMode, AppSettings, FilterOption, ActiveFilters } from './types';
import { StatCard } from './components/StatCard';
import { DynamicMainChart, DistributionChart, SmartBreakdownChart, HorizontalRankChart } from './components/Charts';
import { FilterBar } from './components/FilterBar';
import { SettingsPanel } from './components/SettingsPanel';
import { WhatIfAnalysis } from './components/WhatIfAnalysis';
import { ChatInterface } from './components/ChatInterface';
import { LandingPage } from './components/LandingPage';
import { 
  LayoutDashboard, RefreshCw, WifiOff, Loader2, Globe,
  DollarSign, Users, TrendingUp, List, AlertCircle, Package, MapPin, Calendar, Star, Activity, Database, Layers, BarChart3, Sparkles, Settings, Zap, Table as TableIcon, Lightbulb, FileText, Download
} from 'lucide-react';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  // Theme is now CONSTANT (UNIFIED_THEME)
  const [currentTheme, setCurrentTheme] = useState<Theme>(UNIFIED_THEME);
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [view, setView] = useState<ViewMode>('dashboard');
  const [loading, setLoading] = useState(true); 
  const [rawData, setRawData] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterOption[]>(DEFAULT_FILTERS);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error' | 'loading'>('loading');
  const [reportHtml, setReportHtml] = useState<string>('');
  const [generatingReport, setGeneratingReport] = useState(false);
  
  // LOAD SETTINGS
  const [settings, setSettings] = useState<AppSettings>(() => {
     const saved = localStorage.getItem('saas_dashboard_settings');
     const parsed = saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
     
     return parsed;
  });

  const t = TRANSLATIONS[lang];

  // Theme Effect only when in App mode
  useEffect(() => {
    if (!showLanding) {
      document.body.style.backgroundColor = currentTheme.bg;
      document.body.style.color = currentTheme.textPrimary;
    } else {
      // Reset for landing page
      document.body.style.backgroundColor = '#030303';
    }
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [currentTheme, lang, showLanding]);
  
  useEffect(() => { handleRefresh(undefined, true); }, []);

  const displayMetrics = useMemo(() => {
    let metrics = processRawData(rawData, lang);
    if (rawData.length > 0) {
      const filteredData = rawData.filter(row => {
        return Object.entries(activeFilters).every(([filterKey, filterValue]) => {
           if (!filterValue || filterValue === 'All') return true;
           if (filterKey === '__year') {
              const dateCol = Object.keys(row).find(k => /date|time|created|year/i.test(k) || !isNaN(Date.parse(row[k])));
              if (dateCol) return new Date(row[dateCol]).getFullYear().toString() === filterValue;
              return true;
           }
           return String(row[filterKey]) === String(filterValue);
        });
      });
      metrics = processRawData(filteredData, lang);
    }
    return metrics;
  }, [rawData, activeFilters, lang]);

  const handleRefresh = async (customSettings?: AppSettings, initialLoad = false) => {
    setLoading(true);
    setConnectionStatus('loading');
    
    // NOTE: We NO LONGER randomise the theme. 
    // The theme remains UNIFIED_THEME to ensure consistent branding.
    
    try {
      const { rawData: fetchedRawData, filters: newFilters, error } = await fetchDashboardData(customSettings || settings);
      if (error) { setConnectionStatus('error'); setRawData([]); } 
      else { setRawData(fetchedRawData || []); if (newFilters.length) setFilters(newFilters); setConnectionStatus('connected'); }
    } catch (e) { setConnectionStatus('error'); } 
    finally { setLoading(false); }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    setReportHtml('');
    try {
      const html = await generateStrategicReport(displayMetrics, settings);
      setReportHtml(html);
    } catch (e) {
      console.error(e);
      setReportHtml('<div class="p-4 text-red-500">Failed to generate report. Please check API settings.</div>');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!reportHtml) return;
    const originalTitle = document.title;
    document.title = " "; 
    const printWindow = window.open('', '_blank');
    if (printWindow) {
       printWindow.document.open();
       printWindow.document.write(reportHtml);
       printWindow.document.close();
       setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          document.title = originalTitle;
       }, 500);
    } else {
       alert("Please allow popups to download the report.");
    }
  };

  const getIcon = (type: string) => {
      switch(type) {
         case 'money': return <DollarSign size={20} />;
         case 'users': return <Users size={20} />;
         case 'product': return <Package size={20} />;
         case 'location': return <MapPin size={20} />;
         case 'date': return <Calendar size={20} />;
         case 'rating': return <Star size={20} />;
         case 'trend': return <TrendingUp size={20} />;
         case 'percent': return <Activity size={20} />;
         case 'list': return <List size={20} />;
         case 'alert': return <AlertCircle size={20} />;
         default: return <Database size={20} />;
      }
   };

  const NAV_ITEMS = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'analysis', label: t.simulator, icon: Zap },
    { id: 'insights', label: t.insights, icon: Sparkles },
    { id: 'report', label: t.strategicReport || 'Report', icon: FileText },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  const getMainChartTitle = () => {
      if (displayMetrics.recommendedMainChart === 'bar') {
          return lang === 'ar' ? 'تحليل المقارنة: الأفضل أداءً' : 'Ranking Analysis: Top Performers';
      }
      return lang === 'ar' ? `اتجاه: ${displayMetrics.primaryMetricLabel}` : `${t.trend}: ${displayMetrics.primaryMetricLabel}`;
  };

  // --- RENDER LANDING PAGE IF ACTIVE ---
  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} lang={lang} setLang={setLang} />;
  }

  // --- RENDER MAIN APP ---
  return (
    <div className="min-h-screen font-sans transition-colors duration-1000 relative overflow-x-hidden" style={{ backgroundColor: currentTheme.bg }}>
      
      {/* Navbar */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-500" style={{ background: currentTheme.isDark ? `${currentTheme.bg}cc` : 'rgba(255,255,255,0.8)', borderColor: currentTheme.borderColor }}>
        <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-4">
           <div className="flex justify-between items-center mb-4 md:mb-0">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border border-white/10 group cursor-pointer hover:scale-110 transition-transform" 
                      style={{ background: currentTheme.accentGradient }}
                      onClick={() => handleRefresh()}>
                    <BarChart3 className="text-white" size={20} />
                 </div>
                 <div>
                   {/* CHANGED NAME TO DASHY */}
                   <h1 className="text-xl font-bold tracking-tight">Dashy <span className="opacity-50 font-normal text-sm">| AI Analytics</span></h1>
                   <div className="flex items-center gap-2 text-[10px] opacity-60 uppercase tracking-widest">
                     <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                     {connectionStatus === 'connected' ? t.live : t.error}
                   </div>
                 </div>
              </div>

              <div className="hidden md:flex items-center bg-white/5 p-1.5 rounded-2xl border backdrop-blur-sm" style={{ borderColor: currentTheme.borderColor }}>
                 {NAV_ITEMS.map((item) => {
                    const isActive = view === item.id;
                    return (
                       <button
                          key={item.id}
                          onClick={() => setView(item.id as ViewMode)}
                          className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${isActive ? 'shadow-md' : 'hover:bg-white/5'}`}
                          style={{ 
                             backgroundColor: isActive ? currentTheme.accent : 'transparent',
                             color: isActive ? '#ffffff' : currentTheme.textPrimary
                          }}
                       >
                          <item.icon size={16} />
                          <span>{item.label}</span>
                       </button>
                    );
                 })}
              </div>

              <div className="flex items-center gap-3">
                 <button onClick={() => setLang(prev => prev === 'en' ? 'ar' : 'en')} className="p-2 rounded-xl border hover:bg-black/5 transition-colors" style={{ borderColor: currentTheme.borderColor }}>
                    <Globe size={16} />
                 </button>
                 <button onClick={() => handleRefresh()} disabled={loading} className="p-2 rounded-xl border hover:bg-black/5 transition-colors" style={{ borderColor: currentTheme.borderColor }}>
                   <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                 </button>
              </div>
           </div>
           
           <div className="md:hidden flex justify-between items-center border-t pt-4 mt-4 overflow-x-auto" style={{ borderColor: currentTheme.borderColor }}>
              {NAV_ITEMS.map((item) => (
                 <button
                    key={item.id}
                    onClick={() => setView(item.id as ViewMode)}
                    className="flex flex-col items-center gap-1 min-w-[70px]"
                    style={{ color: view === item.id ? currentTheme.accent : currentTheme.textSecondary }}
                 >
                    <item.icon size={20} />
                    <span className="text-[10px] font-bold">{item.label}</span>
                 </button>
              ))}
           </div>
        </div>
      </nav>

      <main className="max-w-[1800px] mx-auto px-4 md:px-8 py-8 pb-24">
        
        {/* AUTO-INSIGHTS TICKER */}
        {view === 'dashboard' && displayMetrics.insights.length > 0 && (
           <div className="mb-8 p-4 rounded-2xl border glass-panel flex items-start gap-3 animate-fade-in-up" style={{ borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBg }}>
              <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 shrink-0">
                 <Lightbulb size={20} />
              </div>
              <div>
                 <h4 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1" style={{ color: currentTheme.textPrimary }}>AI Observed Insights</h4>
                 <div className="space-y-1">
                    {displayMetrics.insights.map((insight, i) => (
                       <p key={i} className="text-sm font-medium leading-relaxed" style={{ color: currentTheme.textPrimary }}>
                          {insight}
                       </p>
                    ))}
                 </div>
              </div>
           </div>
        )}

        {view === 'dashboard' && (
          <>
            <FilterBar filters={filters} activeFilters={activeFilters} onFilterChange={(id, val) => setActiveFilters(prev => ({ ...prev, [id]: val }))} theme={currentTheme} t={t} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
               {/* KPIs */}
               {displayMetrics.kpiCards.map(kpi => (
                 <div key={kpi.id} className="md:col-span-1">
                    <StatCard title={kpi.label} value={kpi.value} rawValue={kpi.rawValue} change={kpi.change} icon={getIcon(kpi.iconType)} theme={currentTheme} />
                 </div>
               ))}

               {/* 1. Main Chart */}
               <div className="md:col-span-2 lg:col-span-3 rounded-3xl border p-6 glass-panel min-h-[350px] shadow-lg" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}>
                   <h3 className="text-lg font-bold mb-6" style={{ color: currentTheme.textPrimary }}>{getMainChartTitle()}</h3>
                   <div className="h-[300px]">
                      {displayMetrics.revenueHistory.length > 0 ? (
                        <DynamicMainChart 
                            data={displayMetrics.revenueHistory} 
                            theme={currentTheme} 
                            type={displayMetrics.recommendedMainChart} 
                            insight={displayMetrics.trendAnalysis} 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-50">
                            {lang === 'ar' ? 'بانتظار البيانات...' : 'Waiting for Data...'}
                        </div>
                      )}
                   </div>
               </div>

               {/* 2. Top Performers */}
               <div className="md:col-span-1 lg:col-span-1 rounded-3xl border p-6 glass-panel flex flex-col min-h-[350px]" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}>
                   <h3 className="text-lg font-bold mb-1" style={{ color: currentTheme.textPrimary }}>Top 5</h3>
                   <p className="text-xs opacity-60 mb-4">{displayMetrics.topPerformersLabel || 'Items'}</p>
                   <div className="flex-1 h-full">
                      {displayMetrics.topPerformers.length > 0 ? (
                        <HorizontalRankChart 
                           data={displayMetrics.topPerformers} 
                           theme={currentTheme} 
                           insight={lang === 'ar' ? `أفضل أداء: ${displayMetrics.topPerformers[0]?.name} (${displayMetrics.topPerformers[0]?.value})` : `Top performer is ${displayMetrics.topPerformers[0]?.name} with ${displayMetrics.topPerformers[0]?.value}.`}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full opacity-40">No Data</div>
                      )}
                   </div>
               </div>

               {/* 3. Smart Breakdown OR Table Fallback */}
               <div className="md:col-span-2 lg:col-span-3 rounded-3xl border p-6 glass-panel min-h-[350px]" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}>
                    {displayMetrics.breakdownData.length > 0 ? (
                      <>
                        <div className="flex justify-between items-center mb-6">
                           <h3 className="text-lg font-bold" style={{ color: currentTheme.textPrimary }}>
                              {lang === 'ar' ? 'مصفوفة اتخاذ القرار' : 'Decision Matrix'} <span className="opacity-50 text-sm font-normal">| {displayMetrics.primaryMetricLabel} Breakdown</span>
                           </h3>
                           {displayMetrics.breakdownSeries.length > 0 && (
                              <div className="flex gap-2 text-[10px] font-bold uppercase tracking-widest opacity-60">
                                 <span>By {displayMetrics.breakdownSeries.length} Categories</span>
                              </div>
                           )}
                        </div>
                        <div className="h-[300px]">
                             <SmartBreakdownChart 
                                data={displayMetrics.breakdownData} 
                                series={displayMetrics.breakdownSeries} 
                                theme={currentTheme} 
                                insight={displayMetrics.volumeAnalysis}
                             />
                        </div>
                      </>
                    ) : (
                      /* PROFESSIONAL TABLE FALLBACK */
                      <div className="h-full flex flex-col">
                         <div className="flex items-center gap-2 mb-6">
                            <TableIcon size={20} className="opacity-50" />
                            <h3 className="text-lg font-bold" style={{ color: currentTheme.textPrimary }}>
                               {lang === 'ar' ? 'سجل البيانات التفصيلي' : 'Detailed Data View'} 
                            </h3>
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider">
                               Top 10 Records
                            </span>
                         </div>
                         <div className="flex-1 overflow-auto">
                            <table className="w-full text-left border-collapse">
                               <thead>
                                  <tr className="border-b" style={{ borderColor: currentTheme.borderColor }}>
                                     <th className="p-3 text-xs font-bold uppercase tracking-widest opacity-60">Rank</th>
                                     <th className="p-3 text-xs font-bold uppercase tracking-widest opacity-60">Item</th>
                                     <th className="p-3 text-xs font-bold uppercase tracking-widest opacity-60 text-right">Value</th>
                                  </tr>
                               </thead>
                               <tbody>
                                  {displayMetrics.revenueHistory.slice(0,10).map((row, i) => (
                                     <tr key={i} className="border-b last:border-0 hover:bg-white/5 transition-colors" style={{ borderColor: currentTheme.borderColor }}>
                                        <td className="p-3 text-sm font-mono opacity-50">#{i+1}</td>
                                        <td className="p-3 text-sm font-bold">{row.name}</td>
                                        <td className="p-3 text-sm font-mono text-right">{row.value.toLocaleString()}</td>
                                     </tr>
                                  ))}
                               </tbody>
                            </table>
                         </div>
                      </div>
                    )}
               </div>

               {/* 4. Distribution Chart */}
               <div className="md:col-span-1 lg:col-span-1 rounded-3xl border p-6 glass-panel flex flex-col min-h-[350px]" style={{ backgroundColor: currentTheme.cardBg, borderColor: currentTheme.borderColor }}>
                   <h3 className="text-lg font-bold mb-4" style={{ color: currentTheme.textPrimary }}>{t.distributionBy} {displayMetrics.secondaryMetricLabel}</h3>
                   <div className="flex-1 relative">
                      {displayMetrics.categoryDistribution.length > 0 ? (
                         <DistributionChart 
                            data={displayMetrics.categoryDistribution} 
                            theme={currentTheme} 
                            insight={displayMetrics.distributionAnalysis}
                         />
                      ) : (
                         <div className="flex items-center justify-center h-full opacity-40">No Distribution Data</div>
                      )}
                   </div>
               </div>
            </div>
          </>
        )}
        
        {view === 'report' && (
           <div className="animate-fade-in-up">
              {!reportHtml ? (
                 <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
                    <div className="p-6 rounded-full bg-white/5 border backdrop-blur-md" style={{ borderColor: currentTheme.borderColor }}>
                       <FileText size={48} className="opacity-50" />
                    </div>
                    <div>
                       <h2 className="text-2xl font-bold mb-2">Strategic AI Report</h2>
                       <p className="opacity-60 max-w-md mx-auto mb-6">
                          Generate a complete, professional business report based on your current dashboard metrics. 
                          The report includes executive summaries, KPI analysis, and AI-driven recommendations.
                       </p>
                       <button 
                          onClick={handleGenerateReport} 
                          disabled={generatingReport}
                          className="px-8 py-3 rounded-xl font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                          style={{ background: currentTheme.accentGradient }}
                       >
                          {generatingReport ? (
                             <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Generating...</span>
                          ) : (
                             <span className="flex items-center gap-2"><Sparkles size={16} /> Generate Report Now</span>
                          )}
                       </button>
                    </div>
                 </div>
              ) : (
                 <div className="w-full max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                       <button onClick={() => setReportHtml('')} className="text-sm opacity-50 hover:opacity-100 transition-opacity" style={{ color: currentTheme.textPrimary }}>
                          &larr; Back to Generator
                       </button>
                       <div className="flex gap-3">
                           <button onClick={handleDownloadPDF} className="px-4 py-2 rounded-lg border font-bold flex items-center gap-2 hover:bg-white/5 transition-colors shadow-sm" style={{ borderColor: currentTheme.borderColor, color: currentTheme.textPrimary }}>
                              <Download size={16} />
                              Download PDF
                           </button>
                           <button onClick={handleGenerateReport} className="p-2 rounded-lg border hover:bg-white/5 transition-colors" title="Regenerate" style={{ borderColor: currentTheme.borderColor, color: currentTheme.textPrimary }}>
                              <RefreshCw size={16} />
                           </button>
                       </div>
                    </div>
                    {/* Render the HTML Report */}
                    <div className="rounded-xl overflow-hidden shadow-2xl bg-white text-black">
                       <div dangerouslySetInnerHTML={{ __html: reportHtml }} />
                    </div>
                 </div>
              )}
           </div>
        )}

        {view === 'analysis' && <WhatIfAnalysis metrics={displayMetrics} theme={currentTheme} layout="cinematic" />}
        {view === 'insights' && <ChatInterface metrics={displayMetrics} theme={currentTheme} settings={settings} />}
        {view === 'settings' && <SettingsPanel theme={currentTheme} settings={settings} onSave={(s) => { setSettings(s); localStorage.setItem('saas_dashboard_settings', JSON.stringify(s)); handleRefresh(s); setTimeout(() => setView('dashboard'), 500); }} t={t} />}
      </main>
    </div>
  );
};

export default App;
