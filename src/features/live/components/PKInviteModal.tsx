import React, { useState, useEffect } from 'react';
import { X, Swords, Users, MapPin, Radio, Sparkles } from 'lucide-react';
import { LiveStream, subscribeToLiveStreams } from '../services/streamService';

interface PKInviteModalProps {
  currentStreamId: string;
  currentHostUid: string;
  onSendChallenge: (targetStream: LiveStream) => void;
  onClose: () => void;
}

export const PKInviteModal: React.FC<PKInviteModalProps> = ({
  currentStreamId,
  currentHostUid,
  onSendChallenge,
  onClose,
}) => {
  const [activeStreams, setActiveStreams] = useState<LiveStream[]>([]);
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToLiveStreams((streams) => {
      // Filter out self and streams already in PK
      const available = streams.filter(
        (s) => s.id !== currentStreamId && s.hostUid !== currentHostUid && !s.isPkActive
      );
      setActiveStreams(available);
      setIsLoading(false);
    });

    return () => unsub();
  }, [currentStreamId, currentHostUid]);

  const handleChallenge = (stream: LiveStream) => {
    setSelectedStreamId(stream.id);
    onSendChallenge(stream);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[80vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">PK महामुकाबला आव्हान</h3>
              <p className="text-[11px] text-slate-400">लाईव्ह असलेल्या यजमानाशी स्पर्धा करा</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Streamers List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              उपलब्ध यजमान शोधत आहे...
            </div>
          ) : activeStreams.length === 0 ? (
            <div className="py-12 text-center px-4">
              <Radio className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">
                सध्या कोणताही दुसरा यजमान ऑनलाईन नाही. मित्र ऑनलाईन आल्यावर त्यांना आव्हान द्या!
              </p>
            </div>
          ) : (
            activeStreams.map((stream) => (
              <div
                key={stream.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    {stream.hostPhotoURL ? (
                      <img
                        src={stream.hostPhotoURL}
                        alt={stream.hostName}
                        className="w-11 h-11 rounded-full object-cover border-2 border-rose-500/50"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm text-white">
                        {stream.hostName.charAt(0)}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
                  </div>

                  <div className="min-w-0">
                    <span className="font-bold text-xs text-white truncate block">
                      {stream.hostName}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate block">
                      {stream.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-amber-300 font-semibold">
                        📍 {stream.hostDistrict || 'महाराष्ट्र'}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <Users className="w-3 h-3 text-rose-400" />
                        {stream.viewerCount || 1}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleChallenge(stream)}
                  disabled={selectedStreamId === stream.id}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-extrabold text-xs shadow-md shadow-rose-600/30 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>आव्हान द्या</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
