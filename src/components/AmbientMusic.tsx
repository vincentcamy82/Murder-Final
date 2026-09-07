"use client";

import { useEffect, useRef, useState } from "react";
import { Music2, Pause } from "lucide-react";

export default function AmbientMusic() {
  const audio = useRef<HTMLAudioElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const autoplay = useRef<AbortController | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const player = audio.current;
    if (!player) return;
    const controller = new AbortController();
    autoplay.current = controller;
    player.volume = 0.35;

    const tryPlay = async () => {
      try {
        await player.play();
        controller.abort();
      } catch (reason) {
        if (controller.signal.aborted) return;
        if (reason instanceof DOMException && (reason.name === "NotAllowedError" || reason.name === "AbortError")) return;
        setError(true);
        controller.abort();
      }
    };

    const onInteraction = (event: Event) => {
      if (event.target instanceof Node && button.current?.contains(event.target)) return;
      void tryPlay();
    };

    window.addEventListener("click", onInteraction, { signal: controller.signal });
    window.addEventListener("keydown", onInteraction, { signal: controller.signal });
    void tryPlay();

    return () => {
      controller.abort();
      player.pause();
    };
  }, []);

  const toggle = async () => {
    const player = audio.current;
    if (!player) return;
    autoplay.current?.abort();
    if (!player.paused) {
      player.pause();
      return;
    }
    setError(false);
    try {
      await player.play();
    } catch {
      setError(true);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)]">
      <audio ref={audio} src="/audio/ambiance.mp3" loop preload="auto" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setPlaying(false); setError(true); }} data-testid="ambient-audio" />
      {error && <p role="alert" className="mb-2 bg-[#160f08] p-2 text-sm text-parch">La musique est indisponible. Réessayez.</p>}
      <button ref={button} type="button" onClick={toggle} aria-pressed={playing} className="flex items-center gap-2 rounded-sm border border-[#a8863f] bg-[#160f08]/95 px-4 py-3 text-xs text-[#c8a24e] shadow-lg">
        {playing ? <Pause className="h-4 w-4" /> : <Music2 className="h-4 w-4" />}
        {playing ? "Couper la musique" : "Écouter l’ambiance"}
      </button>
    </div>
  );
}
