import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/common/Button";
import { GameBackground } from "../components/Background";
import { Header } from "../components/Layout/Header";
import { useSocketEvents } from "../hooks/useSocket";
import { useGameStore } from "../store/gameStore";

type GameMode = "normal" | "lightning" | "daily";

const MODES: { id: GameMode; icon: string; title: string; desc: string; timer: string; color: string }[] = [
  { id: "normal",    icon: "🏏", title: "Normal Mode",     desc: "15 seconds per turn — strategic play",    timer: "15s", color: "#3B82F6" },
  { id: "lightning", icon: "⚡", title: "Lightning Mode",  desc: "10 seconds — think fast, react faster!",  timer: "10s", color: "#F59E0B" },
  { id: "daily",     icon: "📅", title: "Daily Challenge", desc: "Special daily card set for everyone",      timer: "15s", color: "#A855F7" },
];

const ROUND_OPTIONS: { label: string; value: number; icon: string; desc: string }[] = [
  { label: "15 Rounds",   value: 15,   icon: "⚡", desc: "Quick match (~5 min)" },
  { label: "30 Rounds",   value: 30,   icon: "🏏", desc: "Standard game (~10 min)" },
  { label: "50 Rounds",   value: 50,   icon: "🔥", desc: "Long battle (~15 min)" },
  { label: "Unlimited",   value: 999,  icon: "♾️", desc: "Play until cards run out" },
];

export function CreateRoomPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultMode = (searchParams.get("mode") as GameMode) || "normal";
  const [selectedMode, setSelectedMode] = useState<GameMode>(defaultMode);
  const [selectedRounds, setSelectedRounds] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const { createRoom } = useSocketEvents();
  const { username } = useGameStore();

  if (!username) { navigate("/"); return null; }

  const handleCreate = () => {
    setLoading(true);
    createRoom(selectedMode, selectedRounds);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GameBackground />
      <Header showBack title="Create Room" />

      <div className="relative z-10 pt-20 flex flex-col items-center justify-center min-h-screen px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              animate={{ y: [-6, 0, -6] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-5xl mb-3"
              style={{ filter: "drop-shadow(0 0 20px rgba(37,99,235,0.4))" }}
            >
              🎮
            </motion.div>
            <h2 className="font-display font-bold text-2xl text-white">Create New Room</h2>
            <p className="text-slate-400 mt-1 text-sm">Choose your settings</p>
          </div>

          {/* Game mode */}
          <div className="mb-5">
            <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2 px-1">Game Mode</div>
            <div className="space-y-2">
              {MODES.map((mode, i) => {
                const isSelected = selectedMode === mode.id;
                return (
                  <motion.button
                    key={mode.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => setSelectedMode(mode.id)}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                    style={{
                      background: isSelected ? `${mode.color}18` : "rgba(30,41,59,0.5)",
                      border: `2px solid ${isSelected ? `${mode.color}55` : "rgba(255,255,255,0.06)"}`,
                      backdropFilter: "blur(12px)",
                      boxShadow: isSelected ? `0 0 16px ${mode.color}20` : "none",
                    }}
                  >
                    <div
                      className="text-xl w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${mode.color}20`, border: `1px solid ${mode.color}30` }}
                    >
                      {mode.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-white text-sm">{mode.title}</div>
                      <div className="text-xs text-slate-400">{mode.desc}</div>
                    </div>
                    <div
                      className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: isSelected ? `${mode.color}25` : "rgba(255,255,255,0.05)",
                        color: isSelected ? mode.color : "#64748B",
                      }}
                    >
                      {mode.timer}
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="text-sm flex-shrink-0 ml-1" style={{ color: mode.color }}
                      >✓</motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Round count */}
          <div className="mb-6">
            <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2 px-1">Number of Rounds</div>
            <div className="grid grid-cols-2 gap-2">
              {ROUND_OPTIONS.map((opt, i) => {
                const isSelected = selectedRounds === opt.value;
                return (
                  <motion.button
                    key={opt.value}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.06 }}
                    onClick={() => setSelectedRounds(opt.value)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl text-center transition-all"
                    style={{
                      background: isSelected ? "rgba(37,99,235,0.18)" : "rgba(30,41,59,0.5)",
                      border: `2px solid ${isSelected ? "rgba(37,99,235,0.55)" : "rgba(255,255,255,0.06)"}`,
                      backdropFilter: "blur(12px)",
                      boxShadow: isSelected ? "0 0 16px rgba(37,99,235,0.2)" : "none",
                    }}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    <span className="font-display font-bold text-sm" style={{ color: isSelected ? "#93C5FD" : "white" }}>
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-slate-500">{opt.desc}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Info */}
          <div
            className="rounded-xl p-3 mb-5 text-xs text-slate-400"
            style={{ background: "rgba(30,41,59,0.5)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span>ℹ️</span>
              <span className="font-medium text-slate-300">Game Info</span>
            </div>
            <ul className="space-y-1">
              <li className="flex items-center gap-1.5"><span className="text-blue-400">•</span> 2–4 players per room</li>
              <li className="flex items-center gap-1.5"><span className="text-blue-400">•</span> Random IPL player cards every round</li>
              <li className="flex items-center gap-1.5"><span className="text-blue-400">•</span> Total Runs &amp; Wickets always available + 4 random stats</li>
              <li className="flex items-center gap-1.5"><span className="text-blue-400">•</span> Turn rotates after every round</li>
            </ul>
          </div>

          <Button variant="gold" size="lg" fullWidth onClick={handleCreate} loading={loading}>
            Create Room 🚀
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
