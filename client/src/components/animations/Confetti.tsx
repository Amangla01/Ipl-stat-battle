import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiProps {
  trigger: boolean;
  isWinner?: boolean;
}

export function Confetti({ trigger, isWinner = false }: ConfettiProps) {
  useEffect(() => {
    if (!trigger) return;

    if (isWinner) {
      // Full winner celebration
      const duration = 4000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#FFD700", "#FF6B00", "#FFF", "#FF4500"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#FFD700", "#FF6B00", "#FFF", "#FF4500"],
        });

        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.4 },
        colors: ["#FFD700", "#FF6B00", "#FFF", "#00BFFF", "#FF1493"],
      });
    } else {
      // Round win burst
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FFD700", "#FF6B00", "#FFF"],
      });
    }
  }, [trigger, isWinner]);

  return null;
}
