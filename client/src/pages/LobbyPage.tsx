import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/common/Button";
import { GameBackground } from "../components/Background";
import { Header } from "../components/Layout/Header";
import { useSocketEvents } from "../hooks/useSocket";
import { useGameStore } from "../store/gameStore";
import { backgroundMusic } from "../hooks/useBackgroundMusic";

export function LobbyPage() {
  const { roomCode: _paramCode } = useParams();
  const navigate = useNavigate();
  const { startGame, leaveRoom, markReady, kickPlayer } = useSocketEvents();
  const { room, userId, username, roomCode, phase } = useGameStore();

  useEffect(() => {
    if (!username) { navigate("/"); return; }
    const activePhases: string[] = ["playing", "dealing", "selecting", "revealing", "result"];
    if (activePhases.includes(phase)) navigate(`/game/${roomCode}`);
  }, [phase, username]);

  // Start background music when entering lobby (first user-interaction has already happened)
  useEffect(() => {
    backgroundMusic.play();
  }, []);

  if (!room || !username) return null;

  const isHost = room.hostId === userId;
  const canStart = isHost && room.players.length >= 2 && room.players.length <= 4;
  const myPlayer = room.players.find((p) => p.userId === userId);
  const modeLabels: Record<string, string> = { normal: "Normal 🏏", lightning: "Lightning ⚡", daily: "Daily 📅" };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GameBackground />
      <Header />

      <div className="relative z-10 pt-20 flex flex-col items-center justify-center min-h-screen px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          {/* Room code hero */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="relative text-center mb-6 p-6 rounded-3xl overflow-hidden"
            style={{
              background: "rgba(30,41,59,0.6)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(245,158,11,0.25)",
              boxShadow: "0 0 40px rgba(245,158,11,0.08), 0 24px 48px rgba(0,0,0,0.4)",
            }}
          >
            {/* Glow top line */}
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, transparent, #F59E0B, transparent)" }} />

            <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Room Code</div>
            <motion.div
              className="font-display font-black tracking-widest mb-1"
              style={{
                fontSize: "clamp(2.5rem, 12vw, 4rem)",
                background: "linear-gradient(135deg, #FACC15, #F59E0B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "none",
                filter: "drop-shadow(0 0 20px rgba(245,158,11,0.4))",
              }}
            >
              {room.roomCode}
            </motion.div>
            <div className="text-xs text-slate-500 mb-3">Share this code with friends to join</div>

            <div className="flex items-center justify-center gap-3">
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.25)" }}
              >
                {modeLabels[room.gameMode] || room.gameMode}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => navigator.clipboard?.writeText(room.roomCode)}
                className="text-xs font-medium px-3 py-1 rounded-full text-slate-400 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                📋 Copy
              </motion.button>
            </div>
          </motion.div>

          {/* Players list */}
          <div
            className="rounded-2xl overflow-hidden mb-5"
            style={{
              background: "rgba(30,41,59,0.5)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {/* Header */}
            <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
              <span className="font-display font-semibold text-white text-sm">
                Players ({room.players.length}/4)
              </span>
              {/* Slot dots */}
              <div className="flex gap-1.5">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={i < room.players.length ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: i < room.players.length ? "#22C55E" : "rgba(255,255,255,0.08)",
                      boxShadow: i < room.players.length ? "0 0 6px #22C55E" : "none",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="p-3 space-y-2">
              <AnimatePresence>
                {room.players.map((player, i) => {
                  const isMe = player.userId === userId;
                  const isReady = player.status === "ready";
                  return (
                    <motion.div
                      key={player.userId}
                      layout
                      initial={{ opacity: 0, x: -24, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 24, scale: 0.95 }}
                      transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 24 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{
                        background: isMe ? "rgba(37,99,235,0.1)" : "rgba(255,255,255,0.025)",
                        border: `1px solid ${isMe ? "rgba(37,99,235,0.25)" : "rgba(255,255,255,0.04)"}`,
                      }}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={player.avatar}
                          alt={player.username}
                          className="w-10 h-10 rounded-full"
                          style={{ border: `2px solid ${isMe ? "#3B82F6" : "rgba(255,255,255,0.1)"}` }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.username)}&size=80&bold=true&background=random&color=fff`;
                          }}
                        />
                        {/* Online dot */}
                        <div
                          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                          style={{
                            background: player.status === "disconnected" ? "#EF4444" : "#22C55E",
                            borderColor: "#111827",
                            boxShadow: player.status !== "disconnected" ? "0 0 6px #22C55E" : "none",
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white text-sm truncate">
                            {player.username}
                            {isMe && <span className="text-blue-400 ml-1 text-xs">(You)</span>}
                          </span>
                          {player.isHost && (
                            <span
                              className="text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
                              style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.3)" }}
                            >
                              HOST
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Ready status */}
                      <div className="flex-shrink-0">
                        {isReady ? (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-xs font-semibold text-green-400 flex items-center gap-1"
                          >
                            <span>✓</span> Ready
                          </motion.span>
                        ) : (
                          <span className="text-xs text-slate-600">Waiting…</span>
                        )}
                      </div>

                      {/* Kick button — host only, not for self */}
                      {isHost && !isMe && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => kickPlayer(player.userId)}
                          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs transition-colors"
                          style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.25)" }}
                          title="Kick player"
                        >
                          ✕
                        </motion.button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Empty slots */}
              {room.players.length < 4 && (
                <motion.div
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ border: "1px dashed rgba(255,255,255,0.07)" }}
                >
                  <div className="w-10 h-10 rounded-full bg-white/4 flex items-center justify-center text-slate-600 border border-dashed border-white/10">
                    +
                  </div>
                  <span className="text-xs text-slate-600">Waiting for more players…</span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button variant="ghost" size="md" onClick={leaveRoom} className="flex-1">
              Leave Room
            </Button>

            {!isHost && (
              <Button
                variant={myPlayer?.status === "ready" ? "glass" : "primary"}
                size="md"
                className="flex-1"
                onClick={markReady}
              >
                {myPlayer?.status === "ready" ? "✓ Ready" : "Ready Up"}
              </Button>
            )}

            {isHost && (
              <Button
                variant="gold"
                size="md"
                className="flex-1"
                onClick={startGame}
                disabled={!canStart}
              >
                {canStart ? "Start Game 🚀" : "Need 2+ Players"}
              </Button>
            )}
          </div>

          {isHost && !canStart && (
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center text-xs text-slate-600 mt-3"
            >
              Waiting for more players to join…
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
