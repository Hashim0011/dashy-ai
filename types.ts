

export interface Theme {
  id: string;
  name: string;
  isDark: boolean;
  bg: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentGradient: string;
  chartColors: string[];
  borderColor: string;
  shadow: string;
}

export interface KPIItem {
  id: string;
  label: string;
  value: string | number;
  rawValue?: number; 
  change?: number;
  iconType: 'money' | 'users' | 'product' | 'location' | 'date' | 'rating' | 'percent' | 'trend' | 'list' | 'alert' | 'generic';
}

export interface BreakdownItem {
  name: string;
  [key: string]: string | number; 
}

export interface TopPerformerItem {
  name: string;
  value: number;
  meta?: string;
}

// NEW: For Adaptive Simulator
export interface SimulationDriver {
  id: string;
  label: string;
  originalValue: number;
  type: 'money' | 'percent' | 'count' | 'generic';
  impact: 'positive' | 'negative'; // Does increasing this good or bad? (e.g. Cost is negative)
}

export interface SaaSMetrics {
  primaryMetricLabel: string; 
  secondaryMetricLabel: string;
  mrr: number; 
  mrrGrowth: number;
  activeUsers: number; 
  userGrowth: number;
  churnRate: number;
  churnChange: number;
  newSignups: number;

  kpiCards: KPIItem[];
  recommendedMainChart: ChartType;
  recommendedDistChart: ChartType;

  trendAnalysis: string;     
  distributionAnalysis: string; 
  volumeAnalysis: string;
  
  breakdownData: BreakdownItem[];    
  breakdownSeries: string[];         
  topPerformers: TopPerformerItem[]; 
  topPerformersLabel: string;

  // NEW: Adaptive Drivers for Simulator
  drivers: SimulationDriver[];

  revenueHistory: { name: string; value: number; pv?: number }[];
  userHistory: { name: string; value: number }[];
  categoryDistribution: { name: string; value: number }[];
  regionalData: { subject: string; A: number; fullMark: number }[]; 
  
  insights: string[]; 
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type ViewMode = 'dashboard' | 'insights' | 'analysis' | 'settings' | 'report';

export type ChartType = 'area' | 'bar' | 'line' | 'composed' | 'radar' | 'radial' | 'scatter' | 'pie';

export type ChartVariant = 'neon' | 'glass' | 'minimal' | 'bold' | 'retro';

export type AnalysisLayout = 'sidebar' | 'cinematic' | 'cards';

export interface FilterOption {
  id: string;
  label: string;
  type: 'select' | 'date' | 'range';
  options?: string[];
}

export interface ActiveFilters {
  [key: string]: string;
}

export interface AppSettings {
  sheetId: string;
  sheetName: string;
  dataWebhookUrl: string;
  chatWebhookUrl: string;
}