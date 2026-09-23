import React from 'react';
import { Sparkles, X, Check } from 'lucide-react';
import { LIVE_FILTERS, LiveFilter } from '../config/filters';

interface FilterPickerSheetProps {
  isOpen: boolean;
  selectedFilter: LiveFilter;
  onSelectFilter: (filter: LiveFilter) => void;
  onClose: () => void;
}

export const FilterPickerSheet: React.FC<FilterPickerSheetProps> = ({
  isOpen,
  selectedFilter,
  onSelectFilter,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-slate-900 border-t border-white/15 rounded-t-3xl p-4 shadow-2xl flex flex-col"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">सौंदर्य व सांस्कृतिक फिल्टर्स</h3>
              <p className="text-[11px] text-slate-400">कॅमेऱ्यासाठी मराठी पारंपारिक व ब्युटी फिल्टर्स</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 text-slate-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter List */}
        <div className="grid grid-cols-4 gap-2.5 py-4 overflow-y-auto max-h-[220px]">
          {LIVE_FILTERS.map((f) => {
            const isSelected = selectedFilter.id === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onSelectFilter(f)}
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-rose-500/20 to-amber-500/20 border-rose-500 text-white shadow-lg shadow-rose-950/50 scale-102'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
                <span className="text-2xl mb-1">{f.icon}</span>
                <span className="text-[11px] font-semibold text-center leading-tight line-clamp-1">{f.nameMr}</span>
                <span className="text-[9px] text-slate-400 mt-0.5">{f.nameEn}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
