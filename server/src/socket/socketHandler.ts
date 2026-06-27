import { Server, Socket } from "socket.io";
import { roomManager } from "../gameEngine/RoomManager";
import { timerManager } from "../gameEngine/TimerManager";
import { gameEngine, CardData } from "../gameEngine/GameEngine";
import { Player, IPlayer } from "../models/Player";
import { GameSession } from "../models/GameSession";
import { shuffleArray, STAT_LABELS } from "../utils/cardUtils";

// In-memory round card assignments (cleared each round)
const roundCards = new Map<string, Record<string, CardData>>();

// Lock to prevent double-resolve of a round (timer + manual selection race)
const resolveInProgress = new Set<string>();

// ── AUTHORITATIVE in-memory turn tracker ──────────────────────────────────────
// Maps roomCode → { playerIds (in rotation order), currentIndex }
// This is the single source of truth for "whose turn is it".
// We do NOT rely on DB reads for turn logic — only update DB as a side effect.
const roomTurnTracker = new Map<string, { playerIds: string[]; currentIndex: number }>();

function advanceTurn(roomCode: string): string | null {
  const tracker = roomTurnTracker.get(roomCode);
  if (!tracker || tracker.playerIds.length === 0) return null;
  tracker.currentIndex = (tracker.currentIndex + 1) % tracker.playerIds.length;
  return tracker.playerIds[tracker.currentIndex];
}

function getCurrentTurnPlayer(roomCode: string): string | null {
  const tracker = roomTurnTracker.get(roomCode);
  if (!tracker || tracker.playerIds.length === 0) return null;
  return tracker.playerIds[tracker.currentIndex];
}

