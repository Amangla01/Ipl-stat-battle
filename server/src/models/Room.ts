import mongoose, { Document, Schema } from "mongoose";

export type GameStatus = "waiting" | "starting" | "playing" | "finished";
export type PlayerStatus = "connected" | "disconnected" | "ready";

export interface IRoomPlayer {
  socketId: string;
  userId: string;
  username: string;
  avatar: string;
  score: number;
  status: PlayerStatus;
  isHost: boolean;
  winStreak: number;
  cardId?: string;
}

export interface IRound {
  roundNumber: number;
  selectedStats: string[];
  selectedStat?: string;
  selectedBy?: string;
  cardIds: Record<string, string>;
  winnerId?: string[];
  winnerStat?: string;
  winnerValue?: number;
  timestamp: Date;
}

export interface IRoom extends Document {
  roomCode: string;
  hostId: string;
  players: IRoomPlayer[];
  gameStatus: GameStatus;
  currentRound: number;
  maxRounds: number;
  rounds: IRound[];
  deck: string[];
  usedCards: string[];
  currentTurnPlayerId?: string;
  timerDuration: number;
  gameMode: "normal" | "lightning" | "daily";
  createdAt: Date;
  updatedAt: Date;
}

const RoomPlayerSchema = new Schema<IRoomPlayer>({
  socketId: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  avatar: { type: String, default: "" },
  score: { type: Number, default: 0 },
  status: { type: String, enum: ["connected", "disconnected", "ready"], default: "connected" },
  isHost: { type: Boolean, default: false },
  winStreak: { type: Number, default: 0 },
  cardId: { type: String },
});

const RoundSchema = new Schema<IRound>({
  roundNumber: { type: Number, required: true },
  selectedStats: [{ type: String }],
  selectedStat: { type: String },
  selectedBy: { type: String },
  cardIds: { type: Map, of: String, default: {} },
  winnerId: [{ type: String }],
  winnerStat: { type: String },
  winnerValue: { type: Number },
  timestamp: { type: Date, default: Date.now },
});

const RoomSchema = new Schema<IRoom>(
  {
    roomCode: { type: String, required: true, unique: true, uppercase: true },
    hostId: { type: String, required: true },
    players: [RoomPlayerSchema],
    gameStatus: { type: String, enum: ["waiting", "starting", "playing", "finished"], default: "waiting" },
    currentRound: { type: Number, default: 0 },
    maxRounds: { type: Number, default: 20 },
    rounds: [RoundSchema],
    deck: [{ type: String }],
    usedCards: [{ type: String }],
    currentTurnPlayerId: { type: String },
    timerDuration: { type: Number, default: 15 },
    gameMode: { type: String, enum: ["normal", "lightning", "daily"], default: "normal" },
  },
  { timestamps: true }
);

export const Room = mongoose.model<IRoom>("Room", RoomSchema);
