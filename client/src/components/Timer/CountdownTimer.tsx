import { motion } from "framer-motion";
import { useGameStore } from "../../store/gameStore";

interface CountdownTimerProps {
  total: number;
  isMyTurn: boolean;
}

export function CountdownTimer({ total, isMyTurn }: CountdownTimerProps) {
  const timer = useGameStore((s) => s.timer);
  const pct = total > 0 ? timer / total : 0;
  const isUrgent = timer <= 5 && timer > 0;
  const isDanger = timer <= 3 && timer > 0;

  const color = isDanger ? "#EF4444" : isUrgent ? "#F59E0B" : isMyTurn ? "#3B82F6" : "#475569";
  const size = 54;
  const stroke = 4;
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        animate={isDanger ? { scale: [1, 1.08, 1] } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="relative"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          <motion.circle
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
            style={{ filter: `drop-shadow(0 0 ${isUrgent ? 6 : 3}px ${color})` }}
            transition={{ duration: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            key={timer}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="font-display font-bold"
            style={{ fontSize: "1.05rem", color }}
          >
            {timer}
          </motion.span>
        </div>
      </motion.div>
      <span
        className="text-[9px] font-semibold uppercase tracking-wider text-center"
        style={{ color: isMyTurn ? "#3B82F6" : "#475569" }}
      >
        {isMyTurn ? "⚡ Pick!" : "Wait…"}
      </span>
    </div>
  );
}
