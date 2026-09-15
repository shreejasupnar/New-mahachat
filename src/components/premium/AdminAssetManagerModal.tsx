import React, { useState } from 'react';
import { X, Search, Check, ShieldAlert, CheckCircle, Sliders } from 'lucide-react';
import { PREMIUM_GIFTS } from '../../premium/data/gifts';
import { PREMIUM_CHAT_BUBBLES } from '../../premium/data/chatBubbles';
import { PREMIUM_SCREEN_FRAMES } from '../../premium/data/screenFrames';
import { PREMIUM_SEAT_FRAMES } from '../../premium/data/seatFrames';
import { PREMIUM_BADGES } from '../../premium/data/badges';
import { PREMIUM_ENTRY_EFFECTS } from '../../premium/data/entryEffects';
import { PREMIUM_PROFILE_EFFECTS } from '../../premium/data/profileEffects';

interface AdminAssetManagerModalProps {
  onClose: () => void;
}

export const AdminAssetManagerModal: React.FC<AdminAssetManagerModalProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('gifts');
  const [search, setSearch] = useState('');
  const [disabledMap, setDisabledMap] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setDisabledMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getCatalog = () => {
    switch (selectedCategory) {
      case 'gifts': return PREMIUM_GIFTS;
      case 'bubbles': return PREMIUM_CHAT_BUBBLES;
      case 'frames': return PREMIUM_SCREEN_FRAMES;
      case 'seats': return PREMIUM_SEAT_FRAMES;
      case 'badges': return PREMIUM_BADGES;
      case 'entry': return PREMIUM_ENTRY_EFFECTS;
      case 'profiles': return PREMIUM_PROFILE_EFFECTS;
      default: return PREMIUM_GIFTS;
    }
  };

  const items = getCatalog().filter((item: any) => 
    item.nameMr.toLowerCase().includes(search.toLowerCase()) ||
    item.nameEn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-black">प्रशासक अ‍ॅसेट नियंत्रण (Admin Catalog Control)</h3>
              <p className="text-[11px] text-slate-400">कॅटलॉगमधील अ‍ॅसेट्स तपासणे व चालू/बंद करणे</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="p-3 border-b border-slate-100 flex gap-1.5 overflow-x-auto bg-slate-50">
          {[
            { id: 'gifts', label: 'Gifts (55)' },
            { id: 'bubbles', label: 'Chat Bubbles (52)' },
            { id: 'frames', label: 'Screen Frames (52)' },
            { id: 'seats', label: 'Seat Frames (52)' },
            { id: 'badges', label: 'Badges (52)' },
            { id: 'entry', label: 'Entry Effects (50)' },
            { id: 'profiles', label: 'Profile Effects (32)' },
          ].map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory === c.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100 relative">
          <Search className="w-4 h-4 absolute left-6 top-5.5 text-slate-400" />
          <input
            type="text"
            placeholder="शोधा..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
          />
        </div>

        {/* Items List */}
        <div className="p-3 overflow-y-auto flex-1 space-y-2">
          {items.map((item: any) => {
            const isDisabled = !!disabledMap[item.id];
            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                  isDisabled ? 'bg-slate-100 opacity-60 border-slate-300' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {item.previewIcon || item.icon || '✨'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.nameMr}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      <span>{item.id}</span>
                      <span>•</span>
                      <span>{item.culturalTheme}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    isDisabled
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  {isDisabled ? 'बंद (Disabled)' : 'सक्रिय (Active)'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>एकूण {items.length} अ‍ॅसेट्स सूचीबद्ध</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-bold cursor-pointer"
          >
            पूर्ण झाले
          </button>
        </div>

      </div>
    </div>
  );
};
