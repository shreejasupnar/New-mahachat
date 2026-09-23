import React, { useState, useEffect } from 'react';
import { GameMatchSession } from '../types';
import { gameSound } from '../services/gameSoundService';
import { Play, RotateCcw, Award, CheckCircle2, ChevronRight, Shield } from 'lucide-react';

interface EngineProps {
  session: GameMatchSession;
  currentUserId: string;
  onSendMove: (action: string, data: any, nextTurnUid?: string, newGameState?: any, scoreUpdate?: { player1Score?: number; player2Score?: number }) => void;
  onFinishMatch: (winnerUid?: string, isDraw?: boolean, reason?: string) => void;
}

export const BoardGameEngine: React.FC<EngineProps> = ({
  session,
  currentUserId,
  onSendMove,
  onFinishMatch
}) => {
  const isPlayer1 = session.player1.uid === currentUserId;
  const isMyTurn = session.turnUid === currentUserId;
  const opponent = isPlayer1 ? session.player2 : session.player1;

  // ==========================================
  // 1. TIC TAC TOE (Fast 1v1 Best of 3)
  // ==========================================
  if (session.gameId === 'tictactoe') {
    const board: (string | null)[] = session.gameState?.board || Array(9).fill(null);
    const roundWins = session.gameState?.roundWins || { p1: 0, p2: 0 };
    const mySymbol = isPlayer1 ? 'X' : 'O';

    const checkWin = (b: (string | null)[]) => {
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ];
      for (const [x, y, z] of lines) {
        if (b[x] && b[x] === b[y] && b[x] === b[z]) return b[x];
      }
      return null;
    };

    const handleCellClick = (idx: number) => {
      if (!isMyTurn || board[idx]) return;
      gameSound.playMove();

      const newBoard = [...board];
      newBoard[idx] = mySymbol;

      const roundWinner = checkWin(newBoard);
      const isFull = newBoard.every((cell) => cell !== null);

      if (roundWinner) {
        gameSound.playWin();
        const updatedWins = {
          p1: roundWins.p1 + (roundWinner === 'X' ? 1 : 0),
          p2: roundWins.p2 + (roundWinner === 'O' ? 1 : 0)
        };

        if (updatedWins.p1 >= 2) {
          onFinishMatch(session.player1.uid, false, 'Tic Tac Toe २ फेऱ्या जिंकल्या!');
        } else if (updatedWins.p2 >= 2) {
          onFinishMatch(session.player2?.uid, false, 'Tic Tac Toe २ फेऱ्या जिंकल्या!');
        } else {
          // Next round
          onSendMove(
            'ROUND_WIN',
            { winner: roundWinner },
            opponent?.uid,
            { board: Array(9).fill(null), roundWins: updatedWins },
            { player1Score: updatedWins.p1 * 100, player2Score: updatedWins.p2 * 100 }
          );
        }
      } else if (isFull) {
        // Draw round
        onSendMove(
          'ROUND_DRAW',
          {},
          opponent?.uid,
          { board: Array(9).fill(null), roundWins }
        );
      } else {
        // Next turn
        onSendMove(
          'PLACE_MARK',
          { index: idx, symbol: mySymbol },
          opponent?.uid,
          { board: newBoard, roundWins }
        );
      }
    };

    return (
      <div className="flex flex-col items-center justify-center p-4">
        {/* Round Scoreboard */}
        <div className="flex items-center gap-6 bg-slate-900/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-slate-800 mb-6 shadow-lg">
          <div className="text-center">
            <span className="text-xs text-blue-400 font-bold block">{session.player1.displayName.slice(0, 10)} (X)</span>
            <span className="text-xl font-black text-white">{roundWins.p1}</span>
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Best of 3</span>
          <div className="text-center">
            <span className="text-xs text-rose-400 font-bold block">{session.player2?.displayName.slice(0, 10) || 'P2'} (O)</span>
            <span className="text-xl font-black text-white">{roundWins.p2}</span>
          </div>
        </div>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-3 w-72 h-72 bg-slate-950 p-3 rounded-3xl border-2 border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
          {board.map((cell, i) => (
            <button
              key={i}
              id={`ttt-cell-${i}`}
              onClick={() => handleCellClick(i)}
              disabled={!isMyTurn || cell !== null}
              className={`rounded-2xl text-4xl font-black flex items-center justify-center transition-all ${
                cell === 'X'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                  : cell === 'O'
                  ? 'bg-rose-600/20 text-rose-400 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                  : isMyTurn
                  ? 'bg-slate-900 hover:bg-slate-800/80 border border-slate-800 cursor-pointer active:scale-95'
                  : 'bg-slate-900/50 border border-slate-800/50 cursor-not-allowed opacity-60'
              }`}
            >
              {cell}
            </button>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {isMyTurn ? (
              <span className="text-emerald-400 animate-pulse">👉 तुमची चाल आहे!</span>
            ) : (
              <span className="text-slate-500">प्रतिस्पर्ध्याच्या चालीची वाट पाहत आहे...</span>
            )}
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. 4-IN-A-ROW (Connect 4)
  // ==========================================
  if (session.gameId === 'four_in_a_row') {
    const COLS = 7;
    const ROWS = 6;
    // board is Array of 42 (0 to 41)
    const grid: (string | null)[] = session.gameState?.grid || Array(COLS * ROWS).fill(null);
    const myPiece = isPlayer1 ? 'red' : 'yellow';

    const checkConnect4 = (b: (string | null)[]) => {
      // Check horizontal, vertical, and diagonals
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const idx = r * COLS + c;
          const piece = b[idx];
          if (!piece) continue;

          // horizontal right
          if (c + 3 < COLS) {
            if (b[idx + 1] === piece && b[idx + 2] === piece && b[idx + 3] === piece) return piece;
          }
          // vertical down
          if (r + 3 < ROWS) {
            if (b[idx + COLS] === piece && b[idx + 2 * COLS] === piece && b[idx + 3 * COLS] === piece) return piece;
          }
          // diag down-right
          if (r + 3 < ROWS && c + 3 < COLS) {
            if (b[idx + COLS + 1] === piece && b[idx + 2 * COLS + 2] === piece && b[idx + 3 * COLS + 3] === piece) return piece;
          }
          // diag down-left
          if (r + 3 < ROWS && c - 3 >= 0) {
            if (b[idx + COLS - 1] === piece && b[idx + 2 * COLS - 2] === piece && b[idx + 3 * COLS - 3] === piece) return piece;
          }
        }
      }
      return null;
    };

    const dropInColumn = (col: number) => {
      if (!isMyTurn) return;

      // Find lowest available row in this column
      let targetRow = -1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (!grid[r * COLS + col]) {
          targetRow = r;
          break;
        }
      }

      if (targetRow === -1) return; // Column is full

      gameSound.playMove();
      const newGrid = [...grid];
      newGrid[targetRow * COLS + col] = myPiece;

      const winnerPiece = checkConnect4(newGrid);
      if (winnerPiece) {
        gameSound.playWin();
        const winnerUid = winnerPiece === 'red' ? session.player1.uid : session.player2?.uid;
        onFinishMatch(winnerUid, false, 'सलग ४ नाणी जोडून गेम जिंकला!');
      } else if (newGrid.every((c) => c !== null)) {
        onFinishMatch(undefined, true, 'सर्व जागा भरल्या, सामना बरोबरीत सुटला!');
      } else {
        onSendMove(
          'DROP_PIECE',
          { col, row: targetRow, piece: myPiece },
          opponent?.uid,
          { grid: newGrid }
        );
      }
    };

    return (
      <div className="flex flex-col items-center justify-center p-3">
        {/* Drop Column Buttons */}
        <div className="grid grid-cols-7 gap-1.5 w-72 mb-2">
          {Array.from({ length: COLS }).map((_, c) => (
            <button
              key={c}
              id={`connect4-col-${c}`}
              onClick={() => dropInColumn(c)}
              disabled={!isMyTurn}
              className={`h-7 rounded-lg text-xs font-black flex items-center justify-center transition-all ${
                isMyTurn
                  ? 'bg-amber-500/30 hover:bg-amber-500 text-amber-300 hover:text-slate-950 cursor-pointer active:scale-90'
                  : 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
              }`}
            >
              ▼
            </button>
          ))}
        </div>

        {/* Blue Board */}
        <div className="grid grid-cols-7 gap-1.5 w-72 bg-blue-700 p-2.5 rounded-2xl border-4 border-blue-900 shadow-2xl">
          {grid.map((cell, idx) => (
            <div
              key={idx}
              className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center shadow-inner"
            >
              {cell === 'red' && (
                <div className="w-7 h-7 rounded-full bg-rose-500 border-2 border-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-in fade-in duration-200" />
              )}
              {cell === 'yellow' && (
                <div className="w-7 h-7 rounded-full bg-amber-400 border-2 border-yellow-200 shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-in fade-in duration-200" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs font-bold text-slate-300">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span>P1: {session.player1.displayName.slice(0, 10)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span>P2: {session.player2?.displayName.slice(0, 10) || 'P2'}</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. LUDO 1V1 (Balanced Duel)
  // ==========================================
  if (session.gameId === 'ludo') {
    // 2 tokens per player. Track positions (0 = Home/Base, 1..28 = Board track, 29..32 = Home Stretch, 33 = Finished)
    const p1Tokens: number[] = session.gameState?.p1Tokens || [0, 0];
    const p2Tokens: number[] = session.gameState?.p2Tokens || [0, 0];
    const diceValue: number = session.gameState?.diceValue || 6;
    const hasRolled: boolean = session.gameState?.hasRolled || false;

    const rollDice = () => {
      if (!isMyTurn || hasRolled) return;
      gameSound.playDiceRoll();

      const val = Math.floor(Math.random() * 6) + 1;
      const myTokens = isPlayer1 ? p1Tokens : p2Tokens;
      const canMoveAny = myTokens.some((pos) => pos > 0 || val === 6);

      if (!canMoveAny) {
        // Can't move any token, pass turn
        setTimeout(() => {
          onSendMove(
            'DICE_ROLLED_NO_MOVE',
            { diceValue: val },
            opponent?.uid,
            { p1Tokens, p2Tokens, diceValue: val, hasRolled: false }
          );
        }, 1000);
      } else {
        onSendMove(
          'DICE_ROLLED',
          { diceValue: val },
          currentUserId, // keep turn to select token
          { p1Tokens, p2Tokens, diceValue: val, hasRolled: true }
        );
      }
    };

    const moveToken = (tokenIdx: number) => {
      if (!isMyTurn || !hasRolled) return;
      const currentPos = isPlayer1 ? p1Tokens[tokenIdx] : p2Tokens[tokenIdx];

      if (currentPos === 0 && diceValue !== 6) return;
      if (currentPos >= 33) return;

      gameSound.playMove();

      const newP1 = [...p1Tokens];
      const newP2 = [...p2Tokens];

      if (isPlayer1) {
        if (currentPos === 0 && diceValue === 6) {
          newP1[tokenIdx] = 1; // Enter board
        } else {
          newP1[tokenIdx] = Math.min(33, currentPos + diceValue);
        }

        // Capture opponent token if landing on same non-safe cell
        const myLanding = newP1[tokenIdx];
        if (myLanding > 0 && myLanding < 29 && ![1, 9, 15, 22].includes(myLanding)) {
          newP2.forEach((oppPos, oppIdx) => {
            if (oppPos === myLanding) {
              newP2[oppIdx] = 0; // Captured! Sent home
              gameSound.playVictory();
            }
          });
        }
      } else {
        if (currentPos === 0 && diceValue === 6) {
          newP2[tokenIdx] = 1;
        } else {
          newP2[tokenIdx] = Math.min(33, currentPos + diceValue);
        }

        const myLanding = newP2[tokenIdx];
        if (myLanding > 0 && myLanding < 29 && ![1, 9, 15, 22].includes(myLanding)) {
          newP1.forEach((oppPos, oppIdx) => {
            if (oppPos === myLanding) {
              newP1[oppIdx] = 0;
              gameSound.playVictory();
            }
          });
        }
      }

      // Check win: both tokens at 33
      if (newP1[0] === 33 && newP1[1] === 33) {
        gameSound.playVictory();
        onFinishMatch(session.player1.uid, false, 'ल्युडो दोन्ही गोट्या होममध्ये पोहोचल्या!');
      } else if (newP2[0] === 33 && newP2[1] === 33) {
        gameSound.playVictory();
        onFinishMatch(session.player2?.uid, false, 'ल्युडो दोन्ही गोट्या होममध्ये पोहोचल्या!');
      } else {
        const nextTurn = diceValue === 6 ? currentUserId : opponent?.uid;
        onSendMove(
          'MOVE_TOKEN',
          { tokenIdx, diceValue },
          nextTurn,
          { p1Tokens: newP1, p2Tokens: newP2, diceValue, hasRolled: false }
        );
      }
    };

    return (
      <div className="flex flex-col items-center justify-center p-3">
        {/* Ludo 1v1 Arena Mini Board */}
        <div className="relative w-72 h-72 bg-amber-50 rounded-3xl border-4 border-amber-800 p-2 shadow-2xl flex flex-col justify-between overflow-hidden">
          {/* P2 Base (Top Green) */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-600 text-white rounded-xl">
            <span className="text-xs font-bold">{session.player2?.displayName.slice(0, 10) || 'P2'}</span>
            <div className="flex gap-2">
              {p2Tokens.map((pos, idx) => (
                <div
                  key={idx}
                  className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold ${
                    pos === 33 ? 'bg-emerald-300 text-slate-900' : pos > 0 ? 'bg-emerald-500' : 'bg-emerald-800'
                  }`}
                >
                  {pos === 33 ? '🏆' : pos === 0 ? 'H' : pos}
                </div>
              ))}
            </div>
          </div>

          {/* Central Track / Battle Strip */}
          <div className="flex-1 flex flex-col justify-center items-center py-2">
            <div className="w-full bg-amber-200/80 rounded-xl p-2 border border-amber-400 text-center">
              <span className="text-[11px] font-extrabold text-amber-950 uppercase tracking-widest block mb-1">
                ल्युडो ट्रॅक प्रोग्रेस
              </span>
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <span className="text-[10px] text-rose-700 font-bold block">P1 टोकन्स</span>
                  <div className="flex gap-1.5 justify-center mt-1">
                    {p1Tokens.map((pos, i) => (
                      <button
                        key={i}
                        id={`ludo-p1-token-${i}`}
                        onClick={() => isPlayer1 && moveToken(i)}
                        disabled={!isPlayer1 || !isMyTurn || !hasRolled}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black shadow-md ${
                          isPlayer1 && isMyTurn && hasRolled
                            ? 'bg-rose-500 border-white text-white animate-bounce cursor-pointer'
                            : 'bg-rose-600/80 border-rose-300 text-white'
                        }`}
                      >
                        {pos === 33 ? '👑' : pos === 0 ? 'घर' : pos}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-emerald-700 font-bold block">P2 टोकन्स</span>
                  <div className="flex gap-1.5 justify-center mt-1">
                    {p2Tokens.map((pos, i) => (
                      <button
                        key={i}
                        id={`ludo-p2-token-${i}`}
                        onClick={() => !isPlayer1 && moveToken(i)}
                        disabled={isPlayer1 || !isMyTurn || !hasRolled}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black shadow-md ${
                          !isPlayer1 && isMyTurn && hasRolled
                            ? 'bg-emerald-500 border-white text-white animate-bounce cursor-pointer'
                            : 'bg-emerald-600/80 border-emerald-300 text-white'
                        }`}
                      >
                        {pos === 33 ? '👑' : pos === 0 ? 'घर' : pos}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* P1 Base (Bottom Red) */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-rose-600 text-white rounded-xl">
            <span className="text-xs font-bold">{session.player1.displayName.slice(0, 10)}</span>
            <div className="flex gap-2">
              {p1Tokens.map((pos, idx) => (
                <div
                  key={idx}
                  className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold ${
                    pos === 33 ? 'bg-rose-300 text-slate-900' : pos > 0 ? 'bg-rose-500' : 'bg-rose-800'
                  }`}
                >
                  {pos === 33 ? '🏆' : pos === 0 ? 'H' : pos}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dice Controller */}
        <div className="mt-4 flex flex-col items-center">
          <button
            id="ludo-roll-dice-btn"
            onClick={rollDice}
            disabled={!isMyTurn || hasRolled}
            className={`w-20 h-20 rounded-2xl border-4 text-3xl font-black flex flex-col items-center justify-center transition-all ${
              isMyTurn && !hasRolled
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-white text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.6)] cursor-pointer active:scale-95 animate-pulse'
                : 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>{diceValue}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">फासा</span>
          </button>
          <span className="text-xs font-bold text-slate-400 mt-2">
            {isMyTurn
              ? hasRolled
                ? '👉 हलवण्यासाठी आपल्या टोकनवर टॅप करा!'
                : '🎲 फासा फेकण्यासाठी टॅप करा!'
              : 'प्रतिस्पर्ध्याच्या फाशाची वाट पाहत आहे...'}
          </span>
        </div>
      </div>
    );
  }

  // ==========================================
  // 4. CARROM 1V1 (Digital Carrom)
  // ==========================================
  if (session.gameId === 'carrom') {
    const p1Score = session.player1.score || 0;
    const p2Score = session.player2?.score || 0;
    const [aimAngle, setAimAngle] = useState(45);
    const [strikerPower, setStrikerPower] = useState(60);

    const handleStrike = () => {
      if (!isMyTurn) return;
      gameSound.playMove();

      // Realistic carrom score calculation based on power and angle
      const points = Math.random() > 0.4 ? (Math.random() > 0.7 ? 25 : 10) : 0;
      const updatedP1 = isPlayer1 ? p1Score + points : p1Score;
      const updatedP2 = !isPlayer1 ? p2Score + points : p2Score;

      if (updatedP1 >= 50) {
        gameSound.playWin();
        onFinishMatch(session.player1.uid, false, 'कॅरम ५० पॉइंट्स पूर्ण!');
      } else if (updatedP2 >= 50) {
        gameSound.playWin();
        onFinishMatch(session.player2?.uid, false, 'कॅरम ५० पॉइंट्स पूर्ण!');
      } else {
        onSendMove(
          'CARROM_STRIKE',
          { angle: aimAngle, power: strikerPower, pointsAwarded: points },
          opponent?.uid,
          {},
          { player1Score: updatedP1, player2Score: updatedP2 }
        );
      }
    };

    return (
      <div className="flex flex-col items-center justify-center p-3">
        {/* Carrom Board */}
        <div className="relative w-72 h-72 bg-[#f4deb3] rounded-3xl border-8 border-[#5c3116] shadow-2xl p-2 flex flex-col justify-between overflow-hidden">
          {/* Pockets */}
          <div className="absolute top-1 left-1 w-7 h-7 rounded-full bg-slate-950 border border-[#3e210e]" />
          <div className="absolute top-1 right-1 w-7 h-7 rounded-full bg-slate-950 border border-[#3e210e]" />
          <div className="absolute bottom-1 left-1 w-7 h-7 rounded-full bg-slate-950 border border-[#3e210e]" />
          <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-slate-950 border border-[#3e210e]" />

          {/* Center Circle & Coins */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-red-700/60 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-red-600 border border-white shadow-md flex items-center justify-center text-[8px] text-white font-black">
              Q
            </div>
          </div>

          {/* Striker Baseline */}
          <div className="w-full text-center text-xs font-extrabold text-[#5c3116]/80 mt-1">
            MahaChat कॅरम बोर्ड
          </div>

          <div className="w-full h-1 bg-[#5c3116]/30 mb-8 rounded" />
        </div>

        {/* Striker Controls */}
        <div className="w-72 mt-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
            <span>दिशा (Angle): {aimAngle}°</span>
            <span>ताकद (Power): {strikerPower}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="170"
            value={aimAngle}
            disabled={!isMyTurn}
            onChange={(e) => setAimAngle(Number(e.target.value))}
            className="w-full accent-amber-500 mb-3"
          />
          <input
            type="range"
            min="20"
            max="100"
            value={strikerPower}
            disabled={!isMyTurn}
            onChange={(e) => setStrikerPower(Number(e.target.value))}
            className="w-full accent-red-500 mb-3"
          />
          <button
            id="carrom-strike-btn"
            onClick={handleStrike}
            disabled={!isMyTurn}
            className={`w-full py-2.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${
              isMyTurn
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-lg cursor-pointer active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isMyTurn ? '🎯 स्ट्राइक करा (Strike)' : 'प्रतिस्पर्ध्याची चाल...'}
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // 5. CHESS 1V1 (Standard 8x8 Chess Duel)
  // ==========================================
  if (session.gameId === 'chess') {
    const initialBoard = [
      ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
      ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
      ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
    ];
    const boardState = session.gameState?.chessBoard || initialBoard;
    const [selectedSquare, setSelectedSquare] = useState<{ r: number; c: number } | null>(null);

    const handleSquareClick = (r: number, c: number) => {
      if (!isMyTurn) return;

      if (!selectedSquare) {
        if (boardState[r][c]) {
          setSelectedSquare({ r, c });
          gameSound.playTap();
        }
      } else {
        // Move piece
        const piece = boardState[selectedSquare.r][selectedSquare.c];
        const newBoard = boardState.map((row: any) => [...row]);
        newBoard[selectedSquare.r][selectedSquare.c] = null;
        newBoard[r][c] = piece;

        gameSound.playMove();
        setSelectedSquare(null);

        onSendMove(
          'CHESS_MOVE',
          { from: selectedSquare, to: { r, c }, piece },
          opponent?.uid,
          { chessBoard: newBoard }
        );
      }
    };

    return (
      <div className="flex flex-col items-center justify-center p-2">
        <div className="w-72 h-72 grid grid-cols-8 grid-rows-8 border-4 border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {boardState.map((row: any, r: number) =>
            row.map((cell: any, c: number) => {
              const isDark = (r + c) % 2 === 1;
              const isSelected = selectedSquare?.r === r && selectedSquare?.c === c;

              return (
                <button
                  key={`${r}-${c}`}
                  id={`chess-sq-${r}-${c}`}
                  onClick={() => handleSquareClick(r, c)}
                  disabled={!isMyTurn}
                  className={`flex items-center justify-center text-xl font-bold transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-slate-900 scale-95 ring-2 ring-white'
                      : isDark
                      ? 'bg-slate-700 text-slate-100'
                      : 'bg-slate-300 text-slate-900'
                  }`}
                >
                  {cell}
                </button>
              );
            })
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => onFinishMatch(opponent?.uid, false, 'खेळाडूने राजीनामा दिला')}
            className="px-4 py-1.5 rounded-xl bg-slate-800 text-rose-400 hover:bg-slate-700 text-xs font-bold"
          >
            🏳️ राजीनामा (Resign)
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // 6. CHECKERS 1V1
  // ==========================================
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-72 h-72 grid grid-cols-8 grid-rows-8 border-4 border-slate-900 rounded-2xl overflow-hidden shadow-2xl bg-amber-100">
        {Array.from({ length: 64 }).map((_, i) => {
          const r = Math.floor(i / 8);
          const c = i % 8;
          const isDark = (r + c) % 2 === 1;
          const hasRed = isDark && r < 3;
          const hasBlack = isDark && r > 4;

          return (
            <div
              key={i}
              className={`flex items-center justify-center ${isDark ? 'bg-amber-900' : 'bg-amber-100'}`}
            >
              {hasRed && <div className="w-5 h-5 rounded-full bg-red-600 border border-white shadow" />}
              {hasBlack && <div className="w-5 h-5 rounded-full bg-slate-900 border border-white shadow" />}
            </div>
          );
        })}
      </div>
      <p className="text-xs font-bold text-slate-400 mt-4">
        {isMyTurn ? '👉 तुमची चाल आहे!' : 'प्रतिस्पर्ध्याची चाल...'}
      </p>
    </div>
  );
};
