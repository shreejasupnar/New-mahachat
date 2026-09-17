import React from 'react';
import { X, Check, Hand, User, Crown, Sparkles } from 'lucide-react';
import { SpeakerRequest, voiceRoomService } from '../../services/voiceRoomService';
import { VoiceParticipant } from '../../lib/firebase';
import { VipBadge } from '../vip/VipBadge';

interface SpeakerRequestsModalProps {
  districtId: string;
  hostName: string;
  requests: SpeakerRequest[];
  seats: (VoiceParticipant | null)[];
  onClose: () => void;
}

export const SpeakerRequestsModal: React.FC<SpeakerRequestsModalProps> = ({
  districtId,
  hostName,
  requests,
  seats,
  onClose
}) => {
  const handleAccept = async (req: SpeakerRequest) => {
    // Find free seat (either requested seat if free, or first free seat 0-9)
    let targetSeat = req.requestedSeat !== null && req.requestedSeat !== undefined ? req.requestedSeat : null;
    if (targetSeat === null || seats[targetSeat] !== null) {
      targetSeat = seats.findIndex(s => s === null);
    }

    if (targetSeat === -1 || targetSeat === null) {
      alert('सर्व १० सीट्स भरल्या आहेत! आधी कोणतीही जागा रिकामी करा.');
      return;
    }

    await voiceRoomService.acceptSpeakerRequest(districtId, req, targetSeat, hostName);
  };

  const handleReject = async (req: SpeakerRequest) => {
    await voiceRoomService.rejectSpeakerRequest(districtId, req.uid);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Hand className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">बोलण्याची विनंती (Hand Raise)</h3>
              <p className="text-[11px] text-slate-400">प्रेक्षकांकडून आलेले स्पीकर अर्ज ({requests.length})</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
          {requests.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              सध्या कोणाचीही विनंती प्रलंबित नाही.
            </div>
          ) : (
            requests.map(req => (
              <div 
                key={req.id} 
                className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 shrink-0 border border-slate-600">
                    {req.photoURL ? (
                      <img src={req.photoURL} alt={req.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-pink-400 font-bold text-sm">
                        {req.displayName?.slice(0, 1) || <User className="w-4 h-4" />}
                      </div>
                    )}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-white text-xs truncate flex items-center gap-1.5 flex-wrap">
                      <span>{req.displayName}</span>
                      {req.vipLevel && req.vipLevel > 0 && (
                        <VipBadge level={req.vipLevel} size="xs" />
                      )}
                      {req.vipLevel && req.vipLevel >= 5 && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-full font-bold">
                          प्राधान्य
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-amber-400">
                      {req.requestedSeat !== null && req.requestedSeat !== undefined 
                        ? `सीट ${req.requestedSeat + 1} हवी आहे` 
                        : 'कोणतीही सीट चालेल'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleAccept(req)}
                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs"
                    title="स्वीकारा"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>स्वीकारा</span>
                  </button>
                  <button
                    onClick={() => handleReject(req)}
                    className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl"
                    title="नाकारा"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
        >
          बंद करा
        </button>
      </div>
    </div>
  );
};