export function registerSocketHandlers(io: Server, socket: Socket) {
  // ─── CREATE ROOM ─────────────────────────────────────────────────────────
  socket.on("create-room", async ({ userId, username, gameMode, maxRounds }) => {
    try {
      const room = await roomManager.createRoom(
        socket.id, userId, username, gameMode || "normal", maxRounds || 20
      );
      socket.join(room.roomCode);
      socket.emit("room-created", {
        roomCode: room.roomCode,
        room: sanitizeRoom(room),
      });
    } catch (err) {
      socket.emit("error", { message: "Failed to create room" });
    }
  });

  // ─── JOIN ROOM ───────────────────────────────────────────────────────────
  socket.on("join-room", async ({ roomCode, userId, username }) => {
    try {
      const room = await roomManager.joinRoom(roomCode, socket.id, userId, username);
      if (!room) {
        socket.emit("join-error", { message: "Room not found, full, or game already started" });
        return;
      }
      socket.join(room.roomCode);
      socket.emit("room-joined", { room: sanitizeRoom(room) });
      socket.to(room.roomCode).emit("player-joined", {
        player: room.players.find((p) => p.userId === userId),
        room: sanitizeRoom(room),
      });
    } catch (err) {
      socket.emit("join-error", { message: "Failed to join room" });
    }
  });

  // ─── PLAYER READY ────────────────────────────────────────────────────────
  socket.on("player-ready", async ({ roomCode, userId }) => {
    try {
      const room = await roomManager.getRoomByCode(roomCode);
      if (!room) return;

      const player = room.players.find((p) => p.userId === userId);
      if (player) player.status = "ready" as any;
      await room.save();

      io.to(roomCode).emit("lobby-update", { room: sanitizeRoom(room) });
    } catch (err) {
      socket.emit("error", { message: "Failed to update ready status" });
    }
  });

  // ─── GAME START ──────────────────────────────────────────────────────────
  socket.on("game-start", async ({ roomCode, userId }) => {
    try {
      const room = await roomManager.getRoomByCode(roomCode);
      if (!room || room.hostId !== userId) return;
      if (room.players.length < 2) {
        socket.emit("error", { message: "Need at least 2 players to start" });
        return;
      }

      const allPlayers = await Player.find({});
      if (allPlayers.length === 0) {
        socket.emit("error", { message: "No player cards in database. Run seed first." });
        return;
      }

      // Reset status and set up deck
      room.players.forEach((p) => {
        if ((p.status as string) === "ready") p.status = "connected";
      });
      room.gameStatus = "playing";
      room.currentRound = 1;
      room.deck = shuffleArray(allPlayers.map((p) => (p._id as object).toString()));
      room.usedCards = [];

      // Initialise in-memory turn tracker — use the order players joined
      const playerIds = room.players.map((p) => p.userId);
      roomTurnTracker.set(roomCode, { playerIds, currentIndex: 0 });
      room.currentTurnPlayerId = playerIds[0];

      await room.save();

      io.to(roomCode).emit("game-started", { room: sanitizeRoom(room) });
      await startRound(io, room.roomCode, allPlayers);
    } catch (err) {
      socket.emit("error", { message: "Failed to start game" });
    }
  });

  // ─── STAT SELECTED ───────────────────────────────────────────────────────
  socket.on("stat-selected", async ({ roomCode, userId, stat }) => {
    try {
      // Check it's this player's turn using in-memory tracker (fast & authoritative)
      const expectedTurn = getCurrentTurnPlayer(roomCode);
      if (!expectedTurn || expectedTurn !== userId) {
        // Not this player's turn
        return;
      }

      // Also guard against double-resolve race condition
      if (resolveInProgress.has(roomCode)) return;

      const room = await roomManager.getRoomByCode(roomCode);
      if (!room || room.gameStatus !== "playing") return;

      timerManager.clearTimer(roomCode);
      await resolveRound(io, roomCode, stat);
    } catch (err) {
      socket.emit("error", { message: "Failed to process stat selection" });
    }
  });

  // ─── EMOJI REACTION ──────────────────────────────────────────────────────
  socket.on("emoji-reaction", ({ roomCode, userId, emoji }) => {
    socket.to(roomCode).emit("emoji-received", { userId, emoji });
  });

  // ─── LEAVE ROOM ──────────────────────────────────────────────────────────
  socket.on("leave-room", async ({ roomCode, userId }) => {
    try {
      socket.leave(roomCode);
      const room = await roomManager.leaveRoom(roomCode, userId);
      if (room) {
        // Update tracker if the leaving player was in rotation
        const tracker = roomTurnTracker.get(roomCode);
        if (tracker) {
          tracker.playerIds = tracker.playerIds.filter((id) => id !== userId);
          if (tracker.playerIds.length > 0) {
            tracker.currentIndex = tracker.currentIndex % tracker.playerIds.length;
          }
        }
        io.to(roomCode).emit("player-left", { userId, room: sanitizeRoom(room) });
      }
    } catch (err) {
      console.error("leave-room error:", err);
    }
  });

  // ─── DISCONNECT ──────────────────────────────────────────────────────────
  socket.on("disconnect", async () => {
    try {
      const room = await roomManager.markDisconnected(socket.id);
      if (room) {
        io.to(room.roomCode).emit("player-disconnected", {
          socketId: socket.id,
          room: sanitizeRoom(room),
        });
      }
    } catch (err) {
      console.error("disconnect error:", err);
    }
  });

  // ─── RECONNECT ───────────────────────────────────────────────────────────
  socket.on("player-reconnect", async ({ roomCode, userId }) => {
    try {
      const room = await roomManager.reconnectPlayer(roomCode, userId, socket.id);
      if (!room) {
        socket.emit("reconnect-failed", { message: "Room not found" });
        return;
      }
      socket.join(roomCode);

      const cards = roundCards.get(roomCode);
      const myCard = cards?.[userId];

      socket.emit("reconnect-success", { room: sanitizeRoom(room), myCard });
      io.to(roomCode).emit("player-reconnected", { userId, room: sanitizeRoom(room) });
    } catch (err) {
      socket.emit("reconnect-failed", { message: "Reconnect failed" });
    }
  });

  // ─── GET LEADERBOARD ─────────────────────────────────────────────────────
  socket.on("get-leaderboard", async () => {
    try {
      const sessions = await GameSession.find({}).sort({ playedAt: -1 }).limit(50);
      const aggregate: Record<string, { username: string; wins: number; gamesPlayed: number }> = {};

      for (const session of sessions) {
        for (const p of session.players) {
          if (!aggregate[p.username]) {
            aggregate[p.username] = { username: p.username, wins: 0, gamesPlayed: 0 };
          }
          aggregate[p.username].gamesPlayed += 1;
        }
        if (aggregate[session.winnerName]) {
          aggregate[session.winnerName].wins += 1;
        }
      }

      const leaderboard = Object.values(aggregate)
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 20);

      socket.emit("leaderboard-data", { leaderboard, recentGames: sessions.slice(0, 10) });
    } catch (err) {
      socket.emit("error", { message: "Failed to load leaderboard" });
    }
  });
}

