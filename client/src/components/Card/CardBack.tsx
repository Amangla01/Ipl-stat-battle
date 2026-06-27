import { motion } from "framer-motion";

interface CardBackProps {
  username?: string;
  avatar?: string;
  delay?: number;
}

export function CardBack({ username, avatar, delay = 0 }: CardBackProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -40, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay }}
      className="w-56 rounded-2xl overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, #1A1A3E 0%, #0F0F2E 100%)",
        border: "1px solid rgba(255,215,0,0.2)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        minHeight: "320px",
      }}
    >
      <div
        className="h-1.5 w-full"
        style={{ background: "linear-gradient(90deg, #FFD700, #FF6B00, #FFD700)" }}
      />

      <div className="flex flex-col items-center justify-center h-full py-8 gap-4">
        {/* IPL Logo style */}
        <div className="text-5xl">🏏</div>
        <div
          className="font-display font-bold text-lg text-center px-4"
          style={{ color: "#FFD700" }}
        >
          IPL STAT BATTLE
        </div>

        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />

        {/* Diamond pattern */}
        <div className="grid grid-cols-4 gap-1 opacity-20">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rotate-45"
              style={{ background: i % 2 === 0 ? "#FFD700" : "#FF6B00" }}
            />
          ))}
        </div>

        {username && (
          <div className="flex flex-col items-center gap-2 mt-2">
            {avatar && (
              <img
                src={avatar}
                alt={username}
                className="w-10 h-10 rounded-full border-2 border-yellow-400/50"
              />
            )}
            <span className="text-gray-300 text-sm font-medium">{username}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
