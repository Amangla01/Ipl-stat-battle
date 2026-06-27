import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import { RoomPlayer } from "../../types";

interface LiveScoreboardProps {
  players: RoomPlayer[];
  compact?: boolean;
}

export function LiveScoreboard({ players, compact = false }: LiveScoreboardProps) {
  const { scores, winStreaks, userId, lastWinners, roundState } = useGameStore();

  const sorted = [...players].sort((a, b) => {
    const sa = scores[a.userId] ?? a.score;
    const sb = scores[b.userId] ?? b.score;
    return sb - sa;
  });

  if (compact) {
    // Horizontal pill row for the top bar
    return (
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <AnimatePresence>
          {sorted.map((p, idx) => {
            const score = scores[p.userId] ?? p.score;
            const streak = winStreaks[p.userId] ?? p.winStreak;
            const isMe = p.userId === userId;
            const isWinner = lastWinners.includes(p.userId);
            const isTurn = roundState?.currentTurnPlayerId === p.userId;
            return (
              <motion.div
                key={p.userId}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 px-2 py-1 rounded-full flex-shrink-0"
                style={{
                  background: isMe ? "rgba(37,99,235,0.18)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${isMe ? "rgba(37,99,235,0.4)" : isWinner ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.08)"}`,
                  boxShadow: isWinner ? "0 0 8px rgba(245,158,11,0.25)" : "none",
                }}
              >
                <span
                  className="text-[9px] font-bold w-3 text-center"
                  style={{ color: idx === 0 ? "#FACC15" : idx === 1 ? "#C0C0C0" : "#64748B" }}
                >
                  {idx + 1}
                </span>
                <img
                  src={p.avatar}
                  alt={p.username}
                  className="w-4 h-4 rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${p.username[0]}&size=32&bold=true&background=random&color=fff`;
                  }}
                />
                <span className="text-[10px] font-medium" style={{ color: isMe ? "#93C5FD" : "white" }}>
                  {isMe ? "You" : p.username.slice(0, 7)}
                </span>
                {isTurn && (
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-[8px] text-blue-400"
                  >●</motion.span>
                )}
                <motion.span
                  key={score}
                  initial={{ scale: 1.4, color: "#FACC15" }}
                  animate={{ scale: 1, color: isMe ? "#FACC15" : "#E2E8F0" }}
                  className="font-display font-bold text-[11px]"
                >
                  {score}
                </motion.span>
                {streak >= 2 && <span className="text-[9px]">🔥</span>}
                {isWinner && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[9px]">⭐</motion.span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  }

  // Full vertical scoreboard
  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl h-full"
      style={{
        background: "rgba(30,41,59,0.5)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5 flex-shrink-0">
        <span className="text-sm">🏆</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scores</span>
        {roundState && (
          <span className="ml-auto text-[10px] text-slate-600">R{roundState.roundNumber}</span>
        )}
      </div>
      <div className="flex-1 overflow-hidden flex flex-col justify-around p-2 gap-1">
        <AnimatePresence>
          {sorted.map((player, idx) => {
            const score = scores[player.userId] ?? player.score;
            const streak = winStreaks[player.userId] ?? player.winStreak;
            const isMe = player.userId === userId;
            const isWinner = lastWinners.includes(player.userId);
            const isTurn = roundState?.currentTurnPlayerId === player.userId;
            return (
              <motion.div
                key={player.userId}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl"
                style={{
                  background: isMe ? "rgba(37,99,235,0.12)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isMe ? "rgba(37,99,235,0.25)" : "transparent"}`,
                  minHeight: 34,
                }}
              >
                <span
                  className="text-xs font-bold w-4 text-center flex-shrink-0"
                  style={{ color: idx === 0 ? "#FACC15" : idx === 1 ? "#C0C0C0" : idx === 2 ? "#CD7F32" : "#475569" }}
                >
                  {idx + 1}
                </span>
                <img
                  src={player.avatar}
                  alt={player.username}
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${player.username[0]}&size=40&bold=true&background=random&color=fff`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium truncate" style={{ color: isMe ? "#93C5FD" : "white" }}>
                      {isMe ? "You" : player.username}
                    </span>
                    {isTurn && (
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.7, repeat: Infinity }}
                        className="text-blue-400 text-[9px]"
                      >●</motion.span>
                    )}
                  </div>
                  {streak >= 2 && <div className="text-[9px] text-orange-400">🔥×{streak}</div>}
                </div>
                <motion.div
                  key={score}
                  initial={{ scale: 1.5, color: "#FACC15" }}
                  animate={{ scale: 1, color: isMe ? "#FACC15" : "white" }}
                  className="font-display font-bold text-base flex-shrink-0"
                >
                  {score}
                </motion.div>
                {isWinner && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-xs flex-shrink-0">⭐</motion.span>
                )}
                {player.status === "disconnected" && (
                  <span className="text-[10px] text-red-500 flex-shrink-0">✗</span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
