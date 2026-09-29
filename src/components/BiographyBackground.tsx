import { biographyBackgroundUrl } from "@/lib/site";
import type { SiteContent } from "@/types";

export default function BiographyBackground({ site, apiBase }: { site: SiteContent; apiBase: string }) {
  const url = biographyBackgroundUrl(site, apiBase);
  if (!url) return null;
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30" style={{ backgroundImage: `linear-gradient(to bottom, transparent, #0a0a0a), url(${JSON.stringify(url)})` }} />;
}
