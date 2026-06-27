import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../../store/gameStore";
import { backgroundMusic } from "../../hooks/useBackgroundMusic";

interface HeaderProps {
  showBack?: boolean;
  title?: string;
}

export function Header({ showBack = false, title }: HeaderProps) {
  const navigate = useNavigate();
  const { username, roomCode, phase } = useGameStore();
  const [muted, setMuted] = useState(() => backgroundMusic.isMuted());

  const handleMuteToggle = () => {
    const nowMuted = backgroundMusic.toggleMute();
    setMuted(nowMuted);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center px-4 py-3"
      style={{
        background: "rgba(11,18,32,0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {showBack && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white mr-3 text-xl"
        >
          ←
        </motion.button>
      )}

      <div className="flex items-center gap-2">
        <span className="text-2xl">🏏</span>
        <span
          className="font-display font-bold text-lg"
          style={{ background: "linear-gradient(135deg, #FFD700, #FF6B00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          {title || "IPL STAT BATTLE"}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {roomCode && phase !== "idle" && (
          <div
            className="text-xs px-3 py-1 rounded-full font-bold text-yellow-400 tracking-widest"
            style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.2)" }}
          >
            #{roomCode}
          </div>
        )}
        {username && (
          <div
            className="flex items-center gap-2 text-sm text-gray-300 px-3 py-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <span className="text-base">👤</span>
            <span className="font-medium hidden sm:block">{username}</span>
          </div>
        )}

        {/* Music toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleMuteToggle}
          title={muted ? "Unmute music" : "Mute music"}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          style={{
            background: muted ? "rgba(255,255,255,0.05)" : "rgba(37,99,235,0.15)",
            border: `1px solid ${muted ? "rgba(255,255,255,0.08)" : "rgba(37,99,235,0.35)"}`,
          }}
        >
          <span className="text-base leading-none">{muted ? "🔇" : "🎵"}</span>
        </motion.button>
      </div>
    </header>
  );
}
