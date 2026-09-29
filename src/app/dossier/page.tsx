"use client";

import { useEffect, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { api, API, fileUrl, clearToken } from "@/lib/api";
import VideoGallery, { VideoPlayer } from "@/components/VideoGallery";
import BiographyBackground from "@/components/BiographyBackground";
import { DEFAULT_SITE } from "@/lib/site";
import { privatePhotos } from "@/lib/media";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { Character, MediaItem, SiteContent } from "@/types";
import { FileText, Image as ImageIcon, Film, LogOut, ScrollText, type LucideProps } from "lucide-react";

export default function Dossier() {
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [site, setSite] = useState<SiteContent>(DEFAULT_SITE);

  useEffect(() => {
    api
      .get<Character>("/my/character")
      .then((r) => setCharacter(r.data))
      .catch(() => {
        clearToken();
        router.push("/");
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    api.get<SiteContent>("/site").then(({ data }) => setSite({ ...DEFAULT_SITE, ...data })).catch(() => {});
  }, []);

  const logout = () => {
    clearToken();
    router.push("/");
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-noir-950 font-mono text-sm text-brass">
        Ouverture du dossier…
      </div>
    );
  if (!character) return null;

  const photos = privatePhotos(character.media);
  const videos = character.media.filter((m) => m.kind === "video");

  const srcFor = (m: MediaItem) => (m.source === "upload" ? fileUrl(m.storage_path ?? "") : m.url ?? "");

  return (
    <div className="relative min-h-screen bg-noir-950 grain">
      <BiographyBackground site={site} apiBase={API} />
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-brass">
            Dossier confidentiel
          </span>
          <Button
            data-testid="logout-btn"
            variant="ghost"
            onClick={logout}
            className="gap-2 font-mono text-xs uppercase tracking-widest text-parch/60 hover:text-brass"
          >
            <LogOut className="h-4 w-4" /> Quitter
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        <section className="animate-fade-in mb-12">
          <div className="mb-5 flex items-center gap-3">
            <ImageIcon className="h-5 w-5 text-brass" />
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-brass">
              Galerie photos {photos.length > 0 && `(${photos.length})`}
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-brass/50 to-transparent" />
          </div>
          {photos.length === 0 ? (
            <Empty text="Aucune photographie versée au dossier." />
          ) : (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
              {photos.map((m) => (
                <button
                  key={m.id}
                  data-testid={`photo-${m.id}`}
                  onClick={() => setLightbox(srcFor(m))}
                  className="block w-full break-inside-avoid overflow-hidden rounded-sm border-4 border-parch/90 bg-parch p-0 shadow-lg transition-transform hover:-translate-y-1"
                >
                  <img src={srcFor(m)} alt="" className="w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </section>

        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          <aside className="animate-fade-in lg:col-span-4">
            <div className="rounded-md border border-white/10 bg-noir-paper p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-parch/40">
                {character.title || "Convive"}
              </p>
              <h1 data-testid="character-name" className="mt-3 font-serif text-4xl font-light leading-tight text-parch">
                {character.name}
              </h1>
              <div className="my-6 h-px w-full bg-gradient-to-r from-brass/60 to-transparent" />
              <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-parch/50">
                <ScrollText className="h-4 w-4 text-brass" />
                Dossier scellé
              </div>
              <p className="mt-6 font-serif italic text-parch/50">
                « Ce que vous lisez ici n&apos;est destiné qu&apos;à vos yeux. Gardez le secret jusqu&apos;au dénouement. »
              </p>
            </div>
          </aside>

          <section className="mt-8 lg:col-span-8 lg:mt-0">
            <Tabs defaultValue="story" className="w-full">
              <TabsList className="h-auto w-full justify-start gap-2 rounded-none border-b border-white/10 bg-transparent p-0">
                <TabTrigger value="story" icon={FileText} label="Récit" testid="tab-story" />
                <TabTrigger value="video" icon={Film} label={`Vidéos (${videos.length + site.teasers.length})`} testid="tab-video" />
              </TabsList>

              <TabsContent value="story" className="animate-fade-in mt-8">
                <div className="rounded-md border border-white/10 bg-noir-paper p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                  {character.story ? (
                    <p data-testid="story-text" className="whitespace-pre-wrap font-mono text-[15px] leading-loose text-parch/90">
                      {character.story}
                    </p>
                  ) : (
                    <Empty text="Votre récit sera bientôt révélé par l'organisateur." />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="video" className="animate-fade-in mt-8">
                <VideoGallery videos={site.teasers} />
                {videos.length > 0 && (
                  <div className="mt-8 space-y-8">
                    {videos.map((m) => (
                      <VideoPlayer key={m.id} url={srcFor(m)} title={m.filename || "Vidéo privée"} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>

      {lightbox && (
        <div
          data-testid="lightbox"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6 backdrop-blur-sm"
        >
          <img src={lightbox} alt="" className="max-h-[90vh] max-w-full rounded-sm border-8 border-parch/90 shadow-2xl" />
        </div>
      )}
    </div>
  );
}

function TabTrigger({
  value,
  icon: Icon,
  label,
  testid,
}: {
  value: string;
  icon: ComponentType<LucideProps>;
  label: string;
  testid: string;
}) {
  return (
    <TabsTrigger
      value={value}
      data-testid={testid}
      className="gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 font-mono text-xs uppercase tracking-widest text-parch/50 data-[state=active]:border-brass data-[state=active]:bg-transparent data-[state=active]:text-brass data-[state=active]:shadow-none"
    >
      <Icon className="h-4 w-4" /> {label}
    </TabsTrigger>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-white/10 bg-noir-paper/50 p-12 text-center">
      <p className="font-serif italic text-parch/40">{text}</p>
    </div>
  );
}
