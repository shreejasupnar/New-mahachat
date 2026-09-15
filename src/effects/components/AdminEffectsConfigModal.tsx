import React, { useState } from 'react';
import { X, Plus, Sparkles, Filter, CheckCircle2, XCircle } from 'lucide-react';
import { VISUAL_EFFECTS_REGISTRY } from '../data/effectsRegistry';
import { VisualEffectModel, EffectType, EffectRarity } from '../types';

interface AdminEffectsConfigModalProps {
  onClose: () => void;
}

export const AdminEffectsConfigModal: React.FC<AdminEffectsConfigModalProps> = ({ onClose }) => {
  const [effects, setEffects] = useState<VisualEffectModel[]>(VISUAL_EFFECTS_REGISTRY);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [search, setSearch] = useState('');

  const toggleEffectEnabled = (id: string) => {
    setEffects(prev =>
      prev.map(e => (e.effectId === id ? { ...e, enabled: !e.enabled } : e))
    );
  };

  const filtered = effects.filter(e => {
    if (selectedType !== 'all' && e.effectType !== selectedType) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.nameMr.includes(search)) {
      return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 rounded-3xl p-6 border border-amber-500/30 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">MahaChat Effects Engine Control</h3>
              <p className="text-xs text-amber-400 font-medium">व्हिज्युअल इफेक्ट्स व उत्सव पॅक व्यवस्थापन</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="py-3 flex flex-wrap items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="नाव शोधा (Search effect)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400 flex-1 min-w-[160px]"
          />
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
          >
            <option value="all">सर्व प्रकार (All Types)</option>
            <option value="gift">भेटवस्तू (Gift)</option>
            <option value="avatar_frame">प्रोफाइल फ्रेम (Frame)</option>
            <option value="entrance">प्रवेश इफेक्ट (Entrance)</option>
          </select>
        </div>

        {/* Effects Table / List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-800/60">
          {filtered.map(effect => (
            <div
              key={effect.effectId}
              className="pt-2 flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl">{effect.previewIcon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">{effect.nameMr}</span>
                    <span className="text-xs text-slate-400 truncate">({effect.name})</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                      effect.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
                      effect.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300' :
                      effect.rarity === 'rare' ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {effect.rarity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>प्राधान्य: {effect.priority}</span>
                    <span>•</span>
                    <span>कालावधी: {effect.duration / 1000}s</span>
                    <span>•</span>
                    <span className="text-amber-400">किंमत: 🪙 {effect.price}</span>
                  </div>
                </div>
              </div>

              {/* Status Toggle */}
              <button
                type="button"
                onClick={() => toggleEffectEnabled(effect.effectId)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  effect.enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}
              >
                {effect.enabled ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>सुरू</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>बंद</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            एकूण नोंदणीकृत इफेक्ट्स: <strong className="text-amber-400">{filtered.length}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
          >
            बंद करा (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
