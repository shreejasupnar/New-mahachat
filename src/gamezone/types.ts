export type GameCategory = 'board' | 'fun' | 'brain' | 'action';

export interface GameItem {
  id: string;
  nameMr: string;
  nameEn: string;
  category: GameCategory;
  descriptionMr: string;
  descriptionEn: string;
  icon: string;
  bannerGradient: string;
  accentColor: string;
  entryFeeCoins: number;
  popular?: boolean;
  isNew?: boolean;
  difficulty: 'सोपे' | 'मध्यम' | 'कठीण';
  playTimeMinutes: number;
  howToPlayMr: string[];
}

export interface PlayerMatchInfo {
  uid: string;
  displayName: string;
  photoURL?: string;
  district?: string;
  vipLevel?: number;
  rating?: number;
  score?: number;
  ready?: boolean;
  lastActive?: number;
  coinsDeducted?: boolean;
}

export type MatchStatus =
  | 'searching'
  | 'opponent_found'
  | 'ready'
  | 'countdown'
  | 'playing'
  | 'finished'
  | 'abandoned'
  | 'cancelled';

export interface MatchChatMessage {
  id: string;
  senderUid: string;
  senderName: string;
  text: string;
  timestamp: number;
  isQuickPhrase?: boolean;
  vipLevel?: number;
}

export interface GameMatchSession {
  matchId: string;
  gameId: string;
  category: GameCategory;
  status: MatchStatus;
  player1: PlayerMatchInfo;
  player2?: PlayerMatchInfo;
  turnUid?: string;
  winnerUid?: string;
  loserUid?: string;
  isDraw?: boolean;
  gameState?: any;
  moves?: Array<{
    playerUid: string;
    action: string;
    data: any;
    timestamp: number;
  }>;
  chatMessages?: MatchChatMessage[];
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  durationSeconds?: number;
  reason?: string;
}

export interface GameQueueDoc {
  id: string;
  uid: string;
  gameId: string;
  displayName: string;
  photoURL?: string;
  district?: string;
  vipLevel?: number;
  rating?: number;
  status: 'waiting' | 'matched';
  matchId?: string;
  queuedAt: number;
}

export interface GameUserStats {
  userId: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  xp: number;
  rating: number;
  favoriteGame: string;
  winStreak: number;
  achievements: string[];
}

export interface DailyMission {
  id: string;
  titleMr: string;
  titleEn: string;
  target: number;
  current: number;
  rewardXp: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
}
