"use client";

import { useRef, useState } from "react";
import { Music2, Pause } from "lucide-react";

export default function AmbientMusic() {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  const toggle = async () => {
    const player = audio.current;
    if (!player) return;
    if (!player.paused) {
      player.pause();
      return;
    }
    setError(false);
    player.volume = 0.35;
    try {
      await player.play();
    } catch {
      setError(true);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)]">
      <audio ref={audio} src="/audio/ambiance.mp3" loop preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setPlaying(false); setError(true); }} data-testid="ambient-audio" />
      {error && <p role="alert" className="mb-2 bg-[#160f08] p-2 text-sm text-parch">La musique est indisponible. Réessayez.</p>}
      <button type="button" onClick={toggle} aria-pressed={playing} className="flex items-center gap-2 rounded-sm border border-[#a8863f] bg-[#160f08]/95 px-4 py-3 text-xs text-[#c8a24e] shadow-lg">
        {playing ? <Pause className="h-4 w-4" /> : <Music2 className="h-4 w-4" />}
        {playing ? "Couper la musique" : "Écouter l’ambiance"}
      </button>
    </div>
  );
}
