import mongoose, { Document, Schema } from "mongoose";

export interface ILeaderboardEntry {
  username: string;
  score: number;
  wins: number;
  gamesPlayed: number;
  mvpCount: number;
  winStreak: number;
  bestStreak: number;
}

export interface IGameSession extends Document {
  roomCode: string;
  players: ILeaderboardEntry[];
  winnerId: string;
  winnerName: string;
  mvpName: string;
  totalRounds: number;
  duration: number;
  gameMode: string;
  playedAt: Date;
}

const LeaderboardEntrySchema = new Schema<ILeaderboardEntry>({
  username: { type: String, required: true },
  score: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  gamesPlayed: { type: Number, default: 0 },
  mvpCount: { type: Number, default: 0 },
  winStreak: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
});

const GameSessionSchema = new Schema<IGameSession>({
  roomCode: { type: String, required: true },
  players: [LeaderboardEntrySchema],
  winnerId: { type: String, required: true },
  winnerName: { type: String, required: true },
  mvpName: { type: String, required: true },
  totalRounds: { type: Number, required: true },
  duration: { type: Number, required: true },
  gameMode: { type: String, default: "normal" },
  playedAt: { type: Date, default: Date.now },
});

export const GameSession = mongoose.model<IGameSession>("GameSession", GameSessionSchema);
