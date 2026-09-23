import React, { useState, useEffect } from 'react';
import { GameCategory, GameItem, GameMatchSession } from '../types';
import { GAME_ZONE_CATALOG, GAME_CATEGORIES_META } from '../data/gamesCatalog';
import { GameDetailsModal } from './GameDetailsModal';
import { MatchmakingModal } from './MatchmakingModal';
import { UniversalGameHost } from './UniversalGameHost';
import { GameResultModal } from './GameResultModal';
import { GameLeaderboardModal } from './GameLeaderboardModal';
import { DailyMissionsModal } from './DailyMissionsModal';
import {
  enterGameChallenge,
  refundGameChallenge,
  completeGameMatch,
  joinMatchmakingQueue,
  leaveMatchmakingQueue,
  subscribeToQueueEntry,
  subscribeToMatchSession,
  sendMatchMove,
  finalizeMatchSession,
  fetchUserGameStats
} from '../services/gameZoneBackendService';
import { gameSound } from '../services/gameSoundService';
import {
  ArrowLeft,
  Coins,
  Trophy,
  Gift,
  Search,
  Flame,
  Clock,
  Sparkles,
  Gamepad2,
  ChevronRight,
  ShieldCheck,
  Zap,
  Plus
} from 'lucide-react';

interface Props {
  currentUser: any;
  userCoins: number;
  onUpdateCoins: (newBalance: number) => void;
  onOpenRecharge: () => void;
  onBack: () => void;
}

