import { useCallback, useRef } from "react";

type SoundName = "card-deal" | "card-flip" | "winner" | "tick" | "click" | "crowd" | "error";

const SOUND_URLS: Record<SoundName, string> = {
  "card-deal": "https://assets.mixkit.co/active_storage/sfx/2073/2073-preview.mp3",
  "card-flip": "https://assets.mixkit.co/active_storage/sfx/2074/2074-preview.mp3",
  winner: "https://assets.mixkit.co/active_storage/sfx/1436/1436-preview.mp3",
  tick: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  click: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  crowd: "https://assets.mixkit.co/active_storage/sfx/1277/1277-preview.mp3",
  error: "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3",
};

export function useSound() {
  const audioCache = useRef<Record<string, HTMLAudioElement>>({});
  const enabled = useRef(true);

  const play = useCallback((sound: SoundName, volume = 0.4) => {
    if (!enabled.current) return;
    try {
      if (!audioCache.current[sound]) {
        audioCache.current[sound] = new Audio(SOUND_URLS[sound]);
      }
      const audio = audioCache.current[sound];
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    enabled.current = !enabled.current;
    return enabled.current;
  }, []);

  return { play, toggle };
}
