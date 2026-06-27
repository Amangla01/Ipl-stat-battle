export interface PlayerCard {
  _id: string;
  name: string;
  team: string;
  teamShort: string;
  teamColor: string;
  role: string;
  nationality: string;
  image: string;
  stats: Record<string, number | string>;
}

export interface RoomPlayer {
  userId: string;
  username: string;
  avatar: string;
  score: number;
  status: "connected" | "disconnected" | "ready";
  isHost: boolean;
  winStreak: number;
}

export interface Room {
  roomCode: string;
  hostId: string;
  players: RoomPlayer[];
  gameStatus: "waiting" | "starting" | "playing" | "finished";
  currentRound: number;
  maxRounds: number;
  currentTurnPlayerId?: string;
  timerDuration: number;
  gameMode: "normal" | "lightning" | "daily";
}

export interface RoundState {
  roundNumber: number;
  selectedStats: string[];
  statLabels: Record<string, string>;
  currentTurnPlayerId: string;
  timerDuration: number;
  totalPlayers: number;
}

export interface RevealState {
  cards: Record<string, PlayerCard>;
  selectedStat: string;
  playerValues: Record<string, number>;
  winners: string[];
  lowerIsBetter: boolean;
  statLabel: string;
}

export interface RoundResult {
  winners: string[];
  selectedStat: string;
  statLabel: string;
  winnerValue: number;
  scores: Record<string, number>;
  winStreaks: Record<string, number>;
  roundNumber: number;
  playerNames: Record<string, string>;
}

export interface GameOverData {
  winner: { userId: string; username: string; score: number };
  mvp: { userId: string; username: string } | null;
  finalRanking: { userId: string; username: string; score: number }[];
  scores: Record<string, number>;
  totalRounds: number;
}

export interface LeaderboardEntry {
  username: string;
  wins: number;
  gamesPlayed: number;
  totalScore?: number;
}

export type GamePhase =
  | "idle"
  | "lobby"
  | "dealing"
  | "selecting"
  | "revealing"
  | "result"
  | "finished";

export const STAT_LABELS: Record<string, string> = {
  totalRuns: "Total Runs",
  totalWickets: "Total Wickets",
  totalMatches: "Matches Played",
  highestScore: "Highest Score",
  battingAverage: "Batting Avg",
  strikeRate: "Strike Rate",
  economy: "Economy",
  hundreds: "Centuries",
  fifties: "Half Centuries",
  sixes: "Sixes",
  fours: "Fours",
  totalBoundaries: "Total Boundaries",
  bowlingAverage: "Bowling Avg",
  bestBowling: "Best Bowling",
};

export const STAT_ICONS: Record<string, string> = {
  totalRuns: "🏏",
  totalWickets: "🎯",
  totalMatches: "📅",
  highestScore: "⭐",
  battingAverage: "📊",
  strikeRate: "⚡",
  economy: "💨",
  hundreds: "💯",
  fifties: "5️⃣",
  sixes: "6️⃣",
  fours: "4️⃣",
  totalBoundaries: "🔥",
  bowlingAverage: "🎳",
  bestBowling: "🏆",
};

export const TEAM_COLORS: Record<string, string> = {
  RCB: "#C8102E",
  CSK: "#F4AC20",
  MI: "#004BA0",
  GT: "#1C1C1C",
  LSG: "#A4262C",
  RR: "#EA1A85",
  DC: "#282968",
  SRH: "#F26522",
  KKR: "#3A225D",
  PBKS: "#DCDDDF",
};