// ─── ROUND HELPERS ───────────────────────────────────────────────────────────

async function startRound(io: Server, roomCode: string, allPlayers?: IPlayer[]) {
  const room = await roomManager.getRoomByCode(roomCode);
  if (!room || room.gameStatus !== "playing") return;

  // Refill deck if needed
  if (room.deck.length < room.players.length) {
    const ids = allPlayers
      ? allPlayers.map((p) => (p._id as object).toString())
      : (await Player.find({}, "_id")).map((p) => (p._id as object).toString());
    room.deck = shuffleArray(ids.filter((id) => !room.usedCards.includes(id)));
    if (room.deck.length === 0) {
      room.deck = shuffleArray(ids);
      room.usedCards = [];
    }
    await room.save();
  }

  // Draw one card per player
  const cardIds = room.deck.splice(0, room.players.length);
  room.usedCards.push(...cardIds);
  await room.save();

  const players = allPlayers
    ? allPlayers.filter((p) => cardIds.includes((p._id as object).toString()))
    : await Player.find({ _id: { $in: cardIds } });

  const cardMap: Record<string, CardData> = {};
  room.players.forEach((rp, idx) => {
    const card = players.find((p) => (p._id as object).toString() === cardIds[idx]);
    if (card) cardMap[rp.userId] = gameEngine.toCardData(card);
  });

  roundCards.set(roomCode, cardMap);

  const selectedStats = gameEngine.pickRoundStats();
  const statLabels: Record<string, string> = {};
  selectedStats.forEach((s) => { statLabels[s] = STAT_LABELS[s] || s; });

  // Use in-memory tracker for authoritative turn (never rely on DB for this)
  const turnPlayerId = getCurrentTurnPlayer(roomCode) || room.players[0].userId;

  // Emit each player their card privately
  for (const rp of room.players) {
    const playerSocket = io.sockets.sockets.get(rp.socketId);
    if (playerSocket && cardMap[rp.userId]) {
      playerSocket.emit("receive-card", { card: cardMap[rp.userId] });
    }
  }

  // Broadcast round start with the AUTHORITATIVE turn player
  io.to(roomCode).emit("round-start", {
    roundNumber: room.currentRound,
    selectedStats,
    statLabels,
    currentTurnPlayerId: turnPlayerId,
    timerDuration: room.timerDuration,
    totalPlayers: room.players.length,
    playerCount: room.players.length,
  });

  // Auto-resolve when timer expires
  timerManager.startTimer(io, roomCode, room.timerDuration, async () => {
    if (resolveInProgress.has(roomCode)) return;
    const autoStat = selectedStats[Math.floor(Math.random() * selectedStats.length)];
    await resolveRound(io, roomCode, autoStat);
  });
}

