import { motion } from "framer-motion";
import { PlayerCard as CardType, STAT_LABELS, STAT_ICONS } from "../../types";

export type CardSize = "full" | "compact" | "mini";

interface PlayerCardProps {
  card: CardType;
  selectedStats: string[];
  statLabels?: Record<string, string>;
  isWinner?: boolean;
  winnerStat?: string;
  isRevealed?: boolean;
  size?: CardSize;
  playerName?: string;
  dealDelay?: number;
  className?: string;
}

const CFG: Record<CardSize, { imgH: string; nameSize: string; statH: string; statText: string; valText: string; px: string; }> = {
  full:    { imgH: "h-44",   nameSize: "text-lg",   statH: "h-8",   statText: "text-xs",      valText: "text-sm",   px: "px-4" },
  compact: { imgH: "h-32",   nameSize: "text-base", statH: "h-7",   statText: "text-[11px]",  valText: "text-xs",   px: "px-3" },
  mini:    { imgH: "h-[88px]",nameSize: "text-sm",  statH: "h-6",   statText: "text-[10px]",  valText: "text-[11px]",px: "px-2.5" },
};

export function PlayerCard({
  card, selectedStats, statLabels, isWinner = false, winnerStat,
  isRevealed = false, size = "full", playerName, dealDelay = 0, className = "",
}: PlayerCardProps) {
  const cfg = CFG[size];
  const labels = statLabels || STAT_LABELS;

  const fmt = (key: string, v: number | string): string => {
    if (typeof v === "string") return v || "—";
    if (v === 0 && key !== "totalRuns") return "—";
    if (["battingAverage","bowlingAverage","economy","strikeRate"].includes(key))
      return v.toFixed(2);
    return String(v);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 24, delay: dealDelay }}
      className={`relative flex flex-col rounded-2xl overflow-hidden h-full no-select ${className}`}
      style={{
        /* Gradient border via outline wrapper */
        background: `linear-gradient(160deg, ${card.teamColor}22 0%, #111827 50%, #0B1220 100%)`,
        boxShadow: isWinner
          ? `0 0 0 2px #F59E0B, 0 0 32px rgba(245,158,11,0.5), 0 12px 40px rgba(0,0,0,0.7)`
          : `0 0 0 1px ${card.teamColor}44, 0 12px 40px rgba(0,0,0,0.6)`,
      }}
    >
      {/* Winner pulse ring */}
      {isWinner && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none z-20"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ boxShadow: "inset 0 0 24px rgba(245,158,11,0.3)", border: "2px solid rgba(245,158,11,0.8)" }}
        />
      )}

      {/* ── Team colour header stripe ── */}
      <div
        className="h-1.5 flex-shrink-0 w-full"
        style={{ background: `linear-gradient(90deg, ${card.teamColor}, ${card.teamColor}44, transparent)` }}
      />

      {/* ── Badge row ── */}
      <div className={`flex items-center justify-between ${cfg.px} pt-2 pb-1 flex-shrink-0`}>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
          style={{ background: `${card.teamColor}25`, color: card.teamColor, border: `1px solid ${card.teamColor}44` }}
        >
          {card.teamShort}
        </span>
        <span className="text-[10px] text-slate-500 font-medium">{card.role}</span>
        <span className="text-sm">{getFlag(card.nationality)}</span>
      </div>

      {/* ── Player image area ── */}
      <div className={`relative ${cfg.imgH} flex-shrink-0 flex justify-center overflow-hidden`}>
        {/* Radial team-color glow behind player */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 80%, ${card.teamColor}28 0%, transparent 70%)`,
          }}
        />
        <img
          src={card.image}
          alt={card.name}
          className="relative z-10 h-full object-contain"
          style={{ filter: `drop-shadow(0 4px 12px ${card.teamColor}55)` }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://ui-avatars.com/api/?name=${encodeURIComponent(card.name)}&background=${card.teamColor.replace("#","")}&color=fff&size=200&bold=true&format=svg`;
          }}
        />
        {/* Bottom fade into name plate */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2"
          style={{
            background: `linear-gradient(to top, ${card.teamColor}18 0%, transparent 100%)`,
          }}
        />
      </div>

      {/* ── Name plate ── */}
      <div className={`${cfg.px} py-1.5 flex-shrink-0 border-b border-white/5`}>
        {playerName && <div className="text-[10px] text-slate-500 leading-none mb-0.5">{playerName}</div>}
        <div
          className={`font-display font-bold leading-tight text-white ${cfg.nameSize}`}
          style={{ textShadow: `0 0 20px ${card.teamColor}66` }}
        >
          {card.name}
        </div>
        <div className="text-[10px] leading-tight" style={{ color: `${card.teamColor}cc` }}>
          {card.team}
        </div>
      </div>

      {/* ── Stats list ── */}
      <div className={`${cfg.px} py-1.5 flex-1 flex flex-col justify-around gap-0.5`}>
        {selectedStats.slice(0, 6).map((key) => {
          const val = fmt(key, card.stats[key] as number | string);
          const isWin = isRevealed && winnerStat === key;

          return (
            <div
              key={key}
              className={`flex items-center justify-between rounded-lg px-2 ${cfg.statH} stat-row`}
              style={{
                background: isWin ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${isWin ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.04)"}`,
              }}
            >
              <span className={`flex items-center gap-1 text-slate-400 ${cfg.statText}`}>
                <span className="text-sm leading-none">{STAT_ICONS[key] || "📌"}</span>
                <span>{labels[key] || key}</span>
              </span>
              <span
                className={`font-display font-bold ${cfg.valText}`}
                style={{ color: isWin ? "#FACC15" : "white" }}
              >
                {val}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function getFlag(n: string): string {
  const m: Record<string, string> = {
    India:"🇮🇳",Australia:"🇦🇺",England:"🏴󠁧󠁢󠁥󠁮󠁧󠁿","South Africa":"🇿🇦",
    "New Zealand":"🇳🇿",Afghanistan:"🇦🇫",Pakistan:"🇵🇰","Sri Lanka":"🇱🇰","West Indies":"🏝️",
  };
  return m[n] || "🌍";
}
