"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, errorDetail, formatError } from "@/lib/api";
import type { SiteContent } from "@/types";
import VideoGallery from "@/components/VideoGallery";

export default function Videos() {
  const [site, setSite] = useState<SiteContent | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api.get<SiteContent>("/site").then(({ data }) => setSite(data)).catch((reason) => setError(formatError(errorDetail(reason))));
  }, []);
  return (
    <div className="min-h-screen bg-noir-950 text-parch">
      <header className="border-b border-brass/30 px-6 py-5"><Link href="/" className="text-brass">← Retour à l’accueil</Link></header>
      <main className="mx-auto max-w-4xl px-6 py-12 pb-28">
        <h1 className="mb-4 font-serif text-5xl text-brass">Les teasers de la soirée</h1>
        <p className="mb-10 text-parch/70">Entrez dans l’histoire, une vidéo après l’autre.</p>
        {error ? <p role="alert">{error}</p> : site ? <VideoGallery videos={site.teasers} /> : <p>Chargement des vidéos…</p>}
      </main>
    </div>
  );
}
