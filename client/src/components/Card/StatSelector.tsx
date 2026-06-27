import { motion } from "framer-motion";
import { PlayerCard as CardType, STAT_LABELS, STAT_ICONS } from "../../types";

interface StatSelectorProps {
  selectedStats: string[];
  statLabels?: Record<string, string>;
  myCard: CardType | null;
  selectedStat: string | null;
  winnerStat?: string;
  isMyTurn: boolean;
  phase: string;
  onSelect: (stat: string) => void;
}

export function StatSelector({
  selectedStats, statLabels, myCard, selectedStat,
  winnerStat, isMyTurn, phase, onSelect,
}: StatSelectorProps) {
  const labels = statLabels || STAT_LABELS;
  const canPick = isMyTurn && phase === "selecting" && !selectedStat;

  const fmt = (key: string, v: number | string | undefined): string => {
    if (v === undefined || v === null) return "—";
    if (typeof v === "string") return v || "—";
    if (v === 0 && key !== "totalRuns") return "—";
    if (["battingAverage","bowlingAverage","economy","strikeRate"].includes(key)) return (v as number).toFixed(2);
    return String(v);
  };

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap px-2">
      {selectedStats.slice(0, 6).map((key, i) => {
        const val = myCard ? fmt(key, myCard.stats[key] as number | string) : "?";
        const isSelected = selectedStat === key;
        const isWin = winnerStat === key;
        const isActive = canPick;

        return (
          <motion.button
            key={key}
            onClick={() => isActive && onSelect(key)}
            disabled={!isActive}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 24 }}
            whileHover={isActive ? { scale: 1.06, y: -3 } : {}}
            whileTap={isActive ? { scale: 0.95 } : {}}
            className="relative flex flex-col items-center gap-0.5 rounded-2xl transition-all duration-200"
            style={{
              minWidth: 72, maxWidth: 100,
              padding: "8px 10px",
              cursor: isActive ? "pointer" : "default",
              background: isWin
                ? "rgba(245,158,11,0.18)"
                : isSelected
                ? "rgba(37,99,235,0.22)"
                : isActive
                ? "rgba(255,255,255,0.06)"
                : "rgba(255,255,255,0.03)",
              border: isWin
                ? "1px solid rgba(245,158,11,0.6)"
                : isSelected
                ? "1px solid rgba(37,99,235,0.7)"
                : isActive
                ? "1px solid rgba(255,255,255,0.12)"
                : "1px solid rgba(255,255,255,0.05)",
              boxShadow: isWin
                ? "0 0 16px rgba(245,158,11,0.35), inset 0 0 12px rgba(245,158,11,0.1)"
                : isSelected
                ? "0 0 16px rgba(37,99,235,0.4), inset 0 0 12px rgba(37,99,235,0.1)"
                : isActive
                ? "0 4px 16px rgba(0,0,0,0.3)"
                : "none",
            }}
          >
            {/* Glow ring for active */}
            {isActive && !isSelected && !isWin && (
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ border: "1px solid rgba(37,99,235,0.3)", boxShadow: "inset 0 0 8px rgba(37,99,235,0.05)" }}
              />
            )}

            <span className="text-xl leading-none">
              {STAT_ICONS[key] || "📌"}
            </span>
            <span className="text-[10px] text-slate-400 font-medium leading-tight text-center">
              {labels[key] || key}
            </span>
            <span
              className="font-display font-bold text-sm leading-tight"
              style={{
                color: isWin ? "#FACC15" : isSelected ? "#60A5FA" : isActive ? "white" : "#64748B",
              }}
            >
              {val}
            </span>

            {isWin && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 text-sm bg-amber-400 rounded-full w-4 h-4 flex items-center justify-center text-black font-bold text-[9px]"
              >
                ★
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
