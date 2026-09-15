import React from 'react';
import { 
  X, 
  Hand, 
  MicOff, 
  Trash2, 
  Palette, 
  ShieldAlert, 
  Lock, 
  Unlock,
  Radio
} from 'lucide-react';
import { CULTURAL_ROOM_THEMES } from '../../data/voiceRoomAssets';

interface HostControlsBottomSheetProps {
  requestsCount?: number;
  speakerRequestsCount?: number;
  isRoomLocked: boolean;
  activeThemeId?: string;
  isHost?: boolean;
  districtId?: string;
  districtNameMr?: string;
  onOpenRequests?: () => void;
  onOpenSpeakerRequests?: () => void;
  onMuteAll?: () => void;
  onMuteAllSpeakers?: () => void;
  onCleanChat?: () => void;
  onSelectTheme?: (themeId: string) => void;
  onToggleLock?: () => void;
  onToggleLockRoom?: (locked: boolean) => void;
  onOpenAdminDashboard?: () => void;
  onClose: () => void;
}

export const HostControlsBottomSheet: React.FC<HostControlsBottomSheetProps> = ({
  requestsCount,
  speakerRequestsCount,
  isRoomLocked,
  activeThemeId = 'paravarchya_gappa',
  isHost = true,
  onOpenRequests,
  onOpenSpeakerRequests,
  onMuteAll,
  onMuteAllSpeakers,
  onCleanChat,
  onSelectTheme,
  onToggleLock,
  onToggleLockRoom,
  onOpenAdminDashboard,
  onClose
}) => {
  const pendingRequests = requestsCount ?? speakerRequestsCount ?? 0;

  const handleToggleLockAction = () => {
    if (onToggleLock) {
      onToggleLock();
    } else if (onToggleLockRoom) {
      onToggleLockRoom(!isRoomLocked);
    }
  };

  const handleOpenRequestsAction = () => {
    onClose();
    if (onOpenRequests) {
      onOpenRequests();
    } else if (onOpenSpeakerRequests) {
      onOpenSpeakerRequests();
    }
  };

  const handleMuteAllAction = () => {
    if (onMuteAll) {
      onMuteAll();
    } else if (onMuteAllSpeakers) {
      onMuteAllSpeakers();
    }
  };
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-end justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-purple-500/30 rounded-t-3xl sm:rounded-3xl p-5 w-full max-w-md shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-md">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                {isHost ? 'होस्ट नियंत्रण केंद्र (Host Panel)' : 'मॉडरेटर पॅनेल (Mod Panel)'}
              </h3>
              <p className="text-[11px] text-slate-400">१० सीट्स, प्रेक्षक व कट्टा व्यवस्थापन</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Speaker Requests Button */}
          <button
            onClick={handleOpenRequestsAction}
            className="relative p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/40 flex flex-col items-center justify-center gap-1.5 hover:from-amber-500/30 transition-all text-center"
          >
            {pendingRequests > 0 && (
              <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] animate-bounce">
                {pendingRequests}
              </span>
            )}
            <Hand className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-white text-xs">स्पीकर अर्ज (Hand Raise)</span>
            <span className="text-[10px] text-amber-300">
              {pendingRequests > 0 ? `${pendingRequests} प्रलंबित` : 'अर्ज नाहीत'}
            </span>
          </button>

          {/* Mute All Speakers */}
          <button
            onClick={handleMuteAllAction}
            className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-red-500/50 flex flex-col items-center justify-center gap-1.5 hover:bg-slate-800 transition-all text-center"
          >
            <MicOff className="w-5 h-5 text-red-400" />
            <span className="font-bold text-white text-xs">सर्व म्यूट करा</span>
            <span className="text-[10px] text-slate-400">Mute All Speakers</span>
          </button>

          {/* Clean Chat */}
          <button
            onClick={onCleanChat}
            className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-yellow-500/50 flex flex-col items-center justify-center gap-1.5 hover:bg-slate-800 transition-all text-center"
          >
            <Trash2 className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-white text-xs">चॅट स्वच्छ करा</span>
            <span className="text-[10px] text-slate-400">Clean Chat Stream</span>
          </button>

          {/* Room Lock / Unlock (Host only) */}
          {isHost && (
            <button
              onClick={handleToggleLockAction}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                isRoomLocked 
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-300' 
                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}
            >
              {isRoomLocked ? <Lock className="w-5 h-5 text-rose-400" /> : <Unlock className="w-5 h-5 text-emerald-400" />}
              <span className="font-bold text-white text-xs">
                {isRoomLocked ? 'कट्टा लॉक आहे' : 'कट्टा अनलॉक आहे'}
              </span>
              <span className="text-[10px] text-slate-400">
                {isRoomLocked ? 'फक्त निमंत्रितांना' : 'सर्वांसाठी खुला'}
              </span>
            </button>
          )}

          {/* Admin & Safety Dashboard */}
          <button
            onClick={() => {
              onClose();
              onOpenAdminDashboard?.();
            }}
            className="p-3 col-span-2 rounded-2xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/40 flex items-center justify-between px-4 hover:border-purple-400 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <div className="font-bold text-white text-xs">सुरक्षा व ॲडमिन डॅशबोर्ड</div>
                <div className="text-[10px] text-purple-300">बॅन यादी, अहवाल व लाइव्ह आकडेवारी</div>
              </div>
            </div>
            <span className="text-xs text-purple-300 font-bold">उघडा ➔</span>
          </button>
        </div>

        {/* Room Theme Picker */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Palette className="w-4 h-4 text-pink-400" />
            <span>महाराष्ट्रीयन कट्टा थीम बदला (Change Theme)</span>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {CULTURAL_ROOM_THEMES.map(theme => {
              const isSelected = theme.id === activeThemeId;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    if (typeof onSelectTheme === 'function') {
                      onSelectTheme(theme.id);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'bg-pink-950/60 border-pink-500 shadow-md shadow-pink-500/20' 
                      : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-xs truncate">{theme.nameMr}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-pink-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{theme.descriptionMr}</p>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all"
        >
          बंद करा (Close)
        </button>
      </div>
    </div>
  );
};
