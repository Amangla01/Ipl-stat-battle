import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../socket/socketClient";
import { useGameStore } from "../store/gameStore";

export function useSocketEvents() {
  const navigate = useNavigate();
  const store = useGameStore();

  useEffect(() => {
    const socket = getSocket();

    socket.on("room-created", ({ room, roomCode }) => {
      store.setRoom(room);
      store.setRoomCode(roomCode);
      store.setPhase("lobby");
      navigate(`/lobby/${roomCode}`);
    });

    socket.on("room-joined", ({ room }) => {
      store.setRoom(room);
      store.setRoomCode(room.roomCode);
      store.setPhase("lobby");
      navigate(`/lobby/${room.roomCode}`);
    });

    socket.on("join-error", ({ message }) => {
      alert(`❌ ${message}`);
    });

    socket.on("player-joined", ({ room }) => {
      store.setRoom(room);
    });

    socket.on("player-left", ({ room }) => {
      store.setRoom(room);
    });

    socket.on("lobby-update", ({ room }) => {
      store.setRoom(room);
    });

    socket.on("game-started", ({ room }) => {
      store.setRoom(room);
      store.setPhase("dealing");
      navigate(`/game/${room.roomCode}`);
    });

    socket.on("receive-card", ({ card }) => {
      store.setMyCard(card);
    });

    socket.on("round-start", (data) => {
      store.setRoundState(data);
      store.setPhase("selecting");
      store.setSelectedStat(null);
      store.setHasSelectedStat(false);
      store.setRevealState(null);
      store.setRoundResult(null);
    });

    socket.on("timer-update", ({ remaining }) => {
      store.setTimer(remaining);
    });

    socket.on("cards-revealed", (data) => {
      store.setRevealState(data);
      store.setPhase("revealing");
    });

    socket.on("round-result", (result) => {
      store.setRoundResult(result);
      store.setPhase("result");
    });

    socket.on("score-update", ({ scores, winStreaks }) => {
      store.setScores(scores, winStreaks);
    });

    socket.on("next-round", () => {
      store.setMyCard(null);
      store.setPhase("dealing");
    });

    socket.on("game-over", (data) => {
      store.setGameOver(data);
      store.setPhase("finished");
      navigate(`/result/${store.roomCode || data.winner?.userId}`);
    });

    socket.on("player-disconnected", ({ room }) => {
      store.setRoom(room);
    });

    socket.on("player-reconnected", ({ room }) => {
      store.setRoom(room);
    });

    socket.on("emoji-received", ({ userId, emoji }) => {
      store.addEmojiReaction(userId, emoji);
    });

    socket.on("reconnect-success", ({ room, myCard }) => {
      store.setRoom(room);
      if (myCard) store.setMyCard(myCard);
    });

    socket.on("error", ({ message }) => {
      console.error("Socket error:", message);
    });

    return () => {
      socket.off("room-created");
      socket.off("room-joined");
      socket.off("join-error");
      socket.off("player-joined");
      socket.off("player-left");
      socket.off("lobby-update");
      socket.off("game-started");
      socket.off("receive-card");
      socket.off("round-start");
      socket.off("timer-update");
      socket.off("cards-revealed");
      socket.off("round-result");
      socket.off("score-update");
      socket.off("next-round");
      socket.off("game-over");
      socket.off("player-disconnected");
      socket.off("player-reconnected");
      socket.off("emoji-received");
      socket.off("reconnect-success");
      socket.off("error");
    };
  }, []);

  const createRoom = useCallback(
    (gameMode: "normal" | "lightning" | "daily" = "normal", maxRounds: number = 20) => {
      const socket = getSocket();
      socket.emit("create-room", {
        userId: store.userId,
        username: store.username,
        gameMode,
        maxRounds,
      });
    },
    [store.userId, store.username]
  );

  const joinRoom = useCallback(
    (roomCode: string) => {
      const socket = getSocket();
      socket.emit("join-room", {
        roomCode,
        userId: store.userId,
        username: store.username,
      });
    },
    [store.userId, store.username]
  );

  const startGame = useCallback(() => {
    const socket = getSocket();
    socket.emit("game-start", {
      roomCode: store.roomCode,
      userId: store.userId,
    });
  }, [store.roomCode, store.userId]);

  const selectStat = useCallback(
    (stat: string) => {
      if (store.hasSelectedStat) return;
      store.setSelectedStat(stat);
      store.setHasSelectedStat(true);
      const socket = getSocket();
      socket.emit("stat-selected", {
        roomCode: store.roomCode,
        userId: store.userId,
        stat,
      });
    },
    [store.roomCode, store.userId, store.hasSelectedStat]
  );

  const sendEmoji = useCallback(
    (emoji: string) => {
      const socket = getSocket();
      socket.emit("emoji-reaction", {
        roomCode: store.roomCode,
        userId: store.userId,
        emoji,
      });
    },
    [store.roomCode, store.userId]
  );

  const leaveRoom = useCallback(() => {
    const socket = getSocket();
    socket.emit("leave-room", {
      roomCode: store.roomCode,
      userId: store.userId,
    });
    store.reset();
    navigate("/");
  }, [store.roomCode, store.userId]);

  const markReady = useCallback(() => {
    const socket = getSocket();
    socket.emit("player-ready", {
      roomCode: store.roomCode,
      userId: store.userId,
    });
  }, [store.roomCode, store.userId]);

  return { createRoom, joinRoom, startGame, selectStat, sendEmoji, leaveRoom, markReady };
}
