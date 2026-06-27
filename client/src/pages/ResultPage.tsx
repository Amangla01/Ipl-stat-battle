import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { GameBackground } from "../components/Background";
import { Header } from "../components/Layout/Header";
import { Confetti } from "../components/animations/Confetti";
import { useGameStore } from "../store/gameStore";
import { backgroundMusic } from "../hooks/useBackgroundMusic";

export function ResultPage() {
  const navigate = useNavigate();
  const { gameOver, userId, username, reset } = useGameStore();

  useEffect(() => {
    if (!username) navigate("/");
    // Stop background music when the match ends
    backgroundMusic.stop();
  }, [username]);

  if (!gameOver || !username) return null;

  const amIWinner = gameOver.winner.userId === userId;
  const myRank = gameOver.finalRanking.findIndex((p) => p.userId === userId) + 1;

  const rankSuffix = (n: number) => ["st", "nd", "rd"][n - 1] ?? "th";
  const medalFor = (rank: number) => ["🥇", "🥈", "🥉"][rank - 1] ?? "🏅";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GameBackground />
      <Header title="Match Result" />
      <Confetti trigger={amIWinner} isWinner />

      {/* Winner radial glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: amIWinner
            ? "radial-gradient(ellipse at 50% 20%, rgba(245,158,11,0.18) 0%, transparent 55%)"
            : "radial-gradient(ellipse at 50% 20%, rgba(37,99,235,0.1) 0%, transparent 55%)",
        }}
      />

      <div className="relative z-10 pt-20 flex flex-col items-center justify-center min-h-screen px-4 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          {/* Winner announcement */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, delay: 0.2 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={amIWinner ? { y: [-12, 0, -12], rotate: [-3, 3, -3] } : { y: [-6, 0, -6] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="mb-4"
              style={{
                fontSize: "clamp(4rem, 15vw, 6rem)",
                filter: amIWinner ? "drop-shadow(0 0 40px rgba(245,158,11,0.6))" : "drop-shadow(0 0 20px rgba(255,255,255,0.15))",
              }}
            >
              {amIWinner ? "🏆" : "🏏"}
            </motion.div>

            <h2
              className="font-display font-black mb-1"
              style={{
                fontSize: "clamp(1.75rem, 7vw, 2.5rem)",
                background: amIWinner
                  ? "linear-gradient(135deg, #FACC15, #F59E0B)"
                  : "linear-gradient(135deg, #E2E8F0, #94A3B8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {amIWinner ? "Victory!" : `${gameOver.winner.username} Wins!`}
            </h2>

            {!amIWinner && (
              <p className="text-slate-400 text-sm">
                You finished {myRank}{rankSuffix(myRank)} with{" "}
                <span className="text-white font-semibold">{gameOver.scores[userId] ?? 0}</span> points
              </p>
            )}
          </motion.div>

          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Rounds", value: gameOver.totalRounds, icon: "🔄" },
              { label: "Your Score", value: gameOver.scores[userId] ?? 0, icon: "⭐" },
              { label: "Your Rank", value: `${myRank}${rankSuffix(myRank)}`, icon: "🏅" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="text-center p-4 rounded-2xl"
                style={{
                  background: "rgba(30,41,59,0.5)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="font-display font-black text-2xl text-white">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Final rankings */}
          <div
            className="rounded-2xl overflow-hidden mb-6"
            style={{
              background: "rgba(30,41,59,0.5)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="px-5 py-3 border-b border-white/5">
              <span className="font-display font-semibold text-white text-sm">Final Rankings</span>
            </div>
            <div className="p-3 space-y-2">
              <AnimatePresence>
                {gameOver.finalRanking.map((player, i) => {
                  const isMe = player.userId === userId;
                  const isMVP = gameOver.mvp?.userId === player.userId;
                  return (
                    <motion.div
                      key={player.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{
                        background: i === 0
                          ? "rgba(245,158,11,0.12)"
                          : isMe
                          ? "rgba(37,99,235,0.1)"
                          : "rgba(255,255,255,0.025)",
                        border: `1px solid ${i === 0 ? "rgba(245,158,11,0.3)" : isMe ? "rgba(37,99,235,0.25)" : "rgba(255,255,255,0.04)"}`,
                        boxShadow: i === 0 ? "0 0 16px rgba(245,158,11,0.1)" : "none",
                      }}
                    >
                      <span className="text-xl w-8 text-center flex-shrink-0">{medalFor(i + 1)}</span>

                      <div className="flex-1 min-w-0">
                        <span className={`font-medium text-sm ${isMe ? "text-blue-300" : "text-white"}`}>
                          {player.username}{isMe && " (You)"}
                        </span>
                        {isMVP && (
                          <span
                            className="ml-2 text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}
                          >
                            MVP
                          </span>
                        )}
                      </div>

                      <span className="font-display font-bold text-lg text-white flex-shrink-0">
                        {player.score}
                      </span>
                      <span className="text-xs text-slate-500 flex-shrink-0">pts</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="ghost" size="md" className="flex-1" onClick={() => navigate("/leaderboard")}>
              Leaderboard 🏆
            </Button>
            <Button
              variant="gold"
              size="md"
              className="flex-1"
              onClick={() => { reset(); navigate("/menu"); }}
            >
              Play Again 🏏
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
