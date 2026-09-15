import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Users, Mic, Gift, Radio, Trash2, CheckCircle2 } from 'lucide-react';
import { RoomBan, voiceRoomService } from '../../services/voiceRoomService';
import { agoraVoiceService } from '../../services/agoraVoiceService';

interface VoiceAdminDashboardModalProps {
  districtId: string;
  speakersCount: number;
  listenersCount: number;
  onClose: () => void;
}

export const VoiceAdminDashboardModal: React.FC<VoiceAdminDashboardModalProps> = ({
  districtId,
  speakersCount,
  listenersCount,
  onClose
}) => {
  const [bans, setBans] = useState<RoomBan[]>([]);
  const [activeTab, setActiveTab] = useState<'metrics' | 'bans'>('metrics');
  const [isLiveAgora, setIsLiveAgora] = useState(agoraVoiceService.isLive());

  useEffect(() => {
    const unsub = voiceRoomService.subscribeBans(districtId, (list) => {
      setBans(list);
    });
    setIsLiveAgora(agoraVoiceService.isLive());
    return () => unsub();
  }, [districtId]);

  const handleUnban = async (uid: string) => {
    await voiceRoomService.unbanUser(districtId, uid);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">कट्टा ॲडमिन व सुरक्षा डॅशबोर्ड</h3>
              <p className="text-[11px] text-slate-400">लाइव्ह देखरेख आणि सुरक्षितता</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-xl bg-slate-800/80 p-1 border border-slate-700">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'metrics' 
                ? 'bg-purple-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            लाइव्ह आकडेवारी (Metrics)
          </button>
          <button
            onClick={() => setActiveTab('bans')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'bans' 
                ? 'bg-purple-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            बॅन यादी ({bans.length})
          </button>
        </div>

        {activeTab === 'metrics' ? (
          <div className="space-y-3">
            {/* Agora Engine Health Card */}
            <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${isLiveAgora ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-purple-400" />
                    <span>Agora RTC Real-Time Voice Engine</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isLiveAgora 
                      ? 'क्लाउड RTC द्वारे सर्व १० सीट्स कनेक्टेड आहेत.' 
                      : 'स्थानिक ऑडिओ फिडेलिटी मोड (AGORA_APP_ID सेट केल्यास लाइव्ह क्लाउड होईल)'}
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isLiveAgora ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {isLiveAgora ? 'LIVE RTC' : 'READY'}
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-black text-white">{speakersCount} / 10</div>
                  <div className="text-[10px] text-slate-400">सक्रिय सीट्स (Speakers)</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-black text-white">{listenersCount}</div>
                  <div className="text-[10px] text-slate-400">प्रेक्षक (Listeners)</div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1 text-amber-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>१०-सीट स्टारमेकर स्टाईल लेआउट:</span>
              </p>
              <p>
                पहिल्या ओळीत ५ सीट्स आणि दुसऱ्या ओळीत ५ सीट्स (एकूण १० सीट्स). प्रत्येक सीटवर बोलणाऱ्या व्यक्तीचा व्हॉईस इंडिकेटर (लहर) लाइव्ह आवाजाच्या तीव्रतेनुसार हालचाल करतो.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {bans.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                सध्या या कट्ट्यावरून कोणालाही बॅन केलेले नाही.
              </div>
            ) : (
              bans.map(b => (
                <div 
                  key={b.uid}
                  className="p-2.5 rounded-xl bg-slate-800/60 border border-red-500/20 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-white text-xs">{b.displayName}</div>
                    <div className="text-[10px] text-red-300">कारण: {b.reason}</div>
                  </div>
                  <button
                    onClick={() => handleUnban(b.uid)}
                    className="px-2.5 py-1 bg-slate-700 hover:bg-emerald-600/30 hover:text-emerald-300 text-slate-300 text-[11px] rounded-lg transition-colors"
                  >
                    अनबॅन करा
                  </button>
                </div>
              ))
            )}
          </div>
        )}

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
