export const ALL_STAT_KEYS = [
  "totalRuns",
  "totalWickets",
  "totalMatches",
  "highestScore",
  "battingAverage",
  "strikeRate",
  "economy",
  "hundreds",
  "fifties",
  "sixes",
  "fours",
  "totalBoundaries",
  "bowlingAverage",
  "bestBowling",
] as const;

export type StatKey = (typeof ALL_STAT_KEYS)[number];

export const STAT_LABELS: Record<string, string> = {
  totalRuns: "Total Runs",
  totalWickets: "Total Wickets",
  totalMatches: "Matches Played",
  highestScore: "Highest Score",
  battingAverage: "Batting Avg",
  strikeRate: "Strike Rate",
  economy: "Economy",
  hundreds: "Centuries",
  fifties: "Half Centuries",
  sixes: "Sixes",
  fours: "Fours",
  totalBoundaries: "Total Boundaries",
  bowlingAverage: "Bowling Avg",
  bestBowling: "Best Bowling",
};

// Lower is better for these stats
export const LOWER_IS_BETTER = new Set(["economy", "bowlingAverage"]);

export function parseBestBowling(figures: string): number {
  if (!figures || figures === "0/0") return 0;
  const [wickets, runs] = figures.split("/").map(Number);
  if (isNaN(wickets) || isNaN(runs)) return 0;
  // Higher wickets = better; for same wickets, lower runs = better
  return wickets * 1000 - runs;
}

export function getStatValue(stats: Record<string, number | string>, key: string): number {
  if (key === "bestBowling") return parseBestBowling(stats[key] as string);
  const val = stats[key];
  return typeof val === "number" ? val : parseFloat(val as string) || 0;
}

export function compareStats(
  playerValues: Record<string, number>,
  stat: string
): string[] {
  const entries = Object.entries(playerValues);
  if (entries.length === 0) return [];

  const isLower = LOWER_IS_BETTER.has(stat) && stat !== "bestBowling";

  let best = isLower ? Infinity : -Infinity;
  for (const [, val] of entries) {
    if (val === 0 && stat !== "totalRuns") continue;
    if (isLower) best = Math.min(best, val);
    else best = Math.max(best, val);
  }

  const winners = entries
    .filter(([, val]) => {
      if (val === 0 && isLower) return false;
      return val === best;
    })
    .map(([id]) => id);

  return winners;
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickRandomStats(count = 6): string[] {
  // Always include totalRuns and totalWickets as the first two stats
  const permanent = ["totalRuns", "totalWickets"];
  const pool = ALL_STAT_KEYS.filter((k) => !permanent.includes(k));
  const randomPick = shuffleArray([...pool]).slice(0, count - permanent.length);
  return [...permanent, ...randomPick];
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
