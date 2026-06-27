import { create } from "zustand";
import {
  Room,
  RoomPlayer,
  PlayerCard,
  RoundState,
  RevealState,
  RoundResult,
  GameOverData,
  GamePhase,
} from "../types";

interface GameStore {
  // Identity
  userId: string;
  username: string;

  // Room
  room: Room | null;
  roomCode: string;

  // Game state
  phase: GamePhase;
  myCard: PlayerCard | null;
  roundState: RoundState | null;
  revealState: RevealState | null;
  roundResult: RoundResult | null;
  gameOver: GameOverData | null;
  timer: number;
  scores: Record<string, number>;
  winStreaks: Record<string, number>;
  selectedStat: string | null;
  hasSelectedStat: boolean;

  // Notifications
  lastWinners: string[];
  emojiReactions: { userId: string; emoji: string; id: number }[];

  // Actions
  setIdentity: (userId: string, username: string) => void;
  setRoom: (room: Room) => void;
  setRoomCode: (code: string) => void;
  setPhase: (phase: GamePhase) => void;
  setMyCard: (card: PlayerCard | null) => void;
  setRoundState: (state: RoundState) => void;
  setRevealState: (state: RevealState | null) => void;
  setRoundResult: (result: RoundResult | null) => void;
  setGameOver: (data: GameOverData) => void;
  setTimer: (t: number) => void;
  setScores: (scores: Record<string, number>, winStreaks: Record<string, number>) => void;
  setSelectedStat: (stat: string | null) => void;
  setHasSelectedStat: (v: boolean) => void;
  addEmojiReaction: (userId: string, emoji: string) => void;
  reset: () => void;
  updatePlayerInRoom: (userId: string, updates: Partial<RoomPlayer>) => void;
  removePlayerFromRoom: (userId: string) => void;
}

let emojiIdCounter = 0;

const initialState = {
  userId: "",
  username: "",
  room: null,
  roomCode: "",
  phase: "idle" as GamePhase,
  myCard: null,
  roundState: null,
  revealState: null,
  roundResult: null,
  gameOver: null,
  timer: 0,
  scores: {},
  winStreaks: {},
  selectedStat: null,
  hasSelectedStat: false,
  lastWinners: [],
  emojiReactions: [],
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setIdentity: (userId, username) => set({ userId, username }),
  setRoom: (room) => set({ room }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setPhase: (phase) => set({ phase }),
  setMyCard: (myCard) => set({ myCard }),
  setRoundState: (roundState) => set({ roundState }),
  setRevealState: (revealState) => set({ revealState }),
  setRoundResult: (roundResult) => set({ roundResult, lastWinners: roundResult?.winners ?? [] }),
  setGameOver: (gameOver) => set({ gameOver }),
  setTimer: (timer) => set({ timer }),
  setScores: (scores, winStreaks) => set({ scores, winStreaks }),
  setSelectedStat: (selectedStat) => set({ selectedStat }),
  setHasSelectedStat: (hasSelectedStat) => set({ hasSelectedStat }),

  addEmojiReaction: (userId, emoji) =>
    set((state) => ({
      emojiReactions: [
        ...state.emojiReactions.slice(-9),
        { userId, emoji, id: ++emojiIdCounter },
      ],
    })),

  updatePlayerInRoom: (userId, updates) =>
    set((state) => {
      if (!state.room) return {};
      return {
        room: {
          ...state.room,
          players: state.room.players.map((p) =>
            p.userId === userId ? { ...p, ...updates } : p
          ),
        },
      };
    }),

  removePlayerFromRoom: (userId) =>
    set((state) => {
      if (!state.room) return {};
      return {
        room: {
          ...state.room,
          players: state.room.players.filter((p) => p.userId !== userId),
        },
      };
    }),

  reset: () => set({ ...initialState }),
}));
