// Module-level singleton so audio persists across React re-renders and page navigations
let audio: HTMLAudioElement | null = null;
let isMuted = false;

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio("/sounds/background.mp3");
    audio.loop = true;
    audio.volume = 0.35;
  }
  return audio;
}

export const backgroundMusic = {
  play() {
    const a = getAudio();
    if (a.paused) {
      a.play().catch(() => {
        // Browser blocked autoplay — will try again on next user interaction
      });
    }
  },

  stop() {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  },

  pause() {
    if (audio) audio.pause();
  },

  setMuted(mute: boolean) {
    isMuted = mute;
    const a = getAudio();
    a.muted = mute;
  },

  toggleMute(): boolean {
    isMuted = !isMuted;
    const a = getAudio();
    a.muted = isMuted;
    return isMuted;
  },

  isMuted(): boolean {
    return isMuted;
  },

  isPlaying(): boolean {
    return !!audio && !audio.paused;
  },

  setVolume(v: number) {
    getAudio().volume = Math.max(0, Math.min(1, v));
  },
};
