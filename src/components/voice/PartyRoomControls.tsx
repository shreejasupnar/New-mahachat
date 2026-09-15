import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Smile, 
  MessageSquare, 
  Gift, 
  LayoutGrid
} from 'lucide-react';

interface PartyRoomControlsProps {
  isMuted: boolean;
  isSpeakerOn: boolean;
  isSpeaking: boolean;
  isSeated: boolean;
  totalCount: number;
  isHostOrMod?: boolean;
  hasPendingRequests?: boolean;
  requestsCount?: number;
  isHandRaised?: boolean;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onOpenChatInput: () => void;
  onOpenGiftModal: () => void;
  onOpenAudienceModal: () => void;
  onTriggerReaction: (emoji: string) => void;
  onRaiseHand?: () => void;
  onOpenHostControls?: () => void;
}

export const PartyRoomControls: React.FC<PartyRoomControlsProps> = ({
  isMuted,
  isSpeakerOn,
  isSpeaking,
  isSeated,
  totalCount,
  isHostOrMod = false,
  hasPendingRequests = false,
  requestsCount = 0,
  isHandRaised = false,
  onToggleMute,
  onToggleSpeaker,
  onOpenChatInput,
  onOpenGiftModal,
  onOpenAudienceModal,
  onTriggerReaction,
  onRaiseHand,
  onOpenHostControls
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const reactionEmojis = ['❤️', '🌹', '👏', '🔥', '😂', '👑', '🚩'];

  return (
    <div className="relative w-full px-3 py-3 bg-gradient-to-t from-slate-950 via-slate-950/95 to-slate-900/80 border-t border-purple-900/30 backdrop-blur-xl z-30 select-none shadow-[0_-4px_25px_rgba(0,0,0,0.6)]">
      {/* Floating Reaction Picker */}
      {showReactionPicker && (
        <div className="absolute bottom-16 left-12 z-40 bg-slate-900/95 border border-pink-500/40 rounded-2xl p-2 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150 backdrop-blur-md">
          {reactionEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onTriggerReaction(emoji);
                setShowReactionPicker(false);
              }}
              className="text-2xl hover:scale-125 active:scale-90 transition-transform p-1 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Action Row (matching screenshot layout) */}
      <div className="flex items-center justify-between max-w-md mx-auto w-full">
        {/* Left Side: Speaker, Mic, Emoji, Chat Message */}
        <div className="flex items-center gap-2.5">
          {/* Speaker Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSpeaker}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-sm ${
              isSpeakerOn
                ? 'bg-slate-800/90 text-white border border-slate-700 hover:bg-slate-700'
                : 'bg-slate-900/90 text-slate-500 border border-slate-800'
            }`}
            title={isSpeakerOn ? 'आवाज सुरू' : 'आवाज बंद'}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Mic Toggle Button */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-sm ${
              isSeated && !isMuted
                ? isSpeaking
                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                  : 'bg-emerald-600 text-white'
                : 'bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700'
            }`}
            title={isSeated ? (isMuted ? 'माइक सुरू करा' : 'माइक बंद करा') : 'माइकसाठी सीटवर बसा'}
          >
            {isSeated && !isMuted ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Emoji Reaction Launcher */}
          <button
            type="button"
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="w-10 h-10 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-pink-300 border border-slate-700 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-sm"
            title="प्रतिक्रिया पाठवा"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Quick Chat Input button */}
          <button
            type="button"
            onClick={onOpenChatInput}
            className="w-10 h-10 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-sm"
            title="लाईव्ह मेसेज पाठवा"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Raise Hand Button for Audience (when not seated) */}
          {!isSeated && onRaiseHand && (
            <button
              type="button"
              onClick={onRaiseHand}
              className={`px-2.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-sm ${
                isHandRaised
                  ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                  : 'bg-slate-800/90 text-amber-300 hover:text-amber-200 border-amber-500/40 hover:bg-slate-700'
              }`}
              title="बोलण्याची विनंती करा"
            >
              <span>✋</span>
              <span className="hidden sm:inline text-[11px]">{isHandRaised ? 'विनंती पाठवली' : 'हात वर करा'}</span>
            </button>
          )}
        </div>

        {/* Right Side: Gifts / Rewards button & Grid Menu */}
        <div className="flex items-center gap-2">
          {/* Host / Moderator Quick Panel Button */}
          {isHostOrMod && onOpenHostControls && (
            <button
              type="button"
              onClick={onOpenHostControls}
              className="relative w-10 h-10 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/60 text-purple-200 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-sm"
              title="होस्ट नियंत्रण पॅनेल"
            >
              {requestsCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] animate-bounce">
                  {requestsCount}
                </span>
              )}
              <span className="text-sm">👑</span>
            </button>
          )}

          {/* Gift Collectibles / Store button (matching golden gift box in screenshot) */}
          <button
            type="button"
            onClick={onOpenGiftModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 hover:from-amber-400 hover:to-pink-500 active:scale-90 text-white font-black text-xs shadow-[0_0_18px_rgba(236,72,153,0.5)] border border-pink-300/80 cursor-pointer transition-all"
            title="भेटवस्तू पाठवा"
          >
            <Gift className="w-4 h-4 text-yellow-200 animate-bounce" />
            <span className="text-[11px] uppercase tracking-wide">भेटवस्तू</span>
          </button>

          {/* Grid Menu Icon (matching 9-square icon on far right of screenshot) */}
          <button
            type="button"
            onClick={onOpenAudienceModal}
            className="w-10 h-10 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-sm"
            title="सदस्य व पर्याय"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
