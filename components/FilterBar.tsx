

import React from 'react';
import { Theme, FilterOption, ActiveFilters } from '../types';
import { Filter, ChevronDown, X } from 'lucide-react';

interface FilterBarProps {
  filters: FilterOption[];
  activeFilters: ActiveFilters;
  onFilterChange: (id: string, value: string) => void;
  theme: Theme;
  t?: any;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, activeFilters, onFilterChange, theme, t }) => {
  if (!filters || filters.length === 0) return null;

  // Smart Translation Helper
  const getLocalizedLabel = (filter: FilterOption) => {
     if (!t) return filter.label;
     
     // 1. Special Case for Year (Always translate)
     if (filter.id === '__year' || filter.label.toLowerCase() === 'year') {
        return t.year || 'Year';
     }

     // 2. Check Dictionary
     if (t.dictionary) {
        // Normalize keys: 'Product_Category' -> 'product category'
        const idKey = filter.id.toLowerCase().replace(/_/g, ' ').trim();
        const labelKey = filter.label.toLowerCase().trim();
        
        if (t.dictionary[idKey]) return t.dictionary[idKey];
        if (t.dictionary[labelKey]) return t.dictionary[labelKey];
        
        // Attempt to match simple single words if compound fails (e.g. "Product Status" -> "Status")
        // Only if it's a common pattern
        const commonLastWords = ['status', 'type', 'name', 'date', 'count', 'category', 'region'];
        for (const word of commonLastWords) {
           if (labelKey.endsWith(word) && t.dictionary[word]) {
               // We found a match, but context might be lost. 
               // For now, if we have a match, let's use the Arabic term.
               // Optionally, keep it English if we can't fully translate.
               // But user asked for responsiveness.
               return t.dictionary[word] + (document.documentElement.dir === 'rtl' ? ` (${filter.label})` : ''); 
           }
        }
     }

     return filter.label;
  };

  return (
    <div className="w-full mb-8 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
      <div className="flex flex-col items-start gap-4">
        
        {/* Label Header */}
        <div className="flex items-center gap-2 mb-1 pl-1">
           <div className="p-1.5 rounded-lg" style={{ background: `${theme.accent}20` }}>
              <Filter size={14} style={{ color: theme.accent }} />
           </div>
           <span className="text-xs font-bold uppercase tracking-widest opacity-70" style={{ color: theme.textSecondary }}>{t ? t.filterData : 'Filter Data'}</span>
        </div>

        {/* Filters Row */}
        <div className="w-full flex flex-wrap items-center gap-3">
          {filters.map((filter) => {
             const hasValue = !!activeFilters[filter.id];
             const displayName = getLocalizedLabel(filter);
             
             return (
              <div key={filter.id} className="relative group flex-shrink-0">
                {/* Floating Label inside the input for better space efficiency */}
                <div className={`absolute ${document.documentElement.dir === 'rtl' ? 'right-3' : 'left-3'} top-2 pointer-events-none z-10 opacity-50 text-[9px] font-bold uppercase tracking-wider`} 
                     style={{ color: theme.textPrimary }}>
                   {displayName}
                </div>
                
                <select
                  value={activeFilters[filter.id] || ''}
                  onChange={(e) => onFilterChange(filter.id, e.target.value)}
                  className={`appearance-none ${document.documentElement.dir === 'rtl' ? 'pr-3 pl-8' : 'pl-3 pr-8'} pt-6 pb-2 min-w-[140px] max-w-[200px] rounded-xl text-sm font-bold border cursor-pointer outline-none transition-all hover:shadow-lg focus:ring-2`}
                  style={{ 
                    backgroundColor: theme.cardBg,
                    borderColor: hasValue ? theme.accent : theme.borderColor,
                    color: theme.textPrimary,
                    boxShadow: theme.shadow,
                  }}
                >
                  <option value="">{t ? t.all : 'All'}</option>
                  {filter.options?.map(opt => (
                    <option key={opt} value={opt} className="text-black truncate">
                       {opt.length > 25 ? opt.substring(0, 25) + '...' : opt}
                    </option>
                  ))}
                </select>
                
                <ChevronDown size={14} className={`absolute ${document.documentElement.dir === 'rtl' ? 'left-3' : 'right-3'} top-1/2 translate-y-1 pointer-events-none opacity-50`} style={{ color: theme.textPrimary }} />
              </div>
             );
          })}
          
          {/* Clear Button */}
          {Object.values(activeFilters).some(v => v) && (
            <button 
              onClick={() => filters.forEach(f => onFilterChange(f.id, ''))}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold rounded-xl transition-all hover:bg-red-500/10 text-red-500 ${document.documentElement.dir === 'rtl' ? 'mr-auto' : 'ml-auto'} border border-red-500/20 shadow-sm hover:shadow-md`}
              style={{ backgroundColor: theme.cardBg }}
            >
              <X size={14} /> {t ? t.reset : 'Reset'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};