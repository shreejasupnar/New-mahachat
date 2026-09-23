import React, { useState, useEffect } from 'react';
import { GameMatchSession } from '../types';
import { gameSound } from '../services/gameSoundService';
import { QUIZ_QUESTION_BANK } from '../data/quizQuestions';
import { Check, X, Award, HelpCircle, Sparkles } from 'lucide-react';

interface EngineProps {
  session: GameMatchSession;
  currentUserId: string;
  onSendMove: (action: string, data: any, nextTurnUid?: string, newGameState?: any, scoreUpdate?: { player1Score?: number; player2Score?: number }) => void;
  onFinishMatch: (winnerUid?: string, isDraw?: boolean, reason?: string) => void;
}

export const BrainGameEngine: React.FC<EngineProps> = ({
  session,
  currentUserId,
  onSendMove,
  onFinishMatch
}) => {
  const isPlayer1 = session.player1.uid === currentUserId;
  const opponent = isPlayer1 ? session.player2 : session.player1;

  // ==========================================
  // 1. QUIZ BATTLE 1V1
  // ==========================================
  if (session.gameId === 'quiz_battle') {
    const questionIndex = session.gameState?.questionIndex || 0;
    const questions = session.gameState?.questions || QUIZ_QUESTION_BANK.slice(0, 5);
    const p1Answered = session.gameState?.p1Answered;
    const p2Answered = session.gameState?.p2Answered;

    const myAnswer = isPlayer1 ? p1Answered : p2Answered;
    const currentQ = questions[questionIndex];
    const p1Score = session.player1.score || 0;
    const p2Score = session.player2?.score || 0;

    const handleSelectOption = (idx: number) => {
      if (myAnswer !== undefined) return;
      const isCorrect = idx === currentQ.correctIndex;
      if (isCorrect) {
        gameSound.playWin();
      } else {
        gameSound.playDefeat();
      }

      const pointsEarned = isCorrect ? 20 : 0;
      const updatedP1Score = isPlayer1 ? p1Score + pointsEarned : p1Score;
      const updatedP2Score = !isPlayer1 ? p2Score + pointsEarned : p2Score;

      const nextP1Answer = isPlayer1 ? idx : p1Answered;
      const nextP2Answer = !isPlayer1 ? idx : p2Answered;

      // Check if both players answered current question
      if (nextP1Answer !== undefined && nextP2Answer !== undefined) {
        setTimeout(() => {
          if (questionIndex + 1 >= questions.length) {
            // Quiz completed
            const winnerUid =
              updatedP1Score > updatedP2Score
                ? session.player1.uid
                : updatedP2Score > updatedP1Score
                ? session.player2?.uid
                : undefined;
            const isDraw = updatedP1Score === updatedP2Score;
            onFinishMatch(winnerUid, isDraw, 'क्विझ बॅटल ५ प्रश्न पूर्ण!');
          } else {
            // Advance to next question
            onSendMove(
              'NEXT_QUESTION',
              { nextIndex: questionIndex + 1 },
              undefined,
              {
                questionIndex: questionIndex + 1,
                questions,
                p1Answered: undefined,
                p2Answered: undefined
              },
              { player1Score: updatedP1Score, player2Score: updatedP2Score }
            );
          }
        }, 1200);
      } else {
        onSendMove(
          'ANSWER_SUBMITTED',
          { optionIndex: idx, isPlayer1 },
          undefined,
          {
            questionIndex,
            questions,
            p1Answered: nextP1Answer,
            p2Answered: nextP2Answer
          },
          { player1Score: updatedP1Score, player2Score: updatedP2Score }
        );
      }
    };

    return (
      <div className="flex flex-col items-center justify-center p-3 w-full max-w-sm mx-auto">
        {/* Progress & Category */}
        <div className="w-full flex items-center justify-between text-xs font-bold text-slate-400 mb-3 px-1">
          <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            {currentQ.category}
          </span>
          <span>प्रश्न {questionIndex + 1} / {questions.length}</span>
        </div>

        {/* Question Card */}
        <div className="w-full bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl mb-4 text-center">
          <p className="text-sm font-black text-white leading-relaxed mb-1">
            {currentQ.questionMr}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            {currentQ.questionEn}
          </p>
        </div>

        {/* 4 Options */}
        <div className="w-full space-y-2">
          {currentQ.options.map((opt: string, idx: number) => {
            const isSelected = myAnswer === idx;
            const showCorrectness = myAnswer !== undefined;
            const isRight = idx === currentQ.correctIndex;

            return (
              <button
                key={idx}
                id={`quiz-opt-${idx}`}
                onClick={() => handleSelectOption(idx)}
                disabled={myAnswer !== undefined}
                className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between ${
                  showCorrectness && isRight
                    ? 'bg-emerald-600/30 border-2 border-emerald-500 text-emerald-300'
                    : showCorrectness && isSelected && !isRight
                    ? 'bg-rose-600/30 border-2 border-rose-500 text-rose-300'
                    : isSelected
                    ? 'bg-indigo-600 text-white border-2 border-indigo-400'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-200 hover:bg-slate-800 active:scale-[0.98] cursor-pointer'
                }`}
              >
                <span>{opt}</span>
                {showCorrectness && isRight && <Check className="w-4 h-4 text-emerald-400" />}
                {showCorrectness && isSelected && !isRight && <X className="w-4 h-4 text-rose-400" />}
              </button>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <p className="text-[11px] font-bold text-slate-400">
            {myAnswer !== undefined
              ? '✅ तुमचे उत्तर नोंदवले! प्रतिस्पर्ध्याच्या उत्तराची वाट पाहत आहे...'
              : '👉 योग्य पर्याय निवडा!'}
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. HIGHER OR LOWER (Card Battle)
  // ==========================================
  if (session.gameId === 'higher_lower') {
    const currentCard = session.gameState?.currentCard || 7;
    const streak = session.gameState?.streak || 0;
    const myScore = isPlayer1 ? (session.player1.score || 0) : (session.player2?.score || 0);

    const handleGuess = (guess: 'higher' | 'lower') => {
      const nextCard = Math.floor(Math.random() * 13) + 1;
      const isCorrect = guess === 'higher' ? nextCard >= currentCard : nextCard <= currentCard;

      if (isCorrect) {
        gameSound.playWin();
        const updatedScore = myScore + 15;
        const newStreak = streak + 1;

        if (updatedScore >= 60) {
          onFinishMatch(currentUserId, false, 'हाय किंवा लो - ६० गुण पूर्ण!');
        } else {
          onSendMove(
            'CARD_GUESS',
            { guess, nextCard, correct: true },
            undefined,
            { currentCard: nextCard, streak: newStreak },
            isPlayer1 ? { player1Score: updatedScore } : { player2Score: updatedScore }
          );
        }
      } else {
        gameSound.playDefeat();
        onSendMove(
          'CARD_GUESS',
          { guess, nextCard, correct: false },
          undefined,
          { currentCard: nextCard, streak: 0 }
        );
      }
    };

    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="w-48 h-64 bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-indigo-500/40 rounded-3xl flex flex-col items-center justify-center shadow-2xl mb-6">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">सध्याचे कार्ड</span>
          <span className="text-7xl font-black text-white">{currentCard}</span>
          <span className="text-xs text-slate-500 mt-2 font-medium">१ ते १३ दरम्यान संख्या</span>
        </div>

        <div className="flex gap-4 w-72">
          <button
            id="higher-btn"
            onClick={() => handleGuess('higher')}
            className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 cursor-pointer"
          >
            ▲ HIGHER (मोठे)
          </button>
          <button
            id="lower-btn"
            onClick={() => handleGuess('lower')}
            className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 cursor-pointer"
          >
            ▼ LOWER (लहान)
          </button>
        </div>
      </div>
    );
  }

  // Fallback for Memory Match / Word Battle / Dots & Boxes
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4">🧠</div>
      <h3 className="text-base font-black text-white mb-2">{session.gameId}</h3>
      <p className="text-xs text-slate-400 mb-6">दोन्ही खेळाडू गेम खेळत आहेत...</p>
      <button
        onClick={() => onFinishMatch(session.player1.uid, false, 'गेम फेऱ्या पूर्ण!')}
        className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
      >
        फेरी पूर्ण करा
      </button>
    </div>
  );
};