async function resolveRound(io: Server, roomCode: string, stat: string) {
  if (resolveInProgress.has(roomCode)) return;
  resolveInProgress.add(roomCode);

  timerManager.clearTimer(roomCode);

  try {
    const room = await roomManager.getRoomByCode(roomCode);
    if (!room) { resolveInProgress.delete(roomCode); return; }

    const cards = roundCards.get(roomCode) || {};
    const { winners, playerValues, winnerValue } = gameEngine.resolveRound(stat, cards, room.players);

    // Update scores
    const winnerSet = new Set(winners);
    for (const p of room.players) {
      if (winnerSet.has(p.userId)) {
        p.score += 1;
        p.winStreak = (p.winStreak || 0) + 1;
      } else {
        p.winStreak = 0;
      }
    }
    room.markModified("players");

    room.rounds.push({
      roundNumber: room.currentRound,
      selectedStats: [],
      selectedStat: stat,
      selectedBy: getCurrentTurnPlayer(roomCode) || room.currentTurnPlayerId || "",
      cardIds: Object.fromEntries(
        Object.entries(cards).map(([uid, card]) => [uid, card._id])
      ) as Record<string, string>,
      winnerId: winners,
      winnerStat: stat,
      winnerValue,
      timestamp: new Date(),
    });

    // ── ADVANCE TURN via in-memory tracker ──────────────────────────────
    const nextTurnPlayerId = advanceTurn(roomCode);
    room.currentTurnPlayerId = nextTurnPlayerId || room.players[0].userId;
    room.markModified("currentTurnPlayerId");

    const scores: Record<string, number> = {};
    const winStreaks: Record<string, number> = {};
    for (const p of room.players) {
      scores[p.userId] = p.score;
      winStreaks[p.userId] = p.winStreak;
    }

    // Reveal cards to all players
    io.to(roomCode).emit("cards-revealed", {
      cards,
      selectedStat: stat,
      playerValues,
      winners,
      lowerIsBetter: gameEngine.isLowerBetter(stat),
      statLabel: STAT_LABELS[stat] || stat,
    });

    await room.save();

    setTimeout(async () => {
      io.to(roomCode).emit("round-result", {
        winners,
        selectedStat: stat,
        statLabel: STAT_LABELS[stat] || stat,
        winnerValue,
        scores,
        winStreaks,
        roundNumber: room.currentRound,
        playerNames: Object.fromEntries(room.players.map((p) => [p.userId, p.username])),
      });

      io.to(roomCode).emit("score-update", { scores, winStreaks });

      setTimeout(async () => {
        const updated = await roomManager.getRoomByCode(roomCode);
        if (!updated) { resolveInProgress.delete(roomCode); return; }

        const allPlayers = await Player.find({});
        const remainingCards = allPlayers.filter(
          (p) => !updated.usedCards.includes((p._id as object).toString())
        );

        // ── RELEASE LOCK before starting next round ──────────────────────
        resolveInProgress.delete(roomCode);

        if (remainingCards.length < updated.players.length && updated.currentRound >= updated.maxRounds) {
          await endGame(io, roomCode, updated);
        } else {
          updated.currentRound += 1;
          await updated.save();
          io.to(roomCode).emit("next-round", { roundNumber: updated.currentRound });
          await startRound(io, roomCode, allPlayers);
        }
      }, 4000);
    }, 500);
  } catch (err) {
    console.error("resolveRound error:", err);
    resolveInProgress.delete(roomCode);
  }
}

async function endGame(io: Server, roomCode: string, room: any) {
  room.gameStatus = "finished";
  await room.save();

  // Clean up in-memory state
  roomTurnTracker.delete(roomCode);
  roundCards.delete(roomCode);

  const winner = gameEngine.getGameWinner(room.players);
  const mvpId = gameEngine.getMVP(room.rounds);
  const mvpPlayer = room.players.find((p: any) => p.userId === mvpId);

  const scores: Record<string, number> = {};
  const finalRanking = [...room.players].sort((a: any, b: any) => b.score - a.score);
  for (const p of room.players) scores[p.userId] = p.score;

  try {
    await GameSession.create({
      roomCode,
      players: room.players.map((p: any) => ({
        username: p.username,
        score: p.score,
        wins: p.score,
        gamesPlayed: 1,
        mvpCount: mvpId === p.userId ? 1 : 0,
        winStreak: p.winStreak,
        bestStreak: p.winStreak,
      })),
      winnerId: winner.userId,
      winnerName: winner.username,
      mvpName: mvpPlayer?.username || winner.username,
      totalRounds: room.currentRound,
      duration: Math.floor((Date.now() - room.createdAt.getTime()) / 1000),
      gameMode: room.gameMode,
    });
  } catch (err) {
    console.error("Failed to save game session:", err);
  }

  io.to(roomCode).emit("game-over", {
    winner: { userId: winner.userId, username: winner.username, score: winner.score },
    mvp: mvpPlayer ? { userId: mvpPlayer.userId, username: mvpPlayer.username } : null,
    finalRanking: finalRanking.map((p: any) => ({
      userId: p.userId,
      username: p.username,
      score: p.score,
    })),
    scores,
    totalRounds: room.currentRound,
  });
}

function sanitizeRoom(room: any) {
  return {
    roomCode: room.roomCode,
    hostId: room.hostId,
    players: room.players.map((p: any) => ({
      userId: p.userId,
      username: p.username,
      avatar: p.avatar,
      score: p.score,
      status: p.status,
      isHost: p.isHost,
      winStreak: p.winStreak,
    })),
    gameStatus: room.gameStatus,
    currentRound: room.currentRound,
    maxRounds: room.maxRounds,
    currentTurnPlayerId: room.currentTurnPlayerId,
    timerDuration: room.timerDuration,
    gameMode: room.gameMode,
  };
}
