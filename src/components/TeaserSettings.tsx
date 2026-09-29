"use client";

import { useState } from "react";
import Link from "next/link";
import { api, errorDetail, formatError } from "@/lib/api";
import type { SiteContent, TeaserVideo } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VideoPlayer } from "@/components/VideoGallery";
import { toast } from "sonner";

export default function TeaserSettings({ site, setSite }: { site: SiteContent; setSite: (site: SiteContent) => void }) {
  const [videos, setVideos] = useState<TeaserVideo[]>(site.teasers);
  const [saving, setSaving] = useState(false);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put<SiteContent>("/admin/site", { teasers: videos });
      setSite(data);
      setVideos(data.teasers);
      toast.success("Teasers publiés sur l’accueil et les biographies");
    } catch (error) {
      toast.error(formatError(errorDetail(error)));
    } finally {
      setSaving(false);
    }
  };

  const move = (index: number, offset: number) => {
    setVideos((current) => {
      const updated = [...current];
      [updated[index], updated[index + offset]] = [updated[index + offset], updated[index]];
      return updated;
    });
  };

  return (
    <form onSubmit={save} className="mx-auto max-w-3xl space-y-6">
      <h2 className="font-serif text-3xl text-parch">Vidéos teasers</h2>
      <p className="text-parch/70">Les vidéos enregistrées apparaissent sur l’accueil, la page Vidéos et l’onglet Vidéos de chaque biographie. Utilisez un lien YouTube, Vimeo ou un fichier MP4 hébergé en HTTPS.</p>
      <Link href="/videos" className="inline-block text-brass underline">Voir la page Vidéos</Link>
      <fieldset disabled={saving} className="space-y-6">
        {videos.map((video, index) => (
          <div key={video.id} className="space-y-3 rounded-md border border-white/10 bg-noir-paper p-5">
            <label htmlFor={`title-${video.id}`} className="block text-sm text-brass">Titre du teaser {index + 1}</label>
            <Input id={`title-${video.id}`} required maxLength={200} value={video.title} onChange={(event) => setVideos((current) => current.map((item) => item.id === video.id ? { ...item, title: event.target.value } : item))} />
            <label htmlFor={`url-${video.id}`} className="block text-sm text-brass">Lien de la vidéo</label>
            <Input id={`url-${video.id}`} required type="url" maxLength={2048} placeholder="https://…" value={video.url} onChange={(event) => setVideos((current) => current.map((item) => item.id === video.id ? { ...item, url: event.target.value } : item))} />
            {video.url.startsWith("https://") && <VideoPlayer url={video.url} title={video.title || "Aperçu du teaser"} />}
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Monter ${video.title || "le teaser"}`}>Monter</Button>
              <Button type="button" variant="outline" disabled={index === videos.length - 1} onClick={() => move(index, 1)} aria-label={`Descendre ${video.title || "le teaser"}`}>Descendre</Button>
              <Button type="button" variant="ghost" onClick={() => setVideos((current) => current.filter((item) => item.id !== video.id))}>Retirer</Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" disabled={videos.length >= 30} onClick={() => setVideos((current) => [...current, { id: crypto.randomUUID(), title: "", url: "" }])}>Ajouter un teaser</Button>
        <Button type="submit" className="ml-3">{saving ? "Enregistrement…" : "Enregistrer les vidéos"}</Button>
      </fieldset>
    </form>
  );
}
