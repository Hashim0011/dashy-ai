
import React, { useState, useEffect } from 'react';
import { Theme, AppSettings } from '../types';
import { Save, Link2, Table, Webhook, Check, RefreshCw, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';

interface SettingsPanelProps {
  theme: Theme;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
  t: any;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ theme, settings, onSave, t }) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (key: keyof AppSettings, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const getWebhookMode = (url: string) => {
     if (!url) return null;
     // Remove query params for check
     const cleanUrl = url.split('?')[0];
     return cleanUrl.endsWith('/test') || cleanUrl.endsWith('/test/') ? 'test' : 'production';
  };

  const webhookMode = getWebhookMode(formData.dataWebhookUrl);

  return (
    <div className="animate-fade-in-up max-w-4xl mx-auto">
       <div className="mb-8">
         <h2 className="text-3xl font-black tracking-tight mb-2" style={{ color: theme.textPrimary }}>{t.settings}</h2>
         <p className="opacity-60" style={{ color: theme.textSecondary }}>{t.configureSettings}</p>
       </div>

       <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Data Source (Google Sheets) */}
          <div className="p-6 md:p-8 rounded-3xl border glass-panel relative overflow-hidden"
               style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}>
             
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                   <Table size={24} />
                </div>
                <div>
                   <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>{t.dataSource}</h3>
                   <p className="text-xs opacity-60" style={{ color: theme.textSecondary }}>{t.dataSourceDesc}</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-widest opacity-70 pl-1" style={{ color: theme.textSecondary }}>
                      {t.sheetId}
                   </label>
                   <input 
                      type="text" 
                      value={formData.sheetId}
                      onChange={(e) => handleChange('sheetId', e.target.value)}
                      placeholder="1a2b3c4d5e6f7g8h9i0j..."
                      className="w-full px-4 py-4 rounded-xl text-sm outline-none focus:ring-2 transition-all font-mono"
                      style={{ 
                         backgroundColor: theme.isDark ? 'rgba(0,0,0,0.3)' : '#f9fafb', 
                         borderColor: theme.borderColor,
                         color: theme.textPrimary,
                         boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                      }}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-widest opacity-70 pl-1" style={{ color: theme.textSecondary }}>
                      {t.sheetName}
                   </label>
                   <input 
                      type="text" 
                      value={formData.sheetName}
                      onChange={(e) => handleChange('sheetName', e.target.value)}
                      placeholder="Dashboard Data"
                      className="w-full px-4 py-4 rounded-xl text-sm outline-none focus:ring-2 transition-all"
                      style={{ 
                         backgroundColor: theme.isDark ? 'rgba(0,0,0,0.3)' : '#f9fafb', 
                         borderColor: theme.borderColor,
                         color: theme.textPrimary,
                         boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                      }}
                   />
                </div>
             </div>
          </div>

          {/* Section 2: Integrations (n8n) */}
          <div className="p-6 md:p-8 rounded-3xl border glass-panel relative overflow-hidden"
               style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}>
             
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                   <Webhook size={24} />
                </div>
                <div>
                   <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>{t.integrations}</h3>
                   <p className="text-xs opacity-60" style={{ color: theme.textSecondary }}>{t.integrationsDesc}</p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <div className="flex justify-between items-center">
                      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-70 pl-1" style={{ color: theme.textSecondary }}>
                          <Link2 size={12} /> {t.dataWebhook}
                      </label>
                      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-emerald-500">
                          <Lock size={10} /> Secure System Link
                      </span>
                   </div>
                   <div className="relative group">
                       <input 
                          type="password" 
                          value={formData.dataWebhookUrl}
                          readOnly
                          className="w-full px-4 py-4 rounded-xl text-sm outline-none border transition-all font-mono opacity-60 cursor-not-allowed"
                          style={{ 
                             backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : '#f3f4f6', 
                             borderColor: theme.borderColor,
                             color: theme.accent,
                             boxShadow: 'none'
                          }}
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50">
                          <Lock size={16} style={{ color: theme.textSecondary }} />
                       </div>
                   </div>
                   
                   {/* SMART STATUS BADGE */}
                   {webhookMode && (
                      <div className={`mt-3 p-3 rounded-xl border flex items-start gap-3 ${webhookMode === 'test' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                         {webhookMode === 'test' ? <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" /> : <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />}
                         <div>
                            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${webhookMode === 'test' ? 'text-amber-500' : 'text-emerald-500'}`}>
                               {webhookMode === 'test' ? t.webhookStatus?.test : t.webhookStatus?.prod}
                            </p>
                            <p className="text-[11px] opacity-80 leading-tight" style={{ color: theme.textPrimary }}>
                               {webhookMode === 'test' ? t.webhookStatus?.testDesc : t.webhookStatus?.prodDesc}
                            </p>
                         </div>
                      </div>
                   )}
                </div>

                <div className="space-y-2">
                   <div className="flex justify-between items-center">
                      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-70 pl-1" style={{ color: theme.textSecondary }}>
                          <Link2 size={12} /> {t.chatWebhook}
                      </label>
                      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-emerald-500">
                          <Lock size={10} /> Secure System Link
                      </span>
                   </div>
                   <div className="relative group">
                       <input 
                          type="password" 
                          value={formData.chatWebhookUrl}
                          readOnly
                          className="w-full px-4 py-4 rounded-xl text-sm outline-none border transition-all font-mono opacity-60 cursor-not-allowed"
                          style={{ 
                             backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : '#f3f4f6', 
                             borderColor: theme.borderColor,
                             color: theme.textPrimary,
                             boxShadow: 'none'
                          }}
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50">
                          <Lock size={16} style={{ color: theme.textSecondary }} />
                       </div>
                   </div>
                </div>
             </div>

             <div className="mt-8 p-4 rounded-xl flex items-start gap-3 bg-opacity-50 border border-dashed"
                  style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderColor: theme.borderColor }}>
                 <p className="text-xs leading-relaxed opacity-70" style={{ color: theme.textSecondary }}>
                    {t.syncDesc}
                 </p>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4">
             <button 
                type="submit" 
                className="px-8 py-4 rounded-2xl font-bold text-white text-lg shadow-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                style={{ background: theme.accentGradient }}
             >
                {isSaved ? <Check size={24} /> : <RefreshCw size={24} />}
                <span>{isSaved ? 'Saved!' : t.syncNow}</span>
             </button>
          </div>

       </form>
    </div>
  );
};
