import React from 'react';
import { 
  Trophy, 
  Sparkles, 
  Clock, 
  Users, 
  Heart, 
  Award, 
  Share2, 
  CheckCircle, 
  Radio, 
  Video, 
  Coins,
  Crown,
  Flame
} from 'lucide-react';
import { LiveStream, LiveMessage } from '../services/streamService';

export interface StreamSummaryData {
  streamTitle: string;
  category: string;
  isAudioOnly?: boolean;
  durationSeconds: number;
  viewerCount: number;
  likesCount: number;
  giftsCount: number;
  coinsEarned: number;
  topGifters: Array<{
    name: string;
    photoURL?: string;
    count: number;
  }>;
}

interface StreamSummaryModalProps {
  data: StreamSummaryData;
  onDone: () => void;
}

export const StreamSummaryModal: React.FC<StreamSummaryModalProps> = ({
  data,
  onDone,
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) {
      return `${secs} सेकंद`;
    }
    return `${mins} मि. ${secs} से.`;
  };

  const handleShareToWhatsApp = () => {
    const shareText = `🚩 *महाचॅट लाईव्ह अहवाल (MahaChat Live Report)* 🚩\n\n` +
      `🎙️ थेट संवाद: *${data.streamTitle}*\n` +
      `⏱️ कालावधी: ${formatDuration(data.durationSeconds)}\n` +
      `👥 एकूण प्रेक्षक: ${data.viewerCount}\n` +
      `❤️ मिळालेले लाईक्स: ${data.likesCount}\n` +
      `🎁 एकूण भेटवस्तू: ${data.giftsCount}\n` +
      `🪙 कमावलेली नाणी: ${data.coinsEarned} कॉईन्स\n\n` +
      `माझ्या पुढील थेट संवादात सामील होण्यासाठी महाचॅटवर कनेक्ट रहा! ✨`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-amber-500/40 rounded-3xl p-5 text-center shadow-2xl animate-in zoom-in-95 duration-200 my-auto">
        
        {/* Celebration Trophy Badge */}
        <div className="relative mb-3 inline-block">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30">
            <Trophy className="w-9 h-9 text-slate-950" />
          </div>
          <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1.5 -right-1.5 animate-bounce" />
          <Crown className="w-4 h-4 text-amber-200 absolute -bottom-1 -left-1 animate-pulse" />
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-black text-white tracking-wide mb-1">
          थेट प्रवाह यशस्वीपणे संपन्न! 🎉
        </h2>
        <p className="text-xs text-amber-300/90 font-medium mb-4">
          आपल्या थेट संवादाचा अंतिम अहवाल व कमाई
        </p>

        {/* Stream Details Capsule */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 mb-3 flex items-center justify-between text-left">
          <div className="min-w-0 flex-1 pr-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-300 block">
              थेट शीर्षक
            </span>
            <p className="text-xs font-semibold text-white truncate">
              {data.streamTitle}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] font-bold text-amber-300">
            {data.isAudioOnly ? (
              <>
                <Radio className="w-3 h-3 text-amber-400" />
                <span>ऑडिओ</span>
              </>
            ) : (
              <>
                <Video className="w-3 h-3 text-rose-400" />
                <span>व्हिडिओ</span>
              </>
            )}
          </div>
        </div>

        {/* 4 Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3.5">
          {/* Duration */}
          <div className="bg-slate-850/80 border border-slate-750 rounded-2xl p-3 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center mb-1">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-medium text-slate-400">कालावधी</span>
            <span className="text-sm font-black text-white mt-0.5">
              {formatDuration(data.durationSeconds)}
            </span>
          </div>

          {/* Viewers */}
          <div className="bg-slate-850/80 border border-slate-750 rounded-2xl p-3 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-1">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-medium text-slate-400">एकूण प्रेक्षक</span>
            <span className="text-sm font-black text-white mt-0.5">
              {data.viewerCount}
            </span>
          </div>

          {/* Likes */}
          <div className="bg-slate-850/80 border border-slate-750 rounded-2xl p-3 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-1">
              <Heart className="w-4 h-4 fill-rose-500" />
            </div>
            <span className="text-[10px] font-medium text-slate-400">लाईक्स</span>
            <span className="text-sm font-black text-white mt-0.5">
              {data.likesCount}
            </span>
          </div>

          {/* Coins Earned */}
          <div className="bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-amber-500/20 border border-amber-500/30 rounded-2xl p-3 flex flex-col items-center justify-center shadow-lg shadow-amber-500/10">
            <div className="w-8 h-8 rounded-xl bg-amber-500/25 text-amber-400 flex items-center justify-center mb-1">
              <Coins className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-amber-300">कमावलेले कॉईन्स</span>
            <span className="text-sm font-black text-amber-200 mt-0.5">
              +{data.coinsEarned}
            </span>
          </div>
        </div>

        {/* Top Contributors / Gifters Box */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-4 text-left">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>खास चाहते व भेटवस्तू</span>
            </div>
            <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
              {data.giftsCount} भेटवस्तू
            </span>
          </div>

          {data.topGifters && data.topGifters.length > 0 ? (
            <div className="space-y-1.5">
              {data.topGifters.map((gifter, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between py-1 px-2 rounded-xl bg-white/5 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-black text-amber-400 w-4 text-center">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </span>
                    {gifter.photoURL ? (
                      <img
                        src={gifter.photoURL}
                        alt={gifter.name}
                        className="w-5 h-5 rounded-full object-cover border border-white/20"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                        {gifter.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-white font-medium truncate max-w-[120px]">
                      {gifter.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-300 shrink-0">
                    {gifter.count} भेट
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 text-center py-1">
              या संवादात प्रेक्षकांनी भरपूर दाद दिली आणि संवाद रंगला! 🌟
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Share to WhatsApp */}
          <button
            type="button"
            onClick={handleShareToWhatsApp}
            id="btn-share-stream-summary"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>अहवाल व्हॉट्सअॅपवर शेअर करा</span>
          </button>

          {/* Close / Done Button */}
          <button
            type="button"
            onClick={onDone}
            id="btn-close-stream-summary"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>पूर्ण झाले (मुख्य पानावर जा)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
