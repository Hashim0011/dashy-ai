
import React from 'react';
import { Theme } from '../types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  rawValue?: number; // Optional raw value for precision
  change?: number;
  icon: React.ReactNode;
  theme: Theme;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, rawValue, change, icon, theme }) => {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div 
      className="card-premium relative p-5 rounded-3xl border glass-panel group overflow-visible flex flex-col justify-between h-full min-h-[140px]"
      style={{ 
        backgroundColor: theme.cardBg,
        borderColor: theme.borderColor,
        color: theme.textPrimary,
        boxShadow: theme.shadow
      }}
    >
      <div className="flex justify-between items-start mb-4">
        {/* 3D ICON CONTAINER - PREMIUM GLASS EFFECT WITH DEPTH */}
        <div className="relative w-14 h-14 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 ease-out" style={{ perspective: '800px' }}>
           
           {/* Outer Glow/Shadow */}
           <div className="absolute inset-0 rounded-2xl blur-xl opacity-40 transition-opacity duration-500 group-hover:opacity-70" 
                style={{ background: theme.accent, transform: 'translateY(8px) scale(0.9)' }}></div>
           
           {/* Main 3D Box */}
           <div className="absolute inset-0 rounded-2xl border flex items-center justify-center overflow-hidden shadow-2xl backdrop-blur-md transition-all duration-300"
                style={{ 
                  background: theme.accentGradient, 
                  borderColor: 'rgba(255,255,255,0.3)',
                  // Enhanced Shadow Stack for "Embossed" Button Look
                  boxShadow: `
                    inset 3px 3px 6px rgba(255,255,255,0.4),
                    inset -3px -3px 6px rgba(0,0,0,0.25),
                    0 10px 20px -5px ${theme.accent}60,
                    0 5px 10px -2px rgba(0,0,0,0.2)
                  `,
                  transform: 'rotateX(5deg) rotateY(5deg)' // Subtle static tilt
                }}>
              
              {/* Top Specular Highlight (Glass Shine) */}
              <div className="absolute -top-[40%] -left-[40%] w-[180%] h-[180%] bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-full pointer-events-none opacity-90 blur-sm"></div>
              
              {/* Bottom Reflection/Shadow inside the gem */}
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent opacity-60 pointer-events-none"></div>

              {/* The Icon Itself - Floating Embossed Look */}
              <div className="relative z-10 text-white transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                {/* Apply drop-shadow to the SVG itself to make it pop off the background */}
                <div style={{ filter: 'drop-shadow(0px 4px 3px rgba(0,0,0,0.35))' }}>
                  {icon}
                </div>
              </div>
           </div>
        </div>
        
        {change !== undefined && change !== 0 && (
          <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md border transition-colors"
               style={{ 
                 backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                 borderColor: isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                 color: isPositive ? '#34d399' : '#f87171',
                 boxShadow: isPositive ? '0 2px 10px rgba(16,185,129,0.1)' : '0 2px 10px rgba(239,68,68,0.1)'
               }}>
            {isPositive ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-[11px] font-bold uppercase tracking-widest opacity-70 mb-1 truncate pl-0.5" style={{ color: theme.textSecondary }}>
          {title}
        </p>
        <h3 
          className="text-4xl font-extrabold tracking-tight drop-shadow-sm truncate mt-1 cursor-help" 
          style={{ 
             color: theme.textPrimary,
             textShadow: `0 4px 20px ${theme.accent}15` // Subtle coloured glow behind text
          }}
          title={rawValue !== undefined ? `Exact Value: ${rawValue.toLocaleString()}` : undefined}
        >
          {value}
        </h3>
      </div>
      
      {/* Background Decoration */}
      <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full opacity-5 blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-150 group-hover:rotate-45" 
           style={{ background: theme.accent }}></div>
    </div>
  );
};
