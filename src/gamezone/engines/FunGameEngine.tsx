import React, { useState, useEffect } from 'react';
import { GameMatchSession } from '../types';
import { gameSound } from '../services/gameSoundService';
import { Sparkles, Bomb, Smile, Heart, Flame, Zap, Check, X, RotateCcw } from 'lucide-react';

interface EngineProps {
  session: GameMatchSession;
  currentUserId: string;
  onSendMove: (action: string, data: any, nextTurnUid?: string, newGameState?: any, scoreUpdate?: { player1Score?: number; player2Score?: number }) => void;
  onFinishMatch: (winnerUid?: string, isDraw?: boolean, reason?: string) => void;
}

export const FunGameEngine: React.FC<EngineProps> = ({
  session,
  currentUserId,
  onSendMove,
  onFinishMatch
}) => {
  const isPlayer1 = session.player1.uid === currentUserId;
  const isMyTurn = session.turnUid === currentUserId;
  const opponent = isPlayer1 ? session.player2 : session.player1;

  // ==========================================
  // 1. TRUTH OR DARE 1V1
  // ==========================================
  if (session.gameId === 'truth_or_dare') {
    const TRUTH_PROMPTS = [
      'महाराष्ट्रात तुमचे सर्वात आवडते पर्यटन स्थळ कोणते आणि का?',
      'शाळेत असताना तुम्ही केलेली सर्वात हसरी किंवा गंमतीशीर चूक कोणती?',
      'कोणता पदार्थ तुम्हाला सर्वात जास्त आवडतो (उदा. पुरणपोळी, वडापाव की मिसळ)?',
      'तुम्हाला मिळालेली सर्वात चांगली आणि प्रेरणादायी सल्ला कोणती?',
      'जर तुम्हाला एका दिवसासाठी मुख्यमंत्री केले तर पहिली गोष्ट कोणती कराल?'
    ];

    const DARE_PROMPTS = [
      'ऑडिओ किंवा चॅटमध्ये ५ सेकंदात एका प्रसिद्ध मराठी चित्रपटाचा संवाद बोला!',
      'प्रतिस्पर्ध्याला ३ सुंदर आणि खरे कौतुक सांगा!',
      'एक मजेशीर इमोजी रिएक्शन पाठवून १० सेकंदात हसवा!',
      'एका प्रसिद्ध गाण्याची एक ओळ गुणगुणा किंवा टाइप करा!',
      'स्वतःचा आवडता छंद किंवा कला एका वाक्यात सादर करा!'
    ];

    const promptType: 'truth' | 'dare' | null = session.gameState?.promptType || null;
    const currentPrompt: string | null = session.gameState?.currentPrompt || null;
    const completedCount: number = session.gameState?.completedCount || 0;

    const selectChoice = (type: 'truth' | 'dare') => {
      if (!isMyTurn) return;
      gameSound.playTap();

      const bank = type === 'truth' ? TRUTH_PROMPTS : DARE_PROMPTS;
      const randomPrompt = bank[Math.floor(Math.random() * bank.length)];

      onSendMove(
        'SELECT_PROMPT',
        { type, prompt: randomPrompt },
        currentUserId, // Keep turn to complete or answer
        { promptType: type, currentPrompt: randomPrompt, completedCount }
      );
    };

    const handleComplete = () => {
      gameSound.playWin();
      const newCount = completedCount + 1;

      if (newCount >= 4) {
        onFinishMatch(undefined, true, 'दोन्ही खेळाडूंनी सर्व ट्रुथ व डेअर टास्क यशस्वीपणे पूर्ण केले! 🎉');
      } else {
        onSendMove(
          'COMPLETE_TASK',
          { completedCount: newCount },
          opponent?.uid,
          { promptType: null, currentPrompt: null, completedCount: newCount }
        );
      }
    };

    return (
      <div className="flex flex-col items-center justify-center p-4">
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-14 h-2 rounded-full transition-all ${
                i < completedCount ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {!currentPrompt ? (
          <div className="text-center w-72">
            <h3 className="text-lg font-black text-white mb-4">
              {isMyTurn ? 'तुमचा टर्न: एक पर्याय निवडा!' : 'प्रतिस्पर्धी पर्याय निवडत आहे...'}
            </h3>
            {isMyTurn && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  id="tod-truth-btn"
                  onClick={() => selectChoice('truth')}
                  className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-black text-base shadow-xl active:scale-95 flex flex-col items-center gap-2 cursor-pointer"
                >
                  <span className="text-2xl">🕊️</span>
                  <span>TRUTH</span>
                  <span className="text-[10px] text-blue-100 font-medium">खरे सांगा</span>
                </button>
                <button
                  id="tod-dare-btn"
                  onClick={() => selectChoice('dare')}
                  className="p-5 rounded-2xl bg-gradient-to-br from-rose-600 to-pink-500 text-white font-black text-base shadow-xl active:scale-95 flex flex-col items-center gap-2 cursor-pointer"
                >
                  <span className="text-2xl">🔥</span>
                  <span>DARE</span>
                  <span className="text-[10px] text-rose-100 font-medium">चॅलेंज पूर्ण करा</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-80 bg-slate-900/90 border-2 border-indigo-500/40 p-5 rounded-3xl text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase mb-3 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {promptType === 'truth' ? '🕊️ TRUTH प्रश्न' : '🔥 DARE चॅलेंज'}
            </div>
            <p className="text-sm font-bold text-white leading-relaxed mb-6">
              "{currentPrompt}"
            </p>

            {isMyTurn && (
              <button
                id="tod-done-btn"
                onClick={handleComplete}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 cursor-pointer"
              >
                ✅ मी पूर्ण केले (Done)
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 2. ROCK PAPER SCISSORS (Best of 3)
  // ==========================================
  if (session.gameId === 'rock_paper_scissors') {
    const signs = [
      { id: 'rock', icon: '✊', name: 'दगड (Rock)' },
      { id: 'paper', icon: '✋', name: 'कागद (Paper)' },
      { id: 'scissors', icon: '✌️', name: 'कात्री (Scissors)' }
    ];

    const p1Choice = session.gameState?.p1Choice;
    const p2Choice = session.gameState?.p2Choice;
    const scores = session.gameState?.scores || { p1: 0, p2: 0 };
    const myChoice = isPlayer1 ? p1Choice : p2Choice;

    const chooseSign = (sign: string) => {
      gameSound.playTap();
      const nextP1 = isPlayer1 ? sign : p1Choice;
      const nextP2 = !isPlayer1 ? sign : p2Choice;

      // If both have chosen, evaluate round
      if (nextP1 && nextP2) {
        let win: 'p1' | 'p2' | 'draw' = 'draw';
        if (nextP1 === nextP2) win = 'draw';
        else if (
          (nextP1 === 'rock' && nextP2 === 'scissors') ||
          (nextP1 === 'paper' && nextP2 === 'rock') ||
          (nextP1 === 'scissors' && nextP2 === 'paper')
        ) {
          win = 'p1';
        } else {
          win = 'p2';
        }

        const newScores = {
          p1: scores.p1 + (win === 'p1' ? 1 : 0),
          p2: scores.p2 + (win === 'p2' ? 1 : 0)
        };

        if (newScores.p1 >= 2) {
          gameSound.playWin();
          onFinishMatch(session.player1.uid, false, 'दगड कागद कात्री - २ फेऱ्या जिंकल्या!');
        } else if (newScores.p2 >= 2) {
          gameSound.playWin();
          onFinishMatch(session.player2?.uid, false, 'दगड कागद कात्री - २ फेऱ्या जिंकल्या!');
        } else {
          onSendMove(
            'ROUND_EVAL',
            { p1Choice: nextP1, p2Choice: nextP2, win },
            undefined,
            { p1Choice: null, p2Choice: null, scores: newScores },
            { player1Score: newScores.p1 * 100, player2Score: newScores.p2 * 100 }
          );
        }
      } else {
        onSendMove(
          'CHOOSE_SIGN',
          { sign, isPlayer1 },
          undefined,
          { p1Choice: nextP1, p2Choice: nextP2, scores }
        );
      }
    };

    return (
      <div className="flex flex-col items-center justify-center p-4">
        {/* Score Header */}
        <div className="flex items-center gap-6 bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800 mb-6">
          <div className="text-center">
            <span className="text-xs text-blue-400 font-bold block">{session.player1.displayName.slice(0, 10)}</span>
            <span className="text-2xl font-black text-white">{scores.p1}</span>
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase">Best of 3</span>
          <div className="text-center">
            <span className="text-xs text-rose-400 font-bold block">{session.player2?.displayName.slice(0, 10) || 'P2'}</span>
            <span className="text-2xl font-black text-white">{scores.p2}</span>
          </div>
        </div>

        {/* Choice Buttons */}
        <div className="flex gap-4">
          {signs.map((s) => (
            <button
              key={s.id}
              id={`rps-${s.id}-btn`}
              onClick={() => chooseSign(s.id)}
              disabled={Boolean(myChoice)}
              className={`w-24 h-32 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${
                myChoice === s.id
                  ? 'bg-blue-600 text-white ring-4 ring-blue-400 scale-105 shadow-2xl'
                  : myChoice
                  ? 'bg-slate-900/40 opacity-50 cursor-not-allowed'
                  : 'bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 cursor-pointer active:scale-95'
              }`}
            >
              <span className="text-4xl">{s.icon}</span>
              <span className="text-xs font-bold">{s.name}</span>
            </button>
          ))}
        </div>

        <p className="text-xs font-bold text-slate-400 mt-6">
          {myChoice
            ? '✅ तुमची निवड झाली! प्रतिस्पर्ध्याच्या निवडीची प्रतीक्षा...'
            : '👉 आपले चिन्ह निवडा!'}
        </p>
      </div>
    );
  }

  // ==========================================
  // 3. QUICK TAP (Reflex Battle)
  // ==========================================
  if (session.gameId === 'quick_tap') {
    const myScore = isPlayer1 ? (session.player1.score || 0) : (session.player2?.score || 0);
    const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });

    const handleTapTarget = () => {
      gameSound.playTap();
      const updated = myScore + 10;
      setTargetPos({
        x: Math.floor(Math.random() * 80) + 10,
        y: Math.floor(Math.random() * 80) + 10
      });

      if (updated >= 100) {
        gameSound.playWin();
        onFinishMatch(currentUserId, false, 'क्विक टॅप १०० पॉइंट्स सर्वात आधी पूर्ण केले!');
      } else {
        onSendMove(
          'TAP_TARGET',
          { score: updated },
          undefined,
          {},
          isPlayer1 ? { player1Score: updated } : { player2Score: updated }
        );
      }
    };

    return (
      <div className="flex flex-col items-center justify-center p-3">
        <div className="relative w-72 h-72 bg-slate-950 rounded-3xl border-2 border-indigo-500/30 overflow-hidden shadow-2xl">
          <button
            id="quick-tap-target-btn"
            onClick={handleTapTarget}
            style={{ top: `${targetPos.y}%`, left: `${targetPos.x}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 border-2 border-white shadow-[0_0_20px_rgba(245,158,11,0.8)] flex items-center justify-center text-xl active:scale-90 transition-transform cursor-pointer animate-pulse"
          >
            ⚡
          </button>
        </div>
        <div className="mt-4 text-center">
          <span className="text-xs font-bold text-slate-400 block">तुमचा स्कोअर: {myScore} / १००</span>
          <span className="text-[11px] text-amber-400 font-medium">टार्गेट दिसताच वेगाने टॅप करा!</span>
        </div>
      </div>
    );
  }

  // ==========================================
  // 4. BOMB PASS (Cartoon Ticking Bomb)
  // ==========================================
  if (session.gameId === 'bomb_pass') {
    const bombHolder = session.gameState?.bombHolder || session.player1.uid;
    const isHoldingBomb = bombHolder === currentUserId;

    const passBomb = () => {
      if (!isHoldingBomb) return;
      gameSound.playTap();

      onSendMove(
        'PASS_BOMB',
        {},
        opponent?.uid,
        { bombHolder: opponent?.uid }
      );
    };

    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className={`w-64 h-64 rounded-3xl border-4 flex flex-col items-center justify-center transition-all ${
          isHoldingBomb
            ? 'bg-rose-950/60 border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.4)] animate-pulse'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <span className="text-6xl mb-3">💣</span>
          <span className={`text-sm font-black uppercase tracking-wider ${
            isHoldingBomb ? 'text-rose-400' : 'text-slate-400'
          }`}>
            {isHoldingBomb ? '🔥 बॉम्ब तुमच्याकडे आहे!' : 'प्रतिस्पर्ध्याकडे बॉम्ब आहे'}
          </span>
        </div>

        {isHoldingBomb && (
          <button
            id="pass-bomb-btn"
            onClick={passBomb}
            className="mt-6 px-8 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl active:scale-95 cursor-pointer animate-bounce"
          >
            🚀 बॉम्ब पास करा! (Pass Bomb)
          </button>
        )}
      </div>
    );
  }

  // Fallback for Spin / Mini Race
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4">🎮</div>
      <h3 className="text-base font-black text-white mb-2">{session.gameId}</h3>
      <p className="text-xs text-slate-400 mb-6">दोन्ही खेळाडू गेम खेळत आहेत...</p>
      <button
        onClick={() => onFinishMatch(session.player1.uid, false, 'फेरी पूर्ण झाली!')}
        className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
      >
        फेरी पूर्ण करा
      </button>
    </div>
  );
};
