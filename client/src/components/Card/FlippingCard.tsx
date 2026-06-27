import { motion } from "framer-motion";
import { PlayerCard } from "./PlayerCard";
import { PlayerCard as CardType } from "../../types";

interface FlippingCardProps {
  card?: CardType;
  isRevealed: boolean;
  selectedStats: string[];
  statLabels?: Record<string, string>;
  isWinner?: boolean;
  winnerStat?: string;
  playerName: string;
  avatar?: string;
  flipDelay?: number;
  size?: "full" | "compact" | "mini";
}

export function FlippingCard({
  card, isRevealed, selectedStats, statLabels,
  isWinner = false, winnerStat, playerName, avatar,
  flipDelay = 0, size = "compact",
}: FlippingCardProps) {
  const shouldFlip = isRevealed && !!card;

  return (
    <div className="h-full perspective-1000">
      <motion.div
        animate={{ rotateY: shouldFlip ? 180 : 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: shouldFlip ? flipDelay : 0 }}
        style={{ transformStyle: "preserve-3d", position: "relative", width: "100%", height: "100%" }}
      >
        {/* FRONT — card back */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-2"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: "linear-gradient(160deg, #1E293B 0%, #111827 60%, #0B1220 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}
        >
          <div className="h-1 w-full absolute top-0" style={{ background: "linear-gradient(90deg,#2563EB,#F59E0B,#2563EB)" }} />

          {/* Logo */}
          <motion.div
            animate={{ y: [-4, 0, -4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-4xl"
          >
            🏏
          </motion.div>
          <div className="font-display font-bold text-xs text-center text-gradient-gold px-2">
            IPL STAT BATTLE
          </div>

          {/* Diamond grid */}
          <div className="grid grid-cols-3 gap-1 opacity-10">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rotate-45" style={{ background: i % 2 ? "#2563EB" : "#F59E0B" }} />
            ))}
          </div>

          {/* Player avatar */}
          {avatar && (
            <img
              src={avatar}
              alt={playerName}
              className="w-9 h-9 rounded-full border-2 border-blue-500/40"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <div className="text-xs text-slate-400 font-medium text-center px-2 leading-tight">
            {playerName}
          </div>
        </div>

        {/* BACK — player card (rotated so it shows after flip) */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {card && (
            <PlayerCard
              card={card}
              selectedStats={selectedStats}
              statLabels={statLabels}
              isRevealed
              isWinner={isWinner}
              winnerStat={winnerStat}
              size={size}
              playerName={playerName}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
