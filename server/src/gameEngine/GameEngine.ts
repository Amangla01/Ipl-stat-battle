import { IRoom, IRoomPlayer } from "../models/Room";
import { IPlayer } from "../models/Player";
import {
  compareStats,
  getStatValue,
  pickRandomStats,
  shuffleArray,
  STAT_LABELS,
  LOWER_IS_BETTER,
} from "../utils/cardUtils";

export interface CardData {
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

export interface RoundStartPayload {
  roundNumber: number;
  selectedStats: string[];
  statLabels: Record<string, string>;
  currentTurnPlayerId: string;
  timerDuration: number;
}

export interface CardRevealPayload {
  cards: Record<string, CardData>;
  selectedStat: string;
  playerValues: Record<string, number>;
  winners: string[];
  lowerIsBetter: boolean;
}

export interface RoundResultPayload {
  winners: string[];
  selectedStat: string;
  statLabel: string;
  winnerValue: number;
  scores: Record<string, number>;
  winStreaks: Record<string, number>;
  roundNumber: number;
}

export class GameEngine {
  distributeCards(
    players: IRoomPlayer[],
    availableDeck: IPlayer[]
  ): Record<string, CardData> {
    const shuffled = shuffleArray(availableDeck);
    const assignments: Record<string, CardData> = {};

    players.forEach((player, idx) => {
      if (shuffled[idx]) {
        assignments[player.userId] = this.toCardData(shuffled[idx]);
      }
    });

    return assignments;
  }

  buildRoundPayload(
    room: IRoom,
    selectedStats: string[]
  ): RoundStartPayload {
    const statLabels: Record<string, string> = {};
    selectedStats.forEach((s) => {
      statLabels[s] = STAT_LABELS[s] || s;
    });

    return {
      roundNumber: room.currentRound,
      selectedStats,
      statLabels,
      currentTurnPlayerId: room.currentTurnPlayerId || room.hostId,
      timerDuration: room.timerDuration,
    };
  }

  pickRoundStats(): string[] {
    return pickRandomStats(6);
  }

  resolveRound(
    selectedStat: string,
    playerCards: Record<string, CardData>,
    players: IRoomPlayer[]
  ): {
    winners: string[];
    playerValues: Record<string, number>;
    winnerValue: number;
  } {
    const playerValues: Record<string, number> = {};

    for (const [userId, card] of Object.entries(playerCards)) {
      playerValues[userId] = getStatValue(card.stats, selectedStat);
    }

    const winners = compareStats(playerValues, selectedStat);
    const winnerValue = winners.length > 0 ? playerValues[winners[0]] : 0;

    return { winners, playerValues, winnerValue };
  }

  updateScores(
    players: IRoomPlayer[],
    winners: string[]
  ): IRoomPlayer[] {
    const winnerSet = new Set(winners);
    return players.map((p) => {
      if (winnerSet.has(p.userId)) {
        return {
          ...p,
          score: p.score + 1,
          winStreak: p.winStreak + 1,
        };
      }
      return { ...p, winStreak: 0 };
    });
  }

  getNextTurnPlayer(players: IRoomPlayer[], currentId: string): string {
    const active = players.filter((p) => p.status !== "disconnected");
    if (active.length === 0) return currentId;
    const idx = active.findIndex((p) => p.userId === currentId);
    const next = (idx + 1) % active.length;
    return active[next].userId;
  }

  getGameWinner(players: IRoomPlayer[]): IRoomPlayer {
    return players.reduce((best, p) => (p.score > best.score ? p : best), players[0]);
  }

  getMVP(rounds: { winnerId?: string[] }[]): string | null {
    const winCounts: Record<string, number> = {};
    for (const round of rounds) {
      if (round.winnerId) {
        for (const id of round.winnerId) {
          winCounts[id] = (winCounts[id] || 0) + 1;
        }
      }
    }
    const sorted = Object.entries(winCounts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : null;
  }

  toCardData(player: IPlayer): CardData {
    return {
      _id: (player._id as object).toString(),
      name: player.name,
      team: player.team,
      teamShort: player.teamShort,
      teamColor: player.teamColor,
      role: player.role,
      nationality: player.nationality,
      image: player.image,
      stats: player.stats as unknown as Record<string, number | string>,
    };
  }

  isLowerBetter(stat: string): boolean {
    return LOWER_IS_BETTER.has(stat);
  }
}

export const gameEngine = new GameEngine();
