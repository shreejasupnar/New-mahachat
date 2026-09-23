import React, { useState, useEffect, useRef } from 'react';
import { GameItem, GameMatchSession } from '../types';
import { BoardGameEngine } from '../engines/BoardGameEngine';
import { FunGameEngine } from '../engines/FunGameEngine';
import { BrainGameEngine } from '../engines/BrainGameEngine';
import { ActionGameEngine } from '../engines/ActionGameEngine';
import { gameSound } from '../services/gameSoundService';
import { sendMatchChatMessage } from '../services/gameZoneBackendService';
import { InGame1v1Chat } from './InGame1v1Chat';
import { Volume2, VolumeX, ArrowLeft, Flag, Smile, Trophy, Clock, MessageCircle } from 'lucide-react';

interface Props {
  game: GameItem;
  session: GameMatchSession;
  currentUserId: string;
  onSendMove: (action: string, data: any, nextTurnUid?: string, newGameState?: any, scoreUpdate?: { player1Score?: number; player2Score?: number }) => void;
  onFinishMatch: (winnerUid?: string, isDraw?: boolean, reason?: string) => void;
  onSurrender: () => void;
}

export const UniversalGameHost: React.FC<Props> = ({
  game,
  session,
  currentUserId,
  onSendMove,
  onFinishMatch,
  onSurrender
}) => {
  const [soundOn, setSoundOn] = useState(gameSound.isSoundEnabled());
  const [showSurrenderPrompt, setShowSurrenderPrompt] = useState(false);
  const [turnSecondsLeft, setTurnSecondsLeft] = useState(30);
  const [floatingEmoji, setFloatingEmoji] = useState<string | null>(null);

  // In-game 1v1 Real-time Chat States
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [player1Bubble, setPlayer1Bubble] = useState<string | null>(null);
  const [player2Bubble, setPlayer2Bubble] = useState<string | null>(null);
  const lastProcessedChatIdRef = useRef<string | null>(null);

  const isPlayer1 = session.player1.uid === currentUserId;
  const isMyTurn = session.turnUid === currentUserId;
  const myName = isPlayer1 ? session.player1.displayName : (session.player2?.displayName || 'Player');
  const opponent = isPlayer1 ? session.player2 : session.player1;
  const opponentName = opponent?.displayName || 'प्रतिस्पर्धी';

  // Real-time Chat Messages Listener & Floating Speech Bubble triggers
  useEffect(() => {
    const messages = session.chatMessages;
    if (!messages || messages.length === 0) return;

    const latestMsg = messages[messages.length - 1];
    if (latestMsg.id === lastProcessedChatIdRef.current) return;
    lastProcessedChatIdRef.current = latestMsg.id;

    // Check if message is a single emoji
    const isSingleEmoji = /^\p{Extended_Pictographic}$/u.test(latestMsg.text);
    if (isSingleEmoji) {
      setFloatingEmoji(latestMsg.text);
      setTimeout(() => setFloatingEmoji(null), 1600);
    }

    // Show comic-style speech bubble above relevant player's avatar
    if (latestMsg.senderUid === session.player1.uid) {
      setPlayer1Bubble(latestMsg.text);
      setTimeout(() => setPlayer1Bubble(null), 4000);
    } else {
      setPlayer2Bubble(latestMsg.text);
      setTimeout(() => setPlayer2Bubble(null), 4000);
    }

    // If message is from opponent, play sound chime and update unread if drawer is closed
    if (latestMsg.senderUid !== currentUserId) {
      gameSound.playMessage();
      if (!showChatDrawer) {
        setUnreadChatCount((prev) => prev + 1);
      }
    }
  }, [session.chatMessages, currentUserId, session.player1.uid, showChatDrawer]);

  // Turn timer
  useEffect(() => {
    setTurnSecondsLeft(30);
    const interval = setInterval(() => {
      setTurnSecondsLeft((sec) => {
        if (sec <= 1) {
          return 30; // auto-cycle or pass turn
        }
        return sec - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [session.turnUid]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    gameSound.setSoundEnabled(next);
  };

  const myPlayer = isPlayer1 ? session.player1 : session.player2;
  const myVipLevel = myPlayer?.vipLevel || 0;

  const triggerEmoji = (emoji: string) => {
    gameSound.playTap();
    setFloatingEmoji(emoji);
    setTimeout(() => setFloatingEmoji(null), 1500);

    // Broadcast emoji in chat so opponent sees it too
    sendMatchChatMessage(session.matchId, currentUserId, myName, emoji, true, myVipLevel);
  };

  const handleSendChatMessage = (text: string, isQuickPhrase: boolean = false) => {
    sendMatchChatMessage(session.matchId, currentUserId, myName, text, isQuickPhrase, myVipLevel);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <header className="px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            id="game-host-back-btn"
            onClick={() => setShowSurrenderPrompt(true)}
            className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">{game.icon}</span>
            <div>
              <h3 className="text-xs font-black text-white">{game.nameMr}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{game.nameEn}</p>
            </div>
          </div>
        </div>

        {/* Turn Status & Timer Indicator */}
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 border shadow-sm ${
            isMyTurn
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
              : 'bg-slate-800/80 text-slate-400 border-slate-700'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{isMyTurn ? `तुमची चाल (${turnSecondsLeft}s)` : `प्रतिस्पर्धी (${turnSecondsLeft}s)`}</span>
          </div>

          <button
            id="game-host-sound-btn"
            onClick={toggleSound}
            className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </header>

      {/* Floating Emoji Animation */}
      {floatingEmoji && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-5xl pointer-events-none animate-bounce z-50">
          {floatingEmoji}
        </div>
      )}

      {/* Center Game Arena */}
      <main className="flex-1 overflow-y-auto flex items-center justify-center p-2">
        {game.category === 'board' && (
          <BoardGameEngine
            session={session}
            currentUserId={currentUserId}
            onSendMove={onSendMove}
            onFinishMatch={onFinishMatch}
          />
        )}
        {game.category === 'fun' && (
          <FunGameEngine
            session={session}
            currentUserId={currentUserId}
            onSendMove={onSendMove}
            onFinishMatch={onFinishMatch}
          />
        )}
        {game.category === 'brain' && (
          <BrainGameEngine
            session={session}
            currentUserId={currentUserId}
            onSendMove={onSendMove}
            onFinishMatch={onFinishMatch}
          />
        )}
        {game.category === 'action' && (
          <ActionGameEngine
            session={session}
            currentUserId={currentUserId}
            onSendMove={onSendMove}
            onFinishMatch={onFinishMatch}
          />
        )}
      </main>

      {/* Floating In-Game 1v1 Speech Bubbles Container */}
      <div className="w-full max-w-md mx-auto px-4 relative z-30 pointer-events-none flex justify-between items-end pb-1">
        {/* Player 1 Speech Bubble */}
        <div className="max-w-[180px]">
          {player1Bubble && (
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-2xl rounded-bl-none shadow-lg border border-amber-300/40 animate-in zoom-in-90 slide-in-from-bottom-2 duration-150 relative">
              <span>{player1Bubble}</span>
              <div className="absolute -bottom-1.5 left-3 w-3 h-3 bg-orange-600 rotate-45 border-r border-b border-amber-300/40" />
            </div>
          )}
        </div>

        {/* Player 2 Speech Bubble */}
        <div className="max-w-[180px] text-right ml-auto">
          {player2Bubble && (
            <div className="bg-slate-800 text-slate-100 text-xs font-bold px-3 py-1.5 rounded-2xl rounded-br-none shadow-lg border border-slate-600 animate-in zoom-in-90 slide-in-from-bottom-2 duration-150 relative inline-block text-left">
              <span>{player2Bubble}</span>
              <div className="absolute -bottom-1.5 right-3 w-3 h-3 bg-slate-800 rotate-45 border-r border-b border-slate-600" />
            </div>
          )}
        </div>
      </div>

      {/* Bottom VS Players Bar & In-Game Chat */}
      <footer className="p-3 bg-slate-900/95 border-t border-slate-800 shrink-0">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {/* You */}
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-full border-2 p-0.5 ${isMyTurn ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-700'}`}>
              <img
                src={session.player1.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt="You"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div>
              <span className="text-xs font-black text-white block max-w-[90px] truncate">
                {isPlayer1 ? session.player1.displayName : session.player2?.displayName}
              </span>
              <span className="text-[11px] font-black text-amber-400">
                {isPlayer1 ? session.player1.score || 0 : session.player2?.score || 0} pts
              </span>
            </div>
          </div>

          {/* Center: In-Game Chat Button & Reaction Emojis */}
          <div className="flex items-center gap-2">
            {/* 1v1 Chat Button */}
            <button
              id="game-host-chat-toggle-btn"
              type="button"
              onClick={() => {
                setShowChatDrawer(true);
                setUnreadChatCount(0);
              }}
              className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <MessageCircle className="w-4 h-4 text-amber-400" />
              <span>चॅट</span>
              {unreadChatCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-bounce shadow-md">
                  {unreadChatCount}
                </span>
              )}
            </button>

            {/* Quick Reaction Emojis */}
            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              {['🔥', '😂', '👏', '🎯'].map((em) => (
                <button
                  key={em}
                  onClick={() => triggerEmoji(em)}
                  className="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center text-sm active:scale-90 transition-transform cursor-pointer"
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Opponent */}
          <div className="flex items-center gap-2.5 text-right">
            <div>
              <span className="text-xs font-black text-white block max-w-[90px] truncate">
                {!isPlayer1 ? session.player1.displayName : session.player2?.displayName || 'Opponent'}
              </span>
              <span className="text-[11px] font-black text-amber-400">
                {!isPlayer1 ? session.player1.score || 0 : session.player2?.score || 0} pts
              </span>
            </div>
            <div className={`w-10 h-10 rounded-full border-2 p-0.5 ${!isMyTurn ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-slate-700'}`}>
              <img
                src={opponent?.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                alt="Opponent"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
        </div>
      </footer>

      {/* 1v1 In-Game Live Chat Modal / Drawer */}
      <InGame1v1Chat
        isOpen={showChatDrawer}
        onClose={() => setShowChatDrawer(false)}
        messages={session.chatMessages || []}
        currentUserId={currentUserId}
        opponentName={opponentName}
        onSendMessage={handleSendChatMessage}
        myVipLevel={myVipLevel}
      />

      {/* Surrender Confirmation Modal */}
      {showSurrenderPrompt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-6 rounded-3xl text-center shadow-2xl">
            <Flag className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-black text-white mb-1">सामना सोडून द्यायचा आहे का?</h3>
            <p className="text-xs text-slate-400 mb-6">
              मध्यंतरी गेम सोडल्यास प्रतिस्पर्ध्याला विजयी घोषित केले जाईल आणि ३० नाणी परत मिळणार नाहीत.
            </p>
            <div className="flex gap-3">
              <button
                id="surrender-cancel-btn"
                onClick={() => setShowSurrenderPrompt(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                खेळणे सुरू ठेवा
              </button>
              <button
                id="surrender-confirm-btn"
                onClick={() => {
                  setShowSurrenderPrompt(false);
                  onSurrender();
                }}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase"
              >
                सामना सोडा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
