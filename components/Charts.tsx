
import React, { useState, useMemo } from 'react';
import { Theme, ChartType, ChartVariant, BreakdownItem, TopPerformerItem } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, LineChart, Line, Sector, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  RadialBarChart, RadialBar
} from 'recharts';
import { Info, X, TrendingUp, Sparkles } from 'lucide-react';

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

const CustomTooltip = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-xl transition-all"
           style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)', borderColor: theme.accent, color: theme.textPrimary }}>
        <p className="text-[10px] font-bold mb-1 uppercase tracking-widest opacity-60">{label}</p>
        {payload.map((entry: any, i: number) => (
           <div key={i} className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
             <p className="text-sm font-medium opacity-80 mr-auto">{entry.name}</p>
             <p className="text-lg font-black tabular-nums">{formatNumber(entry.value)}</p>
           </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- HELPER: CHART INSIGHT POPOVER ---
const ChartInsightInfo = ({ insight, theme }: { insight?: string, theme: Theme }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!insight) return null;

  return (
    <div className="absolute top-0 right-0 z-20 m-2">
       <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="p-1.5 rounded-lg backdrop-blur-md border transition-all hover:bg-white/10 hover:scale-105 active:scale-95 group shadow-sm"
        style={{ 
          backgroundColor: theme.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)',
          borderColor: theme.borderColor,
          color: theme.textSecondary
        }}
        title="AI Insights"
      >
        <Info size={14} className="group-hover:text-accent transition-colors" style={{ color: isOpen ? theme.accent : undefined }} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-9 w-64 p-4 rounded-2xl border glass-panel shadow-2xl animate-fade-in-up z-30 backdrop-blur-xl"
             style={{ backgroundColor: theme.cardBg, borderColor: theme.accent }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
                <div className="p-1 rounded bg-accent/10" style={{ backgroundColor: `${theme.accent}20` }}>
                  <Sparkles size={12} style={{ color: theme.accent }} />
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-80" style={{ color: theme.textPrimary }}>AI Analysis</h4>
            </div>
            <button onClick={() => setIsOpen(false)} className="opacity-50 hover:opacity-100 p-1 hover:bg-white/10 rounded">
                <X size={12} style={{ color: theme.textPrimary }} />
            </button>
          </div>
          <p className="text-xs leading-relaxed font-medium opacity-90" style={{ color: theme.textPrimary }}>
            {insight}
          </p>
          {/* Decorative glow */}
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-accent/10 blur-2xl rounded-full pointer-events-none" style={{ background: theme.accent }}></div>
        </div>
      )}
    </div>
  )
}

// --- 1. MAIN DYNAMIC CHART (Area/Line/Bar) ---
export const DynamicMainChart: React.FC<any> = ({ data, theme, type, variant, dataKey = "value", insight }) => {
  // @ts-ignore
  const ChartComponent = type === 'line' ? LineChart : (type === 'bar' ? BarChart : AreaChart);
  // Cast to any to avoid prop type conflicts (specifically radius on Line/Area)
  const ChartElement = (type === 'line' ? Line : (type === 'bar' ? Bar : Area)) as any;
  
  return (
      <div className="relative w-full h-full group/wrapper animate-fade-in-up"> 
         <ChartInsightInfo insight={insight} theme={theme} />
         <ResponsiveContainer width="100%" height="100%">
          {/* @ts-ignore */}
          <ChartComponent data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${theme.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.accent} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={theme.accent} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.borderColor} vertical={false} opacity={0.1} />
            <XAxis dataKey="name" stroke={theme.textSecondary} fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke={theme.textSecondary} fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatNumber} />
            <Tooltip content={<CustomTooltip theme={theme} />} cursor={{ opacity: 0.1, fill: theme.textSecondary }} />
            <ChartElement 
              type="monotone" 
              dataKey={dataKey} 
              stroke={theme.accent} 
              fill={`url(#grad-${theme.id})`}
              strokeWidth={3} 
              dot={false}
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </ChartComponent>
        </ResponsiveContainer>
      </div>
  );
};

// --- 2. DISTRIBUTION CHART (Pie/Radial) ---
export const DistributionChart: React.FC<any> = ({ data, theme, insight }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const visibleData = data.map((item: any, i: number) => ({ ...item, fill: theme.chartColors[i % theme.chartColors.length] }));
  
  const renderActiveShape = (props: any) => {
      const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
      return (
        <g>
          <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} />
          <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={innerRadius - 6} outerRadius={innerRadius - 4} fill={fill} opacity={0.5} />
        </g>
      );
  };

  return (
     <div className="relative w-full h-full animate-fade-in-up">
        <ChartInsightInfo insight={insight} theme={theme} />
        <ResponsiveContainer>
            <PieChart>
              <Pie 
                data={visibleData} 
                cx="50%" 
                cy="50%" 
                innerRadius={55} 
                outerRadius={75} 
                paddingAngle={4} 
                dataKey="value" 
                onMouseEnter={(_, index) => setActiveIndex(index)} 
                stroke="none"
                {...{ activeIndex, activeShape: renderActiveShape } as any}
                animationDuration={1500} 
                animationEasing="ease-out"
              >
                {visibleData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
              </Pie>
              <Tooltip content={<CustomTooltip theme={theme} />} />
            </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="text-xl font-black" style={{ color: theme.textPrimary }}>
                {visibleData[activeIndex] ? ((visibleData[activeIndex].value / visibleData.reduce((a: any,b: any)=>a+b.value,0))*100).toFixed(0)+'%' : ''}
             </div>
        </div>
    </div>
  )
}

// --- 3. NEW: SMART BREAKDOWN CHART (Stacked Bar - Decision Matrix) ---
interface BreakdownProps {
  data: BreakdownItem[];
  series: string[];
  theme: Theme;
  insight?: string;
}

export const SmartBreakdownChart: React.FC<BreakdownProps> = ({ data, series, theme, insight }) => {
  return (
    <div className="w-full h-full animate-fade-in-up relative">
      <ChartInsightInfo insight={insight} theme={theme} />
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.borderColor} vertical={false} opacity={0.1} />
          <XAxis dataKey="name" stroke={theme.textSecondary} fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke={theme.textSecondary} fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatNumber} />
          <Tooltip content={<CustomTooltip theme={theme} />} cursor={{ fill: theme.textSecondary, opacity: 0.05 }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', opacity: 0.7 }} />
          {series.map((key, index) => (
            <Bar 
              key={key} 
              dataKey={key} 
              stackId="a" 
              fill={theme.chartColors[index % theme.chartColors.length]} 
              radius={[0,0,0,0]}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- 4. NEW: HORIZONTAL RANK CHART (Top Performers) ---
interface RankProps {
  data: TopPerformerItem[];
  theme: Theme;
  insight?: string;
}

export const HorizontalRankChart: React.FC<RankProps> = ({ data, theme, insight }) => {
  return (
    <div className="w-full h-full animate-fade-in-up relative">
      <ChartInsightInfo insight={insight} theme={theme} />
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.borderColor} opacity={0.1} />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            stroke={theme.textPrimary} 
            fontSize={11} 
            fontWeight="bold"
            tickLine={false} 
            axisLine={false} 
            width={80}
          />
          <Tooltip 
            cursor={{ fill: theme.textSecondary, opacity: 0.05 }} 
            content={<CustomTooltip theme={theme} />}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1500} animationEasing="ease-out">
             {data.map((entry, index) => (
               <Cell key={`cell-${index}`} fill={index === 0 ? theme.accent : theme.chartColors[(index + 1) % theme.chartColors.length]} />
             ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
