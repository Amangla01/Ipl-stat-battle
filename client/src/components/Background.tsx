import { motion } from "framer-motion";

const ORBS = [
  { w: 700, h: 700, top: "-200px", left: "5%",  color: "rgba(37,99,235,0.10)",  dur: 22 },
  { w: 500, h: 500, top: "30%",   left: "60%", color: "rgba(245,158,11,0.07)", dur: 28 },
  { w: 600, h: 600, top: "55%",   left: "20%", color: "rgba(37,99,235,0.07)",  dur: 18 },
  { w: 400, h: 400, top: "-100px",left: "75%", color: "rgba(59,130,246,0.08)", dur: 25 },
  { w: 350, h: 350, top: "70%",   left: "70%", color: "rgba(245,158,11,0.05)", dur: 32 },
];

export function GameBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Deep base */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(150deg, #0d1526 0%, #0B1220 40%, #0d1428 100%)",
        }}
      />

      {/* Animated orbs */}
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: orb.w, height: orb.h,
            top: orb.top, left: orb.left,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: "blur(60px)",
            borderRadius: "50%",
          }}
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.08, 0.94, 1],
          }}
          transition={{
            duration: orb.dur,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.5,
          }}
        />
      ))}

      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-60" />

      {/* Subtle vignette */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(11,18,32,0.6) 100%)",
        }}
      />
    </div>
  );
}
