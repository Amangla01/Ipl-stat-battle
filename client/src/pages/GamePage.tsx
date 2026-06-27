import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PlayerCard } from "../components/Card/PlayerCard";
import { FlippingCard } from "../components/Card/FlippingCard";
import { CountdownTimer } from "../components/Timer/CountdownTimer";
import { LiveScoreboard } from "../components/Scoreboard/LiveScoreboard";
import { StatSelector } from "../components/Card/StatSelector";
import { GameBackground } from "../components/Background";
import { Confetti } from "../components/animations/Confetti";
import { useSocketEvents } from "../hooks/useSocket";
import { useGameStore } from "../store/gameStore";

const EMOJIS = ["🔥", "👏", "😱", "🎉", "💪", "🤣", "😤", "🏏"];

export function GamePage() {
  const navigate = useNavigate();
  const { selectStat, sendEmoji } = useSocketEvents();
  const store = useGameStore();
  const { room, myCard, roundState, revealState, roundResult, phase, userId, username, timer } = store;

  useEffect(() => {
    if (!username) { navigate("/"); return; }
    if (phase === "finished") navigate(`/result/${room?.roomCode || "end"}`);
  }, [phase, username]);

  if (!room || !username) return null;

  const isMyTurn = roundState?.currentTurnPlayerId === userId;
  const iAmWinner = roundResult?.winners.includes(userId) ?? false;
  const iAmRevealWinner = revealState?.winners?.includes(userId) ?? false;
  const otherPlayers = room.players.filter((p) => p.userId !== userId);

  return (
    <div className="relative flex flex-col" style={{ height: "100dvh", overflow: "hidden" }}>
      <GameBackground />
      <Confetti trigger={!!roundResult && iAmWinner} />

      {/* ── TOP BAR ─────────────────────────────────────────────────── */}
      <div
        className="relative z-10 flex-shrink-0 flex items-center gap-2 px-3"
        style={{
          height: 52,
          background: "rgba(11,18,32,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-lg">🏏</span>
          <span
            className="font-display font-bold text-xs hidden sm:block"
            style={{ background: "linear-gradient(90deg,#F59E0B,#FACC15)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            IPL STAT BATTLE
          </span>
        </div>

        {/* Room code */}
        <div
          className="flex-shrink-0 text-xs font-bold tracking-widest px-2 py-0.5 rounded-full"
          style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.25)" }}
        >
          #{room.roomCode}
        </div>

        {/* Round */}
        <div className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Round</span>
          <span className="font-display font-bold text-white text-sm">{roundState?.roundNumber ?? room.currentRound ?? "—"}</span>
        </div>

        {/* Result badge */}
        <AnimatePresence mode="wait">
          {roundResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold"
              style={{
                background: iAmWinner ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.07)",
                color: iAmWinner ? "#FACC15" : "#94A3B8",
                border: `1px solid ${iAmWinner ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.1)"}`,
                boxShadow: iAmWinner ? "0 0 10px rgba(245,158,11,0.25)" : "none",
              }}
            >
              {iAmWinner ? "🎉 You Won!" : `🏆 ${roundResult.winners.map((id) => roundResult.playerNames[id]).join(", ")} Wins`}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spacer */}
        <div className="flex-1 min-w-0" />

        {/* Scores inline */}
        <div className="flex-shrink-0 min-w-0" style={{ maxWidth: 360 }}>
          <LiveScoreboard players={room.players} compact />
        </div>

        {/* Timer */}
        {(phase === "selecting" || phase === "revealing") && roundState && (
          <div className="flex-shrink-0">
            <CountdownTimer total={roundState.timerDuration} isMyTurn={isMyTurn} />
          </div>
        )}
      </div>

      {/* ── MIDDLE: CARDS ──────────────────────────────────────────────── */}
      {(() => {
        const playerCount = 1 + otherPlayers.length;
        // Layout classes per player count
        const containerClass =
          playerCount === 2
            ? "relative z-10 flex-1 min-h-0 flex items-center justify-center px-4 py-2 gap-3 overflow-hidden"
            : playerCount === 3
            ? "relative z-10 flex-1 min-h-0 flex items-stretch px-1.5 py-2 gap-1.5 overflow-hidden"
            : "relative z-10 flex-1 min-h-0 grid grid-cols-2 auto-rows-fr px-2 py-2 gap-2 overflow-hidden";

        const colClass =
          playerCount === 2
            ? "flex flex-col gap-1 w-full max-w-[260px]"
            : "flex flex-col gap-1 min-w-0 min-h-0";

        const allCols = [
          // "Me" column
          <div key="me" className={colClass}>
            <span className="text-[9px] text-blue-400 uppercase tracking-widest font-bold text-center flex-shrink-0">You</span>
            <div className="flex-1 min-h-0">
              <AnimatePresence mode="wait">
                {myCard && roundState ? (
                  <PlayerCard
                    key={myCard._id}
                    card={myCard}
                    selectedStats={roundState.selectedStats}
                    statLabels={roundState.statLabels}
                    isRevealed={phase === "revealing" || phase === "result"}
                    isWinner={(iAmWinner || iAmRevealWinner) && (phase === "revealing" || phase === "result")}
                    winnerStat={revealState?.selectedStat}
                    size="compact"
                    dealDelay={0}
                  />
                ) : (
                  <DealingPlaceholder />
                )}
              </AnimatePresence>
            </div>
          </div>,
          // Opponent columns
          ...otherPlayers.map((p, i) => {
            const theirCard = revealState?.cards?.[p.userId];
            const isWinner = revealState?.winners?.includes(p.userId) ?? false;
            const isRevealPhase = phase === "revealing" || phase === "result";
            return (
              <div key={p.userId} className={colClass}>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold text-center flex-shrink-0 truncate px-1">
                  {p.username}
                </span>
                <div className="flex-1 min-h-0">
                  <FlippingCard
                    card={theirCard}
                    isRevealed={isRevealPhase}
                    selectedStats={roundState?.selectedStats || []}
                    statLabels={roundState?.statLabels}
                    isWinner={isWinner}
                    winnerStat={revealState?.selectedStat}
                    playerName={p.username}
                    avatar={p.avatar}
                    flipDelay={i * 0.15}
                    size="compact"
                  />
                </div>
              </div>
            );
          }),
        ];

        return (
          <div className={containerClass}>
            {/* Turn/dealing indicator */}
            <AnimatePresence>
              {phase === "dealing" && (
                <motion.div
                  initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(30,41,59,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}>🃏</motion.span>
                  <span className="text-xs text-slate-300 font-medium">Dealing cards…</span>
                </motion.div>
              )}
              {roundState && phase === "selecting" && (
                <motion.div
                  initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{
                    background: isMyTurn ? "rgba(37,99,235,0.2)" : "rgba(30,41,59,0.75)",
                    backdropFilter: "blur(12px)",
                    border: `1px solid ${isMyTurn ? "rgba(37,99,235,0.5)" : "rgba(255,255,255,0.08)"}`,
                    boxShadow: isMyTurn ? "0 0 12px rgba(37,99,235,0.25)" : "none",
                  }}
                >
                  {(() => {
                    const tp = room.players.find((p) => p.userId === roundState.currentTurnPlayerId);
                    return isMyTurn ? (
                      <>
                        <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }} className="text-sm">⚡</motion.span>
                        <span className="text-xs text-blue-300 font-semibold">Your turn — pick a stat!</span>
                      </>
                    ) : (
                      <>
                        <img src={tp?.avatar} alt={tp?.username} className="w-4 h-4 rounded-full"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${tp?.username?.[0]}&size=32&bold=true&background=random&color=fff`; }}
                        />
                        <span className="text-xs text-slate-300 font-medium">{tp?.username} is choosing…</span>
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>

            {allCols}
          </div>
        );
      })()}

      {/* ── BOTTOM: STAT SELECTOR + EMOJIS ─────────────────────────── */}
      <div
        className="relative z-10 flex-shrink-0 flex flex-col gap-1.5 px-3 py-2"
        style={{
          background: "rgba(11,18,32,0.9)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Stat selector */}
        {roundState && (
          <AnimatePresence>
            <StatSelector
              selectedStats={roundState.selectedStats}
              statLabels={roundState.statLabels}
              myCard={myCard}
              selectedStat={store.selectedStat}
              winnerStat={revealState?.selectedStat}
              isMyTurn={isMyTurn}
              phase={phase}
              onSelect={selectStat}
            />
          </AnimatePresence>
        )}

        {/* Emoji row */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-600 hidden sm:block">React:</span>
          <div className="flex gap-1 mx-auto sm:mx-0">
            {EMOJIS.map((emoji) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.3, y: -3 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => sendEmoji(emoji)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-base hover:bg-white/5 transition-colors"
              >
                {emoji}
              </motion.button>
            ))}
          </div>
          <div className="w-16 hidden sm:block" />
        </div>
      </div>

      {/* Floating emoji reactions */}
      <EmojiToasts />
    </div>
  );
}

function DealingPlaceholder() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full rounded-2xl flex flex-col items-center justify-center gap-3"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}
    >
      <motion.div
        animate={{ y: [-6, 0, -6], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="text-4xl"
      >
        🃏
      </motion.div>
      <div className="text-xs text-slate-500 font-medium">Dealing…</div>
    </motion.div>
  );
}

function EmojiToasts() {
  const { emojiReactions, room } = useGameStore();
  return (
    <div className="fixed left-3 bottom-20 flex flex-col-reverse gap-1 pointer-events-none z-50" style={{ maxWidth: 180 }}>
      <AnimatePresence>
        {emojiReactions.slice(-4).map((r) => {
          const p = room?.players.find((x) => x.userId === r.userId);
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -40, scale: 0.6 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="text-slate-300 truncate max-w-[70px]">{p?.username}</span>
              <span className="text-base">{r.emoji}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
