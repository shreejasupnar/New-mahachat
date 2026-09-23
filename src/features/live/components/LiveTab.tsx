import React, { useState, useEffect } from 'react';
import { Video, Sparkles, RefreshCw, Flame, Clock, Users, Play, Radio } from 'lucide-react';
import { UserProfile } from '../../../lib/firebase';
import { LiveStream, subscribeToLiveStreams, cleanupHostPreviousStreams } from '../services/streamService';
import { LiveCard } from './LiveCard';

interface LiveTabProps {
  currentUserProfile: UserProfile | null;
  onGoLive: () => void;
  onJoinStream: (stream: LiveStream) => void;
}

export const LiveTab: React.FC<LiveTabProps> = ({
  currentUserProfile,
  onGoLive,
  onJoinStream,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'popular' | 'new' | 'following'>('popular');
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // If the host is currently on the discovery tab, clean up any previous/orphaned streams
    if (currentUserProfile?.uid) {
      cleanupHostPreviousStreams(currentUserProfile.uid).catch(() => {});
    }

    setIsLoading(true);
    const unsub = subscribeToLiveStreams((liveList) => {
      setStreams(liveList);
      setIsLoading(false);
    });

    return () => unsub();
  }, [currentUserProfile?.uid]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (currentUserProfile?.uid) {
      await cleanupHostPreviousStreams(currentUserProfile.uid).catch(() => {});
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredStreams = streams.filter((s) => {
    // Strictly exclude any stream that is ended or not live
    if (!s || s.status !== 'live' || s.endedAt) {
      return false;
    }
    // If the current user is currently in the discovery tab, their previous broadcast has ended
    if (currentUserProfile && s.hostUid === currentUserProfile.uid) {
      return false;
    }
    if (activeSubTab === 'new') {
      return true; // Sort naturally by recency
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 select-none">
      {/* Top App Header for Live Discovery */}
      <header className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center shadow-md shadow-rose-500/20">
            <Video className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-base text-white tracking-tight">लाईव्ह स्ट्रीम्स</h1>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">महाराष्ट्रातील थेट व्हिडिओ संवाद</p>
          </div>
        </div>

        {/* Go Live Button */}
        <button
          onClick={onGoLive}
          id="btn-go-live-header"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-semibold text-xs shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>लाईव्ह सुरू करा</span>
        </button>
      </header>

      {/* Discovery Category Tabs */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('popular')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeSubTab === 'popular'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>लोकप्रिय ({streams.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('new')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeSubTab === 'new'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>नवीन (New)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('following')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeSubTab === 'following'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>फॉलो केलेले</span>
          </button>
        </div>

        <button
          onClick={handleRefresh}
          className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-all active:rotate-180"
          title="रिफ्रेश करा"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-rose-400' : ''}`} />
        </button>
      </div>

      {/* Streams Feed or Empty State */}
      <main className="p-4">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs text-slate-400">लाईव्ह स्ट्रीम्स लोड होत आहेत...</span>
          </div>
        ) : filteredStreams.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredStreams.map((stream) => (
              <LiveCard
                key={stream.id}
                stream={stream}
                onSelect={onJoinStream}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center max-w-md mx-auto">
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-500/20 to-pink-500/10 border border-rose-500/30 flex items-center justify-center shadow-xl shadow-rose-950/40">
                <Video className="w-10 h-10 text-rose-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-white text-[10px] font-black animate-ping" />
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-white text-[10px] font-black">
                ★
              </div>
            </div>

            <h2 className="text-lg font-bold text-white mb-2">
              सध्या कोणतेही थेट प्रवाह सुरू नाहीत
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              महाराष्ट्रातील मित्रांशी समोरासमोर थेट व्हिडिओवर बोला! स्वतःचा लाईव्ह सुरू करा किंवा मित्र ऑनलाईन येण्याची वाट पहा.
            </p>

            <button
              onClick={onGoLive}
              id="btn-go-live-empty-state"
              className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-bold text-sm shadow-xl shadow-rose-600/30 active:scale-98 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>पहिला लाईव्ह सुरू करा (Go Live)</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
