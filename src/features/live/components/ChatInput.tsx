import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { LIVE_CONFIG } from '../config/liveConfig';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const [lastSentTime, setLastSentTime] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;

    const now = Date.now();
    if (now - lastSentTime < LIVE_CONFIG.CHAT_RATE_LIMIT_MS) {
      return; // Rate limit 1 msg/sec
    }

    onSendMessage(text.trim());
    setText('');
    setLastSentTime(now);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={LIVE_CONFIG.MAX_CHAT_LENGTH}
        placeholder="काहीतरी छान बोला... (Say something nice)"
        disabled={disabled}
        className="flex-1 bg-black/50 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-2 text-xs text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-pink-600 disabled:opacity-40 flex items-center justify-center text-white shrink-0 active:scale-95 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
      >
        <Send className="w-3.5 h-3.5" />
      </button>
    </form>
  );
};
