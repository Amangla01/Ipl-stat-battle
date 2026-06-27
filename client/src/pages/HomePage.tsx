import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/common/Button";
import { GameBackground } from "../components/Background";
import { useGameStore } from "../store/gameStore";
import { getSocket } from "../socket/socketClient";

const FEATURES = [
  { icon: "👥", label: "2–6 Players" },
  { icon: "📊", label: "Real IPL Stats" },
  { icon: "⚡", label: "Live Multiplayer" },
  { icon: "🏆", label: "Daily Challenges" },
];

export function HomePage() {
  const navigate = useNavigate();
  const { setIdentity, username } = useGameStore();
  const [name, setName] = useState(username || "");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    if (socket.connected) setConnected(true);
    return () => { socket.off("connect"); socket.off("disconnect"); };
  }, []);

  const handleEnter = () => {
    if (!name.trim()) return;
    const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setIdentity(userId, name.trim());
    navigate("/menu");
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <GameBackground />

      <div className="relative z-10 flex flex-col items-center px-6 w-full max-w-lg text-center">
        {/* Floating trophy */}
        <motion.div
          animate={{ y: [-10, 0, -10] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="mb-6"
          style={{ filter: "drop-shadow(0 0 32px rgba(245,158,11,0.5))" }}
        >
          <span style={{ fontSize: "clamp(3.5rem, 12vw, 5.5rem)" }}>🏆</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display font-black mb-3 leading-none"
          style={{
            fontSize: "clamp(2.2rem, 9vw, 4rem)",
            background: "linear-gradient(135deg, #FACC15 0%, #F59E0B 40%, #FACC15 100%)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "none",
            animation: "shimmer 3s linear infinite",
          }}
        >
          IPL STAT BATTLE
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-base mb-10 font-body"
        >
          The ultimate multiplayer cricket card game
        </motion.p>

        {/* Input card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="w-full rounded-2xl p-6 mb-6"
          style={{
            background: "rgba(30,41,59,0.6)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)",
          }}
        >
          <label className="block text-sm text-slate-400 font-medium mb-2 text-left">
            Enter your battle name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEnter()}
            placeholder="Your cricket alias…"
            maxLength={20}
            autoFocus
            className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 outline-none text-base font-medium transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${name.trim() ? "rgba(37,99,235,0.5)" : "rgba(255,255,255,0.08)"}`,
              caretColor: "#3B82F6",
              boxShadow: name.trim() ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
            }}
          />
          <Button variant="gold" size="lg" fullWidth className="mt-4" onClick={handleEnter} disabled={!name.trim()}>
            Enter the Arena 🏏
          </Button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-6"
        >
          {FEATURES.map((f) => (
            <span
              key={f.label}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full text-slate-400"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </span>
          ))}
        </motion.div>

        {/* Connection dot */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center gap-2 text-xs text-slate-600"
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            animate={connected ? { opacity: [0.5, 1, 0.5] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ background: connected ? "#22C55E" : "#EF4444", boxShadow: connected ? "0 0 6px #22C55E" : "none" }}
          />
          <span>{connected ? "Server connected" : "Connecting…"}</span>
        </motion.div>
      </div>
    </div>
  );
}
