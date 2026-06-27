import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { GameBackground } from "../components/Background";
import { Header } from "../components/Layout/Header";
import { useSocketEvents } from "../hooks/useSocket";
import { useGameStore } from "../store/gameStore";

export function JoinRoomPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { joinRoom } = useSocketEvents();
  const { username } = useGameStore();

  if (!username) { navigate("/"); return null; }

  const handleJoin = () => {
    if (code.trim().length < 4) return;
    setLoading(true);
    joinRoom(code.trim().toUpperCase());
    setTimeout(() => setLoading(false), 3000);
  };

  const handleInput = (val: string) => {
    setCode(val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6));
  };

  const isReady = code.length >= 4;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GameBackground />
      <Header showBack title="Join Room" />

      <div className="relative z-10 pt-20 flex flex-col items-center justify-center min-h-screen px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ y: [-6, 0, -6] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-5xl mb-3"
              style={{ filter: "drop-shadow(0 0 20px rgba(34,197,94,0.4))" }}
            >
              🚪
            </motion.div>
            <h2 className="font-display font-bold text-2xl text-white">Join a Room</h2>
            <p className="text-slate-400 mt-1 text-sm">Enter the 4–6 character room code</p>
          </div>

          {/* Code input card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl p-6 mb-6"
            style={{
              background: "rgba(30,41,59,0.6)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
            }}
          >
            <label className="block text-sm text-slate-400 font-medium mb-3">Room Code</label>

            <input
              type="text"
              value={code}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              placeholder="ABCDE1"
              maxLength={6}
              autoFocus
              className="w-full text-center font-display font-bold tracking-widest py-4 px-4 rounded-xl outline-none transition-all"
              style={{
                fontSize: "clamp(1.5rem, 8vw, 2.25rem)",
                background: "rgba(255,255,255,0.05)",
                border: `2px solid ${isReady ? "rgba(245,158,11,0.6)" : "rgba(255,255,255,0.08)"}`,
                color: isReady ? "#FACC15" : "white",
                caretColor: "#FACC15",
                boxShadow: isReady ? "0 0 0 4px rgba(245,158,11,0.1), 0 0 20px rgba(245,158,11,0.15)" : "none",
              }}
            />

            {/* Segment indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ scaleX: i < code.length ? 1 : 0.8, opacity: i < code.length ? 1 : 0.3 }}
                  className="h-1 rounded-full flex-1"
                  style={{ background: i < code.length ? "#F59E0B" : "rgba(255,255,255,0.1)" }}
                />
              ))}
            </div>
          </motion.div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleJoin}
            loading={loading}
            disabled={!isReady}
          >
            Join Room →
          </Button>

          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/create")}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Don't have a code? Create a room instead
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
