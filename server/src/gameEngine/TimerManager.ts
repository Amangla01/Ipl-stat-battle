import { Server } from "socket.io";

interface TimerEntry {
  interval: NodeJS.Timeout;
  timeout: NodeJS.Timeout;
  remaining: number;
  onExpire: () => void;
}

export class TimerManager {
  private timers = new Map<string, TimerEntry>();

  startTimer(
    io: Server,
    roomCode: string,
    duration: number,
    onExpire: () => void
  ): void {
    this.clearTimer(roomCode);

    let remaining = duration;

    io.to(roomCode).emit("timer-update", { remaining, total: duration });

    const interval = setInterval(() => {
      remaining -= 1;
      io.to(roomCode).emit("timer-update", { remaining, total: duration });
      if (remaining <= 0) {
        this.clearTimer(roomCode);
      }
    }, 1000);

    const timeout = setTimeout(() => {
      this.clearTimer(roomCode);
      onExpire();
    }, duration * 1000);

    this.timers.set(roomCode, { interval, timeout, remaining, onExpire });
  }

  clearTimer(roomCode: string): void {
    const entry = this.timers.get(roomCode);
    if (entry) {
      clearInterval(entry.interval);
      clearTimeout(entry.timeout);
      this.timers.delete(roomCode);
    }
  }

  hasActiveTimer(roomCode: string): boolean {
    return this.timers.has(roomCode);
  }
}

export const timerManager = new TimerManager();
