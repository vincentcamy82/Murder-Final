"use client";

import { useRef, useState } from "react";
import { api, API, errorDetail, formatError } from "@/lib/api";
import { backgroundUrl, biographyBackgroundUrl } from "@/lib/site";
import { preparePhoto } from "@/lib/photo";
import type { SiteContent } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function BackgroundSettings({ target, site, onSaved }: {
  target: "home" | "biography";
  site: SiteContent;
  onSaved: (site: SiteContent) => void;
}) {
  const biography = target === "biography";
  const sourceKey = biography ? "biography_background_source" : "background_source";
  const urlKey = biography ? "biography_background_url" : "background_url";
  const [url, setUrl] = useState(site[sourceKey] === "url" ? site[urlKey] : "");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const preview = biography ? biographyBackgroundUrl(site, API) : backgroundUrl(site, API);

  const update = async (file?: File, remove = false) => {
    setBusy(true);
    try {
      let updated: SiteContent;
      if (file) {
        const data = new FormData();
        data.append("file", await preparePhoto(file));
        updated = (await api.post<SiteContent>(`/admin/site/background/upload?target=${target}`, data)).data;
      } else {
        updated = (await api.put<SiteContent>("/admin/site", {
          [sourceKey]: "url", [urlKey]: remove ? "" : url.trim(),
        })).data;
      }
      onSaved(updated);
      setUrl(updated[sourceKey] === "url" ? updated[urlKey] : "");
      toast.success("Image de fond mise à jour");
    } catch (error) {
      toast.error(formatError(errorDetail(error) ?? (error instanceof Error ? error.message : undefined)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-4 rounded-md border border-white/10 bg-noir-paper p-6">
      <h2 className="font-serif text-xl text-parch">{biography ? "Fond des biographies" : "Fond de l’accueil"}</h2>
      {biography && <p className="text-sm text-parch/60">Cette image habille toutes les biographies publiques et privées.</p>}
      <div className="aspect-video overflow-hidden rounded-sm border border-white/10 bg-black">
        {preview ? <img src={preview} alt={biography ? "Aperçu du fond des biographies" : "Aperçu du fond de l’accueil"} className="h-full w-full object-cover" /> : <p className="p-6 text-sm text-parch/50">Aucune image de fond</p>}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" aria-label={`Téléverser le fond ${biography ? "des biographies" : "de l’accueil"}`} data-testid={`${target}-bg-upload`} onChange={(event) => { const file = event.target.files?.[0]; if (file) void update(file); event.target.value = ""; }} />
      <Button variant="outline" disabled={busy} onClick={() => input.current?.click()} className="w-full">{busy ? "Enregistrement…" : "Choisir une image"}</Button>
      <label htmlFor={`${target}-bg-url`} className="block text-sm text-brass">Ou utiliser une URL</label>
      <Input id={`${target}-bg-url`} type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://…" />
      <Button disabled={busy || !url.trim()} onClick={() => update()} className="w-full">Appliquer l’URL</Button>
      {biography && preview && <Button variant="ghost" disabled={busy} onClick={() => update(undefined, true)} className="w-full">Retirer le fond</Button>}
    </section>
  );
}
