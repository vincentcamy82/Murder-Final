"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api, API, setToken, formatError, errorDetail, fileUrl } from "@/lib/api";
import { DEFAULT_SITE, backgroundUrl } from "@/lib/site";
import type { PublicCharacter, SiteContent } from "@/types";
import { MapPin, Hourglass, KeyRound, Lock } from "lucide-react";

const AMBIENT_AUDIO = "";

const makePortrait = (label: string, background: string, accent: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
      <rect width="800" height="1000" fill="${background}" />
      <rect x="70" y="80" width="660" height="840" rx="36" fill="#f7e6c7" opacity="0.94" />
      <circle cx="400" cy="360" r="180" fill="${accent}" opacity="0.95" />
      <path d="M220 780c42-210 338-210 380 0" fill="${accent}" opacity="0.75" />
      <text x="400" y="900" text-anchor="middle" font-family="Georgia, serif" font-size="72" fill="${background}">${label}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const PORTRAITS = [
  makePortrait("A", "#2f2217", "#c8a24e"),
  makePortrait("B", "#3a2b1f", "#a8863f"),
  makePortrait("C", "#21160d", "#d4af37"),
  makePortrait("D", "#1f1710", "#8f6b2f"),
  makePortrait("E", "#4a3418", "#c9a35c"),
  makePortrait("F", "#2b2016", "#b68a40"),
];

const PORTRAIT_OVERRIDES: Record<string, string> = {
  dieubanes: makePortrait("D", "#2f2217", "#c8a24e"),
  vince: makePortrait("V", "#3a2b1f", "#a8863f"),
  kass: makePortrait("K", "#21160d", "#d4af37"),
  romain: makePortrait("R", "#1f1710", "#8f6b2f"),
  kiki: makePortrait("K", "#4a3418", "#c9a35c"),
  maeva: makePortrait("M", "#2b2016", "#b68a40"),
  quentin: makePortrait("Q", "#2f2217", "#c8a24e"),
  emilie: makePortrait("E", "#3a2b1f", "#a8863f"),
  mika: makePortrait("M", "#21160d", "#d4af37"),
  dany: makePortrait("D", "#1f1710", "#8f6b2f"),
  olivier: makePortrait("O", "#4a3418", "#c9a35c"),
  marion: makePortrait("M", "#2b2016", "#b68a40"),
  vincent: makePortrait("V", "#2f2217", "#c8a24e"),
};

const DISPLAY = "'IM Fell English', 'Cormorant Garamond', serif";
const CAPS = "'Cinzel Decorative', serif";
const SC = "'IM Fell English SC', serif";

function Countdown({ label, eventDate }: { label: string; eventDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(eventDate).getTime();
    const interval = setInterval(() => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  const units = [
    { label: "Jours", value: timeLeft.days },
    { label: "Heures", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Secondes", value: timeLeft.seconds },
  ];

  return (
    <>
      <p className="relative mt-14 mb-4 text-[11px] uppercase tracking-[0.35em] text-[#b09a72]" style={{ fontFamily: SC }}>
        {label}
      </p>
      <div className="relative mx-auto grid w-full max-w-2xl grid-cols-4 gap-3 deckle bg-[#1d1509]/70 p-6 sm:gap-6" data-testid="countdown">
        {units.map((item, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-3xl text-[#c8a24e] md:text-5xl" style={{ fontFamily: DISPLAY }} data-testid={`cd-${item.label}`}>
              {String(item.value).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[#8f7c58] md:text-[11px]" style={{ fontFamily: SC }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Landing() {
  const router = useRouter();
  const [guests, setGuests] = useState<PublicCharacter[]>([]);
  const [site, setSite] = useState<SiteContent>(DEFAULT_SITE);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    api.get<PublicCharacter[]>("/characters/public").then((r) => setGuests(r.data)).catch(() => {});
    api.get<SiteContent>("/site").then((r) => setSite({ ...DEFAULT_SITE, ...r.data })).catch(() => {});
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = 0.5;
    const tryPlay = () => el.play().catch(() => {});
    tryPlay();
    const onInteract = () => {
      tryPlay();
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
    };
    window.addEventListener("pointerdown", onInteract);
    window.addEventListener("keydown", onInteract);
    return () => {
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!code.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post("/auth/character", { code });
      setToken(data.token);
      router.push("/dossier");
    } catch (err) {
      setError(formatError(errorDetail(err)));
    } finally {
      setLoading(false);
    }
  };

  const scrollToEnter = () => {
    document.getElementById("enter")?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(
      () => document.querySelector<HTMLInputElement>('[data-testid="character-code-input"]')?.focus(),
      400,
    );
  };

  const bodyFont = `'${site.font_body}', serif`;
  const bg = backgroundUrl(site, API);
  const eventDateObj = new Date(site.event_date);

  return (
    <div className="aged-bg min-h-screen text-[#e8dcc2]" style={{ fontFamily: bodyFont }}>
      {AMBIENT_AUDIO ? (
        <video
          ref={audioRef}
          src={AMBIENT_AUDIO}
          loop
          playsInline
          aria-hidden="true"
          tabIndex={-1}
          data-testid="ambient-audio"
          className="pointer-events-none absolute h-px w-px opacity-0"
          style={{ left: "-9999px" }}
        />
      ) : null}

      <header className="sticky top-0 z-50 flex items-center justify-between border-b-2 border-[#4a3418] bg-[#160f08]/95 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3 text-lg tracking-[0.2em] text-[#c8a24e]" style={{ fontFamily: CAPS }}>
          <span className="text-2xl">&#10070;</span>
          <span>Domaine Dieubanes</span>
        </div>
        <nav className="hidden gap-8 text-xs uppercase tracking-[0.25em] text-[#b09a72] md:flex" style={{ fontFamily: SC }}>
          <a href="#recit" className="transition hover:text-[#c8a24e]">Le Récit</a>
          <a href="#suspects" className="transition hover:text-[#c8a24e]">Les Suspects</a>
          <a href="#infos" className="transition hover:text-[#c8a24e]">Infos Pratiques</a>
        </nav>
      </header>

      <section id="recit" className="relative grain overflow-hidden border-b-2 border-[#4a3418] px-6 py-24 text-center">
        {bg && (
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-20 sepia"
            style={{ backgroundImage: `url(${bg})`, filter: "sepia(0.6) contrast(0.9)" }}
          />
        )}
        <div className="pointer-events-none absolute inset-0 aged-vignette" />

        <div className="relative mx-auto max-w-3xl">
          <p className="mb-5 text-xs uppercase tracking-[0.4em] text-[#c8a24e]" style={{ fontFamily: SC }}>
            &mdash; {site.eyebrow} &mdash;
          </p>
          <h1 className="mb-2 text-5xl italic leading-tight text-[#f1e6cd] md:text-7xl" style={{ fontFamily: DISPLAY }}>
            {site.title} <span className="text-[#c8a24e]">{site.title_highlight}</span>
          </h1>
          <div className="my-7 flex items-center justify-center gap-4 text-[#a8863f]">
            <span className="h-px w-16 bg-[#a8863f]/50" />
            <span className="text-xl">&#10086;</span>
            <span className="h-px w-16 bg-[#a8863f]/50" />
          </div>
          <p className="mx-auto max-w-xl text-lg italic leading-relaxed text-[#d8c8a6]" style={{ fontFamily: DISPLAY }}>
            {site.story}
            {site.story_highlight && (
              <span className="mt-3 block not-italic text-[#c8a24e]" style={{ fontFamily: SC }}>
                {site.story_highlight}
              </span>
            )}
          </p>
        </div>

        <Countdown label={site.countdown_label} eventDate={site.event_date} />

        <form id="enter" onSubmit={submit} className="relative mx-auto mt-12 w-full max-w-md paper deckle p-8 text-[#2b2016]">
          <p className="mb-5 text-2xl italic text-[#3a2a17]" style={{ fontFamily: DISPLAY }}>Carton d&apos;invitation</p>
          <label className="mb-3 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#6e4b22]" style={{ fontFamily: SC }}>
            <KeyRound className="h-4 w-4" /> {site.code_label}
          </label>
          <input
            data-testid="character-code-input"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXXXX"
            maxLength={12}
            className="w-full border-b-2 border-[#6e4b22]/50 bg-transparent px-2 py-2 text-center text-3xl tracking-[0.3em] text-[#2b2016] placeholder:text-[#6e4b22]/30 focus:border-[#6e4b22] focus:outline-none"
            style={{ fontFamily: DISPLAY }}
          />
          {error && <p data-testid="code-error" className="mt-4 text-center text-sm text-[#8a2020]">{error}</p>}
          <button
            data-testid="enter-btn"
            type="submit"
            disabled={loading}
            className="mt-7 w-full border border-[#3a2a17] bg-[#3a2a17] px-8 py-3 text-xs uppercase tracking-[0.25em] text-[#efe4cb] transition hover:bg-[#2b2016] disabled:opacity-60"
            style={{ fontFamily: SC }}
          >
            {loading ? "Vérification..." : "Ouvrir mon dossier"}
          </button>
        </form>
      </section>

      <section id="suspects" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-16 text-center">
          <h2 className="mb-3 text-4xl italic text-[#f1e6cd]" style={{ fontFamily: DISPLAY }}>{site.guests_label}</h2>
          <div className="mx-auto mb-4 flex items-center justify-center gap-3 text-[#a8863f]">
            <span className="h-px w-12 bg-[#a8863f]/50" />
            <span>&#10086;</span>
            <span className="h-px w-12 bg-[#a8863f]/50" />
          </div>
          <p className="mx-auto max-w-md text-base italic text-[#c0ae86]" style={{ fontFamily: DISPLAY }}>
            Chacun d&apos;entre eux a un mobile. Chacun d&apos;entre eux dissimule un secret. Examinez attentivement leur portrait.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3">
          {guests.map((char, i) => {
            const nameWords = (char.name || "").toLowerCase().trim().split(/\s+/);
            const overrideKey = Object.keys(PORTRAIT_OVERRIDES).find((k) => nameWords.includes(k));
            const override = overrideKey ? PORTRAIT_OVERRIDES[overrideKey] : null;
            const defaultPortrait = override || PORTRAITS[i % PORTRAITS.length];
            const portrait = char.portrait_storage_path
              ? fileUrl(char.portrait_storage_path)
              : char.portrait_url || defaultPortrait;
            const fallbackPortrait = char.portrait_storage_path
              ? char.portrait_url || defaultPortrait
              : defaultPortrait;
            return (
              <div key={char.id || i} className="group flex flex-col">
                <div className="old-frame" style={{ transform: `rotate(${i % 2 ? 0.8 : -0.8}deg)` }}>
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={portrait}
                      data-fallback-src={fallbackPortrait}
                      alt={char.name}
                      onError={(e) => {
                        const fallback = e.currentTarget.dataset.fallbackSrc;
                        if (fallback && e.currentTarget.src !== fallback) {
                          e.currentTarget.src = fallback;
                        }
                      }}
                      className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
                      style={{ filter: override ? "sepia(0.35) contrast(0.98)" : "sepia(0.85) contrast(0.95) brightness(0.92)" }}
                    />
                    <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 60px rgba(60,40,15,0.7)" }} />
                    <span className="absolute bottom-3 left-3 bg-[#160f08]/80 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#c8a24e]" style={{ fontFamily: SC }}>
                      {char.title || "Convive"}
                    </span>
                  </div>
                </div>
                <div className="mt-5 text-center">
                  <h3 className="text-2xl italic text-[#efe4cb] transition-colors group-hover:text-[#c8a24e]" style={{ fontFamily: DISPLAY }}>
                    {char.name}
                  </h3>
                  <button
                    data-testid={`suspect-${i}`}
                    onClick={scrollToEnter}
                    className="mt-3 text-[11px] uppercase tracking-[0.25em] text-[#a8863f] underline decoration-[#a8863f]/40 underline-offset-4 transition hover:text-[#e8dcc2]"
                    style={{ fontFamily: SC }}
                  >
                    Consulter le dossier
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer id="infos" className="border-t-2 border-[#4a3418] bg-[#120d07] px-6 py-12 text-center text-[#8f7c58]">
        <div className="mb-6 flex flex-col items-center justify-center gap-6 text-[#c0ae86] md:flex-row" style={{ fontFamily: SC }}>
          <span className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
            <MapPin className="h-4 w-4 text-[#a8863f]" /> Domaine Dieubanes
          </span>
          <span className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
            <Hourglass className="h-4 w-4 text-[#a8863f]" />
            {eventDateObj.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} à{" "}
            {eventDateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <p className="mb-5 text-xs italic" style={{ fontFamily: DISPLAY }}>Dieubanes &mdash; Soirée privée, Murder Party.</p>
        <button
          data-testid="admin-link"
          onClick={() => router.push("/admin/login")}
          className="mx-auto flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#5f4e34] transition-colors hover:text-[#c8a24e]"
          style={{ fontFamily: SC }}
        >
          <Lock className="h-3 w-3" /> Espace organisateur
        </button>
      </footer>
    </div>
  );
}
