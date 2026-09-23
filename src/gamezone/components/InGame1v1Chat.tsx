import React, { useState, useRef, useEffect } from 'react';
import { MatchChatMessage } from '../types';
import { X, Send, MessageSquare, Sparkles } from 'lucide-react';
import { gameSound } from '../services/gameSoundService';
import { VipBadge } from '../../components/vip/VipBadge';

export const QUICK_GAME_PHRASES: string[] = [
  'छान चाल! 👏',
  'आता माझी पाळी! ⚡',
  'काय खेळलास भावा! 🔥',
  'लवकर चाल खेळ ⏳',
  'बघूया कोण जिंकतं! 🎯',
  'छान खेळलास! 🤝',
  'काय योगायोग! 😂',
  'विजय आमचाच! 🏆',
  'पुन्हा खेळूया? 🔄',
  'शाब्बास! 👍'
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  messages: MatchChatMessage[];
  currentUserId: string;
  opponentName: string;
  onSendMessage: (text: string, isQuickPhrase?: boolean) => void;
  myVipLevel?: number;
}

export const InGame1v1Chat: React.FC<Props> = ({
  isOpen,
  onClose,
  messages,
  currentUserId,
  opponentName,
  onSendMessage,
  myVipLevel = 0
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string, isQuick: boolean = false) => {
    const content = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!content) return;

    gameSound.playTap();
    onSendMessage(content, isQuick);
    if (textToSend === undefined) {
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      {/* Backdrop Click to close */}
      <div className="flex-1 w-full" onClick={onClose} />

      {/* In-Game Chat Sheet */}
      <div 
        id="ingame-1v1-chat-sheet"
        className="w-full max-w-md mx-auto bg-slate-900 border-t border-slate-700/80 rounded-t-3xl shadow-2xl flex flex-col max-h-[75vh] overflow-hidden animate-in slide-in-from-bottom duration-200"
      >
        {/* Header */}
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <span>थेट १v१ चॅट</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-bold">
                  Live
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">
                {opponentName} सोबत संवाद
              </p>
            </div>
          </div>

          <button
            id="ingame-chat-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Marathi Regional Gaming Phrases (1-Tap Chips) */}
        <div className="px-3 py-2 bg-slate-950/50 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-1 mb-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>झटपट संवाद (Quick Phrases):</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            {QUICK_GAME_PHRASES.map((phrase, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(phrase, true)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-amber-600/30 border border-slate-700 hover:border-amber-500/50 text-slate-200 hover:text-amber-200 text-[11px] font-bold transition-all active:scale-95 shrink-0 shadow-xs cursor-pointer"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>

        {/* Message History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[140px] max-h-[260px]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-6 text-slate-500">
              <MessageSquare className="w-8 h-8 mb-1.5 opacity-30 text-amber-400" />
              <p className="text-xs font-bold text-slate-400">अद्याप कोणताही संदेश नाही</p>
              <p className="text-[10px] text-slate-500 mt-0.5">वरील झटपट शब्दांवर टॅप करा किंवा संदेश लिहा</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderUid === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in duration-100`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5 text-[9px] text-slate-400 px-1 flex-wrap">
                    <span className="font-bold">{isMe ? 'तुम्ही' : msg.senderName}</span>
                    {msg.vipLevel && msg.vipLevel > 0 ? (
                      <VipBadge level={msg.vipLevel} size="xs" />
                    ) : null}
                    <span>•</span>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div
                    className={`max-w-[80%] px-3 py-1.5 rounded-2xl text-xs font-semibold break-words shadow-sm flex flex-wrap items-baseline gap-1 ${
                      isMe
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-br-xs'
                        : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-bl-xs'
                    }`}
                  >
                    {msg.vipLevel && msg.vipLevel > 0 ? (
                      <span className="inline-flex items-center align-middle mr-1 select-none shrink-0" title={`VIP ${msg.vipLevel}`}>
                        <VipBadge level={msg.vipLevel} size="xs" />
                      </span>
                    ) : null}
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Free-typing Input Bar with VIP badge */}
        <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <div className="flex-1 bg-slate-900 border border-slate-800 focus-within:border-amber-500/60 rounded-xl px-2.5 py-1 flex items-center gap-1.5 transition-colors">
            {myVipLevel > 0 && (
              <div className="shrink-0 flex items-center select-none" title={`VIP ${myVipLevel}`}>
                <VipBadge level={myVipLevel} size="xs" />
              </div>
            )}
            <input
              ref={inputRef}
              id="ingame-chat-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="संदेश टाइप करा..."
              maxLength={100}
              className="flex-1 bg-transparent border-none py-1 text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <button
            id="ingame-chat-send-btn"
            type="button"
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="w-9 h-9 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95 shadow-md shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
