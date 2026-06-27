import { Router, Request, Response } from "express";
import { Player } from "../models/Player";
import { GameSession } from "../models/GameSession";
import { Room } from "../models/Room";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.get("/players", async (_req: Request, res: Response) => {
  try {
    const players = await Player.find({}).select("-__v");
    res.json({ players });
  } catch {
    res.status(500).json({ error: "Failed to fetch players" });
  }
});

router.get("/players/:id", async (req: Request, res: Response) => {
  try {
    const player = await Player.findById(req.params.id).select("-__v");
    if (!player) return res.status(404).json({ error: "Player not found" });
    res.json({ player });
  } catch {
    res.status(500).json({ error: "Failed to fetch player" });
  }
});

router.get("/leaderboard", async (_req: Request, res: Response) => {
  try {
    const sessions = await GameSession.find({}).sort({ playedAt: -1 }).limit(100);
    const aggregate: Record<string, { username: string; wins: number; gamesPlayed: number; totalScore: number }> = {};

    for (const session of sessions) {
      for (const p of session.players) {
        if (!aggregate[p.username]) {
          aggregate[p.username] = { username: p.username, wins: 0, gamesPlayed: 0, totalScore: 0 };
        }
        aggregate[p.username].gamesPlayed += 1;
        aggregate[p.username].totalScore += p.score;
      }
      if (aggregate[session.winnerName]) {
        aggregate[session.winnerName].wins += 1;
      }
    }

    const leaderboard = Object.values(aggregate)
      .sort((a, b) => b.wins - a.wins || b.totalScore - a.totalScore)
      .slice(0, 20);

    res.json({ leaderboard });
  } catch {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

router.get("/room/:roomCode", async (req: Request, res: Response) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.roomCode.toUpperCase() });
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json({
      roomCode: room.roomCode,
      gameStatus: room.gameStatus,
      playerCount: room.players.length,
      gameMode: room.gameMode,
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

export default router;