export const GameZoneHomeScreen: React.FC<Props> = ({
  currentUser,
  userCoins,
  onUpdateCoins,
  onOpenRecharge,
  onBack
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGame, setActiveGame] = useState<GameItem | null>(null);

  // Modals state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMatchmaking, setShowMatchmaking] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  // Active match session
  const [currentSession, setCurrentSession] = useState<GameMatchSession | null>(null);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userGameStats, setUserGameStats] = useState<any>(null);

  useEffect(() => {
    if (currentUser?.uid) {
      fetchUserGameStats(currentUser.uid).then((stats) => {
        if (stats) setUserGameStats(stats);
      });
    }
  }, [currentUser?.uid]);

  // Subscribe to live match when activeMatchId is set
  useEffect(() => {
    if (!activeMatchId) return;

    const unsubscribe = subscribeToMatchSession(activeMatchId, (session) => {
      setCurrentSession(session);
      if (session.status === 'playing') {
        setIsPlaying(true);
        setShowMatchmaking(false);
      } else if (session.status === 'finished') {
        setIsPlaying(false);
        setShowResultModal(true);
      }
    });

    return () => unsubscribe();
  }, [activeMatchId]);

  // Filter games based on category and search query
  const filteredGames = GAME_ZONE_CATALOG.filter((g) => {
    const matchesCategory = selectedCategory === 'all' || g.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      g.nameMr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.descriptionMr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectGame = (game: GameItem) => {
    gameSound.playTap();
    setActiveGame(game);
    setShowDetailsModal(true);
  };

  /**
   * Start 1v1 Challenge
   * 1. Generates unique matchId
   * 2. Calls backend to deduct exactly 30 coins with idempotency
   * 3. Enters real-time matchmaking queue or joins existing waiting room
   */
  const handleConfirmStartChallenge = async (game: GameItem) => {
    setShowDetailsModal(false);

    const generatedMatchId = `match_${game.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setActiveMatchId(generatedMatchId);
    setShowMatchmaking(true);

    // Deduct 30 coins through wallet backend
    const entryResult = await enterGameChallenge(
      currentUser?.uid || 'guest',
      generatedMatchId,
      game.id,
      game.nameMr,
      userCoins
    );

    if (!entryResult.success) {
      alert(entryResult.error || 'नाणी कमी आहेत किंवा सामना तयार करण्यात त्रुटी आली');
      setShowMatchmaking(false);
      return;
    }

    if (entryResult.newBalance !== undefined) {
      onUpdateCoins(entryResult.newBalance);
    }

    // Join Matchmaking Queue
    const playerInfo = {
      uid: currentUser?.uid || 'guest',
      displayName: currentUser?.displayName || 'खेळाडू',
      photoURL: currentUser?.photoURL,
      district: currentUser?.district || 'महाराष्ट्र',
      vipLevel: currentUser?.vipLevel || 1,
      rating: userGameStats?.rating || 1200,
      score: 0,
      ready: true,
      lastActive: Date.now(),
      coinsDeducted: true
    };

    const queueResult = await joinMatchmakingQueue(playerInfo, game.id, generatedMatchId);

    if (queueResult.matchCreated && queueResult.session) {
      // Opponent matched immediately!
      setCurrentSession(queueResult.session);
    } else {
      // Waiting in queue: subscribe to self queue document
      const unsub = subscribeToQueueEntry(currentUser?.uid || 'guest', game.id, (matchedId) => {
        setActiveMatchId(matchedId);
        unsub();
      });
    }
  };

  /**
   * Cancel Matchmaking
   * Automatically refunds 30 coins via backend API
   */
  const handleCancelMatchmaking = async () => {
    if (activeMatchId && activeGame) {
      await refundGameChallenge(
        currentUser?.uid || 'guest',
        activeMatchId,
        activeGame.id,
        'Matchmaking cancelled by player'
      );
      await leaveMatchmakingQueue(currentUser?.uid || 'guest', activeGame.id);

      // Refund 30 coins to local state
      onUpdateCoins(userCoins + 30);
    }

    setShowMatchmaking(false);
    setActiveMatchId(null);
    setCurrentSession(null);
  };

  /**
   * Handle game move send
   */
  const handleSendMove = async (
    action: string,
    data: any,
    nextTurnUid?: string,
    newGameState?: any,
    scoreUpdate?: { player1Score?: number; player2Score?: number }
  ) => {
    if (!activeMatchId || !currentUser?.uid) return;
    await sendMatchMove(
      activeMatchId,
      currentUser.uid,
      action,
      data,
      nextTurnUid,
      newGameState,
      scoreUpdate
    );
  };

  /**
   * Finish match
   */
  const handleFinishMatch = async (winnerUid?: string, isDraw: boolean = false, reason?: string) => {
    if (!activeMatchId || !currentSession) return;

    await finalizeMatchSession(activeMatchId, winnerUid, isDraw, reason);

    // Call server to record statistics and XP
    await completeGameMatch({
      matchId: activeMatchId,
      gameId: currentSession.gameId,
      player1Uid: currentSession.player1.uid,
      player2Uid: currentSession.player2?.uid || 'guest',
      winnerUid,
      isDraw,
      score1: currentSession.player1.score || 0,
      score2: currentSession.player2?.score || 0,
      durationSeconds: Math.floor((Date.now() - currentSession.createdAt) / 1000)
    });
  };

  /**
   * Surrender match
   */
  const handleSurrender = async () => {
    if (!currentSession || !currentUser?.uid) return;
    const opponentUid =
      currentSession.player1.uid === currentUser.uid
        ? currentSession.player2?.uid
        : currentSession.player1.uid;

    await handleFinishMatch(opponentUid, false, 'खेळाडूने सामना सोडला (Surrender)');
  };

  // If live game is active, render the dedicated Game Host Screen
  if (isPlaying && currentSession && activeGame) {
    return (
      <UniversalGameHost
        game={activeGame}
        session={currentSession}
        currentUserId={currentUser?.uid || 'guest'}
        onSendMove={handleSendMove}
        onFinishMatch={handleFinishMatch}
        onSurrender={handleSurrender}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-24 select-none">
      {/* ==========================================
          1. HEADER
      ========================================== */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            id="gamezone-back-btn"
            onClick={() => {
              gameSound.playTap();
              onBack();
            }}
            className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              🎮
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight flex items-center gap-1.5">
                <span>MahaChat</span>
                <span className="text-amber-400">Game Zone</span>
              </h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                1 vs 1 Online Arena
              </span>
            </div>
          </div>
        </div>

        {/* Coins & Profile Controls */}
        <div className="flex items-center gap-2.5">
          {/* Coin Balance Pill with Recharge '+' */}
          <button
            id="gamezone-recharge-btn"
            onClick={() => {
              gameSound.playCoin();
              onOpenRecharge();
            }}
            className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 px-3 py-1.5 rounded-2xl transition-all active:scale-95 shadow-lg group cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Coins className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black text-amber-400">{userCoins}</span>
            <div className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition-transform">
              +
            </div>
          </button>

          {/* User Avatar */}
          <div className="w-9 h-9 rounded-2xl border-2 border-slate-700 overflow-hidden shadow-md">
            <img
              src={currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* ==========================================
          2. HERO SECTION
      ========================================== */}
      <section className="relative px-4 pt-5 pb-3 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-44 bg-gradient-to-b from-amber-500/10 via-orange-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-md mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" /> PLAY • COMPETE • HAVE FUN
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            १ विरुद्ध १ ऑनलाइन गेम्स
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            महाराष्ट्रातील खऱ्या मित्रांसोबत थेट स्पर्धा करा • प्रत्येक सामना ३० नाणी
          </p>

          {/* Quick Action Badges */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              id="gamezone-leaderboard-btn"
              onClick={() => {
                gameSound.playTap();
                setShowLeaderboard(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs font-bold text-slate-300 hover:text-amber-400 flex items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>लीडरबोर्ड</span>
            </button>

            <button
              id="gamezone-missions-btn"
              onClick={() => {
                gameSound.playTap();
                setShowMissions(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-xs font-bold text-slate-300 hover:text-purple-400 flex items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 text-purple-400" />
              <span>दैनिक मिशन्स</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==========================================
          3. CATEGORIES & SEARCH
      ========================================== */}
      <section className="px-4 mt-2 mb-4 space-y-3">
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="खेळ शोधा (उदा. ल्युडो, विटी दांडू, कॅरम, क्विझ)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 shadow-inner"
          />
        </div>

        {/* 4 Large Category Cards */}
        <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto">
          {GAME_CATEGORIES_META.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-card-${cat.id}`}
                onClick={() => {
                  gameSound.playTap();
                  setSelectedCategory(isSelected ? 'all' : cat.id);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all active:scale-95 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/20 shadow-xl'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                    {cat.count} खेळ
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">{cat.nameMr}</h4>
                  <span className="text-[10px] text-slate-400 block font-medium">{cat.nameEn}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ==========================================
          4. GAMES CATALOG GRID
      ========================================== */}
      <section className="px-4 max-w-md mx-auto w-full space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            {selectedCategory === 'all'
              ? `सर्व खेळ (${filteredGames.length})`
              : `${GAME_CATEGORIES_META.find((c) => c.id === selectedCategory)?.nameMr} (${filteredGames.length})`}
          </h3>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-[11px] font-bold text-amber-400 hover:underline"
            >
              सर्व दाखवा
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              id={`game-card-${game.id}`}
              className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all flex items-center justify-between shadow-lg group"
            >
              <div className="flex items-center gap-3">
                {/* Game Icon */}
                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl shadow-md group-hover:scale-105 transition-transform">
                  {game.icon}
                </div>

                {/* Game Info */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    {game.isNew && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-red-500 text-white">
                        NEW
                      </span>
                    )}
                    {game.popular && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        🔥 लोकप्रिय
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> {game.playTimeMinutes} मि.
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-white">{game.nameMr}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 font-medium max-w-[190px]">
                    {game.descriptionMr}
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 pt-0.5">
                    <Coins className="w-3 h-3" />
                    <span>प्रवेश शुल्क: {game.entryFeeCoins} नाणी</span>
                  </div>
                </div>
              </div>

              {/* Play Button */}
              <button
                id={`play-btn-${game.id}`}
                onClick={() => handleSelectGame(game)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-95 transition-all cursor-pointer"
              >
                खेळा
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
          5. MODALS ROUTER
      ========================================== */}
      {showDetailsModal && activeGame && (
        <GameDetailsModal
          game={activeGame}
          userCoins={userCoins}
          onClose={() => setShowDetailsModal(false)}
          onStartMatch={handleConfirmStartChallenge}
          onRechargeCoins={onOpenRecharge}
        />
      )}

      {showMatchmaking && activeGame && (
        <MatchmakingModal
          game={activeGame}
          session={currentSession}
          onCancelMatchmaking={handleCancelMatchmaking}
          onStartPlaying={() => {
            setShowMatchmaking(false);
            setIsPlaying(true);
          }}
          currentUser={currentUser}
        />
      )}

      {showResultModal && currentSession && activeGame && (
        <GameResultModal
          game={activeGame}
          session={currentSession}
          currentUserId={currentUser?.uid || 'guest'}
          onRematch={() => {
            setShowResultModal(false);
            handleConfirmStartChallenge(activeGame);
          }}
          onReturnHome={() => {
            setShowResultModal(false);
            setActiveMatchId(null);
            setCurrentSession(null);
            setIsPlaying(false);
          }}
        />
      )}

      {showLeaderboard && (
        <GameLeaderboardModal
          onClose={() => setShowLeaderboard(false)}
          currentUserStats={userGameStats}
        />
      )}

      {showMissions && (
        <DailyMissionsModal
          onClose={() => setShowMissions(false)}
          onClaimReward={(missionId, coins, xp) => {
            onUpdateCoins(userCoins + coins);
          }}
        />
      )}
    </div>
  );
};
