import React, { useState } from 'react';
import { X, Send, Flame, Sparkles } from 'lucide-react';
import { UserProfile } from '../../lib/firebase';

interface InRoomChatInputModalProps {
  currentUser: UserProfile;
  onSendMessage: (text: string) => void;
  onCleanChat?: () => void;
  onClose: () => void;
}

export const InRoomChatInputModal: React.FC<InRoomChatInputModalProps> = ({
  currentUser,
  onSendMessage,
  onCleanChat,
  onClose
}) => {
  const [text, setText] = useState('');

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
    onClose();
  };

  const quickPhrases = [
    'नमस्कार मंडळी! 🙏',
    'छान गाणं! 🎵',
    'अभिनंदन! 👏',
    'जय महाराष्ट्र! 🚩',
    'खूप छान विषय आहे 💕',
    'हाय हाय 👋'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border-t sm:border border-pink-500/40 rounded-t-3xl sm:rounded-3xl p-4 max-w-md w-full shadow-2xl text-white space-y-3 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-base">💬</span>
            <h3 className="font-bold text-sm text-pink-200">व्हॉईस रूम लाईव्ह चॅट</h3>
          </div>
          <div className="flex items-center gap-2">
            {onCleanChat && (
              <button
                type="button"
                onClick={() => {
                  onCleanChat();
                  onClose();
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-600/30 text-red-300 border border-red-500/40 text-[10px] font-bold hover:bg-red-600/50"
                title="चॅट साफ करा"
              >
                <Flame className="w-3 h-3 text-red-400" />
                <span>Clean Chat</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Phrases */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {quickPhrases.map((phrase, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onSendMessage(phrase);
                onClose();
              }}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-purple-900/60 border border-slate-700 text-[11px] text-slate-300 hover:text-pink-200 whitespace-nowrap active:scale-95 transition-all"
            >
              {phrase}
            </button>
          ))}
        </div>

        {/* Text Input Form */}
        <form onSubmit={handleSend} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="रूममध्ये मेसेज पाठवा..."
            className="flex-1 bg-slate-800/90 border border-slate-700 focus:border-pink-500 focus:outline-none rounded-2xl px-3.5 py-2 text-xs text-white placeholder-slate-400"
            autoFocus
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="w-10 h-10 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-40 text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
