import mongoose, { Document, Schema } from "mongoose";

export interface IPlayerStats {
  totalRuns: number;
  totalWickets: number;
  totalMatches: number;
  highestScore: number;
  bestBowling: string;
  battingAverage: number;
  bowlingAverage: number;
  strikeRate: number;
  economy: number;
  hundreds: number;
  fifties: number;
  sixes: number;
  fours: number;
  totalBoundaries: number;
  [key: string]: number | string;
}

export interface IPlayer extends Document {
  name: string;
  team: string;
  teamShort: string;
  teamColor: string;
  role: string;
  nationality: string;
  image: string;
  stats: IPlayerStats;
}

const PlayerStatsSchema = new Schema<IPlayerStats>(
  {
    totalRuns: { type: Number, default: 0 },
    totalWickets: { type: Number, default: 0 },
    totalMatches: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    bestBowling: { type: String, default: "0/0" },
    battingAverage: { type: Number, default: 0 },
    bowlingAverage: { type: Number, default: 0 },
    strikeRate: { type: Number, default: 0 },
    economy: { type: Number, default: 0 },
    hundreds: { type: Number, default: 0 },
    fifties: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    totalBoundaries: { type: Number, default: 0 },
  },
  { strict: false }
);

const PlayerSchema = new Schema<IPlayer>(
  {
    name: { type: String, required: true, unique: true },
    team: { type: String, required: true },
    teamShort: { type: String, required: true },
    teamColor: { type: String, required: true },
    role: { type: String, required: true },
    nationality: { type: String, required: true },
    image: { type: String, required: true },
    stats: { type: PlayerStatsSchema, required: true },
  },
  { timestamps: true }
);

export const Player = mongoose.model<IPlayer>("Player", PlayerSchema);
