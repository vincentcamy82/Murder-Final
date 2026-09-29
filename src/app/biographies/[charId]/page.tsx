"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Film, ScrollText } from "lucide-react";
import { api, API, fileUrl, errorDetail, formatError } from "@/lib/api";
import { DEFAULT_SITE } from "@/lib/site";
import type { PublicBiography, SiteContent } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BiographyBackground from "@/components/BiographyBackground";
import PrivateBiographyAccess from "@/components/PrivateBiographyAccess";
import VideoGallery from "@/components/VideoGallery";

export default function Biography({ params }: { params: Promise<{ charId: string }> }) {
  const { charId } = use(params);
  const [biography, setBiography] = useState<PublicBiography | null>(null);
  const [site, setSite] = useState<SiteContent>(DEFAULT_SITE);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setBiography(null);
    setError("");
    Promise.all([
      api.get<PublicBiography>(`/characters/public/${charId}`, { signal: controller.signal }),
      api.get<SiteContent>("/site", { signal: controller.signal }),
    ]).then(([character, settings]) => {
      setBiography(character.data);
      setSite({ ...DEFAULT_SITE, ...settings.data });
    }).catch((reason) => {
      if (!controller.signal.aborted) setError(formatError(errorDetail(reason)));
    });
    return () => controller.abort();
  }, [charId]);

  const portrait = biography?.portrait_storage_path ? fileUrl(biography.portrait_storage_path) : biography?.portrait_url;

  return (
    <div className="relative min-h-screen bg-noir-950 text-parch">
      <BiographyBackground site={site} apiBase={API} />
      <header className="relative z-10 border-b border-white/10 bg-black/70">
        <nav className="mx-auto flex max-w-6xl justify-between gap-4 px-6 py-5 text-sm text-brass"><Link href="/">← Les convives</Link><Link href="/videos">Vidéos</Link></nav>
      </header>
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12 pb-28">
        {error ? <p role="alert">{error}</p> : !biography ? <p>Ouverture de la biographie…</p> : (
          <div className="grid gap-10 lg:grid-cols-3">
            <aside className="space-y-8">
              {portrait && <img src={portrait} alt={biography.name} className="max-h-[32rem] w-full rounded-sm border-4 border-parch/90 object-cover" />}
              <div className="rounded-md border border-white/10 bg-noir-paper p-8 shadow-xl">
                <p className="font-mono text-xs uppercase tracking-widest text-parch/60">{biography.title || "Convive"}</p>
                <h1 className="mt-3 font-serif text-4xl">{biography.name}</h1>
                <div className="my-6 h-px bg-brass/50" />
                <p className="flex items-center gap-2 text-sm text-brass"><ScrollText className="h-4 w-4" /> Biographie publique</p>
                <PrivateBiographyAccess codeLabel={site.code_label} />
              </div>
            </aside>
            <Tabs defaultValue="story" className="lg:col-span-2">
              <TabsList className="mb-6 bg-noir-paper">
                <TabsTrigger value="story" className="gap-2"><FileText className="h-4 w-4" /> Récit</TabsTrigger>
                <TabsTrigger value="videos" className="gap-2"><Film className="h-4 w-4" /> Vidéos ({site.teasers.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="story" className="rounded-md border border-white/10 bg-noir-paper p-8">
                <p className="whitespace-pre-wrap font-mono text-sm leading-loose">{biography.public_story || "La biographie de ce personnage sera bientôt dévoilée."}</p>
              </TabsContent>
              <TabsContent value="videos"><VideoGallery videos={site.teasers} /></TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}
