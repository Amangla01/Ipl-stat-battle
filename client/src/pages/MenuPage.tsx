import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GameBackground } from "../components/Background";
import { Header } from "../components/Layout/Header";
import { useGameStore } from "../store/gameStore";

const MODES = [
  {
    id: "create",
    icon: "🎮",
    title: "Create Room",
    desc: "Host a private match with friends",
    color: "#3B82F6",
    glow: "rgba(37,99,235,0.35)",
    path: "/create",
  },
  {
    id: "join",
    icon: "🚪",
    title: "Join Room",
    desc: "Enter a room code to join a match",
    color: "#22C55E",
    glow: "rgba(34,197,94,0.3)",
    path: "/join",
  },
  {
    id: "leaderboard",
    icon: "🏆",
    title: "Leaderboard",
    desc: "See the top players globally",
    color: "#F59E0B",
    glow: "rgba(245,158,11,0.35)",
    path: "/leaderboard",
  },
  {
    id: "daily",
    icon: "📅",
    title: "Daily Challenge",
    desc: "Today's special challenge mode",
    color: "#A855F7",
    glow: "rgba(168,85,247,0.3)",
    path: "/create?mode=daily",
  },
];

export function MenuPage() {
  const navigate = useNavigate();
  const { username } = useGameStore();

  if (!username) { navigate("/"); return null; }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GameBackground />
      <Header />

      <div className="relative z-10 pt-20 flex flex-col items-center justify-center min-h-screen px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Welcome */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="text-5xl mb-4"
              style={{ filter: "drop-shadow(0 0 20px rgba(245,158,11,0.4))" }}
            >
              🏏
            </motion.div>
            <h2 className="font-display font-bold text-2xl text-white">
              Welcome back,
            </h2>
            <h2
              className="font-display font-black text-3xl mt-0.5"
              style={{ background: "linear-gradient(90deg,#FACC15,#F59E0B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              {username}!
            </h2>
          </div>

          {/* Mode cards */}
          <div className="flex flex-col gap-3">
            {MODES.map((mode, i) => (
              <motion.button
                key={mode.id}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08, type: "spring", stiffness: 260, damping: 22 }}
                whileHover={{ scale: 1.025, x: 6 }}
                whileTap={{ scale: 0.975 }}
                onClick={() => navigate(mode.path)}
                className="relative flex items-center gap-4 p-4 rounded-2xl text-left overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${mode.color}18 0%, ${mode.color}06 100%)`,
                  border: `1px solid ${mode.color}30`,
                  boxShadow: `0 4px 20px rgba(0,0,0,0.3)`,
                }}
              >
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{
                    background: `${mode.color}20`,
                    border: `1px solid ${mode.color}30`,
                    boxShadow: `0 0 20px ${mode.glow}`,
                  }}
                >
                  {mode.icon}
                </div>

                {/* Text */}
                <div className="flex-1">
                  <div className="font-display font-bold text-base text-white">{mode.title}</div>
                  <div className="text-sm text-slate-400 mt-0.5">{mode.desc}</div>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 text-slate-600 text-lg">›</div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
