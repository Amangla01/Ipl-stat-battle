import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { GameBackground } from "../components/Background";
import { Header } from "../components/Layout/Header";
import { getSocket } from "../socket/socketClient";

interface LeaderboardEntry {
  username: string;
  wins: number;
  gamesPlayed: number;
}

const MEDAL = ["🥇", "🥈", "🥉"];
const RANK_COLORS = ["#FACC15", "#C0C0C0", "#CD7F32"];

export function LeaderboardPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("get-leaderboard");
    socket.on("leaderboard-data", ({ leaderboard }) => {
      setEntries(leaderboard);
      setLoading(false);
    });
    return () => { socket.off("leaderboard-data"); };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GameBackground />
      <Header showBack title="Leaderboard" />

      <div className="relative z-10 pt-20 flex flex-col items-center min-h-screen px-4 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg pt-6"
        >
          {/* Title */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ y: [-6, 0, -6] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-5xl mb-3"
              style={{ filter: "drop-shadow(0 0 24px rgba(245,158,11,0.5))" }}
            >
              🏆
            </motion.div>
            <h2 className="font-display font-bold text-2xl text-white">Global Leaderboard</h2>
            <p className="text-slate-400 mt-1 text-sm">Top IPL Stat Battle champions</p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                className="text-4xl mb-4 inline-block"
              >
                ⚙
              </motion.div>
              <div className="text-slate-400 text-sm">Loading rankings…</div>
            </div>
          ) : entries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 rounded-2xl"
              style={{
                background: "rgba(30,41,59,0.5)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="text-5xl mb-4">🏏</div>
              <div className="text-white font-semibold mb-1">No matches played yet</div>
              <div className="text-slate-500 text-sm mb-6">Be the first to play and claim the throne!</div>
              <Button variant="gold" size="md" onClick={() => navigate("/menu")}>
                Play Now 🚀
              </Button>
            </motion.div>
          ) : (
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(30,41,59,0.5)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Top 3 podium header */}
              {entries.length >= 3 && (
                <div className="flex items-end justify-center gap-3 px-6 pt-6 pb-4 border-b border-white/5">
                  {[1, 0, 2].map((rank) => {
                    const e = entries[rank];
                    const heights = ["h-20", "h-28", "h-16"];
                    const h = heights[rank];
                    return (
                      <motion.div
                        key={rank}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: rank * 0.1 }}
                        className="flex flex-col items-center gap-1"
                      >
                        <span className="text-xl">{MEDAL[rank]}</span>
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                          style={{
                            background: `hsl(${(e.username.charCodeAt(0) * 37) % 360}, 50%, 25%)`,
                            border: `2px solid ${RANK_COLORS[rank]}50`,
                          }}
                        >
                          {e.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="text-xs text-white font-medium text-center max-w-[60px] truncate">{e.username}</div>
                        <div
                          className={`w-16 ${h} rounded-t-lg flex items-center justify-center`}
                          style={{ background: `${RANK_COLORS[rank]}20`, border: `1px solid ${RANK_COLORS[rank]}30` }}
                        >
                          <span className="font-display font-black text-sm" style={{ color: RANK_COLORS[rank] }}>{e.wins}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Full list */}
              <AnimatePresence>
                {entries.map((entry, i) => (
                  <motion.div
                    key={entry.username}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="flex items-center gap-4 px-5 py-3.5 border-b last:border-b-0"
                    style={{
                      borderColor: "rgba(255,255,255,0.04)",
                      background: i === 0 ? "rgba(245,158,11,0.06)" : "transparent",
                    }}
                  >
                    {/* Rank */}
                    <div
                      className="w-8 text-center font-display font-bold flex-shrink-0"
                      style={{ color: RANK_COLORS[i] ?? "#475569", fontSize: i < 3 ? "1.25rem" : "0.875rem" }}
                    >
                      {i < 3 ? MEDAL[i] : i + 1}
                    </div>

                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                      style={{
                        background: `hsl(${(entry.username.charCodeAt(0) * 37) % 360}, 50%, 25%)`,
                        border: `2px solid ${(RANK_COLORS[i] ?? "#334155") + "50"}`,
                      }}
                    >
                      {entry.username.slice(0, 2).toUpperCase()}
                    </div>

                    {/* Name + games */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">{entry.username}</div>
                      <div className="text-xs text-slate-500">
                        {entry.gamesPlayed} {entry.gamesPlayed === 1 ? "game" : "games"}
                      </div>
                    </div>

                    {/* Win rate */}
                    {entry.gamesPlayed > 0 && (
                      <div
                        className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.04)", color: "#64748B" }}
                      >
                        {Math.round((entry.wins / entry.gamesPlayed) * 100)}%
                      </div>
                    )}

                    {/* Wins */}
                    <div className="text-right flex-shrink-0">
                      <div
                        className="font-display font-black text-lg"
                        style={{ color: RANK_COLORS[i] ?? "#E2E8F0" }}
                      >
                        {entry.wins}
                      </div>
                      <div className="text-[10px] text-slate-600">wins</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {!loading && entries.length > 0 && (
            <div className="mt-6 text-center">
              <Button variant="ghost" size="sm" onClick={() => navigate("/menu")}>
                ← Back to Menu
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
