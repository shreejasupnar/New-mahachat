import React from 'react';
import { X, Users, Award, Shield, Crown } from 'lucide-react';
import { LiveParticipant } from '../services/streamService';

interface ViewerListSheetProps {
  participants: LiveParticipant[];
  viewerCount: number;
  onClose: () => void;
  onSelectUser?: (userId: string) => void;
}

export const ViewerListSheet: React.FC<ViewerListSheetProps> = ({
  participants,
  viewerCount,
  onClose,
  onSelectUser,
}) => {
  // Sort: Host first, then VIPs (highest level first), then regular viewers
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.role === 'host') return -1;
    if (b.role === 'host') return 1;
    const aVip = a.isVip || (a.vipLevel && a.vipLevel > 0) ? (a.vipLevel || 1) : 0;
    const bVip = b.isVip || (b.vipLevel && b.vipLevel > 0) ? (b.vipLevel || 1) : 0;
    return bVip - aVip;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-4 max-h-[75vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">थेट प्रेक्षक (Viewers)</h3>
              <p className="text-[11px] text-slate-400">{viewerCount} जण सध्या पाहत आहेत</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of active participants */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
          {sortedParticipants.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              कोणतीही यादी उपलब्ध नाही
            </div>
          ) : (
            sortedParticipants.map((p) => {
              const isVip = p.isVip || (p.vipLevel && p.vipLevel > 0);
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectUser?.(p.userId)}
                  className={`flex items-center justify-between p-2 rounded-2xl transition-all cursor-pointer ${
                    isVip 
                      ? 'bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 hover:bg-amber-500/15'
                      : 'bg-slate-800/40 hover:bg-slate-800/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      {p.photoURL ? (
                        <img
                          src={p.photoURL}
                          alt={p.name}
                          className={`w-9 h-9 rounded-full object-cover border ${
                            isVip ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-700'
                          }`}
                        />
                      ) : (
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                          isVip ? 'bg-gradient-to-tr from-amber-600 to-yellow-500' : 'bg-slate-700'
                        }`}>
                          {p.name.charAt(0)}
                        </div>
                      )}
                      {p.role === 'host' && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px] font-black">
                          ★
                        </span>
                      )}
                      {isVip && p.role !== 'host' && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center text-[8px] font-black shadow">
                          <Crown className="w-2.5 h-2.5 fill-black" />
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`font-semibold text-xs max-w-[130px] truncate ${isVip ? 'text-amber-200 font-bold' : 'text-white'}`}>
                          {p.name}
                        </span>
                        {p.role === 'host' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            HOST
                          </span>
                        )}
                        {isVip && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-black flex items-center gap-0.5">
                            <Crown className="w-2 h-2 fill-black" />
                            VIP {p.vipLevel || 1}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {p.district ? `${p.district} • ऑनलाईन` : 'ऑनलाईन'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
