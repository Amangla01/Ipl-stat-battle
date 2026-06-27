import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import { useSocketEvents } from "../../hooks/useSocket";

const EMOJIS = ["🔥", "👏", "😱", "🎉", "💪", "🤣", "😤", "🏏"];

export function EmojiReactions() {
  const reactions = useGameStore((s) => s.emojiReactions);
  const { room } = useGameStore();
  const { sendEmoji } = useSocketEvents();

  return (
    <>
      {/* Floating reactions */}
      <div className="fixed right-4 bottom-32 flex flex-col-reverse gap-2 pointer-events-none z-40">
        <AnimatePresence>
          {reactions.slice(-5).map((r) => {
            const player = room?.players.find((p) => p.userId === r.userId);
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: 60, scale: 0.5 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, y: -40, scale: 1.5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full"
              >
                <span className="text-xs text-gray-300">{player?.username || "?"}</span>
                <span className="text-xl">{r.emoji}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Emoji picker */}
      <div
        className="fixed right-4 bottom-4 flex gap-1.5 p-2 rounded-2xl z-40"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {EMOJIS.map((emoji) => (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => sendEmoji(emoji)}
            className="text-xl w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
          >
            {emoji}
          </motion.button>
        ))}
      </div>
    </>
  );
}
