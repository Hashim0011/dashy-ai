import React, { useState, useMemo, useEffect } from 'react';
import { Theme, SaaSMetrics, AnalysisLayout } from '../types';
import { 
  RotateCcw, Zap, Calculator, TrendingUp, DollarSign, Users, Target, Settings2, Sliders, AlertCircle
} from 'lucide-react';
import { 
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface WhatIfProps {
  metrics: SaaSMetrics;
  theme: Theme;
  layout: AnalysisLayout;
}

export const WhatIfAnalysis: React.FC<WhatIfProps> = ({ metrics, theme, layout }) => {
  // Dynamic State: Keys are driver IDs, values are % change (-50 to +50)
  const [driverChanges, setDriverChanges] = useState<Record<string, number>>({});

  // Initialize state when drivers change
  useEffect(() => {
     const initial: Record<string, number> = {};
     metrics.drivers.forEach(d => { initial[d.id] = 0; });
     setDriverChanges(initial);
  }, [metrics.drivers]);

  // --- CALCULATION ENGINE ---
  const projections = useMemo(() => {
    // Baseline is the Primary Metric (e.g. Total Sales)
    const baselineValue = metrics.mrr; 
    
    // Calculate "Total Impact Score"
    // We assume drivers contribute to the baseline.
    // If driver is "Sales", and we increase it by 10%, the baseline increases.
    // If driver is "Cost", and we increase it, we might need a separate "Profit" metric, 
    // but for a universal dashboard, we will simulate the "Net Business Value".
    
    let totalImpactFactor = 1.0;

    metrics.drivers.forEach(driver => {
        const changePercent = driverChanges[driver.id] || 0;
        
        // Weighting logic:
        // If this driver IS the primary metric (e.g. Revenue slider controlling Revenue), weight is 1.
        // If it's a secondary driver (e.g. Users), we assume a linear correlation (weight 1).
        // If it's negative impact (Cost), it reduces the "Net Value" (Profit Proxy).
        
        const impact = (changePercent / 100);
        
        if (driver.impact === 'negative') {
            // Increasing cost reduces net value
            totalImpactFactor -= (impact * 0.5); // Assume costs are ~50% of revenue for generic weighting
        } else {
            // Increasing sales/users increases net value
            // If multiple drivers are positive, we average their impact to avoid exponential explosion
            // unless it's the only driver.
            const weight = 1 / (metrics.drivers.filter(d => d.impact === 'positive').length || 1);
            totalImpactFactor += (impact * weight); 
        }
    });

    const projectedValue = baselineValue * totalImpactFactor;
    const changeVal = projectedValue - baselineValue;
    const changePercent = baselineValue !== 0 ? (changeVal / baselineValue) * 100 : 0;

    return {
      baseline: baselineValue,
      projected: projectedValue,
      change: changeVal,
      percent: changePercent
    };
  }, [metrics.mrr, metrics.drivers, driverChanges]);

  // Generate Time-Series Forecast based on simulation
  const chartData = useMemo(() => {
    const months = ["M1", "M2", "M3", "M4", "M5", "M6"];
    return months.map((month, index) => {
      // Organic growth simulation (small upward curve)
      const organicGrowth = 1 + (index * 0.02);
      const baseVal = projections.baseline * organicGrowth; 
      
      // The simulated impact ramps up over time (implementation delay)
      const rampUp = 0.5 + (index * 0.1); // 50% impact at M1, 100% at M6
      const timeWeightedImpact = 1 + (projections.percent / 100) * Math.min(1, rampUp); 
      
      return {
        name: month,
        Baseline: Math.round(baseVal),
        Projected: Math.round(baseVal * timeWeightedImpact),
      };
    });
  }, [projections, metrics.mrr]);

  const isPositive = projections.percent >= 0;

  const applyScenario = (type: 'optimistic' | 'pessimistic') => {
     const newChanges: Record<string, number> = {};
     metrics.drivers.forEach(d => {
        if (type === 'optimistic') {
           newChanges[d.id] = d.impact === 'positive' ? 15 : -10;
        } else {
           newChanges[d.id] = d.impact === 'positive' ? -15 : 10;
        }
     });
     setDriverChanges(newChanges);
  };

  // --- RENDERERS ---

  const getIconForDriver = (type: string) => {
     if (type === 'money') return DollarSign;
     if (type === 'users') return Users;
     if (type === 'percent') return Target;
     return Sliders;
  };

  const SliderControl: React.FC<{ driver: any }> = ({ driver }) => {
     const Icon = getIconForDriver(driver.type);
     const val = driverChanges[driver.id] || 0;
     
     return (
      <div className={`rounded-2xl border p-4 transition-all duration-300 hover:shadow-lg ${layout === 'cards' ? 'bg-white/5' : 'bg-black/5'}`}
           style={{ borderColor: theme.borderColor }}>
         <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 truncate mr-2">
               <Icon size={16} className="opacity-70 shrink-0" style={{ color: theme.textPrimary }} />
               <span className="text-xs font-bold uppercase tracking-wider truncate" style={{ color: theme.textSecondary }} title={driver.label}>
                  {driver.label}
               </span>
            </div>
            <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${val > 0 ? 'bg-emerald-500/10 text-emerald-500' : (val < 0 ? 'bg-red-500/10 text-red-500' : 'bg-white/10')}`} style={{ color: val === 0 ? theme.textPrimary : undefined }}>
               {val > 0 ? '+' : ''}{val}%
            </span>
         </div>
         <input 
            type="range" min="-50" max="50" value={val}
            onChange={(e) => setDriverChanges({...driverChanges, [driver.id]: Number(e.target.value)})}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
            style={{ accentColor: theme.accent }} 
         />
         <div className="flex justify-between mt-1 text-[9px] opacity-30" style={{ color: theme.textSecondary }}>
             <span>-50%</span>
             <span>0%</span>
             <span>+50%</span>
         </div>
      </div>
     );
  };

  const Header = () => (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
       <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl shadow-lg ${layout === 'cinematic' ? 'bg-white/10' : ''}`} style={{ background: layout !== 'cinematic' ? theme.accentGradient : undefined }}>
             <Calculator className="text-white" size={24} />
          </div>
          <div>
             <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: theme.textPrimary }}>Simulator</h2>
             <p className="text-xs opacity-60 flex items-center gap-1">
                <Zap size={10} className="text-amber-500" /> AI-Detected {metrics.drivers.length} Drivers
             </p>
          </div>
       </div>
       <div className="flex gap-2">
          <button onClick={() => applyScenario('optimistic')} className="px-4 py-2 rounded-lg border text-xs font-bold hover:bg-white/5 transition-colors" style={{ borderColor: theme.borderColor, color: theme.textPrimary }}>BULL CASE</button>
          <button onClick={() => applyScenario('pessimistic')} className="px-4 py-2 rounded-lg border text-xs font-bold hover:bg-white/5 transition-colors" style={{ borderColor: theme.borderColor, color: theme.textPrimary }}>BEAR CASE</button>
          <button onClick={() => metrics.drivers.forEach(d => setDriverChanges(prev => ({...prev, [d.id]: 0})))} className="p-2 rounded-lg border hover:bg-white/5 transition-colors" style={{ borderColor: theme.borderColor, color: theme.textPrimary }}><RotateCcw size={16}/></button>
       </div>
    </div>
  );

  if (metrics.drivers.length === 0) {
      return (
         <div className="animate-fade-in-up flex flex-col items-center justify-center h-[400px] text-center p-6 border rounded-3xl glass-panel" style={{ borderColor: theme.borderColor }}>
             <AlertCircle size={48} className="mb-4 opacity-20" style={{ color: theme.textPrimary }} />
             <h3 className="text-xl font-bold mb-2" style={{ color: theme.textPrimary }}>No Numeric Drivers Found</h3>
             <p className="opacity-60 max-w-md" style={{ color: theme.textSecondary }}>
                 To use the simulator, your dataset needs at least one numeric column (like Revenue, Sales, Count, etc.).
             </p>
         </div>
      )
  }

  return (
    <div className="animate-fade-in-up space-y-6">
       <Header />
       
       {/* MAIN DISPLAY */}
       <div className="w-full h-[400px] md:h-[450px] rounded-3xl border glass-panel p-6 relative overflow-hidden shadow-2xl"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}>
          
          <div className="absolute top-4 left-6 z-20 flex gap-8 bg-black/20 p-3 rounded-2xl backdrop-blur-sm border border-white/5">
             <div>
                <p className="text-[10px] opacity-50 font-bold uppercase tracking-wider mb-0.5">Projected</p>
                <h4 className="text-xl font-black" style={{ color: isPositive ? '#34d399' : '#f87171' }}>
                   {projections.projected.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </h4>
             </div>
             <div className="w-px bg-white/10"></div>
             <div>
                <p className="text-[10px] opacity-50 font-bold uppercase tracking-wider mb-0.5">Current</p>
                <h4 className="text-xl font-black opacity-70" style={{ color: theme.textPrimary }}>
                   {projections.baseline.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </h4>
             </div>
             <div className="w-px bg-white/10"></div>
             <div>
                 <p className="text-[10px] opacity-50 font-bold uppercase tracking-wider mb-0.5">Impact</p>
                 <div className={`flex items-center gap-1 font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                     {isPositive ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                     {projections.percent.toFixed(1)}%
                 </div>
             </div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
             <ComposedChart data={chartData} margin={{ top: 60, right: 20, left: 20, bottom: 20 }}>
                <defs>
                   <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? '#34d399' : '#f87171'} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={isPositive ? '#34d399' : '#f87171'} stopOpacity={0} />
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.borderColor} vertical={false} opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.textSecondary, fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.textSecondary, fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip 
                   cursor={{ stroke: theme.accent, strokeWidth: 1, strokeDasharray: '5 5' }}
                   contentStyle={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)', border: `1px solid ${theme.borderColor}`, borderRadius: '16px', backdropFilter: 'blur(12px)' }}
                   itemStyle={{ color: theme.textPrimary, fontWeight: 'bold' }}
                />
                <Area 
                   type="monotone" dataKey="Projected" 
                   stroke={isPositive ? '#34d399' : '#f87171'} strokeWidth={4}
                   fill="url(#splitColor)" 
                   activeDot={{ r: 8, strokeWidth: 0, fill: '#fff' }}
                   animationDuration={500}
                />
                <Line 
                   type="monotone" dataKey="Baseline" 
                   stroke={theme.textSecondary} strokeWidth={2} strokeDasharray="10 5" 
                   dot={false} opacity={0.5}
                />
             </ComposedChart>
          </ResponsiveContainer>
       </div>

       {/* CONTROLS GRID - ADAPTIVE */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {metrics.drivers.map((driver) => (
             <SliderControl key={driver.id} driver={driver} />
          ))}
       </div>
    </div>
  );
};